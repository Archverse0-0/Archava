# Archava Architecture

## Runtime flows

### Voice concierge

```text
Browser -> GET /api/getToken -> token service
Browser <-> LiveKit Cloud <-> Ava worker
Ava worker -> Gemini realtime
Ava worker -> Tavus (optional)
Ava worker -> internal navigation data packets -> Browser
```

The token service creates fresh room and participant identifiers. Browser-provided room names are not trusted.

### Web3 booking

```text
Browser wallet
  -> calculateDeposit(guest, type, configured MockUSDT)
  -> approve(MockUSDT -> BookingEscrow)
  -> wait approval receipt
  -> createBooking
  -> wait booking receipt
  -> parse BookingCreated event
  -> verify bookings[id]
  -> render confirmation/QR
```

The transaction URL is never sufficient proof on its own.

## Sources of truth

- Contract state: Web3 booking/payment status
- Live inventory provider: real-world availability (not implemented by the local mock tool)
- Backend environment/secrets: provider credentials
- `src/web3/contracts.ts`: currently configured frontend contract addresses

## Known production gaps

- in-memory token rate limiting is process-local;
- inventory provider is not integrated in the local tool;
- staff authentication is wallet/owner based rather than a full venue IAM flow;
- contract upgrades/pausing strategy is not defined;
- dependency findings require ongoing remediation;
- MCP tool allowlisting should be added before sensitive integrations are exposed.
