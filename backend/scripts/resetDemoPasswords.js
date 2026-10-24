/**
 * Seeds bcrypt passwords for the demo accounts.
 *
 * The SQL dump ships with PLACEHOLDER hashes (invalid, 51 chars) so login can
 * never succeed until this script runs. It only overwrites hashes that are not
 * valid bcrypt hashes unless you pass --force.
 *
 *   node scripts/resetDemoPasswords.js [--force]
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const bcrypt = require('bcryptjs');
const { pool } = require('../src/config/db');

const DEMO_ACCOUNTS = [
  { email: 'admin@pharmachain.test', password: 'Admin@123', label: 'Admin' },
  { email: 'ops@medicore.test', password: 'Dist@123', label: 'Distributor' },
  { email: 'pharmacist@apollocity.test', password: 'Pharm@123', label: 'Pharmacy' },
];

const force = process.argv.includes('--force');
const looksLikeBcrypt = (hash) => typeof hash === 'string' && /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(hash);

async function main() {
  for (const account of DEMO_ACCOUNTS) {
    const result = await pool.query('SELECT id, password_hash FROM users WHERE LOWER(email) = LOWER($1)', [account.email]);
    if (result.rows.length === 0) {
      console.log(`⚠  ${account.email} not found — skipping`);
      continue;
    }

    const current = result.rows[0].password_hash;
    if (!force && looksLikeBcrypt(current)) {
      console.log(`•  ${account.email} already has a valid hash — skipping (use --force to reset)`);
      continue;
    }

    const hash = bcrypt.hashSync(account.password, 10);
    await pool.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [hash, result.rows[0].id]);
    console.log(`✅ ${account.label.padEnd(12)} ${account.email} → password set`);
  }

  await pool.end();
  console.log('\nDemo credentials are ready.');
}

main().catch((err) => {
  console.error('Failed to seed passwords:', err.message);
  process.exit(1);
});
