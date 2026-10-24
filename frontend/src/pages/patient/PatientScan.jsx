import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QrScanner from '../../components/QrScanner';
import { ScanLine, ShieldCheck, Camera, Search } from 'lucide-react';

/**
 * Public QR scan landing page — no login required.
 * Decodes the QR printed on a pack (which encodes /verify/<serial>) and
 * routes the patient to the verification result.
 */
export default function PatientScan() {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);
  const [manual, setManual] = useState('');
  const [error, setError] = useState('');

  const handleScan = useCallback((serial) => {
    setScanning(false);
    if (serial) navigate(`/verify/${encodeURIComponent(serial)}`);
  }, [navigate]);

  function lookupManual(e) {
    e.preventDefault();
    const value = manual.trim();
    if (!value) return;
    // If the user pasted a full URL, honour it; otherwise treat it as a serial.
    const match = value.match(/\/verify\/([^/?#]+)/i);
    navigate(`/verify/${encodeURIComponent(match ? match[1] : value)}`);
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-7 h-7 text-emerald-400" />
          </div>
          <h1 className="text-xl font-bold text-white">Verify your medicine</h1>
          <p className="text-xs text-slate-400">
            Scan the QR code on the pack — no account needed. You'll see where it was made,
            every hand it passed through, and whether CDSCO has authorised it.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-sm text-center">
            {error}
          </div>
        )}

        <button
          onClick={() => { setError(''); setScanning(true); }}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-4 rounded-xl transition flex items-center justify-center gap-2"
        >
          <Camera className="w-5 h-5" /> Open camera &amp; scan QR
        </button>

        <form onSubmit={lookupManual} className="space-y-2">
          <label className="text-xs text-slate-400">No camera? Type the serial number instead</label>
          <div className="flex gap-2">
            <input
              value={manual}
              onChange={(e) => setManual(e.target.value)}
              placeholder="e.g. SN200955"
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white font-mono text-sm focus:border-emerald-500 outline-none"
            />
            <button
              type="submit"
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition"
            >
              <Search className="w-4 h-4" /> Check
            </button>
          </div>
        </form>

        <p className="text-center text-[11px] text-slate-600 flex items-center justify-center gap-1.5">
          <ScanLine className="w-3.5 h-3.5" /> Public verification — runs against the PharmaChain ledger
        </p>

        <QrScanner
          open={scanning}
          onClose={() => setScanning(false)}
          onScan={handleScan}
          title="Scan pack QR code"
        />
      </div>
    </div>
  );
}
