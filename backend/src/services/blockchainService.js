'use strict';

/**
 * Thin ethers.js wrapper around the PharmaChain contract.
 *
 * Every call is defensive: if the Hardhat node is down, the contract is not
 * deployed or the transaction fails, the service resolves with
 * { status: 'SKIPPED' | 'FAILED' } instead of throwing so the Postgres
 * transaction (the system of record) can proceed. The API then reports
 * "falling back to DB" exactly like the original logs show.
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const { ethers } = require('ethers');

const ABI = [
  'function registerBatch(string batchNumber, string medicineCode) returns (bool)',
  'function recordEvent(string serialNumber, string eventType, string eventContext) returns (uint256)',
  'function setBlocked(string serialNumber, bool blocked) returns (bool)',
  'function getBatchHistory(string serialNumber) view returns (tuple(string serialNumber, string eventType, address actor, uint256 timestamp, string context)[])',
  'function isBlocked(string serialNumber) view returns (bool)',
  'function totalEvents() view returns (uint256)',
  'function owner() view returns (address)',
  'event BatchRegistered(string batchNumber, string medicineCode, uint256 timestamp)',
  'event SerialEventRecorded(string serialNumber, string eventType, address actor, uint256 timestamp)',
];

const RPC_URL = process.env.BLOCKCHAIN_RPC_URL || 'http://127.0.0.1:8545';
const PRIVATE_KEY =
  process.env.BLOCKCHAIN_ADMIN_PRIVATE_KEY ||
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || null;

let provider = null;
let wallet = null;
let contract = null;

function getProvider() {
  if (!provider) {
    provider = new ethers.JsonRpcProvider(RPC_URL);
  }
  return provider;
}

function getContract() {
  if (contract) return contract;
  if (!CONTRACT_ADDRESS) return null;
  try {
    provider = new ethers.JsonRpcProvider(RPC_URL);
    wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);
    return contract;
  } catch (err) {
    console.warn('[Blockchain] Could not initialise contract:', err.message);
    return null;
  }
}

async function isAvailable() {
  const c = getContract();
  if (!c) return false;
  try {
    await Promise.race([
      provider.getBlockNumber(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000)),
    ]);
    return true;
  } catch (_) {
    return false;
  }
}

// ── Write serialisation ──────────────────────────────────────────
// ethers caches the account nonce for ~250 ms, so two writes issued back to
// back (receive, then immediately transfer) can pick the SAME nonce and the
// second one is rejected with "nonce has already been used" (the DB row then
// shows FAILED). Chain writes are therefore serialised and always signed with
// a fresh 'pending' nonce fetched right before sending.
let writeLock = Promise.resolve();
function serializeWrite(fn) {
  const run = writeLock.then(fn, fn);
  writeLock = run.then(() => null, () => null);
  return run;
}

async function sendContractTx(fn) {
  return serializeWrite(async () => {
    // Raw eth_getTransactionCount via provider.send — getTransactionCount()
    // goes through ethers' short-lived response cache, which can hand back a
    // stale nonce right after a previous write and get it rejected.
    const addr = await wallet.getAddress();
    const nonce = parseInt(await provider.send('eth_getTransactionCount', [addr, 'pending']), 16);
    const tx = await fn({ nonce });
    const receipt = await tx.wait();
    return { status: 'CONFIRMED', txHash: receipt.hash, blockNumber: receipt.blockNumber };
  });
}

async function registerBatch(batchNumber, medicineCode = '') {
  const c = getContract();
  if (!c) return { status: 'SKIPPED', reason: 'No contract configured' };
  try {
    return await sendContractTx((opts) => c.registerBatch(String(batchNumber), String(medicineCode || ''), opts));
  } catch (err) {
    console.warn(`[Blockchain] registerBatch(${batchNumber}) failed:`, err.shortMessage || err.message);
    return { status: 'FAILED', reason: err.shortMessage || err.message };
  }
}

async function recordEvent(serialNumber, eventType, context = '') {
  const c = getContract();
  if (!c) return { status: 'SKIPPED', reason: 'No contract configured' };
  try {
    return await sendContractTx((opts) =>
      c.recordEvent(String(serialNumber), String(eventType), String(context || ''), opts)
    );
  } catch (err) {
    console.warn(`[Blockchain] recordEvent(${serialNumber}, ${eventType}) failed:`, err.shortMessage || err.message);
    return { status: 'FAILED', reason: err.shortMessage || err.message };
  }
}

async function setBlocked(serialNumber, blocked) {
  const c = getContract();
  if (!c) return { status: 'SKIPPED', reason: 'No contract configured' };
  try {
    return await sendContractTx((opts) => c.setBlocked(String(serialNumber), Boolean(blocked), opts));
  } catch (err) {
    console.warn(`[Blockchain] setBlocked(${serialNumber}) failed:`, err.shortMessage || err.message);
    return { status: 'FAILED', reason: err.shortMessage || err.message };
  }
}

/** On-chain custody trail for a serial. Returns [] / array, or null when unavailable. */
async function getSerialHistory(serialNumber) {
  const c = getContract();
  if (!c) return null;
  try {
    const rows = await c.getBatchHistory(String(serialNumber));
    return rows.map((r) => ({
      serialNumber: r.serialNumber ?? r[0],
      eventType: r.eventType ?? r[1],
      actor: r.actor ?? r[2],
      timestamp: Number(r.timestamp ?? r[3]) * 1000,
      context: r.context ?? r[4],
    }));
  } catch (err) {
    console.warn(`[Blockchain] On-chain query failed, falling back to DB: ${err.shortMessage || err.message}`);
    return null;
  }
}

async function isBlocked(serialNumber) {
  const c = getContract();
  if (!c) return null;
  try {
    return await c.isBlocked(String(serialNumber));
  } catch (_) {
    return null;
  }
}

async function getTotalEvents() {
  const c = getContract();
  if (!c) return null;
  try {
    return Number(await c.totalEvents());
  } catch (_) {
    return null;
  }
}

async function getStatus() {
  const available = await isAvailable();
  return {
    available,
    rpcUrl: RPC_URL,
    contractAddress: CONTRACT_ADDRESS,
    totalEvents: available ? await getTotalEvents() : null,
  };
}

/**
 * Raw on-chain details for a transaction hash: block number, confirmations,
 * miner status. Returns { found:false } when the local chain has been reset.
 */
async function getTransactionDetails(hash) {
  try {
    const provider = getProvider();
    const tx = await provider.getTransaction(hash);
    if (!tx) {
      return { hash, found: false, note: 'Not present on the current chain (the local node was restarted since this write)' };
    }
    const [receipt, head, block] = await Promise.all([
      provider.getTransactionReceipt(hash),
      provider.getBlockNumber(),
      tx.blockNumber != null ? provider.getBlock(tx.blockNumber) : Promise.resolve(null),
    ]);
    return {
      hash,
      found: true,
      blockNumber: tx.blockNumber,
      confirmations: tx.blockNumber != null ? head - tx.blockNumber + 1 : 0,
      from: tx.from,
      to: tx.to,
      gasUsed: receipt ? receipt.gasUsed.toString() : null,
      status: receipt ? (Number(receipt.status) === 1 ? 'SUCCESS' : 'REVERTED') : 'PENDING',
      minedAt: block ? block.timestamp * 1000 : null,
      chainHead: head,
    };
  } catch (err) {
    return { hash, found: false, note: `RPC unavailable: ${err.shortMessage || err.message}` };
  }
}

module.exports = {
  isAvailable,
  registerBatch,
  recordEvent,
  setBlocked,
  getSerialHistory,
  isBlocked,
  getTotalEvents,
  getStatus,
  getProvider,
  getTransactionDetails,
};
