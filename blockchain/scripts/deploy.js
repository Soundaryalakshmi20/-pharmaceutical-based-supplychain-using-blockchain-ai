/**
 * Deploys PharmaChain to the local Hardhat node and records the address so the
 * backend can pick it up (backend/.env CONTRACT_ADDRESS).
 *
 * Run:  npx hardhat run scripts/deploy.js --network localhost
 */
const fs = require('fs');
const path = require('path');

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying PharmaChain with account:', deployer.address);

  const PharmaChain = await ethers.getContractFactory('PharmaChain');
  const contract = await PharmaChain.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log('✅ PharmaChain deployed to:', address);

  // Persist for the backend / tooling
  const out = { address, deployedAt: new Date().toISOString(), deployer: deployer.address };
  fs.writeFileSync(path.join(__dirname, '..', 'contract-address.json'), JSON.stringify(out, null, 2));

  // Keep backend/.env in sync when the address changed (fresh chain = same
  // deterministic address, but guard against nonce drift anyway).
  const envPath = path.join(__dirname, '..', '..', 'backend', '.env');
  if (fs.existsSync(envPath)) {
    const env = fs.readFileSync(envPath, 'utf8');
    if (/^CONTRACT_ADDRESS=.*$/m.test(env)) {
      const updated = env.replace(/^CONTRACT_ADDRESS=.*$/m, `CONTRACT_ADDRESS=${address}`);
      if (updated !== env) {
        fs.writeFileSync(envPath, updated);
        console.log('Updated CONTRACT_ADDRESS in backend/.env');
      }
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
