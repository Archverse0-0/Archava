# Archava Deployment Guide

Archava is a multi-service application. Deploying only the Vite frontend is not enough for Ava voice sessions.

## Required production pieces

1. Vite frontend
2. Flask `/api/getToken` service
3. LiveKit Ava worker
4. LiveKit Cloud project
5. Optional Tavus avatar
6. Monad Testnet contracts

## Frontend on Vercel

Configure:

- Framework: Vite
- Build: `npm run build`
- Output: `dist`
- Node: 22.22.2 or a compatible newer runtime
- `VITE_LIVEKIT_URL`: your LiveKit WSS URL

The frontend expects `/api/getToken` on the same origin. If the Flask token service is hosted elsewhere, configure a same-origin reverse proxy/rewrite from `/api/*` to that service. Do not expose LiveKit API secrets in Vercel frontend variables.

## Token service

Environment:

```ini
LIVEKIT_API_KEY=...
LIVEKIT_API_SECRET=...
ALLOWED_ORIGINS=https://your-frontend.example
TOKEN_RATE_LIMIT_PER_MINUTE=30
```

The token service generates room names and participant identities server-side.

## Ava worker

Run:

```bash
cd backend
python agent.py start
```

Use the deployment mode recommended by your LiveKit Agents runtime. `agent.py dev` is for development.

## Docker deployment

```bash
docker compose up --build
```

The frontend container listens on port 80. Terminate TLS at a reverse proxy/load balancer unless nginx is separately configured with certificates.

## Smart contracts

Contract deployment is manual via GitHub `workflow_dispatch` or Foundry CLI. After a deployment, update frontend addresses and verify the full booking flow before publishing the new frontend.

## Pre-release checklist

- frontend lint/typecheck passes
- frontend tests pass
- backend tests pass
- Forge build/tests pass
- Slither passes or findings are reviewed
- JS and Python dependency audits are reviewed
- `/api/getToken` rejects abusive volume and disallowed browser origins
- Web3 confirmation verifies the real transaction event
- staff wallet is the actual BookingEscrow owner
- current contract addresses match the frontend
- Ava cannot trigger signing without a pending booking
- availability is backed by a real inventory provider before Ava promises a slot
