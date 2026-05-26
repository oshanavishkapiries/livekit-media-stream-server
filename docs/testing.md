# LiveKit POC — Local Testing Guide

This guide explains how to test the Hitha LiveKit proof of concept locally.

## Prerequisites

- Node.js 18+ and npm
- Docker (for local LiveKit server) or a LiveKit Cloud account

## Step 1: Start a LiveKit server

### Option A: Docker (recommended for local testing)
```bash
docker run --rm -p 7880:7880 \
  -e LIVEKIT_KEYS="devkey: secret" \
  livekit/livekit-server \
  --dev \
  --node-ip=127.0.0.1
```

This starts a dev-mode LiveKit server on `ws://localhost:7880` with:
- API Key: `devkey`
- API Secret: `secret`

### Option B: LiveKit Cloud
1. Create a free project at https://cloud.livekit.io
2. Copy the WebSocket URL, API Key, and API Secret
3. Paste them into `backend/.env`

## Step 2: Configure the backend

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` if using LiveKit Cloud, or leave defaults for Docker:
```
LIVEKIT_URL=ws://localhost:7880
LIVEKIT_API_KEY=devkey
LIVEKIT_API_SECRET=secret
PORT=3001
```

## Step 3: Configure the frontend

```bash
cp frontend/.env.example frontend/.env
```

Default points to `http://localhost:3001` — change if backend is on a different host.

## Step 4: Install dependencies

```bash
npm install
```

## Step 5: Start the applications

```bash
# Start both at once
npm run dev

# Or separately in two terminals:
npm run backend   # Terminal 1
npm run frontend  # Terminal 2
```

Backend runs on **http://localhost:3001**
Frontend runs on **http://localhost:5173**

## Step 6: Verify backend

```bash
# Health check
curl http://localhost:3001/health

# Token generation test
curl -X POST http://localhost:3001/livekit/token \
  -H "Content-Type: application/json" \
  -d '{"roomName":"test","participantName":"alice"}'
```

Expected response includes `accessToken`, `roomUrl`, `roomName`, `participantName`.

## Step 7: Test with two browser tabs

1. Open **http://localhost:5173** in Tab 1 (Chrome)
2. Enter "Alice" as name and "test-room" as room name
3. Click **Join as Client**
4. Grant camera/microphone permissions when prompted
5. You should see your own video
6. Open **http://localhost:5173** in Tab 2 (or incognito window)
7. Enter "Bob" as name and "test-room" (same room!) as room name
8. Click **Join as Therapist**
9. Both tabs should now show each other's video

## Step 8: Test with two devices on the same network

1. Find your computer's local IP address:
   ```bash
   ip addr show | grep 'inet ' | grep -v 127.0.0.1
   # or: ifconfig | grep "inet "
   ```
   Example: `192.168.1.50`

2. Update `frontend/.env` to use the local IP instead of localhost:
   ```
   VITE_API_BASE_URL=http://192.168.1.50:3001
   ```

3. Restart the frontend

4. On Device 1 (your computer): open `http://localhost:5173`

5. On Device 2 (phone/tablet/laptop on same WiFi): open `http://192.168.1.50:5173`

6. Join the same room from both devices

**Note:** If using Docker LiveKit, make sure the server is accessible on the network:
```bash
docker run --rm -p 7880:7880 \
  -e LIVEKIT_KEYS="devkey: secret" \
  livekit/livekit-server \
  --dev \
  --node-ip=192.168.1.50
```

## Step 9: Verify audio/video works

1. **Local video**: Your own video tile should appear in the grid
2. **Remote video**: When another participant joins, their video appears
3. **Audio**: Speak into your mic — the other participant should hear you
4. **Mic mute**: Click "Mic Off" — your audio track should stop. Click "Mic On" to resume
5. **Camera toggle**: Click "Camera Off" — a "Camera Off" overlay appears on your tile
6. **Leave room**: Click "Leave Room" — you return to the join page
7. **Rejoin**: Enter the same room again — should work
8. **Disconnect handling**: When the remote participant leaves, their tile disappears and "Waiting for others..." shows

## Troubleshooting

### "Cannot connect to LiveKit server"
- Make sure the LiveKit server (Docker or Cloud) is running
- Check `LIVEKIT_URL` in `backend/.env` is correct
- Try `curl http://localhost:7880` — should return something

### "Invalid LiveKit credentials"
- Check `LIVEKIT_API_KEY` and `LIVEKIT_API_SECRET` match your LiveKit server
- For Docker, key is `devkey` and secret is `secret`

### "Camera/microphone permission denied"
- Click the lock/padlock icon in the browser address bar
- Set camera and microphone to "Allow"
- Refresh the page

### No video appears
- Make sure your camera is not being used by another app
- Try a different browser (Chrome works best)
- Check browser console for errors (F12)

### Backend unavailable
- Make sure backend is running on port 3001
- Check `VITE_API_BASE_URL` in `frontend/.env`
- Check for CORS errors in browser console
