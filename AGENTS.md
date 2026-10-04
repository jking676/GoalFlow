# GoalFlow — Base44 Dev Environment

## Overview
Frontend-only Vite + React 19 + TypeScript + Tailwind CSS v4 app. No backend, no database, no external services. All persistence is via `localStorage` in the browser. Data seeds automatically on first load.

## Running
```bash
docker compose -f docker-compose.base44.yml up -d --build
```
- App served on host port 3000 (maps to Vite's 5173 inside the container).
- `node:22` base image; source bind-mounted at `/app`.
- Dependencies installed on container startup via `npm install` (no lockfile committed).
- Live-reload dev server (`vite --host 0.0.0.0`); edits appear without rebuilds.

## Verification
- `curl http://localhost:3000/` returns the Vite-served HTML with `/@vite/client` (dev mode, not a prebuilt bundle).
- Healthcheck: `wget -qO- http://localhost:5173/` inside the container.

## No secrets required
The app has no external service dependencies. No credentials needed.
