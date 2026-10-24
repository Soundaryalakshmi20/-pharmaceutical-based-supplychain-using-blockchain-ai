import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { verifySerial } from '../../api/verify';
import { dispenseMedicine } from '../../api/inventory';
import StatusBadge from '../../components/StatusBadge';
import { Activity, Loader2, CheckCircle2, AlertTriangle, Search, Printer, Camera } from 'lucide-react';
import QrScanner from '../../components/QrScanner';
import { printHTML, reportHeader, reportFooter } from '../../utils/printUtils';

export default function DispenseMedicine() {
  const { user } = useAuth();
  const [form, setForm] = useState({ serialNumber: '', patientReference: '' });
  const [checking, setChecking] = useState(false);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);

  function onQrScan(value) {
    setScanning(false);
    setForm((f) => ({ ...f, serialNumber: value }));
    verifyWith(value);
  }

  async function verifyWith(value) {
    if (!value) return;
    setChecking(true);
    setError('');
    setResult(null);
    setPreview(null);
    try {
      const data = await verifySerial(value, 'DISPENSE', user.organizationId);
      setPreview(data);
      if (!data.canProceed) setError(data.warnings?.[0] || `Verification returned ${data.status}`);
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message);
    } finally {
      setChecking(false);
    }
  }

  async function check(e) {
    e.preventDefault();
    if (!form.serialNumber.trim()) return;
    setChecking(true);
    setError('');
    setResult(null);
    setPreview(null);
    try {
      const data = await verifySerial(form.serialNumber.trim(), 'DISPENSE', user.organizationId);
      setPreview(data);
      if (!data.canProceed) setError(data.warnings?.[0] || `Verification returned ${data.status}`);
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message);
    } finally {
      setChecking(false);
    }
  }

  async function confirmDispense() {
    setChecking(true);
    setError('');
    try {
      const data = await dispenseMedicine({
        serialNumber: form.serialNumber.trim(),
        patientReference: form.patientReference || null,
      });
      setResult(data);
      setPreview(null);
      setForm({ serialNumber: '', patientReference: '' });
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message);
    } finally {
      setChecking(false);
    }
  }

  function printReceipt() {
    const html = `
      ${reportHeader('Dispensing Receipt', 'Patient copy — keep this for authenticity checks')}
      <table>
        <tr><td style="width:160px;color:#6b7280;font-weight:600">Serial Number</td><td class="mono">${result.serialNumber}</td></tr>
        <tr><td style="color:#6b7280;font-weight:600">Medicine</td><td>${result.medicine}</td></tr>
        <tr><td style="color:#6b7280;font-weight:600">Batch</td><td class="mono">${result.batchNumber}</td></tr>
        <tr><td style="color:#6b7280;font-weight:600">Pharmacy</td><td>${user?.organizationName || 'N/A'}</td></tr>
        <tr><td style="color:#6b7280;font-weight:600">Dispensed At</td><td>${new Date(result.dispensedAt).toLocaleString('en-IN')}</td></tr>
        <tr><td style="color:#6b7280;font-weight:600">Blockchain</td><td class="mono">${result.blockchain?.status || 'N/A'} ${result.blockchain?.txHash ? `— ${result.blockchain.txHash}` : ''}</td></tr>
      </table>
      ${reportFooter()}`;
    printHTML(html, 'Dispensing Receipt — PharmaChain');
  }

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
          <Activity className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Dispense Medicine</h2>
          <p className="text-xs text-slate-400">Hand a pack to a patient at {user?.organizationName}</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-sm flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> {error}
        </div>
      )}

      {result && (
        <div className="p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
          <div className="flex items-center gap-2 text-emerald-400 font-bold mb-3">
            <CheckCircle2 className="w-5 h-5" /> Dispensed successfully
          </div>
          <div className="text-xs font-mono text-slate-300 space-y-1">
            <p>Serial: <span className="text-white">{result.serialNumber}</span></p>
            <p>Medicine: <span className="text-white">{result.medicine}</span></p>
            <p>Blockchain: <span className={result.blockchain?.status === 'CONFIRMED' ? 'text-emerald-400' : 'text-amber-400'}>{result.blockchain?.status}</span></p>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={printReceipt} className="flex items-center gap-2 text-xs text-emerald-400 hover:text-emerald-300 font-medium">
              <Printer className="w-3.5 h-3.5" /> Print receipt
            </button>
            <Link to="/pharmacy/scan" className="text-xs text-slate-400 hover:text-white">Scan another pack →</Link>
          </div>
        </div>
      )}

      <form onSubmit={check} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="form-grid">
          <div className="form-group">
            <label>Serial number</label>
            <input
              value={form.serialNumber}
              onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
              placeholder="SN200955"
              className="font-mono"
            />
          </div>
          <div className="form-group">
            <label>Patient (optional)</label>
            <input
              value={form.patientReference}
              onChange={(e) => setForm({ ...form, patientReference: e.target.value })}
              placeholder="Name or Rx number"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={checking}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-50"
        >
          {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Verify pack
        </button>
        <button
          type="button"
          onClick={() => setScanning(true)}
          disabled={checking}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-50"
          title="Scan the pack's QR code with the camera"
        >
          <Camera className="w-4 h-4" /> Scan QR
        </button>
      </form>

      <QrScanner
        open={scanning}
        onClose={() => setScanning(false)}
        onScan={onQrScan}
        title="Scan pack to dispense"
      />

      {preview && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Pre-dispense verification</p>
              <p className="font-mono font-bold text-white">{preview.serialNumber}</p>
            </div>
            <StatusBadge status={preview.status} />
          </div>

          {preview.medicine && (
            <div className="text-sm text-slate-300">
              <p className="text-white font-medium">{preview.medicine.name}</p>
              <p className="text-xs text-slate-500">
                Batch {preview.batch?.batchNumber} · expires{' '}
                {new Date(preview.batch?.expiryDate).toLocaleDateString('en-IN')}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            {Object.entries(preview.checks || {}).map(([key, value]) => (
              <div key={key} className="bg-slate-950 p-2.5 rounded-lg flex justify-between border border-slate-800">
                <span className="capitalize text-slate-400">{key}</span>
                <span className={value === 'PASS' ? 'text-emerald-400 font-bold' : value === 'FAIL' ? 'text-rose-400 font-bold' : 'text-amber-400 font-bold'}>
                  {value}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={confirmDispense}
            disabled={checking || !preview.canProceed}
            className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition flex items-center justify-center gap-2"
          >
            {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
            Confirm dispense
          </button>
        </div>
      )}
    </div>
  );
}
