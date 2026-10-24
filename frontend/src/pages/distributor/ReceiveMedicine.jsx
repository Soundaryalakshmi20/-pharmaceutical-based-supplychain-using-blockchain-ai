import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { verifySerial } from '../../api/verify';
import { receiveMedicine } from '../../api/inventory';
import { Link } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';
import { PackageCheck, Loader2, CheckCircle2, AlertTriangle, Search, Camera } from 'lucide-react';
import QrScanner from '../../components/QrScanner';

export default function ReceiveMedicine() {
  const { user } = useAuth();
  const [serial, setSerial] = useState('');
  const [checking, setChecking] = useState(false);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);

  function onQrScan(value) {
    setScanning(false);
    setSerial(value);
    // auto-run the verification for the scanned serial
    verifyWith(value);
  }

  async function verifyWith(value) {
    if (!value) return;
    setChecking(true);
    setError('');
    setResult(null);
    setPreview(null);
    try {
      const data = await verifySerial(value, 'RECEIVE', user.organizationId);
      setPreview(data);
      if (!data.canProceed) {
        setError(data.warnings?.[0] || `Verification returned ${data.status}`);
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message);
    } finally {
      setChecking(false);
    }
  }

  async function check(e) {
    e.preventDefault();
    if (!serial.trim()) return;
    setChecking(true);
    setError('');
    setResult(null);
    setPreview(null);
    try {
      const data = await verifySerial(serial.trim(), 'RECEIVE', user.organizationId);
      setPreview(data);
      if (!data.canProceed) {
        setError(data.warnings?.[0] || `Verification returned ${data.status}`);
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message);
    } finally {
      setChecking(false);
    }
  }

  async function confirmReceive() {
    setChecking(true);
    setError('');
    try {
      const data = await receiveMedicine({ serialNumber: serial.trim() });
      setResult(data);
      setPreview(null);
      setSerial('');
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message);
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <PackageCheck className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Receive Medicine</h2>
          <p className="text-xs text-slate-400">
            Take custody of a pack for {user?.organizationName}
          </p>
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
            <CheckCircle2 className="w-5 h-5" /> Pack received into stock
          </div>
          <div className="text-xs font-mono text-slate-300 space-y-1">
            <p>Serial: <span className="text-white">{result.serial?.serial_number}</span></p>
            <p>Status: <StatusBadge status={result.serial?.status} /></p>
            <p>Blockchain: <span className={result.blockchain?.status === 'CONFIRMED' ? 'text-emerald-400' : 'text-amber-400'}>{result.blockchain?.status}</span></p>
            {result.blockchain?.txHash && <p className="break-all text-[10px] text-slate-500">Tx: {result.blockchain.txHash}</p>}
          </div>
          <Link to="/distributor/inventory" className="inline-block mt-4 text-xs text-emerald-400 hover:text-emerald-300">
            Open inventory →
          </Link>
        </div>
      )}

      <form onSubmit={check} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Serial number</label>
          <div className="flex gap-2">
            <input
              value={serial}
              onChange={(e) => setSerial(e.target.value)}
              placeholder="e.g. SN200955"
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white font-mono focus:border-emerald-500 outline-none"
            />
            <button
              type="submit"
              disabled={checking}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-50"
            >
              {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Check
            </button>
            <button
              type="button"
              onClick={() => setScanning(true)}
              disabled={checking}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-50"
              title="Scan the pack's QR code with the camera"
            >
              <Camera className="w-4 h-4" /> Scan QR
            </button>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Every receive is verified against batch status, expiry and CDSCO rulings before it is written.
            If CDSCO has prohibited or recalled the medicine, receiving is refused.
          </p>
        </div>
      </form>

      <QrScanner
        open={scanning}
        onClose={() => setScanning(false)}
        onScan={onQrScan}
        title="Scan pack to receive"
      />

      {preview && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Verification result</p>
              <p className="font-mono font-bold text-white">{preview.serialNumber}</p>
            </div>
            <StatusBadge status={preview.status} />
          </div>

          {preview.medicine && (
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <p className="text-[10px] uppercase text-slate-500">Medicine</p>
                <p className="text-white font-medium">{preview.medicine.name}</p>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <p className="text-[10px] uppercase text-slate-500">Batch / expiry</p>
                <p className="text-white font-medium">
                  {preview.batch?.batchNumber} · {new Date(preview.batch?.expiryDate).toLocaleDateString('en-IN')}
                </p>
              </div>
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

          {preview.warnings?.length > 0 && (
            <ul className="text-xs text-amber-300 space-y-1">
              {preview.warnings.map((w, i) => <li key={i}>• {w}</li>)}
            </ul>
          )}

          <button
            onClick={confirmReceive}
            disabled={checking || !preview.canProceed}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition flex items-center justify-center gap-2"
          >
            {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : <PackageCheck className="w-4 h-4" />}
            Confirm receive
          </button>
        </div>
      )}
    </div>
  );
}
