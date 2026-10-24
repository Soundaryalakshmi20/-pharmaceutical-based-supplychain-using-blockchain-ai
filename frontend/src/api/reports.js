import client from './client';

export const getMedicineCatalog = async () => {
  const { data } = await client.get('/reports/medicine-catalog');
  return data.data;
};

export const getInventoryReport = async () => {
  const { data } = await client.get('/reports/inventory');
  return data.data;
};

export const getExpiryReport = async () => {
  const { data } = await client.get('/reports/expiry');
  return data.data;
};

export const getSalesReport = async (params = {}) => {
  const { data } = await client.get('/reports/sales', { params });
  return data.data;
};

export const getComplianceReport = async () => {
  const { data } = await client.get('/reports/compliance');
  return data.data;
};

export const getSupplierDirectory = async () => {
  const { data } = await client.get('/reports/suppliers');
  return data.data;
};
