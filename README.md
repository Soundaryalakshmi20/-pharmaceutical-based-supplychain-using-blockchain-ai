# PharmaChain — Blockchain-backed pharmaceutical supply chain

A full-stack final-year project. Medicines move pack-by-pack (each pack has a unique serial number
and a QR code), every custody move is written to **PostgreSQL** and mirrored to an **Ethereum
(Hardhat) smart contract**, and a patient can scan the QR on a pack to verify authenticity.

---

## 1. How it fits together

```
 Browser (React + Vite, :5173)
   │  /api/*  ── proxied by Vite ──►
   ▼
 Express API (:3001) ──► PostgreSQL :5434  (system of record: medicines, batches,
   │                                          serials, inventory, bills, audit logs)
   └── ethers.js ──► Hardhat node :8545 ──► PharmaChain.sol (tamper-evident custody trail)
```

| Layer      | Folder        | Stack                                    | Port |
|------------|---------------|------------------------------------------|------|
| Frontend   | `frontend/`   | React 18, Vite 6, Tailwind 4, react-router | 5173 |
| Backend    | `backend/`    | Express 4, pg, JWT, bcryptjs, ethers v6  | 3001 |
| Database   | `database/`   | PostgreSQL 13/17/18 (SQL dump + schema)  | 5434 |
| Blockchain | `blockchain/` | Hardhat 2, Solidity 0.8.24               | 8545 |

**Data model (the core loop)**

```
medicines ──< batches ──< serial_numbers ──< transactions (RECEIVE/TRANSFER/DISPENSE/BLOCK)
                 │              │
                 └── inventory (org + batch quantities)
                 └── regulatory_status (CDSCO rulings: PERMITTED/PROHIBITED/RECALLED)
                 └── alerts, dispensing, audit_logs
```

Postgres is the system of record; the contract only appends custody events
(`registerBatch`, `recordEvent`, `getBatchHistory`, `isBlocked`). If the chain is down the API
keeps working and logs `falling back to DB` — the write is never blocked by the chain.

---

## 2. Run it from the beginning

Prerequisites: Node 18+, npm, PostgreSQL listening on **port 5434** with database `pharma_chain`
(user `postgres`, password `1234` — see `backend/.env`).

Windows shortcut: double-click [`start-all.bat`](start-all.bat) at the project root — it starts the
chain, deploys the contract, then the API and the web app in separate windows.

Manual steps (in order):

```bash
# 1) Database — only needed for a brand-new machine
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -p 5434 -c "CREATE DATABASE pharma_chain;"
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -p 5434 -d pharma_chain -f database/pharma_chain_full.sql

# 2) Blockchain — local chain + contract
cd blockchain
npm install
npx hardhat node                      # window 1: JSON-RPC on 127.0.0.1:8545
npm run deploy                        # window 2: writes CONTRACT_ADDRESS into backend/.env

# 3) API
cd backend
npm install
npm run seed:auth                     # sets the demo passwords (dump ships placeholder hashes)
PORT=3001 node src/server.js          # window 3

# 4) Web app
cd frontend
npm install
npx vite --port 5173 --host           # window 4
```

Open **http://localhost:5173**.

### Demo accounts

| Role          | Email                     | Password    |
|---------------|---------------------------|-------------|
| Administrator  | `admin@pharmachain.test`  | `Admin@123` |
| Distributor   | `ops@medicore.test`       | `Dist@123`  |
| Pharmacy      | `pharmacist@apollocity.test` | `Pharm@123` |

Re-seed them any time with `npm run seed:auth` inside `backend/` (add `--force` to overwrite a
custom password).

> **Stale page after a code change?** The app registers a service worker for offline support. If the
> UI looks old, run this in the browser console and reload:
> `(await caches.keys()).map(k=>caches.delete(k)); (await navigator.serviceWorker.getRegistrations()).map(r=>r.unregister());`

---

## 3. How the system works (the happy path)

1. **Admin — catalog & batches.** `/admin/medicines` maintains the drug catalog. `/admin/batches`
   creates a batch: the API inserts the batch, mints **one serial number per unit** (`SN200001…`)
   and calls `registerBatch()` on the contract.
2. **Distributor — receive.** `/distributor/receive` runs the verification engine
   (`verifyMedicine(serial, org, 'RECEIVE')`) which checks *registered / batch status / expiry /
   regulatory / custody*. Only if it passes does the API take custody: `serial.current_owner = org`,
   `status = IN_STOCK`, `inventory.quantity += 1`, a `RECEIVE` transaction row and a
   `recordEvent(RECEIVE)` on-chain tx.
3. **Distributor — transfer.** `/distributor/transfer` moves the pack to a pharmacy
   (`IN_TRANSIT`, owner cleared, `inventory -= 1`, `TRANSFER` tx + chain event).
4. **Pharmacy — receive & dispense.** The pharmacy receives the pack, then `/pharmacy/dispense`
   marks it `DISPENSED`, writes a `dispensing` row and a `DISPENSE` chain event.
5. **Patient — scan.** The QR encodes `…/verify/<serial>`. That page is public (no token), calls
   `GET /api/verify/:serial` and renders a verdict:
   `VERIFIED`, `WARNING`, `EXPIRED`, `REGULATORY_BLOCK`, `ALREADY_DISPENSED`, `POSSIBLE_COUNTERFEIT`,
   plus the supply-chain timeline and the on-chain hashes.
6. **Regulator.** `/admin/regulatory` records CDSCO rulings. A `PROHIBITED`/`RECALLED` ruling
   cascades: batch status changes, serials are blocked, an alert opens and an on-chain `BLOCK`
   event is written — after that every receive/transfer/dispense for those packs is refused.

---

## 4. API surface

Auth: `POST /api/auth/login` → JWT (12h), `GET /api/auth/me`. Send it as `Authorization: Bearer <token>`.

| Group | Endpoints |
|-------|-----------|
| catalog | `/api/medicines`, `/api/batches` (create mints serials) |
| custody | `/api/inventory`, `/inventory/stock`, `/inventory/receive`, `/inventory/transfer`, `/inventory/dispense` |
| verification | `GET /api/verify/:serial?action=…`, `GET /api/verify/:serial/history` (public) |
| regulation | `/api/regulatory`, `/api/regulatory/stats`, `/api/alerts`, `/api/alerts/summary` |
| chain | `/api/blockchain/status`, `/api/blockchain/transactions`, `/api/blockchain/history/:serial` |
| existing modules | `/api/audit`, `/api/billing`, `/api/cdsco`, `/api/drug-interactions`, `/api/patients`, `/api/prescriptions`, `/api/reports/*`, `/api/dashboard/stats` |
| health | `GET /api/health` → db status, LAN IP (used for QR URLs), contract address |

Response shape everywhere: `{ success, message, data }` / `{ success:false, error:{ code, message } }`.

---

## 5. Ports & configuration

| What | Where |
|------|-------|
| DB connection, JWT secret, RPC URL, private key, contract address | `backend/.env` |
| Vite dev proxy (`/api` → `localhost:3001`) | `frontend/vite.config.js` |
| Hardhat network | `blockchain/hardhat.config.js` |

Notes:
- The API ignores `PORT=0` from the system environment and defaults to **3001**.
- The Hardhat account keys in `backend/.env` are the public test keys (account #0/#1/#2) — never use
  them on a real network.
- QR codes must be scanned from another device: start Vite with `--host` and open the app through
  the LAN URL printed by Vite (the health endpoint exposes the LAN IP for this reason).

## 6. Tests / checks

There is no automated test suite in this repo. The verified smoke path is:

```bash
# backend up?
curl http://localhost:3001/api/health

# login + call an endpoint
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pharmachain.test","password":"Admin@123"}' | jq -r .data.token)
curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/dashboard/stats

# frontend builds?
cd frontend && npx vite build
```
