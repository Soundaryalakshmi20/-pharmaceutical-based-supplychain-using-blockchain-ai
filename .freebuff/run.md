# Pharma-Chain Run Instructions (verified)

## How to reproduce from scratch
1. PostgreSQL on port 5434, database `pharma_chain`, user `postgres`, password `1234`
   (connection string lives in `backend/.env` → `DATABASE_URL`).
   Fresh machine: restore the dump (schema + seed data together):
   ```
   "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -p 5434 -c "CREATE DATABASE pharma_chain;"
   "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -p 5434 -d pharma_chain -f database/pharma_chain_full.sql
   ```
   (Extra schema/seed: `database/002_enhanced_schema.sql`, `database/002_medicine_seed.sql`.)
2. Demo passwords: the dump ships placeholder bcrypt hashes, so seed them once:
   ```
   cd backend && npm run seed:auth
   ```
3. CDSCO data: already seeded in the dump; re-sync from the UI at /admin/cdsco → "Sync CDSCO Data".

## Order to start the services
```
cd blockchain && npx hardhat node                                  # :8545 (window 1)
cd blockchain && npx hardhat run scripts/deploy.js --network localhost   # writes CONTRACT_ADDRESS
cd backend && PORT=3001 node src/server.js                          # :3001 (window 2)
cd frontend && npx vite --port 5173 --host                          # :5173 (window 3)
```
Or run `start-all.bat` at the project root (does all four).

## Ports
- Frontend: 5173 (Vite proxies `/api` → 3001)
- Backend: 3001 (code ignores system `PORT=0` and defaults to 3001)
- Hardhat node: 8545 (contract `0x5FbDB2315678afecb367f032d93F642f64180aa3`)
- PostgreSQL: 5434

## Demo logins
| Role | Email | Password |
|---|---|---|
| Admin | admin@pharmachain.test | Admin@123 |
| Distributor | ops@medicore.test | Dist@123 |
| Pharmacy | pharmacist@apollocity.test | Pharm@123 |

## Smoke checks
```
curl http://localhost:3001/api/health
cd frontend && npx vite build
```

## Gotcha: stale UI
The service worker caches `/index.html`; after a rebuild, clear it if the UI looks old:
```
(await caches.keys()).map(k=>caches.delete(k)); (await navigator.serviceWorker.getRegistrations()).map(r=>r.unregister());
```
Full documentation: `README.md`.
