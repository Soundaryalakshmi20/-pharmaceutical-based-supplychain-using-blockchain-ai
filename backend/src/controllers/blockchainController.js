const db = require('../config/db');
const blockchainService = require('../services/blockchainService');
const batchTrailService = require('../services/batchTrailService');
const { sendSuccess } = require('../utils/response');

// GET /api/blockchain/status
exports.status = async (req, res, next) => {
  try {
    const status = await blockchainService.getStatus();
    return sendSuccess(res, status);
  } catch (err) {
    next(err);
  }
};

// GET /api/blockchain/transactions?limit=50 — recent ledger writes (DB mirror)
exports.transactions = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 50;
    const result = await db.query(
      `SELECT t.id, t.transaction_type, t.quantity, t.timestamp, t.blockchain_status,
              t.blockchain_transaction_hash, t.blockchain_tx_hash,
              b.batch_number, m.name AS medicine_name,
              sn.serial_number,
              fo.name AS from_name, fo.type AS from_type,
              tt.name AS to_name, tt.type AS to_type
       FROM transactions t
       JOIN batches b ON t.batch_id = b.id
       JOIN medicines m ON b.medicine_id = m.id
       LEFT JOIN serial_numbers sn ON t.serial_number_id = sn.id
       LEFT JOIN organizations fo ON t.from_organization_id = fo.id
       LEFT JOIN organizations tt ON t.to_organization_id = tt.id
       ORDER BY t.timestamp DESC
       LIMIT $1`,
      [limit]
    );
    return sendSuccess(res, result.rows);
  } catch (err) {
    next(err);
  }
};

// GET /api/blockchain/batch/:batchNumber — full audit trail of one batch:
// CDSCO verdict + every serial + custody transactions + contract events
exports.batchTrail = async (req, res, next) => {
  try {
    const trail = await batchTrailService.getBatchTrail(req.params.batchNumber, {
      serialLimit: parseInt(req.query.serialLimit, 10) || 500,
    });
    return sendSuccess(res, trail);
  } catch (err) {
    next(err);
  }
};

// GET /api/blockchain/tx/:hash — verify a write on-chain (block, confirmations)
exports.transactionDetails = async (req, res, next) => {
  try {
    const details = await blockchainService.getTransactionDetails(req.params.hash);
    return sendSuccess(res, details);
  } catch (err) {
    next(err);
  }
};

// GET /api/blockchain/history/:serialNumber — on-chain trail with DB fallback
exports.history = async (req, res, next) => {
  try {
    const onChain = await blockchainService.getSerialHistory(req.params.serialNumber);
    const dbHistory = await db.query(
      `SELECT t.transaction_type, t.timestamp, t.blockchain_status, t.blockchain_transaction_hash
       FROM transactions t
       JOIN serial_numbers sn ON t.serial_number_id = sn.id
       WHERE LOWER(sn.serial_number) = LOWER($1)
       ORDER BY t.timestamp ASC`,
      [req.params.serialNumber]
    );

    return sendSuccess(res, {
      serialNumber: req.params.serialNumber,
      source: onChain ? 'chain' : 'database',
      onChainEvents: onChain || [],
      databaseEvents: dbHistory.rows,
    });
  } catch (err) {
    next(err);
  }
};
