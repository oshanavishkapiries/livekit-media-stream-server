# POC Review Checklist

Use this checklist to verify the Hitha LiveKit POC works correctly.

## Backend

- [ ] **Health endpoint works** — `GET /health` returns `{"status":"ok",...}`
- [ ] **Token endpoint returns token** — `POST /livekit/token` with valid body returns `accessToken`
- [ ] **Token endpoint validates input** — missing `roomName` or `participantName` returns 400 error
- [ ] **LiveKit API secret is never exposed** — check that `/livekit/token` response does not contain the secret
- [ ] **CORS is enabled** — frontend can call the backend from a different origin

## Frontend — Join Flow

- [ ] **Join form renders** — shows name input, room input, and join buttons
- [ ] **Validation works** — submitting without name or room shows an error message
- [ ] **Join as Client button works** — generates token and connects to room
- [ ] **Join as Therapist button works** — generates token and connects to room
- [ ] **Loading state shows** — "Connecting..." appears while token is being fetched
- [ ] **Backend unavailable error** — shows user-friendly message if backend is down

## Frontend — Room Connection

- [ ] **Connected state indicator** — shows "Connected" in green when joined
- [ ] **Connecting state indicator** — shows "Connecting..." while establishing connection
- [ ] **Local video appears** — participant can see their own camera feed
- [ ] **Participant name displayed** — shows the name entered in the join form

## Frontend — Remote Participants

- [ ] **Remote video appears** — when second participant joins, their video tile shows
- [ ] **Remote participant name** — displays the remote participant's name
- [ ] **Audio works** — both participants can hear each other
- [ ] **Participant disconnect** — remote tile disappears when they leave the room
- [ ] **Alone message** — "Waiting for others to join..." shows when only one participant

## Frontend — Controls

- [ ] **Mic mute/unmute** — toggles microphone off and on
- [ ] **Mic button state** — shows correct label ("Mic On" / "Mic Off")
- [ ] **Camera on/off** — toggles camera off and on
- [ ] **Camera button state** — shows correct label ("Camera On" / "Camera Off")
- [ ] **Camera off overlay** — shows "Camera Off" overlay on local tile when camera disabled
- [ ] **Leave room** — disconnects and returns to join form
- [ ] **Copy room name** — copies room name to clipboard

## Frontend — Error Handling

- [ ] **Missing participant name** — shows error message
- [ ] **Missing room name** — shows error message
- [ ] **Backend unavailable** — shows user-friendly error
- [ ] **Invalid LiveKit credentials** — shows relevant error message
- [ ] **Camera/mic permission denied** — shows permission error message
- [ ] **No camera/mic found** — shows device not found message
- [ ] **Token generation failure** — shows server error message

## End-to-End

- [ ] **Two participants can communicate** — two browser tabs/devices in same room see each other
- [ ] **No LiveKit secret in browser** — inspect network tab, no API secret exposed
- [ ] **README is complete** — setup instructions are clear and work
- [ ] **Environment files exist** — `.env.example` files for both backend and frontend
- [ ] **No hardcoded secrets** — all credentials come from environment variables
