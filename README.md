
# Hypnosis Content Generation Application

This project generates dynamic, personalized hypnosis sessions using theme ontologies, templated mantras, and an extendable session engine. Below is an up‑to‑date snapshot of the architecture and state of the app to help contributors and reviewers quickly understand how things fit together.

## Architecture Snapshot

### Core Environment

- Frameworks: Next.js 15.1.7 (App Router), React 19
- Tooling: TypeScript, Tailwind CSS, PostCSS; Next dev uses Turbopack
- Package manager: npm (package-lock.json present)
- Node versions: CI runs 18.x and 20.x

Environment variables (names only; set in `.env.local`):
- `DATABASE_URL` – Prisma datasource (Postgres)
- `NEXTAUTH_SECRET` – NextAuth JWT/session secret
- `NEXTAUTH_URL` – Base URL for NextAuth
- `PROBE_PORT`, `PROBE_HOST` – Dev probe server settings (optional)
- AWS Polly (if used): `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`

### Backend

- Database/ORM: Postgres + Prisma (`prisma/schema.prisma`)
- Key models: `User`, `Theme`, `Mantra`, `RenderedMantra`, `UserSession`, `Phase`, `PhaseItem`, `Effect`, `Telemetry`, plus NextAuth tables
- Auth: NextAuth (JWT strategy) with Credentials provider; registration stores bcrypt‑hashed passwords
- Content loading: `lib/themes.ts` reads `ontologies/` and `hypnosis/mantras/` at runtime to upsert Prisma `Theme` and `Mantra`
- TTS/audio: API returns placeholder URLs; `lib/tts/aws-polly.ts` is ready to call Polly but route currently stubs generation

API routes:
- `GET/POST /api/auth/[...nextauth]` – NextAuth handler
- `POST /api/auth/register` – Create user (name/email/password → bcrypt)
- `GET /api/themes` – List themes with mantras (from DB)
- `POST /api/themes` – Load/refresh DB from `ontologies/` and `hypnosis/mantras/`
- `GET /api/tts/generate` – Return available TTS options
- `POST /api/tts/generate` – Generate text variants; returns placeholder `audioUrl`

### Frontend

- App routes (selected):
  - `/` (server component): redirects authenticated users to `/dashboard`
  - `/dashboard` (client): theme discovery + entry points
  - `/themes` (client): browse/search themes (fetches `/api/themes`)
  - `/sessions` (client): list user sessions (placeholder)
  - `/session/builder` (client): build multi‑phase sessions (local state)
  - `/admin/mantra-editor` (client): template editor + variant preview
  - `/auth/signin`, `/auth/signup` (server wrappers render client forms)
- Visuals & audio: WebGL fragment shader viewer (`public/shaders/*.frag`) and minimal WebAudio placeholder player
- PWA: No manifest/service worker configured

### Data & Ontologies

- Ontology JSON: `ontologies/*.json` (description, appeal, tags, keywords, cnc)
- Mantras: `hypnosis/mantras/<Category>/<Theme>.json|.txt` (templated lines + optional difficulty)
- Loader: `ThemeLoader` populates/updates Prisma, estimating difficulty/points when absent

### Deployment & CI

- Local dev: `npm run dev` (Turbopack)
- CI: GitHub Actions runs TS/ESLint/Prisma validate and a non‑blocking Next build with minimal env
- Deployment: No automated deploy; `deploy.yml` is a manual placeholder

### Current Limitations

- TTS/audio route returns placeholders; no file persistence/CDN yet
- Theme loading uses filesystem at runtime (not serverless‑friendly)
- Session Builder lacks persistence APIs for `UserSession`/`Phase`/`PhaseItem`
- No PWA manifest/service worker

### Next Steps (High‑leverage)

1) Implement real TTS generation + storage (use `AWSPollyTTS`, return actual URLs/durations)
2) Add REST endpoints and DB writes for sessions/phases; wire dashboard/sessions
3) Migrate from runtime fs loader to pre‑seeded DB; provide seed script
4) Add request validation (Zod) and basic rate limiting for auth/tts


## Overview

The Hypnosis Content Generation Application serves as an engine that generates dynamic and personalized hypnosis content through structured phases, each designed to guide the user deeper into a hypnotic experience. Key features include:  

- **Themes**: High-level hypnosis motifs such as submission, mind emptying, or roleplay identities, which influence the content and focus of each session. [More details](Docs/Themes.md)
- **Phases**: Structured segments within each session that progress through hypnotic stages—starting with an induction, followed by deepeners, and then flowing into suggestion-focused phases based on the chosen themes. Each phase includes specific objectives, such as deepening trance, enhancing focus, or instilling particular suggestions, creating a cohesive journey for the user. [More details](Docs/cyclers_and_players_overview.md)
- **Sessions**: Configurations that define the hypnosis experience, including selected themes, user preferences, difficulty levels, and duration. Sessions are composed of phases, ensuring a guided and adaptive flow tailored to individual goals.
- **State Tracking**: The application constantly re-estimates the listener's arousal, focus, and depth.
  - **Arousal**: Increases if suggestive themes, or JOI state (green - increase slowly, purple increase fast). Cumulative. Plans for using heart rate data to fine tune this.
  - **Focus**: Depends on the theme (if theme calls attention), or if JOI state is in purple.
  - **Depth**: Depends on number of deepeners used recently.
- **Adaptive Content**: Based on the state tracking, the application dynamically adjusts the content to better suit the listener's current state, ensuring a more effective and personalized hypnosis experience. [More details](Docs/Adaptive_Director.md)
## User Interface
todo (mantra builder, line builder, session builder, session player)

## Example Sessions

### **Somnophilia and Ego Loss Marriage**

**Description:**  
This session guides the listener into a dreamy, sleep-like state (Somnophilia), then gently erodes their sense of self (Ego Loss) while instilling a sense of union or “marriage” to the experience. By the end, the participant feels deeply merged with the hypnotic suggestions and themes of devotion.

| Phase            | Duration | Theme(s)                 | Player        | Cycler        | Script Segment?          |
|------------------|----------|--------------------------|---------------|---------------|--------------------------|
| Induction         | 2 min    | Relaxation               | Direct        | Chain         | Intro relaxation script  |
| Drift into Sleep  | 3 min    | Somnophilia + Acceptance | TriChamber    | Adaptive      | (none, mantra only)      |
| Dissolving Self   | 4 min    | Ego Loss + Confusion     | Rotational    | Cluster       | Ego-loss deepener script |
| Unified Devotion  | 3 min    | Somnophilia + Worship    | Composite     | Random        | (none, mantra only)      |
| Final Merge       | 3 min    | Ego Loss + Devotion      | Layered       | Weave         | Final marriage script    |

---

### **Latex Drone Enslavement**

**Description:**  
The subject is introduced to a scenario where they become a compliant latex-clad drone. Early phases use drone identity and obedience themes, moving into a state of total, almost mechanical servitude.

| Phase             | Duration | Theme(s)              | Player      | Cycler    | Script Segment?          |
|-------------------|----------|-----------------------|-------------|-----------|--------------------------|
| Conditioning Start | 2 min    | Submission + Drone     | Direct      | Chain     | (none, mantra only)      |
| Latex Identity     | 3 min    | Drone + Overload       | TriChamber  | Adaptive  | Latex induction script   |
| Enslavement Core   | 4 min    | Obedience + Brainwashing | Rotational | Cluster | (none, mantra only)      |
| Mechanical Reinforcement | 3 min | Drone + Mindbreak  | Composite   | Random    | Drone obedience script   |
| Final Integration  | 3 min    | Surrender + Slave      | Layered     | Weave     | (none, mantra only)      |

---

### **Productivity and Fitness Regimen**

**Description:**  
This session focuses on improving the subject’s daily productivity and encouraging a consistent fitness routine. It starts with a relaxing induction, leads into motivating suggestions, and ends with reinforcing new habits.

| Phase               | Duration | Theme(s)           | Player     | Cycler     | Script Segment?          |
|---------------------|----------|--------------------|------------|------------|--------------------------|
| Calm Focus          | 2 min    | Relaxation + Focus | Direct     | Chain      | (none, mantra only)      |
| Motivating Routine  | 3 min    | Productivity + Affirmation | TriChamber | Adaptive | Productivity script |
| Fitness Encouragement | 3 min  | Fitness + Discipline | Rotational | Cluster   | (none, mantra only)      |
| Habit Reinforcement | 4 min    | Suggestibility + Devotion | Composite | Random  | (none, mantra only)      |
| Empowered Outlook   | 3 min    | Confidence + Pride | Layered    | Weave      | Final empowerment script  |

Click here for a more [`exhaustive list`](Docs/Example_Sessions.md)  
Click here for a moreFor more details on the [`formal session grammar`](Docs/Session_Grammar.md)

## Backend Components

- **Database**: Uses SQLite, with support for PostgreSQL. Stores text snippets, audio files, images, and user preferences.
- **API**: Manages session configuration and content retrieval. Supports secure data transfer and authentication.

## Getting Started

Follow this path to run the app through theme selection and into the session player UI. Audio rendering is stubbed; see “Audio page behavior” and “TidalCycles renderer (roadmap)”.

### 1) Install and run

- `cd ai-conditioner-web`
- `cp .env.example .env.local`
- Set in `.env.local`:
  - `NEXTAUTH_SECRET` (random string)
  - `NEXTAUTH_URL` (e.g., http://localhost:3000)
  - `DATABASE_URL` (see DB options below)
- Install deps: `npm ci`
- Sanity check: `npm run typecheck` and `npm run lint`
- Prisma: `npx prisma validate && npx prisma generate`
- (If starting from empty DB) `npx prisma db push`
- Dev: `npm run dev` (Turbopack)

### 2) Database options

- Postgres (default in `prisma/schema.prisma`): set `DATABASE_URL=postgres://…` in `.env.local`.
- SQLite (fast local dev): edit `prisma/schema.prisma` datasource to `provider = "sqlite"` and set `DATABASE_URL="file:./dev.db"`; then `npx prisma generate && npx prisma db push`.

### 3) Sign up and sign in

- Visit `/auth/signup` to create an account, then sign in at `/auth/signin`.

Note for maintainers: The registration route should hash and store passwords (see “Known hotspots and quick fixes”).

### 4) Load themes and browse

- Go to `/dashboard`, click “Load Themes”.
- This imports ontologies from `ontologies/*.json` and mantras from `hypnosis/mantras/**` into the database.
- The Theme Browser lists themes and basic metadata for selection.

### 5) Build and play a session

- Open `/session/builder` and add phases. For each phase:
  - Choose a Player (spatialization style): Direct, Tri‑Chamber, Stereo Split, Rotational, Layered
  - Choose a Cycler (selection style): Random, Chain, Adaptive, Weave, Bridge
  - Select one or more Themes
- Save the session, then open `/session/player/:id` from the Dashboard.

## Theme loading details

- Ontologies: `ontologies/*.json` include `description`, `appeal`, `keywords`, optional `tags`, and optional `cnc`.
- Mantras: JSON files commonly use `line` and `difficulty`; TXT files are scored via a simple heuristic.
- API routes:
  - `POST /api/themes` — loads ontologies and mantras
  - `GET /api/themes` — returns themes with mantras for UI
- Maintainer notes:
  - Ensure `lib/themes.ts` imports Prisma from `./db` and maps ontology fields to the Prisma `Theme` model. If you add ontology fields, update `ThemeLoader` accordingly.

## Audio page behavior

- Visuals
  - WebGL spiral (`components/ui/spiral-viewer.tsx`) toggles on/off; animation speed follows Play/Pause.
- Controls
  - Play/Pause, skip phase, master volume slider. Shows Player (spatialization) and Cycler (selection) per phase.
- Mantra display
  - “Current Mantra” text updates at segment boundaries.
- Spatialization intent (metadata)
  - Players annotate `audioPan` per segment:
    - Direct: center (0.0)
    - Tri‑Chamber: cycle left/center/right (-0.5, 0.0, 0.5)
    - Rotational: cycle pan and add visual rotation
  - A minimal WebAudio layer can map `audioPan` to a `StereoPannerNode` and schedule segments.

## TidalCycles renderer (roadmap)

Use TidalCycles/SuperDirt for generative ambience and spatial cues while TTS remains in‑browser.

- Separate audio host: SuperCollider + SuperDirt + TidalCycles
- Service: accept phase/player/cycler state and translate to Tidal patterns; send via OSC
- Frontend: on phase changes, POST a “scene” (bpm, intensity, pan pattern) to the service; keep TTS in WebAudio
- Fallback: if host is unreachable, continue with visuals + WebAudio only

## API Reference (summary)

- Auth
  - `POST /api/auth/register` → `{ name, email, password }` → 201 with `userId`
  - `GET/POST /api/auth/[...nextauth]` → NextAuth credentials login
- Themes
  - `GET /api/themes` → themes with mantras (name, tags, keywords, cnc)
  - `POST /api/themes` → scan `ontologies/` + `hypnosis/mantras/` and upsert DB
- TTS
  - `GET /api/tts/generate` → available voices/engines/formats
  - `POST /api/tts/generate` → templated variants; returns placeholder `audioUrl`

## Environment Variables (local dev)

Create `.env.local` with at least:

```
DATABASE_URL=postgresql://user:pass@localhost:5432/conditioner
NEXTAUTH_SECRET=replace-with-random-string
NEXTAUTH_URL=http://localhost:3000
# Optional, if integrating AWS Polly:
# AWS_ACCESS_KEY_ID=...
# AWS_SECRET_ACCESS_KEY=...
# AWS_REGION=us-east-1
```

## Known hotspots and quick fixes

- Registration password hashing is implemented
  - File: `app/api/auth/register/route.ts` (bcrypt hash on create); login uses `bcrypt.compare` in `lib/auth.ts`.

- Theme loader import and field mapping
  - File: `lib/themes.ts`
  - Ensures ontology fields → Prisma `Theme`; sets categories from `tags` or fallback categorizer.

- TTS/audio is currently stubbed
  - `lib/tts/aws-polly.ts` is ready to call Polly; `/api/tts/generate` returns placeholders. For real synthesis, call Polly, persist audio, and return actual URLs/durations.

## License

This project is licensed under the MIT License. See the [`LICENSE`](LICENSE) file for more information.
