# LiveKit Server Deployment

This folder is the only artifact that needs to be deployed to VPS 1.

## Root Initialization Commands

Run these from an empty parent directory when creating the monorepo from scratch:

```bash
mkdir telehealth-monorepo
cd telehealth-monorepo
git init
mkdir -p livekit-server backend frontend docs
touch .gitignore README.md
```

## Files Included

- `livekit-server/docker-compose.yml`
- `livekit-server/livekit.yaml`

## Copy To VPS 1

1. Create a directory on VPS 1, for example `/opt/telehealth/livekit-server`.
2. Copy only the `livekit-server` folder into that directory.

## Install Prerequisites

- Docker Engine
- Docker Compose plugin

## Exact Commands

```bash
mkdir -p /opt/telehealth
cp -R livekit-server /opt/telehealth/
cd /opt/telehealth/livekit-server
docker compose up -d
docker compose logs -f
```

## Git Commands

```bash
git add .gitignore livekit-server docs/01-livekit-deployment.md
git commit -m "feat(livekit): add standalone server deployment"
```

## Required Ports

Open these ports on the VPS firewall and any upstream security group:

- `7880/tcp` for the LiveKit HTTP/WebSocket endpoint
- `7881/tcp` for TCP fallback / relay traffic
- `50000-50100/udp` for WebRTC media traffic

## Configuration Notes

- Replace the dummy API key pair in `livekit.yaml` before production use.
- Point the backend `LIVEKIT_URL` to the deployed LiveKit endpoint, usually `wss://your-domain` or the public IP with TLS termination in front.
- Keep this service isolated from the backend and frontend so it can be deployed independently.
