# GoalFlow — Base44 Dev Environment

## Overview
Pure frontend app: Vite 8 + React 19 + TypeScript + Tailwind CSS v4 + lucide-react.
No backend, no database, no external services. All data persists in `localStorage`.

## Running
- `docker compose -f docker-compose.base44.yml up -d`
- Web entry point on host port 3000 (maps to container Vite dev server on 5173).
- No lockfile is committed; `npm install` runs on every container start.
- Vite dev server with HMR — edits appear via live reload, no rebuild needed.

## Verification
- `curl http://localhost:3000/` returns the HTML shell with Vite client injected (dev mode, not a prebuilt bundle).
- Healthcheck probes `http://localhost:5173/` from inside the container.

## Secrets
None required. The app is fully self-contained with no external integrations.
