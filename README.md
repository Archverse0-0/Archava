# Archava

Archava is an AI-native hospitality demo that combines a realtime voice concierge, page-aware browser actions, and Monad Testnet booking escrow.

> **Current status:** MVP / testnet. The repository is suitable for demos, portfolio work, and controlled testing. It is **not an independently audited production payment system**. Smart-contract and dependency security checks must be green before a production deployment.

## What is inside

- **Frontend:** React 18, Vite, TypeScript, Tailwind, RainbowKit/Wagmi/Viem
- **Realtime AI:** LiveKit Agents + Gemini realtime audio
- **Avatar:** Tavus when configured, with voice-only fallback
- **Backend:** Flask token server + Python LiveKit worker
- **Web3:** Monad Testnet, BookingEscrow, WhiteRockPass, MockUSDT
- **Optional tools:** n8n MCP integration

## Architecture

```text
Browser (React/Vite)
  ├─ /api/getToken ──────> Flask token service
  ├─ LiveKit room <──────> LiveKit Cloud <──────> Python Ava worker
  │                                            ├─ Gemini realtime
  │                                            ├─ Tavus avatar (optional)
  │                                            └─ internal navigation/tools
  └─ Wallet ─────────────> Monad Testnet
                         ├─ BookingEscrow
                         ├─ WhiteRockPass
                         └─ MockUSDT
```

The browser does **not** accept URL query parameters as proof of an on-chain booking. Web3 confirmation verifies the transaction receipt and the stored BookingEscrow record.

## Security invariants

The hardened flow enforces the following invariants:

1. BookingEscrow accepts only native MON or the configured USDT token.
2. EIP-712 signed intents cannot choose their own discounted deposit amount; the contract recalculates it.
3. Native MON membership minting is disabled until the owner explicitly configures a MON price.
4. Frontend booking IDs come from the confirmed `BookingCreated` event, never a hard-coded value.
5. Staff check-in uses the contract ABI and remains owner-gated on-chain.
6. LiveKit rooms and participant identities are generated server-side.
7. The token endpoint is CORS restricted, rate limited, and sends non-cacheable tokens.
8. The local availability tool does not invent realtime inventory when no inventory provider is connected.

See `SECURITY.md` and `docs/ARCHITECTURE.md`.

## Prerequisites

- Node.js **22.22.2** (see `.nvmrc`)
- Python 3.11
- Foundry **v1.8.3** for the contract workflow
- A wallet configured for Monad Testnet

## Environment

Create `backend/.env` from `backend/.env.example`.

```ini
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=...
LIVEKIT_API_SECRET=...
ALLOWED_ORIGINS=http://localhost:5173
TOKEN_RATE_LIMIT_PER_MINUTE=30

GEMINI_API_KEY=...
GEMINI_MODEL=gemini-3.1-flash-live-preview
GEMINI_VOICE=Kore

TAVUS_API_KEY=
FACE_ID=
PAL_ID=
TAVUS_ENABLED=true

N8N_MCP_SERVER_URL=

# Optional physical email delivery (generic SMTP, any provider).
SMTP_HOST=
SMTP_PORT=465
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
SMTP_USE_SSL=true
```

Create a root `.env` for the frontend:

```ini
VITE_LIVEKIT_URL=wss://your-project.livekit.cloud
```

## Local setup

```bash
npm ci --legacy-peer-deps
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
npm run dev:all
```

Services:

- Frontend: `http://localhost:5173`
- Token API: `http://localhost:5001`
- Ava worker: LiveKit worker process

## Smart contracts

Install pinned dependencies before the first build:

```bash
cd contracts
forge install foundry-rs/forge-std@v1.16.1 --no-git
forge install OpenZeppelin/openzeppelin-contracts@v5.7.0 --no-git
forge build
forge test -vvv
```

Current frontend contract addresses are defined in `src/web3/contracts.ts`. After any manual redeployment, update that file and verify the addresses before publishing a frontend build.

### Important deployment rule

Contract deployment is intentionally **manual**. The CI workflow does not redeploy contracts on every push to `main`, because a new deployment creates new addresses and would otherwise leave the frontend pointing at stale contracts.

## CI

CI checks:

- ESLint + TypeScript
- Vitest + coverage
- Python critical Ruff rules + compile smoke check
- Python tests
- Forge build/tests/coverage
- Slither
- JavaScript dependency audit
- Python dependency audit

Production frontend deployment depends on those checks. Security findings are not silently ignored.

## Docker

```bash
docker compose up --build
```

`VITE_LIVEKIT_URL` is passed as a **build argument**, because Vite bakes `VITE_*` variables into the frontend bundle at build time.

The nginx container exposes HTTP on port 80. TLS should be terminated by a reverse proxy or hosting platform unless nginx is explicitly configured with certificates.

## Web3 booking lifecycle

```text
connect wallet
  -> calculate deposit from contract
  -> approve MockUSDT
  -> wait for approval receipt
  -> createBooking
  -> wait for booking receipt
  -> decode BookingCreated
  -> use real bookingId
  -> verify receipt + stored booking
  -> render QR/check-in proof
```

A legacy email/request summary is not an on-chain payment receipt.

## AI concierge safety notes

Ava can navigate internal pages and trigger a pending wallet confirmation. It should not create a default booking merely because a user says “sign”. A booking must already exist in the frontend state before the wallet confirmation action is accepted.

If `N8N_MCP_SERVER_URL` is enabled, expose only tools that are appropriate for an unauthenticated hospitality session. Production integrations should use explicit allowlists and authorization rules around any tool that can write data or move money.

## Security audit history

`docs/SECURITY-AUDIT-REPORT.md` is an internal historical AI-assisted report. It is useful engineering context, but it is not an independent third-party audit and should not be used as a guarantee of production safety.

## License

Proprietary project for Archava / White Rock Beach Club demo work. All rights reserved unless a separate license is provided.
