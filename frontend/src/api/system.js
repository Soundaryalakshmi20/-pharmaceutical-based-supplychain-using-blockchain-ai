import client from './client';

export const getBlockchainStatus = async () => {
  const { data } = await client.get('/blockchain/status');
  return data.data;
};

export const getLedgerTransactions = async (params = {}) => {
  const { data } = await client.get('/blockchain/transactions', { params });
  return data.data;
};

export const getOnChainHistory = async (serialNumber) => {
  const { data } = await client.get(`/blockchain/history/${encodeURIComponent(serialNumber)}`);
  return data.data;
};

/** On-chain verification of a single transaction hash (block, confirmations). */
export const getTxDetails = async (hash) => {
  const { data } = await client.get(`/blockchain/tx/${encodeURIComponent(hash)}`);
  return data.data;
};

/** Full cryptographic audit trail for one batch number: CDSCO verdict,
 *  every serial, custody transactions and the matching contract events. */
export const getBatchTrail = async (batchNumber) => {
  const { data } = await client.get(`/blockchain/batch/${encodeURIComponent(batchNumber)}`);
  return data.data;
};

export const getDashboardStats = async () => {
  const { data } = await client.get('/dashboard/stats');
  return data.data;
};

export const getOrganizations = async (params = {}) => {
  const { data } = await client.get('/organizations', { params });
  return data.data;
};

export const getRegulatory = async (params = {}) => {
  const { data } = await client.get('/regulatory', { params });
  return data.data;
};

export const getRegulatoryStats = async () => {
  const { data } = await client.get('/regulatory/stats');
  return data.data;
};

export const upsertRegulatory = async (payload) => {
  const { data } = await client.post('/regulatory', payload);
  return data.data;
};
