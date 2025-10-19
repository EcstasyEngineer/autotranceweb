Common local issues and fixes

- Node version mismatch
  - Use Node 18 or 20. Check with `node -v`.

- Missing env vars
  - Copy `.env.example` to `.env.local` and fill at least: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`.
  - If using AWS Polly locally, also set `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`.

- Prisma client errors
  - Run: `npx prisma validate && npx prisma generate`.
  - For a fresh SQLite dev DB: set `provider = "sqlite"` in `prisma/schema.prisma` and `DATABASE_URL="file:./dev.db"`, then `npx prisma db push`.

- Dev server port in use
  - Run with a different port: `PORT=3001 npm run dev`.

- NextAuth callback errors in dev
  - Ensure `NEXTAUTH_URL` matches the browser URL, e.g., `http://localhost:3000`.
  - Set a valid `NEXTAUTH_SECRET`.

- Type errors
  - Run `npm run typecheck`. If errors reference AWS/Polly and you don't need TTS, verify you aren't importing TTS code in server components unnecessarily.

- Lint fails
  - Run `npm run lint -- --fix` or `npx eslint . --ext .ts,.tsx --fix`.

- WSL networking hiccups
  - Use `npm run probe` to test inbound reachability (see `scripts/wsl-probe.mjs`).

