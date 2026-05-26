# Hitha — LiveKit Video & Voice POC

Minimal proof-of-concept application to test LiveKit video and voice calling for the Hitha platform.

## Architecture

```
/frontend  — React (Vite) app with LiveKit Client SDK
/backend   — Express API server with LiveKit Server SDK
/docs      — Testing guide and POC checklist
```

The backend generates access tokens securely. The frontend uses those tokens to connect to LiveKit rooms. **LiveKit API secrets never leave the backend.**

## Prerequisites

- Node.js 18+ and npm
- A LiveKit instance (cloud or self-hosted)
  - Get a free LiveKit Cloud project at https://cloud.livekit.io
  - Or run locally: `docker run -p 7880:7880 livekit/livekit-server --dev`

## Setup

```bash
# Install all dependencies (root + backend + frontend)
npm install

# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### Configure environment

**backend/.env** — fill in your LiveKit credentials:
```
LIVEKIT_URL=ws://localhost:7880
LIVEKIT_API_KEY=devkey
LIVEKIT_API_SECRET=secret
PORT=3001
```

For LiveKit Cloud, get your URL/API key/secret from the LiveKit Cloud dashboard.

**frontend/.env** — points to backend:
```
VITE_API_BASE_URL=http://localhost:3001
```

## Running

```bash
# Start both backend and frontend:
npm run dev

# Or start individually:
npm run backend   # http://localhost:3001
npm run frontend  # http://localhost:5173
```

## How to Test

1. Start the backend and frontend
2. Open http://localhost:5173 in two browser tabs
3. In Tab 1: enter your name, enter a room name (e.g. "test-room"), click "Join as Client"
4. In Tab 2: enter a different name, enter the **same** room name, click "Join as Therapist"
5. Both participants should see each other's video and hear audio
6. Test mute, camera toggle, and leave controls
7. See `docs/testing.md` for more detailed testing instructions

## Environment Variables

### Backend

| Variable | Description |
|---|---|
| `LIVEKIT_URL` | WebSocket URL of LiveKit server |
| `LIVEKIT_API_KEY` | LiveKit API key |
| `LIVEKIT_API_SECRET` | LiveKit API secret (never exposed to frontend) |
| `PORT` | Backend server port (default: 3001) |

### Frontend

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Backend API base URL |

## API Endpoints

### `GET /health`
Health check. Returns server status and LiveKit URL.

### `POST /livekit/token`
Generate a LiveKit access token.

Request body:
```json
{
  "roomName": "test-room",
  "participantName": "Alice",
  "participantRole": "client"
}
```

Response:
```json
{
  "accessToken": "eyJhbG...",
  "roomUrl": "ws://localhost:7880",
  "roomName": "test-room",
  "participantName": "Alice",
  "participantRole": "client"
}
```

## Security Notes

- LiveKit API secret is **never** sent to the browser
- Tokens are generated server-side in `/livekit/token`
- For production, room names should come from appointment/session IDs
- Production will add: authentication, authorization, recording policy, consent flows, audit logs
