# Telehealth Monorepo

This repository is structured as a monorepo, but each service is intentionally deployable on its own.

## Architecture

- `livekit-server` is the standalone WebRTC signaling and media layer for VPS 1.
- `backend` is the Express token wrapper for VPS 2.
- `frontend` is the React Vite client for VPS 2.
- `docs` contains deployment and operational notes.

## Repository Layout

```text
/telehealth-monorepo
  /livekit-server
  /backend
  /frontend
  /docs
  .gitignore
  README.md
```

## Local Development

### 1. LiveKit Server

```bash
cd livekit-server
docker compose up -d
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Production Deployment Strategy

### VPS 1

Deploy only `livekit-server/`.

- Run `docker compose up -d` inside that folder.
- Expose `7880/tcp`, `7881/tcp`, and `50000-50100/udp`.
- Keep the LiveKit API key and secret synchronized with the backend environment.

### VPS 2

Deploy `backend/` and `frontend/` separately.

- Backend: run as a Node.js service on port `3001` or your chosen port.
- Frontend: build with Vite and serve `dist/` through Nginx or a similar static server.
- Configure the frontend to call the backend via `VITE_BACKEND_URL`.
- Configure the backend to point at the external LiveKit server via `LIVEKIT_URL`.

## Git Workflow

Use small, conventional commits per service boundary.

### Example Step 1 Commit

```bash
git add .gitignore livekit-server docs/01-livekit-deployment.md
git commit -m "feat(livekit): add standalone server deployment"
```

### Example Step 2 Commit

```bash
git add backend docs/02-backend-setup.md
git commit -m "feat(backend): add token wrapper"
```

### Example Step 3 Commit

```bash
git add frontend docs/03-frontend-setup.md
git commit -m "feat(frontend): add livekit room client"
```

### Final Commit

```bash
git add README.md docs
git commit -m "docs: add master deployment guide"
```
