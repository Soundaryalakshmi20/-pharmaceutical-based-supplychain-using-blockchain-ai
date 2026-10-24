'use strict';

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const os = require('os');
const express = require('express');
const cors = require('cors');

const db = require('./config/db');
const { notFoundHandler, errorHandler } = require('./utils/response');

// Route modules (existing)
const auditRoutes = require('./routes/auditRoutes');
const billingRoutes = require('./routes/billingRoutes');
const cdscoRoutes = require('./routes/cdscoRoutes');
const drugInteractionRoutes = require('./routes/drugInteractionRoutes');
const patientRoutes = require('./routes/patientRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const reportingRoutes = require('./routes/reportingRoutes');
const verificationRoutes = require('./routes/verificationRoutes');

// Route modules (rebuilt)
const authRoutes = require('./routes/authRoutes');
const medicineRoutes = require('./routes/medicineRoutes');
const batchRoutes = require('./routes/batchRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const regulatoryRoutes = require('./routes/regulatoryRoutes');
const alertRoutes = require('./routes/alertRoutes');
const blockchainRoutes = require('./routes/blockchainRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const organizationRoutes = require('./routes/organizationRoutes');

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Request log (kept tiny; mirrors the original server's style)
app.use((req, res, next) => {
  if (req.path.startsWith('/api') && req.path !== '/api/health') {
    console.log(`[API] ${req.method} ${req.path}`);
  }
  next();
});

function lanIp() {
  const ifs = os.networkInterfaces();
  for (const name of Object.keys(ifs)) {
    for (const iface of ifs[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) return iface.address;
    }
  }
  return '127.0.0.1';
}

// ─── Health check ────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  let dbStatus = 'connected';
  let dbTime = null;
  try {
    const row = await db.testConnection();
    dbTime = row.now;
  } catch (err) {
    dbStatus = 'disconnected';
  }

  res.json({
    success: true,
    message: 'Pharma-Chain API is running',
    data: {
      status: 'ok',
      service: 'pharma-chain-api',
      db: dbStatus,
      dbTime,
      lanIp: lanIp(),
      port: Number(process.env.PORT) > 0 ? Number(process.env.PORT) : 3001,
      contractAddress: process.env.CONTRACT_ADDRESS || null,
      rpcUrl: process.env.BLOCKCHAIN_RPC_URL || null,
      time: new Date().toISOString(),
    },
  });
});

// ─── API routes ──────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/verify', verificationRoutes);
app.use('/api/regulatory', regulatoryRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/blockchain', blockchainRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/organizations', organizationRoutes);

app.use('/api/audit', auditRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/cdsco', cdscoRoutes);
app.use('/api/drug-interactions', drugInteractionRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/reports', reportingRoutes);

app.get('/', (req, res) => {
  res.json({ success: true, message: 'Pharma-Chain API', docs: '/api/health' });
});

app.use(notFoundHandler);
app.use(errorHandler);

// ─── Start ───────────────────────────────────────────────────
const PORT = Number(process.env.PORT) > 0 ? Number(process.env.PORT) : 3001;

async function start() {
  try {
    await db.testConnection();
    console.log('=================================');
    console.log('✅ PostgreSQL Database connected successfully!');
    console.log(`Database Time: ${new Date().toUTCString()}`);
    console.log('=================================');
  } catch (err) {
    console.error('❌ Could not connect to PostgreSQL:', err.message);
    console.error('   Check DATABASE_URL / DB_* in backend/.env (expects port 5434).');
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Pharma-Chain Server running on Port ${PORT}`);
    console.log(`Health Check: http://localhost:${PORT} /api/health`);
    console.log('=================================');
  });
}

start();

module.exports = app;
