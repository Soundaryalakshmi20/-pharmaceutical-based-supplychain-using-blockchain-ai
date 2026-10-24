import client from './client';

/**
 * GET /api/verify/:serialNumber?action=RECEIVE|TRANSFER|DISPENSE|PATIENT_SCAN
 * Public — works without a token so patients can scan a QR code.
 */
export const verifySerial = async (serialNumber, action = 'PATIENT_SCAN', organizationId = null) => {
  const { data } = await client.get(`/verify/${encodeURIComponent(serialNumber)}`, {
    params: { action, organizationId },
  });
  return data.data;
};

/** GET /api/verify/:serialNumber/history — supply chain timeline */
export const getVerificationHistory = async (serialNumber) => {
  const { data } = await client.get(`/verify/${encodeURIComponent(serialNumber)}/history`);
  return data.data;
};
