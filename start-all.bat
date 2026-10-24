@echo off
REM ============================================================
REM  PharmaChain - start everything (blockchain, API, web app)
REM
REM  Run this from the project root. Each service opens in its
REM  own window; close those windows to stop the stack.
REM  Prereq: PostgreSQL running on port 5434 with pharma_chain.
REM ============================================================
setlocal
set ROOT=%~dp0

echo [1/4] Checking node_modules ...
if not exist "%ROOT%blockchain\node_modules" ( pushd "%ROOT%blockchain" && call npm install && popd )
if not exist "%ROOT%backend\node_modules"    ( pushd "%ROOT%backend"    && call npm install && popd )
if not exist "%ROOT%frontend\node_modules"   ( pushd "%ROOT%frontend"   && call npm install && popd )

echo [2/4] Starting Hardhat node on 127.0.0.1:8545 ...
start "PharmaChain - Hardhat" /D "%ROOT%blockchain" cmd /k "npx hardhat node"
timeout /t 8 /nobreak >nul

echo [3/4] Deploying the PharmaChain contract ...
pushd "%ROOT%blockchain"
call npx hardhat run scripts/deploy.js --network localhost
popd

echo        Starting API on :3001 ...
start "PharmaChain - API" /D "%ROOT%backend" cmd /k "set PORT=3001& node src/server.js"
timeout /t 3 /nobreak >nul

echo [4/4] Starting web app on :5173 ...
start "PharmaChain - Web" /D "%ROOT%frontend" cmd /k "npx vite --port 5173 --host"

echo.
echo Stack starting. Open http://localhost:5173
echo   Admin       admin@pharmachain.test   / Admin@123
echo   Distributor ops@medicore.test        / Dist@123
echo   Pharmacy    pharmacist@apollocity.test / Pharm@123
echo.
pause
