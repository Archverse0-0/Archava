# Security Policy

## Project status

Archava currently targets controlled MVP and Monad Testnet use. Do not treat testnet assets, MockUSDT, internal AI-assisted audit notes, or demo reservation flows as production payment guarantees.

## Trust boundaries

- The browser is untrusted.
- URL/query parameters are untrusted.
- LLM tool arguments are untrusted.
- MCP servers are external integrations and must be allowlisted before production use.
- Wallet signatures authorize only the exact on-chain operation the user reviews.
- Contract state is the source of truth for Web3 booking status.

## Required production controls

Before mainnet or real-money use:

- independent smart-contract audit;
- rate limiting backed by shared infrastructure rather than only in-memory process state;
- authenticated/authorized staff check-in workflow;
- production inventory source for availability;
- secrets manager and key rotation;
- CSP/reverse-proxy review;
- dependency audit with zero unresolved critical/high runtime vulnerabilities, or formally documented exceptions;
- monitoring for token issuance, booking creation, cancellation, settlement, and failed tool calls;
- incident response and pause/containment strategy.

## Reporting

Do not publish secrets, private keys, API keys, customer data, or exploit details in a public issue. Report security findings privately to the project maintainers.
