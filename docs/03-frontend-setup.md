# Frontend Setup

The frontend is a Vite React application that requests a token from the backend and connects directly to LiveKit.

## Scaffold And Install

```bash
mkdir -p frontend
npm create vite@latest frontend -- --template react
cd frontend
npm install
npm install livekit-client @livekit/components-react @livekit/components-styles
```

## Git Commands

```bash
git add frontend docs/03-frontend-setup.md
git commit -m "feat(frontend): add livekit room client"
```

## Environment Variables

- `VITE_BACKEND_URL` should point to the VPS 2 backend URL
- `VITE_LIVEKIT_URL` should point to the external LiveKit server URL

## Run Locally

```bash
cd frontend
npm run dev
```

## Production Deployment

1. Deploy the `frontend` folder to VPS 2.
2. Build it with `npm run build`.
3. Serve the `dist` directory with a static web server such as Nginx.
