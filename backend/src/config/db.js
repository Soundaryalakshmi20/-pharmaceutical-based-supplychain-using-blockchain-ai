'use strict';

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const { Pool } = require('pg');

const connectionString =
  process.env.DATABASE_URL ||
  `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5434}/${process.env.DB_NAME || 'pharma_chain'}`;

const pool = new Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 30000,
});

const DB_NAME = (() => {
  try {
    return new URL(connectionString).pathname.replace('/', '');
  } catch (_) {
    return process.env.DB_NAME || 'pharma_chain';
  }
})();

let connectedLogged = false;
pool.on('connect', () => {
  if (!connectedLogged) {
    connectedLogged = true;
    console.log(`Connected to PostgreSQL Database (${DB_NAME})`);
  }
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected pool error:', err.message);
});

async function query(text, params) {
  return pool.query(text, params);
}

async function testConnection() {
  const result = await pool.query('SELECT NOW() AS now');
  return result.rows[0];
}

module.exports = { pool, query, testConnection };
