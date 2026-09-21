# Archava Smart Contracts

Foundry project for the Monad Testnet portion of Archava.

## Contracts

- `BookingEscrow.sol` — daybed deposits, cancellation, check-in settlement, EIP-712 booking intents
- `WhiteRockPass.sol` — ERC-721 membership passes and booking discounts
- `MockUSDT.sol` — testnet-only ERC-20 faucet token

## Install

```bash
forge install foundry-rs/forge-std@v1.16.1 --no-git
forge install OpenZeppelin/openzeppelin-contracts@v5.7.0 --no-git
```

`remappings.txt` maps the installed libraries.

## Build and test

```bash
forge build
forge test -vvv
forge coverage
```

`test/SecurityRegression.t.sol` contains regression coverage for the highest-risk invariants discovered during the September 2026 repository audit.

## Security invariants

- Only native MON or configured USDT can fund a booking.
- Signed intents must use the contract-calculated deposit.
- Nonce increments happen only after signature validation succeeds.
- Native MON pass minting is disabled until an owner explicitly sets a native price.
- Check-in is owner-only and settles once.
- Guest cancellation is blocked inside the 24-hour window.

## Deploy

Deployments are manual. Do not automatically redeploy on every application push.

```bash
PRIVATE_KEY=... \
MONAD_RPC_URL=... \
forge script script/Deploy.s.sol --rpc-url "$MONAD_RPC_URL" --private-key "$PRIVATE_KEY" --broadcast -vvvv
```

After deployment, update `src/web3/contracts.ts` in the frontend with the new addresses and verify them against the Monad explorer.
