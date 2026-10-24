import client from './client';

export const getPatients = async (params = {}) => {
  const { data } = await client.get('/patients', { params });
  return data.data;
};

export const getPatientById = async (id) => {
  const { data } = await client.get(`/patients/${id}`);
  return data.data;
};

export const createPatient = async (payload) => {
  const { data } = await client.post('/patients', payload);
  return data.data;
};

export const updatePatient = async (id, payload) => {
  const { data } = await client.put(`/patients/${id}`, payload);
  return data.data;
};

export const deletePatient = async (id) => {
  const { data } = await client.delete(`/patients/${id}`);
  return data.data;
};

export const addPatientAllergy = async (patientId, payload) => {
  const { data } = await client.post(`/patients/${patientId}/allergies`, payload);
  return data.data;
};

export const removePatientAllergy = async (patientId, allergyId) => {
  const { data } = await client.delete(`/patients/${patientId}/allergies/${allergyId}`);
  return data.data;
};
