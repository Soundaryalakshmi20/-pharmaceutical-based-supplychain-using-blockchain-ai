import client from './client';

export const getBills = async (params = {}) => {
  const { data } = await client.get('/billing', { params });
  return data.data;
};

export const getBillById = async (id) => {
  const { data } = await client.get(`/billing/${id}`);
  return data.data;
};

export const createBill = async (payload) => {
  const { data } = await client.post('/billing', payload);
  return data.data;
};

export const voidBill = async (id) => {
  const { data } = await client.patch(`/billing/${id}/void`);
  return data.data;
};

export const getSalesSummary = async (params = {}) => {
  const { data } = await client.get('/billing/summary', { params });
  return data.data;
};
