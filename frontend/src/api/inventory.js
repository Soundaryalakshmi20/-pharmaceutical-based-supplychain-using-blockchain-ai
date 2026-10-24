import client from './client';

/** Per-pack inventory rows for the caller's organisation (admins see all). */
export const getInventory = async (params = {}) => {
  const { data } = await client.get('/inventory', { params });
  return data.data;
};

/** Quantity stock rows (organisation + batch). */
export const getStock = async (params = {}) => {
  const { data } = await client.get('/inventory/stock', { params });
  return data.data;
};

/** Take custody of a pack that is in transit. */
export const receiveMedicine = async (payload) => {
  const { data } = await client.post('/inventory/receive', payload);
  return data.data;
};

/** Dispatch a pack this organisation holds to another organisation. */
export const transferMedicine = async (payload) => {
  const { data } = await client.post('/inventory/transfer', payload);
  return data.data;
};

/** Hand a pack to a patient. */
export const dispenseMedicine = async (payload) => {
  const { data } = await client.post('/inventory/dispense', payload);
  return data.data;
};
