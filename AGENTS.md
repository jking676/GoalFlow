# AGENTS.md

## Project overview
GoalFlow — a pure frontend Vite + React 19 + TypeScript + Tailwind CSS v4 app (lucide-react icons). No backend, no database; all persistence is via `localStorage` in the browser (seed data on first load).

## Running in Base44
- `docker compose -f docker-compose.base44.yml up -d` brings up a `node:22` container running the Vite dev server.
- Source is bind-mounted at `/app`; `node_modules` lives in a named volume. Deps install on container startup (`npm install`, no lockfile committed).
- Vite dev server listens on port 5173 inside the container, mapped to host port 3000.
- Host allowlist handled via the `__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS` env var (platform-provided); dev server binds `0.0.0.0`.

## Verifying it works
- `curl -sf http://127.0.0.1:3000/` returns the `index.html` with `/src/main.tsx` as the entry.
- `curl -s http://127.0.0.1:3000/src/main.tsx` returns compiled (transformed) JS — confirms live source serving, not a prebuilt bundle.
- Healthcheck probes `http://127.0.0.1:5173/` inside the container.

## Secrets
None required. No external services.
