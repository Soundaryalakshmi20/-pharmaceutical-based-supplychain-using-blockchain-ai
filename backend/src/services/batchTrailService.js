'use strict';

/**
 * Batch audit trail — everything the chain and the database know about one
 * batch number: its CDSCO verdict, every serial it minted, the custody
 * transactions between them, and the matching events in the PharmaChain
 * contract (with the transaction hashes needed to prove them on-chain).
 */

const db = require('../config/db');
const { ApiError } = require('../utils/response');
const blockchainService = require('./blockchainService');

const BLOCKING = ['PROHIBITED', 'RECALLED', 'RESTRICTED'];

class BatchTrailService {
  async getBatchTrail(batchNumber, { serialLimit = 500, chainSerialCap = 40 } = {}) {
    const batchResult = await db.query(
      `SELECT b.*, m.name AS medicine_name, m.medicine_code, m.manufacturer_name,
              m.composition, m.dosage,
              COALESCE(rb.status, rm.status, 'UNKNOWN') AS reg_status,
              COALESCE(rb.authority, rm.authority) AS reg_authority,
              COALESCE(rb.reference_number, rm.reference_number) AS reg_reference,
              COALESCE(rb.effective_date, rm.effective_date) AS reg_effective,
              COALESCE(rb.reason, rm.reason) AS reg_reason,
              COALESCE(rb.source, rm.source) AS reg_source,
              COALESCE(rb.is_simulated, rm.is_simulated, true) AS reg_simulated,
              COALESCE(rb.id, rm.id) AS reg_record_id
       FROM batches b
       JOIN medicines m ON m.id = b.medicine_id
       LEFT JOIN regulatory_status rb ON rb.batch_id = b.id
       LEFT JOIN regulatory_status rm ON rm.medicine_id = m.id AND rm.batch_id IS NULL
       WHERE LOWER(b.batch_number) = LOWER($1)
       ORDER BY b.id DESC
       LIMIT 1`,
      [batchNumber]
    );

    if (batchResult.rows.length === 0) {
      throw new ApiError(404, 'BATCH_NOT_FOUND', `No batch numbered "${batchNumber}" exists in the ledger`);
    }
    const batch = batchResult.rows[0];

    const serialsResult = await db.query(
      `SELECT sn.id, sn.serial_number, sn.status, sn.current_owner, sn.updated_at,
              o.name AS owner_name, o.type AS owner_type,
              (SELECT COUNT(*) FROM transactions t WHERE t.serial_number_id = sn.id) AS tx_count,
              (SELECT t.blockchain_transaction_hash FROM transactions t
                WHERE t.serial_number_id = sn.id AND t.blockchain_transaction_hash IS NOT NULL
                ORDER BY t.timestamp DESC LIMIT 1) AS last_tx_hash
       FROM serial_numbers sn
       LEFT JOIN organizations o ON o.id = sn.current_owner
       WHERE sn.batch_id = $1
       ORDER BY sn.serial_number
       LIMIT $2`,
      [batch.id, serialLimit]
    );

    const txResult = await db.query(
      `SELECT t.id, t.transaction_type, t.quantity, t.timestamp, t.blockchain_status,
              t.blockchain_transaction_hash, t.blockchain_tx_hash,
              sn.serial_number,
              fo.name AS from_name, fo.type AS from_type,
              tt.name AS to_name, tt.type AS to_type
       FROM transactions t
       LEFT JOIN serial_numbers sn ON sn.id = t.serial_number_id
       LEFT JOIN organizations fo ON fo.id = t.from_organization_id
       LEFT JOIN organizations tt ON tt.id = t.to_organization_id
       WHERE t.batch_id = $1
       ORDER BY t.timestamp ASC`,
      [batch.id]
    );

    const serials = serialsResult.rows;
    const transactions = txResult.rows;

    // ── On-chain side ────────────────────────────────────────────
    const chainStatus = await blockchainService.getStatus();
    let batchEvents = [];
    let serialEvents = {};
    let onChainSerials = 0;

    if (chainStatus.available) {
      // batch-scoped events (regulatory BLOCK/UNBLOCK of this batch)
      batchEvents = (await blockchainService.getSerialHistory(`BATCH#${batch.batch_number}`)) || [];

      // per-serial contract events — only for serials that actually moved,
      // capped so a 5,000-unit batch cannot stall the page.
      const moved = [...new Set(
        transactions.map((t) => t.serial_number).filter(Boolean)
      )].slice(0, chainSerialCap);

      for (const serialNumber of moved) {
        const events = await blockchainService.getSerialHistory(serialNumber);
        if (events && events.length > 0) {
          serialEvents[serialNumber] = events;
          onChainSerials += 1;
        }
      }
    }

    // ── CDSCO verdict ────────────────────────────────────────────
    const regBlocked = BLOCKING.includes(batch.reg_status);
    const expired = new Date(batch.expiry_date) < new Date();
    const batchBlocked = batch.status !== 'ACTIVE';
    const allowed = !regBlocked && !batchBlocked && !expired;

    let verdict;
    if (regBlocked) {
      verdict = `BLOCKED BY CDSCO — ${batch.reg_status}; receive/transfer/dispense refused for every serial in this batch`;
    } else if (batchBlocked) {
      verdict = `Batch is ${batch.status}; every serial in it is frozen`;
    } else if (expired) {
      verdict = 'Batch has expired; it can no longer move or be dispensed';
    } else if (batch.reg_status === 'PERMITTED') {
      verdict = 'CDSCO APPROVED — permitted for manufacture, distribution and sale';
    } else {
      verdict = 'No CDSCO restriction on record (not on the prohibited/recall list) — movement allowed';
    }

    const summary = {
      totalSerials: serials.length,
      inStock: serials.filter((s) => s.status === 'IN_STOCK').length,
      inTransit: serials.filter((s) => s.status === 'IN_TRANSIT').length,
      dispensed: serials.filter((s) => s.status === 'DISPENSED').length,
      blocked: serials.filter((s) => ['BLOCKED', 'FLAGGED_SUSPICIOUS'].includes(s.status)).length,
      unowned: serials.filter((s) => s.current_owner == null).length,
      transactions: transactions.length,
      confirmed: transactions.filter((t) => t.blockchain_status === 'CONFIRMED').length,
      pending: transactions.filter((t) => t.blockchain_status === 'PENDING').length,
      failed: transactions.filter((t) => t.blockchain_status === 'FAILED').length,
      contractEvents: batchEvents.length + Object.values(serialEvents).flat().length,
      onChainSerials,
    };

    return {
      batch: {
        id: batch.id,
        batchNumber: batch.batch_number,
        status: batch.status,
        manufacturingDate: batch.manufacturing_date,
        expiryDate: batch.expiry_date,
        quantity: batch.quantity,
        createdAt: batch.created_at,
      },
      medicine: {
        id: batch.medicine_id,
        code: batch.medicine_code,
        name: batch.medicine_name,
        manufacturer: batch.manufacturer_name,
        composition: batch.composition,
        dosage: batch.dosage,
      },
      regulatory: {
        status: batch.reg_status,
        authority: batch.reg_authority,
        referenceNumber: batch.reg_reference,
        effectiveDate: batch.reg_effective,
        reason: batch.reg_reason,
        source: batch.reg_source,
        isSimulated: batch.reg_simulated,
        allowedToMove: allowed,
        verdict,
      },
      summary,
      serials,
      transactions,
      chain: {
        available: chainStatus.available,
        rpcUrl: chainStatus.rpcUrl,
        contractAddress: chainStatus.contractAddress,
        totalEvents: chainStatus.totalEvents,
        batchEvents,
        serialEvents,
      },
      generatedAt: new Date().toISOString(),
    };
  }
}

module.exports = new BatchTrailService();
