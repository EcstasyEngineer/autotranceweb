from __future__ import annotations

import argparse
import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Iterable, List, Sequence, Tuple

from .config import CatalogConfig
from .utils import io as io_utils
from .utils.ollama import OllamaClient
from .utils.ontology import Theme, load_theme, load_themes
from .utils.prompts import render_scoring_prompt

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)

RAW_INPUT_ROOT = Path("data/catalog_v3/raw")
SCORED_OUTPUT_ROOT = Path("data/catalog_v3/scored")
PROMPT_VERSION = "1.0"


def _latest_subdir(root: Path) -> Path:
    if not root.exists():
        raise FileNotFoundError(f"No data at {root}")
    subdirs = sorted([p for p in root.iterdir() if p.is_dir()], reverse=True)
    if not subdirs:
        raise FileNotFoundError(f"No subdirectories found in {root}")
    return subdirs[0]


def _load_stage1_payloads(path: Path) -> List[dict]:
    payloads: List[dict] = []
    for file_path in sorted(path.glob("*.json")):
        payload = io_utils.read_json(file_path)
        payload["_source_path"] = file_path
        payloads.append(payload)
    return payloads


def _parse_combo_id(path: Path) -> str:
    return path.stem


def _parse_scoring_response(text: str) -> dict:
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.strip("`")
        if cleaned.lower().startswith("json"):
            cleaned = cleaned[4:].strip()
    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError as exc:
        raise ValueError(f"Invalid JSON from scorer: {exc}\n{text}") from exc
    if "score" not in data or "verdict" not in data or "rationale" not in data:
        raise ValueError(f"Scoring response missing fields: {data}")
    return data


def _resolve_sources(source_ids: Iterable[str], theme_index: Dict[str, Theme]) -> List[Theme]:
    sources: List[Theme] = []
    for source_id in source_ids:
        theme = theme_index.get(source_id)
        if theme is None:
            raise KeyError(f"Unknown source theme id: {source_id}")
        sources.append(theme)
    return sources


def score(
    config: CatalogConfig,
    *,
    input_dir: Path | None,
    model_override: str | None,
    passes_override: int | None,
    include_prompt: bool,
    start_index: int,
    limit: int | None,
    skip_existing: bool,
    output_dir: Path | None,
    progress_log: Path | None,
) -> None:
    selected_names = config.selected_themes()
    themes = load_themes(selected_names)
    theme_index: Dict[str, Theme] = {theme.id: theme for theme in themes}

    base_dir = input_dir or _latest_subdir(RAW_INPUT_ROOT)
    logger.info("Using Stage 1 data from %s", base_dir)
    payloads = _load_stage1_payloads(base_dir)
    total_records = len(payloads)
    logger.info("Loaded %s proposal records", total_records)

    if start_index:
        payloads = payloads[start_index:]
    if limit is not None:
        payloads = payloads[:limit]
    if not payloads:
        logger.info("No proposal records to process (start/limit exhausted list).")
        return

    client = OllamaClient(
        host=config.ollama.host,
        timeout=config.ollama.timeout,
    )
    if output_dir:
        output_root = io_utils.ensure_dir(output_dir)
    else:
        timestamp = io_utils.timestamp()
        output_root = io_utils.ensure_dir(SCORED_OUTPUT_ROOT / timestamp)

    model = model_override or config.scoring.model
    passes = passes_override or config.scoring.passes
    options = {
        "temperature": config.scoring.temperature,
        "top_p": config.scoring.top_p,
        "repeat_penalty": config.scoring.repeat_penalty,
    }

    target_cache: Dict[str, Theme] = {}

    if progress_log:
        progress_log.parent.mkdir(parents=True, exist_ok=True)

    def log_progress(message: str) -> None:
        if not progress_log:
            return
        stamp = datetime.now(timezone.utc).isoformat()
        with progress_log.open("a", encoding="utf-8") as handle:
            handle.write(f"{stamp} {message}\n")

    for offset, payload in enumerate(payloads, start=0):
        source_ids = payload.get("sources", [])
        try:
            sources = _resolve_sources(source_ids, theme_index)
        except KeyError as exc:
            logger.warning("Skipping payload %s: %s", payload.get("_source_path"), exc)
            log_progress(f"SKIP unknown source {payload.get('_source_path')}: {exc}")
            continue

        parsed = payload.get("parsed", {})
        proposals = parsed.get("proposals", [])
        if not proposals:
            continue

        combo_id = _parse_combo_id(payload["_source_path"])
        absolute_index = start_index + offset + 1
        logger.info("Scoring record %s/%s (%s)", absolute_index, total_records, combo_id)
        log_progress(f"START {absolute_index}/{total_records} {combo_id}")
        for proposal_index, proposal in enumerate(proposals):
            target_id = proposal.get("target_id") or proposal.get("target_name")
            target_name = proposal.get("target_name") or target_id
            rationale = proposal.get("rationale", "").strip()
            if not target_id or not target_name:
                logger.info("Skipping proposal without target in %s", combo_id)
                log_progress(f"SKIP missing target fields {combo_id} proposal {proposal_index}")
                continue

            cache_key = target_id.lower()
            target_theme = target_cache.get(cache_key)
            if target_theme is None:
                try:
                    target_theme = load_theme(target_name)
                except FileNotFoundError:
                    try:
                        target_theme = load_theme(target_id)
                    except FileNotFoundError:
                        logger.info("Target theme not found: %s (proposal %s)", target_name, combo_id)
                        log_progress(
                            f"SKIP missing target theme {combo_id} proposal {proposal_index}: {target_name}"
                        )
                        continue
                target_cache[cache_key] = target_theme

            prompt = render_scoring_prompt(sources, target_theme, rationale)
            for pass_index in range(passes):
                response_text = client.generate(model=model, prompt=prompt, options=options)
                try:
                    parsed_score = _parse_scoring_response(response_text)
                except ValueError as exc:
                    logger.error(
                        "Failed to parse scoring response for %s proposal %s pass %s: %s",
                        combo_id,
                        proposal_index,
                        pass_index,
                        exc,
                    )
                    parsed_score = {"error": str(exc), "raw_response": response_text}

                record = {
                    "scoring_model": model,
                    "prompt_version": PROMPT_VERSION,
                    "sources": [theme.id for theme in sources],
                    "target": target_theme.id,
                    "target_name": target_theme.name,
                    "proposal": {
                        "source_record": str(payload.get("_source_path")),
                        "proposal_index": proposal_index,
                        "rationale": rationale,
                        "confidence_hint": proposal.get("confidence_hint"),
                        "raw": proposal,
                    },
                    "pass_index": pass_index,
                    "options": options,
                    "raw_response": response_text,
                    "parsed": parsed_score,
                }
                if include_prompt:
                    record["prompt"] = prompt

                output_path = output_root / f"{combo_id}__sample{payload.get('sample_index', 0)}__{proposal_index}__pass{pass_index}.json"
                if skip_existing and output_path.exists():
                    continue
                io_utils.write_json(output_path, record)
                log_progress(
                    f"WRITE {combo_id} proposal {proposal_index} pass {pass_index} -> {output_path.name}"
                )

    logger.info("Stage 2 completed. Results saved to %s", output_root)
    log_progress(f"DONE wrote results to {output_root}")


def parse_args(argv: Sequence[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Stage 2: score candidate theme transitions.")
    parser.add_argument("--input", type=Path, help="Path to Stage 1 directory (defaults to latest).")
    parser.add_argument("--model", help="Override scoring model.")
    parser.add_argument("--passes", type=int, help="Override number of scoring passes.")
    parser.add_argument("--include-prompt", action="store_true", help="Persist prompt text with each record.")
    parser.add_argument("--start-index", type=int, default=0, help="Skip the first N proposal records.")
    parser.add_argument("--limit", type=int, help="Limit number of proposal records.")
    parser.add_argument("--no-skip-existing", action="store_true", help="Re-score even if output file exists.")
    parser.add_argument("--output-dir", type=Path, help="Directory for scored records (resume support).")
    parser.add_argument(
        "--progress-log",
        type=Path,
        help="Append progress messages to this file for long-running jobs.",
    )
    return parser.parse_args(argv)


def main(argv: Sequence[str] | None = None) -> None:
    args = parse_args(argv)
    config = CatalogConfig()
    score(
        config,
        input_dir=args.input,
        model_override=args.model,
        passes_override=args.passes,
        include_prompt=args.include_prompt,
        start_index=args.start_index,
        limit=args.limit,
        skip_existing=not args.no_skip_existing,
        output_dir=args.output_dir,
        progress_log=args.progress_log,
    )


if __name__ == "__main__":
    main()
