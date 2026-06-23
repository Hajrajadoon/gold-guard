# GoldGuard AI

> AI-assisted gold & precious-metal asset verification, anchored on the Casper blockchain.

GoldGuard AI lets a user submit a physical gold asset (name, weight, purity), runs it through a scoring engine that produces a **trust score** and a **risk level**, and then permanently records the verification result **on-chain** on the Casper Network. Each verification can be exported as a downloadable PDF certificate.

---

## Table of Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [First Time Run](#first-time-run)
  - [Regular](#regular)
  - [1. Smart Contract](#1-smart-contract-casper-contract-clean)
  - [2. Deploy Server](#2-deploy-server-deploy-server)
  - [3. Frontend](#3-frontend-frontend)
- [Smart Contract](#smart-contract)
- [Verification Flow](#verification-flow)
- [Configuration & Notes](#configuration--notes)
- [License](#license)

---

## Overview

GoldGuard AI is a full-stack Web3 application made of three independent services:

| Component | Role | Stack |
|-----------|------|-------|
| **`frontend/`** | User dashboard: connect wallet, submit asset, view score/risk, export certificate | React 18 + TypeScript + Vite + Tailwind CSS |
| **`casper-contract-clean/`** | On-chain smart contract that stores the verification result (`asset`, `score`, `risk`) | Rust (`no_std`) → WASM, Casper SDK |
| **`deploy-server/`** | Lightweight relay that forwards signed deploys to the Casper testnet RPC | Node.js + Express 5 |

The target network is the **Casper Testnet** (`casper-test`).

---

## How It Works

1. The user connects their **Casper Wallet** browser extension.
2. They enter a gold asset: **name**, **weight (g)**, and **purity (%)**.
3. The scoring engine (`GoldGuardAgent`) computes:
   - a **Trust Score** (0–100), weighted mostly by purity, and
   - a **Risk Level** — `LOW`, `MEDIUM`, or `HIGH`.
4. A Casper **deploy** is built with the [`casper-js-sdk`](https://www.npmjs.com/package/casper-js-sdk) and signed in the wallet.
5. The signed deploy is POSTed to the **deploy server**, which relays it to the Casper testnet via `account_put_deploy`.
6. The returned **deploy/transaction hash** is saved with the result, kept in local history, and can be exported as a **PDF certificate**.

---

## Architecture

```
                    ┌──────────────────────────────┐
                    │          Frontend            │
                    │  React + Vite + Tailwind     │
                    │  - GoldGuardAgent (scoring)  │
                    │  - casper-js-sdk (deploy)    │
                    └───────────┬──────────────────┘
                                │
              sign deploy       │   POST /deploy (signed deploy JSON)
        ┌───────────────────────┤
        ▼                       ▼
┌────────────────┐     ┌──────────────────────┐
│ Casper Wallet  │     │     Deploy Server    │
│  (extension)   │     │   Express @ :4000    │
└────────────────┘     └──────────┬───────────┘
                                   │ account_put_deploy (JSON-RPC)
                                   ▼
                    ┌──────────────────────────────┐
                    │       Casper Testnet         │
                    │  node.testnet.casper.network │
                    │   ── runs ──>  verify()      │
                    │   stores: asset, score, risk │
                    └──────────────────────────────┘
```

---

## Tech Stack

### Frontend (`frontend/`)
- **React 18** + **TypeScript 5**
- **Vite 5** (dev server / bundler) with `@vitejs/plugin-react`
- **Tailwind CSS 3** + PostCSS + Autoprefixer
- **React Router DOM 6** — routing (`/dashboard`, `/landing`)
- **Zustand 4** — wallet state management
- **Framer Motion 11** — animations
- **casper-js-sdk** (`^2.15.7`) — building & serializing deploys
- **casper-wallet-sdk** — Casper Wallet provider integration
- **jsPDF** — PDF certificate generation
- **buffer** — browser polyfill for WASM/byte handling

### Smart Contract (`casper-contract-clean/`)
- **Rust** (`no_std`, `no_main`), edition 2021, `nightly` toolchain
- **casper-contract** `4.0.0` / **casper-types** `4.0.2`
- Compiled to **`wasm32-unknown-unknown`** (`cdylib`)
- **Makefile**-driven build, **Cargo**-based integration tests

### Deploy Server (`deploy-server/`)
- **Node.js** (ES modules)
- **Express 5** + **CORS**
- **casper-js-sdk** (`^5.0.12`) for deploy helpers
- Relays to Casper Testnet JSON-RPC (`account_put_deploy`)

---

## Project Structure

```
gold-guard/
├── frontend/                    # React dashboard (Vite + TS + Tailwind)
│   └── src/
│       ├── pages/               # Dashboard, Landing, Home
│       ├── components/          # StatCard, RiskMeter, VerificationForm, HistoryTable, ...
│       ├── agents/              # GoldGuardAgent — scoring/risk engine
│       ├── lib/casper/          # deploy / sign / send / rpc / wasm helpers
│       ├── wallet/              # Casper Wallet provider connect/sign/disconnect
│       ├── store/               # Zustand wallet store
│       ├── utils/               # generateCertificate (jsPDF)
│       └── types/               # verification / result / history types
│
├── casper-contract-clean/       # On-chain smart contract
│   ├── contract/                # Rust source (src/lib.rs), Cargo config
│   ├── tests/                   # Rust integration tests
│   └── Makefile                 # build / test / lint targets
│
├── deploy-server/               # Express relay → Casper testnet RPC
│   ├── server.js                # POST /deploy endpoint
│   └── deploy-contract.js       # standalone contract deploy script
│
└── types/                       # Shared TS type declarations (casper.d.ts)
```

---

## Getting Started

### Prerequisites
- **Node.js** 18+ and npm
- **Rust** with the `nightly` toolchain and the `wasm32-unknown-unknown` target (only needed to rebuild the contract)
- The **Casper Wallet** browser extension, funded with **testnet** CSPR
- `wasm-strip` (optional, from WABT) for contract size optimization

> **Database:** records are stored in **SQLite** (`better-sqlite3`). There is
> **no separate database to install and no migrations to run** — the
> `deploy-server/goldguard.db` file and its `records` table are created
> automatically the first time the deploy server starts.

### First Time Run

For a fresh clone / new machine. This installs dependencies; the SQLite
database is created automatically on first server start.

```bash
# 1) Deploy server — relay + records DB (Terminal 1)
cd deploy-server
npm install            # also compiles the better-sqlite3 native binding
node server.js         # creates goldguard.db on first run
# → Deploy server running on port 4000

# 2) Frontend (Terminal 2)
cd frontend
npm install
npm run dev            # then open the printed http://localhost:5173 URL
```

Then connect your Casper Wallet (funded with testnet CSPR) and run an assay.

> Rebuilding the smart contract is **optional** — the compiled WASM is already
> embedded in the frontend. You only need the Rust toolchain if you change
> `lib.rs` (see [Smart Contract](#1-smart-contract-casper-contract-clean)).

### Regular

Day-to-day, once dependencies are already installed:

```bash
# Terminal 1
cd deploy-server && node server.js

# Terminal 2
cd frontend && npm run dev
```

Saved records persist in `deploy-server/goldguard.db` between runs. Always start
the deploy server before verifying, since the frontend submits deploys and reads
records through it.

### 1. Smart Contract (`casper-contract-clean/`)

```bash
cd casper-contract-clean

# Add the WASM target and build the release WASM
make build-contract

# Run integration tests
make test

# Lint / format checks
make check-lint
```

The compiled artifact is produced at
`contract/target/wasm32-unknown-unknown/release/contract.wasm`.

### 2. Deploy Server (`deploy-server/`)

```bash
cd deploy-server
npm install
node server.js
# → Deploy server running on port 4000
```

The server exposes a single endpoint, `POST /deploy`, which accepts a signed
deploy (either raw or wrapped in `{ deploy: ... }`) and forwards it to the
Casper testnet RPC.

### 3. Frontend (`frontend/`)

```bash
cd frontend
npm install
npm run dev        # start Vite dev server
# npm run build    # production build
# npm run preview  # preview the production build
```

Open the dev server URL, connect your Casper Wallet, and submit an asset from
the **Dashboard**.

> **Note:** The frontend posts signed deploys to `https://gold-guard.onrender.com/deploy`,
> so the deploy server must be reachable for on-chain submission to succeed.

---

## Smart Contract

The contract (`casper-contract-clean/contract/src/lib.rs`) is intentionally
minimal. It exposes a single public entry point, **`verify`**, that stores the
verification result under named keys:

```rust
#[no_mangle]
pub extern "C" fn verify() {
    let asset: String = runtime::get_named_arg("asset");
    let score: u64    = runtime::get_named_arg("score");
    let risk: String  = runtime::get_named_arg("risk");

    runtime::put_key("asset", storage::new_uref(asset).into());
    runtime::put_key("score", storage::new_uref(score).into());
    runtime::put_key("risk",  storage::new_uref(risk).into());
}
```

The `call()` function installs the contract and registers it under the named key
`goldguard_contract`.

| Argument | Type        | Description                       |
|----------|-------------|-----------------------------------|
| `asset`  | `CLString`  | Asset name / identifier           |
| `score`  | `CLU64`     | Trust score (0–100)               |
| `risk`   | `CLString`  | Risk level (`LOW`/`MEDIUM`/`HIGH`)|

---

## Verification Flow

1. **Connect** — `wallet/index.ts` resolves the `CasperWalletProvider`, requests a connection, and returns the active public key.
2. **Score** — `GoldGuardAgent` / `Dashboard` compute the trust score and risk level from purity and weight.
3. **Build deploy** — `lib/casper/deploy.ts` creates the deploy (`casper-test` chain, 20 CSPR payment) — either a WASM module-bytes install or a stored-contract `verify` call.
4. **Sign** — the deploy JSON is signed via the Casper Wallet; the signature is normalized and attached as an approval.
5. **Submit** — `lib/casper/send.ts` POSTs the signed deploy to the relay; `deploy-server/server.js` forwards it to the testnet RPC and returns the deploy hash.
6. **Persist & certify** — the result (asset, weight, purity, score, risk, tx hash, date) is stored in `localStorage` history and can be exported to PDF via `utils/generateCertificate.ts`.

---

## Configuration & Notes

- **Network:** `casper-test` (testnet). RPC endpoints are defined in
  `frontend/src/lib/casper/rpc.ts` and `deploy-server/server.js`
  (`https://node.testnet.casper.network/rpc`).
- **Deploy server URL:** hard-coded to `https://gold-guard.onrender.com` in
  `frontend/src/lib/casper/send.ts`, `frontend/src/lib/casper/status.ts`, and
  `frontend/src/lib/api/records.ts`. Update these for local or other deployments.
- **Payment:** deploys use a fixed standard payment of `20000000000` motes
  (20 CSPR).
- **History** is persisted client-side in `localStorage` under the `gg_history`
  key.
- The scoring logic is a deterministic, rule-based heuristic — not a trained ML
  model — and is intended as a demonstration of the end-to-end on-chain
  verification flow.

---

## License

Released under the **MIT License**. See [LICENSE](LICENSE) for details.

© 2026 Hajrajadoon
