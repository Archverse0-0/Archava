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
- Node: 24 (`.nvmrc`; CI pins the same version in `.github/workflows/ci.yml`)
- `VITE_LIVEKIT_URL`: your LiveKit WSS URL

The frontend expects `/api/getToken` on the same origin. If the Flask token service is hosted elsewhere, configure a same-origin reverse proxy/rewrite from `/api/*` to that service. Do not expose LiveKit API secrets in Vercel frontend variables.

## CI deployments and secrets

`.github/workflows/ci.yml` deploys the frontend on its own:

- Pull requests → `Deploy Frontend Preview (Vercel)` publishes a preview once the gates pass.
- Pushes to `main` → `Deploy Frontend Production (Vercel)` publishes production, and additionally waits on the dependency audit.

Secrets live under Settings, then Secrets and variables, then Actions:

| Secret | Used by | Required? |
| --- | --- | --- |
| `VERCEL_TOKEN` | both deploy jobs | yes, to deploy |
| `VERCEL_ORG_ID` | both deploy jobs | yes, to deploy |
| `VERCEL_PROJECT_ID` | both deploy jobs | yes, to deploy |
| `CODECOV_TOKEN` | coverage upload | optional; upload is skipped without it |
| `MONAD_RPC_URL` | contract deploy | manual dispatch only |
| `DEPLOYER_PRIVATE_KEY` | contract deploy | manual dispatch only |
| `MONAD_EXPLORER_API_KEY` | contract verification | manual dispatch only |

The three Vercel secrets gate the deploy steps directly. While they are unset, the deploy step is skipped and the run is annotated with a warning that says no deployment was produced — rather than aborting on `Input required and not supplied: vercel-token`. A job that fails identically on every run regardless of the code is worse than no job: once reviewers learn that CI is always red, a real failure stops being read. The annotation keeps the absence loud instead of silent — it announces that nothing was deployed, it does not claim success. Setting the three secrets flips the condition and the deploy runs on the next push, with no further edit to the workflow.

The contract-deploy secrets are deliberately different. That job runs only on manual `workflow_dispatch`, so a human asked for it; it fails loudly when they are missing instead of skipping, because a silent skip there would mean someone believing a deploy happened when it did not.

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
- Vercel deploy secrets are configured, or the team knows no deploy was produced
- `/api/getToken` rejects abusive volume and disallowed browser origins
- Web3 confirmation verifies the real transaction event
- staff wallet is the actual BookingEscrow owner
- current contract addresses match the frontend
- Ava cannot trigger signing without a pending booking
- availability is backed by a real inventory provider before Ava promises a slot
