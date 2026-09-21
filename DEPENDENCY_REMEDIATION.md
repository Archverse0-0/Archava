# Dependency remediation plan

This document records the state of `npm audit` for this repository, what was
fixed, and why the findings that remain are accepted rather than suppressed.

**It is deliberately written so that the numbers can be re-measured, not
copied.** Every figure below was produced by running `npm audit --json`
against the lockfile in this commit. If the lockfile moves, re-run the
command and re-triage — do not carry these numbers forward.

```bash
npm audit --json --legacy-peer-deps      # full report
npm run audit:deps                       # the CI gate (see below)
```

## What the CI gate does

`npm run audit:deps` runs `scripts/dependency-audit-gate.mjs`, which reads
`security/dependency-allowlist.json` and enforces three things:

1. **Every high/critical advisory must appear in the allowlist.** A newly
   published advisory that is not yet triaged fails the build immediately.
   This is the property the previous `npm audit --audit-level=high` +
   `continue-on-error: true` combination lacked — it reported a green job
   while advisories were outstanding, which is worse than no check.
2. **Every allowlist entry must be unexpired and justified.** Entries carry a
   written `reason` and an `expiresOn` date; an expired entry fails the build,
   so exceptions cannot quietly become permanent.
3. **Low/moderate findings are summarised but non-blocking.** The project
   cannot currently absorb six semver-major upgrades at once.

The allowlist therefore only ever *narrows* what already passed. Deleting an
entry, or letting it lapse, makes the gate **stricter** — never looser. There
is no `continue-on-error` on the dependency job.

## Measured results

| | Before | After `npm audit fix` | Now |
|---|---|---|---|
| total | 52 | — | **30** |
| critical | 2 | — | **1** |
| high | 17 | — | **2** |
| moderate | 30 | — | **27** |
| low | 3 | — | **0** |

Measured 2026-09-21 against the lockfile in this branch. The 22 advisories
that disappeared were semver-compatible bumps applied by
`npm audit fix --legacy-peer-deps` (59 packages moved; `package.json`
declared ranges were not changed by the fix).

Re-measured after the two lockfile moves that this hardening branch introduced
(`typescript-eslint` `8.11.0 → 8.70.x`, and the `vite` build-time env change).
The figures above are unchanged.

> **`--legacy-peer-deps` is the canonical mode here.** `npm audit --json`
> without it reports **33** findings (`critical=2 high=2 moderate=29`); with
> it — the mode both `npm ci --legacy-peer-deps` and the CI gate use — it
> reports **30** (`critical=1 high=2 moderate=27`), which is what the table
> records. The 3-finding delta is a *package* count, not an advisory count:
> without the flag npm resolves `@vitest/coverage-v8` as its own critical
> finding. Its `via` field is the plain string `"vitest"`, i.e. it inherits the
> two already-allowlisted `vitest` advisories (GHSA-5xrq-8626-4rwp and
> GHSA-82fw-gwwq-j7x9) instead of introducing a new one, so it needs no
> allowlist entry of its own — and the gate only builds its blocking set from
> entries whose `via` items are objects carrying an advisory URL.

The remaining 30 findings are **12 distinct advisories** reaching 30 packages.
All 12 are gated behind a semver-major upgrade of one of six direct
dependencies:

| Direct dependency | Declared | Required to clear | Advisories it clears |
|---|---|---|---|
| `vitest` | `^2.1.9` | `5.0.1` | GHSA-5xrq-8626-4rwp, GHSA-82fw-gwwq-j7x9 |
| `vite` | `^5.4.1` | `6.4.3`+ | GHSA-fx2h-pf6j-xcff, GHSA-4w7w-66w2-5vf9, GHSA-v6wh-96g9-6wx3, GHSA-67mh-4wv8-2f99 (via esbuild) |
| `react-router-dom` | `^6.26.2` | `7.18.0`+ | GHSA-337j-9hxr-rhxg, GHSA-wrjc-x8rr-h8h6 |
| `wagmi` | `^2.19.5` | `3.7.7` | GHSA-vcc3-ghjq-m6fr, GHSA-w5hq-g745-h8pq, GHSA-96hv-2xvq-fx4p, GHSA-58qx-3vcg-4xpx |
| `@rainbow-me/rainbowkit` | `^2.2.11` | `3.x` | (transitively the same `ws` / `decode-uri-component` pins) |
| `@vitest/coverage-v8` | `^2.1.9` | `5.0.1` | (must move in lockstep with `vitest`) |

## Why the remaining findings are accepted, not hidden

Each advisory below is assessed for **reachability from this application as it
is actually deployed**, not for its CVSS in the abstract. The application ships
a static `dist/` tree served by nginx; there is no Vite dev server, no Vitest
process, and no server-side React render in the deployed artifact.

### Blocking severity (in the allowlist, individually justified)

**GHSA-5xrq-8626-4rwp — critical — `vitest`**
Vitest UI server arbitrary file read when the UI server is listening.
*Reachability:* none in the deployed artifact. Vitest runs only under
`npm run test` / `test:watch`; the `test:ui` script that would start the UI
server was removed on this branch, `@vitest/ui` is an optional peer of `vitest`
and is not installed, and no Vitest code ships in `dist/`.
*Remediation:* `vitest 2.x → 5.x`.

**GHSA-fx2h-pf6j-xcff — high — `vite`**
`server.fs.deny` bypass via Windows alternate paths (`\??\`, 8.3 short names).
*Reachability:* dev-server only. Production serves static files through nginx
with no Vite server process, so `server.fs.deny` has nothing to enforce
against. *Remediation:* `vite 5.x → 6.x`, then re-run `npm run build`.

**GHSA-96hv-2xvq-fx4p — high — `ws` (via `wagmi` → `@walletconnect/universal-provider`)**
Memory-exhaustion DoS from tiny fragments/data chunks.
*Reachability:* this is the most honest concern on the list. It is reached
through the WalletConnect relay socket, which **is** used in production when a
guest pairs a wallet. Exploiting it requires the paired wallet to be talking
to a malicious or compromised relay; the impact is a hung tab, not loss of
funds. Fixed in `ws 8.21.0`, but the version is pinned by `wagmi 2.x` and
cannot be overridden without a major bump. *Remediation:*
`wagmi 2.x → 3.x` (depends on `ws >= 8.21.0`). This is the first upgrade to
schedule.

### Non-blocking severity (recorded, report-only)

| Advisory | Sev | Reachability |
|---|---|---|
| GHSA-82fw-gwwq-j7x9 | moderate | `@vitest/mocker` redirect-mock path traversal. Dev-only; needs a crafted mock path that only a contributor with repo write access could introduce. |
| GHSA-4w7w-66w2-5vf9 | moderate | Vite optimized-deps `.map` path traversal. The optimized-deps cache exists only while `vite dev` runs. |
| GHSA-v6wh-96g9-6wx3 | moderate | `launch-editor` NTLMv2 disclosure via UNC. Needs a remote page to reach `/__open-in-editor`, which exists only on a contributor's localhost and is never exposed. |
| GHSA-67mh-4wv8-2f99 | moderate | `esbuild` dev-server request forgery. `esbuild` is a build-time transform here; its server never runs. |
| GHSA-337j-9hxr-rhxg | moderate | React Router constructor injection via `deserializeErrors()`. This is an **SSR hydration** path; Archava is a client-only Vite SPA with no server render pass, so the function is never called. |
| GHSA-wrjc-x8rr-h8h6 | moderate | React Router open redirect via backslash target. In a client-only SPA a backslash target stays an in-app route; the one externally-supplied location is the avatar's `navigate` packet, which is constrained by the `ROUTE_ALIASES` allowlist in `src/components/ai_avatar/AvatarVoiceAgent.jsx`. |
| GHSA-vcc3-ghjq-m6fr | moderate | `decode-uri-component` DoS via exponential decoding. Transitive through `wagmi`/`query-string`; only the visitor's own browser decodes the URL, so impact is confined to that visitor's tab. |
| GHSA-w5hq-g745-h8pq | moderate | `uuid` buffer bounds check in v3/v5/v6 when an explicit `buf` is supplied. The app calls `uuidv4()` / `randomUUID()` with no caller-provided buffer, so the unchecked branch is unreachable. |
| GHSA-58qx-3vcg-4xpx | moderate | `ws` uninitialized memory disclosure. Same WalletConnect-relay reachability as GHSA-96hv-2xvq-fx4p and the same `wagmi 2.x` pin. |

## Migration plan

These are six semver-major upgrades and should land as separate, reviewable
commits rather than one un-reviewable jump. Suggested order is by risk
reduction per unit of churn:

1. **`wagmi 2.x → 3.x`** (with `@rainbow-me/rainbowkit 2.x → 3.x`). Highest
   security value — clears both `ws` advisories, which are the only findings
   with a production reachability path. Expect changes around connector
   config; re-test wallet connection and the booking approval flow.
2. **`vitest 2.x → 5.x`** (with `@vitest/coverage-v8 2.x → 5.x`). Clears the
   one remaining critical. Test-only churn. (`test:ui`, the script that starts
   the vulnerable UI server, is already gone.)
3. **`vite 5.x → 6.x`**. Clears the remaining high plus three moderates.
   Re-run `npm run build` and confirm the output is byte-comparable in
   behaviour, since Vite 6 changes the default `build.target` and chunking.
4. **`react-router-dom 6.x → 7.x`**. Clears both React Router moderates. The
   declarative `<BrowserRouter>` / `<Routes>` API this app uses is
   backwards compatible; verify the avatar's `ROUTE_ALIASES` navigation still
   resolves after the upgrade.

Until each upgrade lands, the corresponding allowlist entries stay in force and
expire **2027-03-31**. On that date the gate starts failing for the entries
that have not been renewed, which forces the re-triage rather than allowing the
exceptions to become invisible.

## Other dependency surfaces

* **Python (`backend/requirements.txt`)** is gated separately by
  `pip-audit -r backend/requirements.txt` in the `security-audit` CI job, and
  is currently clean. `pytest` is pinned to `9.0.3` because 8.x carries
  PYSEC-2026-1845 (unmaintained-import RCE from a crafted config file).
* **Foundry (`contracts/`)** is not covered by `npm audit`. Its dependencies
  are pinned in CI (`forge-std v1.16.1`, `OpenZeppelin v5.7.0`) and installed
  with `--no-commit` so a clean runner can build without a pre-existing
  `contracts/lib`.
