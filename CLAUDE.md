# AI Conditioner Web

AI Conditioner Web is a greenfield Next.js 15 application for generating hypnotic suggestions with assistive AI. It blends an adaptive content engine—borrowing ideas from livecoding tools like TidalCycles and earlier internal prototypes—with a modern audio pipeline so users can assemble, render, and replay immersive sessions.

## Vision
- **Dynamic session builder** that lets creators stitch together phases, pick themes, and preview timing before publishing.
- **Cycler-driven content flow** that adapts mantra ordering, pacing, and emphasis based on user intent (focus, arousal, depth).
- **AI-assisted voice work** through a TTS layer that caches rendered audio and keeps consistent voices across sessions.
- **Persistent backend** so generated assets, templates, and telemetry survive across browser sessions and devices.

## Stack Overview
- **Framework**: Next.js 15 (App Router) with React Server Components and Tailwind CSS.
- **Language & Tooling**: TypeScript, ESLint, Prettier, Turbopack for fast dev builds.
- **State**: React Query for server cache, Zustand for client state, and session-state helpers in `lib/session-engine/`.
- **Auth**: NextAuth.js configured for credentials + OAuth providers.
- **Database**: Prisma ORM targeting PostgreSQL; SQLite is supported for local prototypes via connection string swap.
- **Audio**: AWS Polly integration with SHA256-based caching stored alongside rendered mantra text.

## Getting Started
```bash
npm install              # install deps
npm run dev              # dev server
npm run lint             # project linting
npm run build            # production build
npm start                # serve production build
```

Prisma commands you will reach for often:
- `npx prisma generate` – regenerate the client after schema tweaks.
- `npx prisma migrate dev` – create and apply a migration while prototyping.
- `npx prisma db push` – push schema to dev DB without migrations (useful early on).
- `npx prisma studio` – inspect and edit records through Prisma Studio.

## Key Subsystems

### App Router (`app/`)
- `app/page.tsx` acts as the marketing/landing shell.
- Auth flows live under `app/auth/`, the dashboard under `app/dashboard/`, and the session builder/player under `app/session/`.
- API routes (`app/api/.../route.ts`) power server-side session manipulation, theme lookup, and TTS rendering without leaving the App Router.

### Session Engine (`lib/session-engine/`)
- **Cyclers** (`cyclers/*.ts`) control the ordering logic for mantra delivery: adaptive, weave, cluster, and more experimental behaviors.
- **Players** (`players/*.ts`) define spatialization and timing (direct, tri-chamber, rotational, etc.).
- `director.ts`, `session-parser.ts`, and `types.ts` wire cyclers, players, and telemetry together so phases can adapt mid-session.

### Audio & Templates (`lib/tts/` and `lib/mantras/`)
- Template rendering handles variable substitution (`{subject_subjective}`), verb conjugation, and persona POV selection before hitting Polly.
- Audio files are hashed by rendered text to avoid duplicate synthesis and to enable CDN migration later.

### Data Model (Prisma)
- **User** – credentials, POV preferences, and telemetry aggregate.
- **Theme** – curated hypnosis motifs with tagging and CNC flags.
- **Mantra** – template text tied to themes, difficulty, and content flags.
- **RenderedMantra** – concrete text/audio output keyed by hash.
- **UserSession / Phase / PhaseItem / Effect** – builder output describing how a session plays back.
- **Telemetry** – optional live measurements (arousal/focus/depth) for adaptive loops.

## Content Sources
- Structured hypnosis content lives under `hypnosis/` (mantras and modular session pieces).
- Ontology metadata and theme descriptors live in `ontologies/`.
- Visuals, shaders, and audio assets reside in `assets/` (source) and `public/` (served).

## Development Workflow
- Favor incremental commits with Conventional Commit messages (`feat(session): add adaptive cycler strategy`).
- Keep tests and lint passing (`npm run lint`). Add Playwright/jest coverage as the test story evolves.
- When altering schema or session engine primitives, update related docs in `docs/` (e.g., `Session_Grammar.md`, `cyclers_and_players_overview.md`).
- Use feature branches (`feature/new-session-phase`) and squash merge back into `main`.

## Issue & Task Tracking
- Issue title pattern: `[Area] short description` (e.g., `[Session Engine] Adaptive loop stalls`).
- Minimum labels: one type (`bug`, `enhancement`, `documentation`, `tech-debt`), one priority (`priority-high`, `priority-medium`, etc.), and the relevant feature label (`feature-session-engine`, `feature-tts`, `feature-ui`, ...).
- When filing issues, include reproduction steps, environment info (`node -v`, `npm -v`, branch), and direct file references such as `lib/session-engine/cyclers/adaptive.ts:45`.
- For GH CLI: `gh issue create --title "…" --body "…" --label "bug,feature-session-builder,priority-medium"`.

## Build Troubleshooting Checklist
- [ ] Dependencies installed (`npm install`) and Node ≥ 18.
- [ ] Prisma client regenerated after schema changes.
- [ ] `npm run lint` and future `npm test` succeed locally.
- [ ] `.next/` cache cleared if hot reload acts stale.
- [ ] Environment variables (`DATABASE_URL`, AWS credentials for Polly) present in `.env.local`.

## Open Questions / Next Up
- Finalize how adaptive cyclers read telemetry in real time (web sockets vs polling).
- Decide on default voice pack & fallback when Polly quota hits limits.
- Align SQLite dev workflow with production Postgres migrations to avoid drift.
- Document a happy-path user journey through the session builder once UI stabilizes.
