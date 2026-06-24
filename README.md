# GoldGuard AI

> AI-assisted gold & precious-metal asset verification, anchored on the Casper blockchain.

GoldGuard AI lets users submit precious metal assets such as gold and silver for verification. The platform uses an intelligent trust-scoring engine to calculate authenticity and risk levels, then permanently records verification results on the Casper blockchain. Each successful verification can be exported as a blockchain-backed PDF certificate.

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

---## Live Deployment

### Frontend

https://jovial-salmiakki-9def31.netlify.app

### Backend API

https://gold-guard.onrender.com

### Network

Casper Testnet (casper-test)

### Requirements

- Casper Wallet Extension
- Casper Testnet Network
- Testnet CSPR from Casper Faucet

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

### Production Architecture

```text
                    ┌──────────────────────────────────────┐
                    │              Frontend                │
                    │      React + Vite + Tailwind CSS     │
                    │                                      │
                    │  Netlify Deployment                  │
                    │  jovial-salmiakki-9def31.netlify.app │
                    │                                      │
                    │  - GoldGuardAgent                    │
                    │  - Casper Wallet SDK                 │
                    │  - Certificate Generator             │
                    └────────────────┬─────────────────────┘
                                     │
                                     ▼
                           ┌─────────────────┐
                           │  Casper Wallet  │
                           │   Extension     │
                           │   (Testnet)     │
                           └────────┬────────┘
                                    │
                                    ▼
                    ┌──────────────────────────────────────┐
                    │            Backend API               │
                    │      gold-guard.onrender.com         │
                    │                                      │
                    │  Node.js + Express + SQLite          │
                    └────────────────┬─────────────────────┘
                                     │
                                     ▼
                    ┌──────────────────────────────────────┐
                    │          Casper Testnet              │
                    │       Smart Contract verify()        │
                    └──────────────────────────────────────┘
```

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



#### Live Frontend

```text
https://jovial-salmiakki-9def31.netlify.app
```

Hosted on Netlify and responsible for:

* User Interface
* Asset Verification Form
* Casper Wallet Integration
* Certificate Generation
* Verification Ledger Display

#### Live Backend API

```text
https://gold-guard.onrender.com
```

Hosted on Render and responsible for:

* Deploy Submission
* Blockchain Communication
* Verification Record Storage
* SQLite Database Management

#### Database

The application uses SQLite (`better-sqlite3`).

The database is hosted alongside the backend service on Render and stores:

* Asset Type
* Weight
* Purity
* Trust Score
* Risk Level
* Deploy Hash
* Verification Timestamp

---

### Using the Live Application

1. Install the Casper Wallet browser extension.
2. Switch the wallet network to **Casper Testnet**.
3. Obtain free testnet CSPR from the Casper Faucet.
4. Open the frontend application:

```text
https://jovial-salmiakki-9def31.netlify.app
```

5. Connect your Casper Wallet.
6. Select the asset type (Gold or Silver).
7. Enter the weight and purity values.
8. Click **Run Assay**.
9. Sign the transaction in Casper Wallet.
10. Wait for blockchain confirmation.
11. View the verification result and transaction hash.
12. Download the blockchain-backed certificate.

---

### Local Development Setup (Optional)

Developers wishing to run GoldGuard AI locally can use:

```bash
# Backend
cd deploy-server
npm install
node server.js

# Frontend
cd frontend
npm install
npm run dev
```

The frontend will start on a local Vite development server and connect to the locally running backend.

> Note: Production users do not need to run any local services. The application is fully deployed on Netlify and Render and can be accessed directly through a web browser.


Then connect your Casper Wallet (funded with testnet CSPR) and run an assay.

> Rebuilding the smart contract is **optional** — the compiled WASM is already
> embedded in the frontend. You only need the Rust toolchain if you change
> `lib.rs` (see [Smart Contract](#1-smart-contract-casper-contract-clean)).

## Deployment & Usage

### Production Environment

GoldGuard AI is currently deployed and operational on the Casper Testnet.

| Component   | Platform       | URL                                         |
| ----------- | -------------- | ------------------------------------------- |
| Frontend    | Netlify        | https://jovial-salmiakki-9def31.netlify.app |
| Backend API | Render         | https://gold-guard.onrender.com             |
| Blockchain  | Casper Testnet | https://node.testnet.casper.network         |

The deployed application allows users to:

* Connect a Casper Wallet account.
* Submit Gold or Silver assets for verification.
* Generate a Trust Score and Risk Assessment.
* Sign blockchain transactions.
* Record verification results on-chain.
* View verification history.
* Download blockchain-backed PDF certificates.

---

### Requirements for End Users

Before using GoldGuard AI, users must:

1. Install the Casper Wallet browser extension.
2. Switch the wallet network to **Casper Testnet**.
3. Obtain free testnet CSPR from the Casper Faucet.
4. Visit the deployed frontend application.
5. Connect their wallet and begin verification.

> **Important:** Every verification requires a blockchain transaction. A small amount of testnet CSPR will be consumed for transaction fees when signing and submitting deploys.

---

### Smart Contract (`casper-contract-clean/`)

The smart contract is responsible for storing verification results on the Casper blockchain.

Main responsibilities:

* Accept verification data.
* Store asset information.
* Store trust scores.
* Store risk classifications.
* Generate immutable blockchain records.

To rebuild the contract locally:

```bash
cd casper-contract-clean

# Build WASM contract
make build-contract

# Run tests
make test

# Run lint checks
make check-lint
```

Compiled contract output:

```text id="k4o1lh"
contract/target/wasm32-unknown-unknown/release/contract.wasm
```

---

### Backend API (`deploy-server/`)

Production Backend:

```text id="uqc4oh"
https://gold-guard.onrender.com
```

Responsibilities:

* Receive signed deploys.
* Relay deploys to Casper Testnet.
* Manage verification records.
* Store records in SQLite.
* Return deploy hashes and transaction status.

Key Endpoints:

```http
POST /deploy
GET /records
```

The deploy endpoint accepts a signed Casper deploy and forwards it to the Casper Testnet RPC for execution.

---

### Frontend (`frontend/`)

Production Frontend:

```text id="s7k6sq"
https://jovial-salmiakki-9def31.netlify.app
```

Responsibilities:

* Casper Wallet Integration
* Verification Dashboard
* Trust Score Display
* Risk Assessment Display
* Verification Ledger
* PDF Certificate Generation

Users interact entirely through the frontend application without needing to run any local services.

---

### Local Development Setup (Optional)

Developers wishing to contribute or run the project locally may use:

```bash
# Terminal 1
cd deploy-server
npm install
node server.js

# Terminal 2
cd frontend
npm install
npm run dev
```

Local frontend builds will communicate with the configured backend endpoint.

---

### Data Persistence

Verification records are stored in:

```text id="3e5yrk"
goldguard.db
```

using SQLite (`better-sqlite3`).

Stored information includes:

* Asset Type
* Weight
* Purity
* Trust Score
* Risk Level
* Deploy Hash
* Verification Timestamp

Records are displayed in the Verification Ledger and linked to their corresponding Casper Testnet transactions.

---

### Blockchain Integration

GoldGuard AI currently operates on:

```text id="f74bbv"
Network: Casper Testnet
Chain Name: casper-test
```

Verification results are submitted as signed deploys through Casper Wallet and permanently recorded on-chain through the GoldGuard verification smart contract.

Each successful verification generates:

* A Deploy Hash
* An On-Chain Record
* A Verification Certificate
* A Ledger Entry

providing a transparent and immutable audit trail for precious metal verification.

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
6. **Persist & certify** — the result (asset, weight, purity, score, risk, tx hash, date) is stored the result is stored in SQLite records,
displayed in the Verification Ledger,
and can be exported as a PDF certificate.

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
