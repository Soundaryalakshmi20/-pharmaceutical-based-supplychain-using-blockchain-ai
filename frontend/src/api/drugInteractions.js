import client from './client';

export const getDrugInteractions = async (params = {}) => {
  const { data } = await client.get('/drug-interactions', { params });
  return data.data;
};

export const checkDrugInteractions = async (medicineNames) => {
  const { data } = await client.post('/drug-interactions/check', { medicineNames });
  return data.data;
};

export const addDrugInteraction = async (payload) => {
  const { data } = await client.post('/drug-interactions', payload);
  return data.data;
};

export const deactivateDrugInteraction = async (id) => {
  const { data } = await client.delete(`/drug-interactions/${id}`);
  return data.data;
};
