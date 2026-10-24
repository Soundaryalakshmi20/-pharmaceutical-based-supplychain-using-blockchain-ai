import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { verifySerial } from '../../api/verify';
import { receiveMedicine, dispenseMedicine } from '../../api/inventory';
import StatusBadge from '../../components/StatusBadge';
import { ScanLine, Loader2, CheckCircle2, AlertTriangle, PackageCheck, Activity, Camera } from 'lucide-react';
import QrScanner from '../../components/QrScanner';

/**
 * Shared "scan & verify" page used by distributor and pharmacy navs.
 * Runs the same verification engine as the public patient page, plus the
 * role-appropriate custody action (receive / dispense).
 */
export default function ScanVerify() {
  const { user } = useAuth();
  const [serial, setSerial] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [done, setDone] = useState(null);
  const [scanning, setScanning] = useState(false);

  const action = user?.role === 'PHARMACY' ? 'DISPENSE' : 'RECEIVE';

  function onQrScan(value) {
    setScanning(false);
    setSerial(value);
    runVerify(value);
  }

  async function runVerify(value) {
    if (!value) return;
    setBusy(true);
    setError('');
    setResult(null);
    setDone(null);
    try {
      const data = await verifySerial(value, 'PATIENT_SCAN', user?.organizationId);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message);
    } finally {
      setBusy(false);
    }
  }

  async function run(e) {
    e.preventDefault();
    if (!serial.trim()) return;
    setBusy(true);
    setError('');
    setResult(null);
    setDone(null);
    try {
      const data = await verifySerial(serial.trim(), 'PATIENT_SCAN', user?.organizationId);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message);
    } finally {
      setBusy(false);
    }
  }

  async function performAction() {
    setBusy(true);
    setError('');
    try {
      const payload = { serialNumber: serial.trim() };
      const data =
        action === 'DISPENSE'
          ? await dispenseMedicine(payload)
          : await receiveMedicine(payload);
      setDone(data);
      setResult(null);
      setSerial('');
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <ScanLine className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Scan &amp; Verify</h2>
          <p className="text-xs text-slate-400">Check authenticity against the ledger before acting</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-sm flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> {error}
        </div>
      )}

      {done && (
        <div className="p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
          <div className="flex items-center gap-2 text-emerald-400 font-bold mb-2">
            <CheckCircle2 className="w-5 h-5" /> {action === 'DISPENSE' ? 'Dispensed' : 'Received'} on record
          </div>
          <p className="text-xs font-mono text-slate-300">
            {done.serialNumber || done.serial?.serial_number} · blockchain{' '}
            <span className="text-emerald-400">{done.blockchain?.status}</span>
          </p>
        </div>
      )}

      <form onSubmit={run} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="form-group">
          <label>Serial number / QR payload</label>
          <div className="flex gap-2">
            <input
              value={serial}
              onChange={(e) => setSerial(e.target.value)}
              placeholder="SN200955"
              className="font-mono flex-1"
            />
            <button
              type="button"
              onClick={() => setScanning(true)}
              disabled={busy}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 rounded-lg text-sm font-medium transition disabled:opacity-50"
              title="Scan the pack's QR code with the camera"
            >
              <Camera className="w-4 h-4" /> Scan QR
            </button>
          </div>
        </div>
        <button
          type="submit"
          disabled={busy}
          className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition flex items-center justify-center gap-2"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ScanLine className="w-4 h-4" />}
          Verify authenticity
        </button>
      </form>

      <QrScanner
        open={scanning}
        onClose={() => setScanning(false)}
        onScan={onQrScan}
        title="Scan pack QR code"
      />

      {result && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Ledger verdict</p>
              <p className="font-mono font-bold text-white">{result.serialNumber}</p>
            </div>
            <StatusBadge status={result.status} />
          </div>

          {result.medicine && (
            <div className="text-sm">
              <p className="text-white font-medium">{result.medicine.name}</p>
              <p className="text-xs text-slate-500">
                {result.medicine.manufacturer} · batch {result.batch?.batchNumber} ·{' '}
                {result.batch?.status}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            {Object.entries(result.checks || {}).map(([key, value]) => (
              <div key={key} className="bg-slate-950 p-2.5 rounded-lg flex justify-between border border-slate-800">
                <span className="capitalize text-slate-400">{key}</span>
                <span className={value === 'PASS' ? 'text-emerald-400 font-bold' : value === 'FAIL' ? 'text-rose-400 font-bold' : 'text-amber-400 font-bold'}>
                  {value}
                </span>
              </div>
            ))}
          </div>

          {result.warnings?.length > 0 && (
            <ul className="text-xs text-amber-300 space-y-1">
              {result.warnings.map((w, i) => <li key={i}>• {w}</li>)}
            </ul>
          )}

          <button
            onClick={performAction}
            disabled={busy || !result.canProceed}
            className="w-full bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition flex items-center justify-center gap-2"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> :
              action === 'DISPENSE' ? <Activity className="w-4 h-4" /> : <PackageCheck className="w-4 h-4" />}
            {action === 'DISPENSE' ? 'Dispense this pack' : 'Receive into stock'}
          </button>
        </div>
      )}
    </div>
  );
}
