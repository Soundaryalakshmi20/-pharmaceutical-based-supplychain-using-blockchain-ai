import client from './client';

export const getAlerts = async (params = {}) => {
  const { data } = await client.get('/alerts', { params });
  return data.data;
};

export const getAlertSummary = async () => {
  const { data } = await client.get('/alerts/summary');
  return data.data;
};

export const updateAlertStatus = async (id, status) => {
  const { data } = await client.patch(`/alerts/${id}`, { status });
  return data.data;
};

export const createAlert = async (payload) => {
  const { data } = await client.post('/alerts', payload);
  return data.data;
};
