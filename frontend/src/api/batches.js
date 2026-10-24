import client from './client';

export const getBatches = async (params = {}) => {
  const { data } = await client.get('/batches', { params });
  return data.data;
};

export const getBatchById = async (id) => {
  const { data } = await client.get(`/batches/${id}`);
  return data.data;
};

export const createBatch = async (payload) => {
  const { data } = await client.post('/batches', payload);
  return data.data;
};

export const updateBatchStatus = async (id, status) => {
  const { data } = await client.patch(`/batches/${id}/status`, { status });
  return data.data;
};
