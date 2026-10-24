import React, { useState, useEffect } from 'react';
import { transferMedicine } from '../../api/inventory';
import { verifySerial } from '../../api/verify';
import { Truck, CheckCircle2, Printer, Camera, AlertTriangle, ShieldCheck, ShieldX, Loader2, Search } from 'lucide-react';
import QrScanner from '../../components/QrScanner';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import client from '../../api/client';
import { printHTML, reportHeader, reportFooter } from '../../utils/printUtils';

export default function TransferMedicine() {
  const { user } = useAuth();
  const [form, setForm] = useState({ serialNumber: '', toOrganizationId: '' });
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    client.get('/regulatory').then(res => {
      setPharmacies([{ id: 2, name: 'Apollo City Pharmacy' }]);
    }).catch(() => {
      setPharmacies([{ id: 2, name: 'Apollo City Pharmacy' }]);
    });
  }, []);

  const [preview, setPreview] = useState(null); // pre-transfer verification
  const [checking, setChecking] = useState(false);

  // Step 1: verify the pack (CDSCO verdict, custody, expiry) before moving it.
  const handleCheck = async (serialOverride) => {
    const serial = (serialOverride ?? form.serialNumber).trim();
    if (!serial) return;
    setChecking(true);
    setError('');
    setResult(null);
    setPreview(null);
    try {
      const data = await verifySerial(serial, 'TRANSFER', user.organizationId);
      setPreview(data);
      if (!data.canProceed) {
        setError(data.warnings?.[0] || `Verification returned ${data.status}`);
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message);
    } finally {
      setChecking(false);
    }
  };

  // Step 2: only reachable when verification passed (button disabled otherwise).
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (preview && !preview.canProceed) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const payload = {
        serialNumber: form.serialNumber,
        fromOrganizationId: user.organizationId,
        toOrganizationId: parseInt(form.toOrganizationId),
      };
      const data = await transferMedicine(payload);
      setResult(data);
      setForm({ serialNumber: '', toOrganizationId: '' });
      setPreview(null);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to transfer medicine');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
          <Truck className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Transfer Medicine</h2>
          <p className="text-xs text-slate-400">Dispatch inventory from {user?.organizationName} to a Pharmacy</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
          <div className="flex items-center gap-2 text-emerald-400 font-bold mb-2">
            <CheckCircle2 className="w-5 h-5" /> Transfer Successful
          </div>
          <div className="text-xs font-mono text-slate-300 space-y-1">
            <p>Serial: <span className="text-white">{result.serialNumber}</span></p>
            <p>Sent To: <span className="text-white">Org ID {result.toOrganizationId}</span></p>
            <p className="text-emerald-400 mt-2">Blockchain Status: {result.blockchain?.status}</p>
            {result.blockchain?.txHash && (
              <p className="break-all text-[10px] text-slate-400">Tx Hash: {result.blockchain.txHash}</p>
            )}
          </div>
          <button onClick={() => {
            const html = `
              ${reportHeader('Transfer Receipt', 'Medicine dispatch confirmation')}
              <table>
                <tr><td style="width:140px;color:#6b7280;font-weight:600">Serial Number</td><td class="mono">${result.serialNumber}</td></tr>
                <tr><td style="color:#6b7280;font-weight:600">From Organization</td><td>${user?.organizationName || 'N/A'} (ID: ${user?.organizationId})</td></tr>
                <tr><td style="color:#6b7280;font-weight:600">To Organization</td><td>Org ID ${result.toOrganizationId}</td></tr>
                <tr><td style="color:#6b7280;font-weight:600">Transfer Date</td><td>${new Date().toLocaleString('en-IN')}</td></tr>
                <tr><td style="color:#6b7280;font-weight:600">Blockchain Status</td><td>${result.blockchain?.status || 'N/A'}</td></tr>
                ${result.blockchain?.txHash ? `<tr><td style="color:#6b7280;font-weight:600">Tx Hash</td><td class="mono" style="word-break:break-all;font-size:10px">${result.blockchain.txHash}</td></tr>` : ''}
              </table>
              ${reportFooter()}`;
            printHTML(html, 'Transfer Receipt — PharmaChain');
          }} className="mt-3 flex items-center gap-2 text-xs text-emerald-400 hover:text-emerald-300 font-medium">
            <Printer className="w-3.5 h-3.5" /> Print Transfer Receipt
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Serial Number (from package QR)</label>
          <div className="flex gap-2">
            <input required value={form.serialNumber} onChange={e => setForm({...form, serialNumber: e.target.value})} className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:border-purple-500 outline-none font-mono" placeholder="e.g. SN100001" />
            <button
              type="button"
              onClick={() => setScanning(true)}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 rounded-lg text-sm font-medium transition"
              title="Scan the pack's QR code with the camera"
            >
              <Camera className="w-4 h-4" /> Scan QR
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Destination Pharmacy</label>
          <select required value={form.toOrganizationId} onChange={e => setForm({...form, toOrganizationId: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:border-purple-500 outline-none">
            <option value="">Select pharmacy...</option>
            {pharmacies.map(p => (
              <option key={p.id} value={p.id}>{p.name} (ID: {p.id})</option>
            ))}
          </select>
        </div>
        <button
          type="button"
          disabled={checking || !form.serialNumber.trim()}
          onClick={() => handleCheck()}
          className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors mt-2"
        >
          {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          {checking ? 'Checking CDSCO status…' : 'Check before transfer'}
        </button>

        {preview && (
          <div className={`rounded-lg p-4 border space-y-3 ${
            preview.canProceed ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30'
          }`}>
            <div className="flex items-center justify-between gap-2">
              <p className="font-mono font-bold text-white">{preview.serialNumber}</p>
              <StatusBadge status={preview.status} />
            </div>
            {preview.medicine && (
              <p className="text-xs text-slate-300">
                <span className="text-white font-medium">{preview.medicine.name}</span> · batch{' '}
                <span className="font-mono">{preview.batch?.batchNumber}</span> · CDSCO:{' '}
                <b className={preview.medicine.regulatoryStatus === 'PERMITTED' ? 'text-emerald-400' : 'text-amber-400'}>
                  {preview.medicine.regulatoryStatus}
                </b>
              </p>
            )}
            <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono">
              {Object.entries(preview.checks || {}).map(([key, value]) => (
                <div key={key} className="flex justify-between bg-slate-950/60 rounded px-2 py-1.5 border border-slate-800">
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
            {!preview.canProceed && (
              <p className="text-xs text-rose-300 flex items-start gap-1.5">
                <ShieldX className="w-4 h-4 shrink-0 mt-0.5" />
                Transfer refused — this medicine is not cleared to move to the next level.
              </p>
            )}
          </div>
        )}

        <button
          disabled={loading || checking || (preview ? !preview.canProceed : false) || !preview}
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-500 text-white font-medium py-2.5 rounded-lg transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</> : preview?.canProceed ? (
            <><ShieldCheck className="w-4 h-4" /> Transfer to Pharmacy</>
          ) : preview ? (
            <><ShieldX className="w-4 h-4" /> Transfer blocked — CDSCO / ledger check failed</>
          ) : (
            'Check the pack first'
          )}
        </button>
      </form>

      <QrScanner
        open={scanning}
        onClose={() => setScanning(false)}
        onScan={(value) => {
          setScanning(false);
          setForm((f) => ({ ...f, serialNumber: value }));
          handleCheck(value);
        }}
        title="Scan pack to transfer"
      />
    </div>
  );
}
