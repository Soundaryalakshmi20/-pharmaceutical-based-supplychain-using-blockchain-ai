import client from './client';

/** Returns an array of medicines (catalog). */
export const getMedicines = async (params = {}) => {
  const { data } = await client.get('/medicines', { params });
  return data.data;
};

export const getMedicineById = async (id) => {
  const { data } = await client.get(`/medicines/${id}`);
  return data.data;
};

export const createMedicine = async (payload) => {
  const { data } = await client.post('/medicines', payload);
  return data.data;
};

export const updateMedicine = async (id, payload) => {
  const { data } = await client.put(`/medicines/${id}`, payload);
  return data.data;
};

export const deleteMedicine = async (id) => {
  const { data } = await client.delete(`/medicines/${id}`);
  return data.data;
};
