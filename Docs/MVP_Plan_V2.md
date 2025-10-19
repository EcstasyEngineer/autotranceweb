# MVP Plan — PWA + Tidal‑like Audio from Prisma

This plan updates the original MVP to ship a practical end‑to‑end: a server with a PWA frontend that generates and plays TidalCycles‑like patterns using data stored in Prisma. It favors a small, maintainable core that can run on a cheap VPS or move to serverless later.

## Goals
- PWA frontend that plays algorithmic audio from patterns (Tidal/Strudel style) and stored samples.
- Minimal server (Next.js API or Node) for auth, Prisma DB access, pattern/schedule persistence, and asset delivery.
- Fast audio ingestion pipeline (drop files, auto‑transcode, index in DB).
- Works offline (cached packs/patterns) and online (optional sync + shared sessions).

Non‑Goals (MVP)
- Full collaborative editing, multi‑user session sync, or DAW‑grade editing.
- Perfectly normalized content taxonomy (keep it simple until v2).

## Architecture

Option A — PWA audio engine (recommended for MVP)
- Engine: Strudel (JS port of Tidal) in the browser using Web Audio.
- Server: CRUD for patterns, packs, sessions; signed URLs for audio; optional WS for control.
- Pros: simpler deploy, zero audio on server, easy offline, no Haskell.
- Cons: some engines/effects differ from desktop Tidal; device audio constraints apply.

Option B — Server engine (tidal‑websocket)
- Haskell Tidal + SuperCollider server; expose WebSocket API; client is a thin controller.
- Pros: authentic Tidal; can render audio server‑side.
- Cons: heavier runtime, trickier deploys (Haskell + SC), more ops.

MVP choice: Option A now; keep a narrow compatibility layer so Option B can be added for server rendering later (export patterns as strings or event JSON).

## Data Model (Prisma) — Minimal, Practical

- AudioAsset
  - id, kind ('sample'|'loop'|'stem'), codec ('opus'|'wav'|...), mimeType, sampleRate, channels, durationMs, size, sha256
  - storage ('url'|'blob'), url (nullable), blob (nullable)
  - packId (optional), tags (string[]), createdAt, updatedAt
- SamplePack
  - id, name, baseUrl, license, coverUrl, meta (Json)
- Pattern
  - id, name, engine ('strudel'|'tidal'), mini (string), tempo (bpm), meter (e.g. '4/4'), tags (string[]), createdById, updatedAt
- Instrument
  - id, name, type ('sampler'|'synth'), params (Json), defaultPackId (optional)
- Clip (lightweight arrangement unit)
  - id, patternId, instrumentId, startCycle, lengthCycles, gain, pan, params (Json)
- Session
  - id, name, bpm, startedAt, endedAt, ownerId
- ThemeLink (optional bridge to catalog)
  - id, themeId (slug), patternId

Notes
- If storage='url', files live in object storage (S3/R2/Supabase) or public folder; DB holds metadata.
- If storage='blob', DB stores a small opus blob (best for short one‑shots). Keep under ~256KB for sanity.
- We can support both; prefer URL+object storage for serverless/VPS portability.

## Audio Ingestion Pipeline

CLI/Script `scripts/audio/ingest` (can be Node or Python):
- Input: folder(s) of audio.
- Steps:
  1) Transcode to Opus 48k (96–160 kbps) and/or keep original WAV.
  2) Compute sha256, duration, channels, sample rate.
  3) Emit `pack.manifest.json` mapping logical names to URLs (or blob payloads for small hits).
  4) Upload to object storage and mint canonical URLs; or store as blob in DB.
  5) Create/Upsert `SamplePack` + `AudioAsset` rows; link `Instrument` defaults as needed.
- Output: console summary + JSON report for audit.

## PWA Frontend
- Engine: Strudel in a Web Worker (or AudioWorklet) for timing stability.
- Cache: pre‑cache selected `SamplePack`s and `Pattern`s in CacheStorage/IndexedDB; offline first playback.
- UI: minimal editor (pattern string + tempo), pack browser, play/stop, save pattern to DB.
- Transport: 1 shared clock; `hush()`/solo controls; local gain/mix.

## Server API
- Auth: NextAuth (credentials) with fixed hashing (complete registration flow).
- Patterns: CRUD; list by tag/theme; latest N per user.
- Packs/assets: list, signed URL fetch; HEAD to validate cache freshness.
- Sessions: create/join/start/stop; optional `/ws` for real‑time control (future).

## Deployment Options
- Cheap VPS (Docker): simplest for WS + file uploads; persistent volume for cache and secrets.
- Serverless: feasible if audio is client‑side; keep object storage for assets; WebSocket becomes SSE or 3rd‑party (Ably/Pusher) for live control.

## Acceptance Criteria (MVP)
- Load app → login → open PWA → choose a pack → enter a pattern → press Play → hear audio.
- Patterns + sessions persist in Prisma.
- Ingest script adds a new pack; PWA finds it and can play samples offline.
- Basic QA: pattern roundtrip (edit → save → reload), mobile audio unlock, hush/stop works.

## Near‑Term Next Steps
- Content: add 1–2 demo packs and 10–20 seed patterns mapped to v4 backbone (e.g., obedience/surrender scaffolds).
- Writer integration (later): given a headspace, fetch recommended sequence and emit starter patterns.
- Optional: revive `tidal-websocket` for server rendering (alternate engine), behind a feature flag.

## Codebase Actions Backlog (from 2025‑10‑12 Analysis)
1) Realign Prisma usage and add `lib/prisma`; seed Themes/Patterns/Packs.
2) Fix credential auth end‑to‑end (hash + login); add minimal validation.
3) Wire session builder/player to real data (remove mocks); add CRUD routes.
4) Stabilize rendering lifecycles (e.g., SpiralViewer/WebGL); guard unfinished routes.
5) Add `.env.local` defaults, first migration, and seed script.

---

## Appendix — Storage Choice
- URL + Object Storage
  - Pros: cheap, CDN‑friendly, serverless‑ready; good for large samples/loops.
  - Cons: two‑hop fetch; must sign URLs for private packs.
- DB Blob (Opus)
  - Pros: single read via API; fine for tiny hits or embedded “one‑shot” packs; easier atomic backups.
  - Cons: DB bloat, harder CDN; avoid for >256KB assets.

Recommendation: default to URL/object storage; allow blob for tiny assets.
