import React from 'react';
import VerificationDisplay from '../../components/VerificationDisplay';

/**
 * Public verification landing page for /verify/:serialNumber (QR scan target).
 * All rendering lives in VerificationDisplay, which fetches the verification
 * result and the supply chain timeline.
 */
export default function PatientVerify() {
  return <VerificationDisplay />;
}
