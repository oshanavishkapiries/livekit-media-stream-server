# Backend Setup

The backend is a standalone Express service that issues LiveKit access tokens.

## Install Dependencies

```bash
mkdir -p backend
cd backend
npm init -y
npm install express cors dotenv livekit-server-sdk
npm install -D nodemon
cp .env.example .env
```

## Git Commands

```bash
git add backend docs/02-backend-setup.md
git commit -m "feat(backend): add token wrapper"
```

## Environment Variables

- `PORT` defaults to `3001`
- `LIVEKIT_URL` must point to the external LiveKit server
- `LIVEKIT_API_KEY` must match `livekit-server/livekit.yaml`
- `LIVEKIT_API_SECRET` must match `livekit-server/livekit.yaml`

## Run Locally

```bash
cd backend
npm run dev
```

## Production Deployment

1. Deploy the `backend` folder to VPS 2.
2. Install Node.js 20 or later.
3. Set environment variables using a process manager like systemd or PM2.
4. Start the service with `npm start`.

## API Contract

- `POST /getToken`
- Body: `{ "identity": "...", "roomName": "...", "name": "..." }`
- Response: `{ token, url, roomName, identity }`
