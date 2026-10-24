import client from './client';

/**
 * Fetch all CDSCO regulatory data
 */
export const getAllCDSCOData = async () => {
  const response = await client.get('/cdsco/data');
  return response.data.data;
};

/**
 * Fetch CDSCO data statistics
 */
export const getCDSCOStats = async () => {
  const response = await client.get('/cdsco/stats');
  return response.data.data;
};

/**
 * Sync all CDSCO data (admin only)
 */
export const syncCDSCOData = async () => {
  const response = await client.post('/cdsco/sync');
  return response.data.data;
};

/**
 * Sync only 2026 banned FDCs (admin only)
 */
export const syncFDC2026 = async () => {
  const response = await client.post('/cdsco/sync/fdc-2026');
  return response.data.data;
};

/**
 * Sync only NSQ drugs (admin only)
 */
export const syncNSQDrugs = async () => {
  const response = await client.post('/cdsco/sync/nsq');
  return response.data.data;
};
