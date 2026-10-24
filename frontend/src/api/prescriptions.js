import client from './client';

export const getPrescriptions = async (params = {}) => {
  const { data } = await client.get('/prescriptions', { params });
  return data.data;
};

export const getPrescriptionById = async (id) => {
  const { data } = await client.get(`/prescriptions/${id}`);
  return data.data;
};

export const createPrescription = async (payload) => {
  const { data } = await client.post('/prescriptions', payload);
  return data.data;
};

export const updatePrescriptionStatus = async (id, payload) => {
  const { data } = await client.patch(`/prescriptions/${id}/status`, payload);
  return data.data;
};

export const dispensePrescriptionItem = async (itemId, payload) => {
  const { data } = await client.post(`/prescriptions/items/${itemId}/dispense`, payload);
  return data.data;
};

export const checkPrescriptionInteractions = async (id) => {
  const { data } = await client.get(`/prescriptions/${id}/interactions`);
  return data.data;
};
