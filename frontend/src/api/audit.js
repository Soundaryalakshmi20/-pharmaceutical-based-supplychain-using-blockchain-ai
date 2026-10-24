import client from './client';

export const getAuditLogs = async (params = {}) => {
  const { data } = await client.get('/audit', { params });
  return data.data;
};

export const getAuditStats = async (params = {}) => {
  const { data } = await client.get('/audit/stats', { params });
  return data.data;
};

export const logAuditEvent = async (payload) => {
  const { data } = await client.post('/audit', payload);
  return data.data;
};
