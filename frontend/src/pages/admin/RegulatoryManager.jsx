import React, { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { getRegulatory, upsertRegulatory, getRegulatoryStats } from '../../api/system';
import { getMedicines } from '../../api/medicines';
import { getBatches } from '../../api/batches';
import StatusBadge from '../../components/StatusBadge';
import { ShieldCheck, Plus, Search, X, Loader2, AlertTriangle } from 'lucide-react';

const EMPTY = {
  medicineId: '',
  batchId: '',
  status: 'PERMITTED',
  referenceNumber: '',
  effectiveDate: new Date().toISOString().slice(0, 10),
  reason: '',
};

export default function RegulatoryManager() {
  const { data: rulings, loading, execute: refresh } = useApi(() => getRegulatory());
  const { data: stats } = useApi(getRegulatoryStats);
  const { data: medicines } = useApi(getMedicines);
  const { data: batches } = useApi(() => getBatches());

  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(null);

  const rows = (rulings || []).filter((r) => {
    if (!search) return true;
    const hay = `${r.medicine_name} ${r.medicine_code} ${r.batch_number || ''} ${r.status}`.toLowerCase();
    return hay.includes(search.toLowerCase());
  });

  const isBlocking = ['PROHIBITED', 'RECALLED', 'RESTRICTED'].includes(form.status);
  const batchesForMedicine = (batches || []).filter(
    (b) => !form.medicineId || String(b.medicine_id) === String(form.medicineId)
  );

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    setSaved(null);
    try {
      const payload = {
        medicineId: parseInt(form.medicineId, 10),
        batchId: form.batchId ? parseInt(form.batchId, 10) : null,
        status: form.status,
        referenceNumber: form.referenceNumber || null,
        effectiveDate: form.effectiveDate,
        reason: form.reason || null,
        source: 'https://cdsco.gov.in/opencms/opencms/en/Notifications/Gazette-Notifications/',
      };
      const result = await upsertRegulatory(payload);
      setSaved(result);
      refresh();
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" /> Regulatory Manager
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            CDSCO rulings block or unblock medicines and batches across the whole network.
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setError(''); setSaved(null); }}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          <Plus className="w-4 h-4" /> New ruling
        </button>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {(stats?.byStatus || []).slice(0, 3).map((row) => (
          <div key={row.status} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
            <StatusBadge status={row.status} />
            <span className="text-2xl font-extrabold text-white">{row.count}</span>
          </div>
        ))}
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search medicine, batch or status…"
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-emerald-500 outline-none"
        />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-500 text-sm">Loading rulings…</div>
        ) : rows.length === 0 ? (
          <div className="p-10 text-center text-slate-500 text-sm">No regulatory records.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Medicine</th><th>Batch</th><th>Status</th><th>Reference</th><th>Effective</th><th>Authority</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="text-white">
                      {r.medicine_name}
                      <span className="block text-[11px] text-slate-500 font-mono">{r.medicine_code}</span>
                    </td>
                    <td className="font-mono text-slate-400">{r.batch_number || 'All batches'}</td>
                    <td><StatusBadge status={r.status} /></td>
                    <td className="font-mono text-[11px] text-slate-400">{r.reference_number || '—'}</td>
                    <td>{new Date(r.effective_date).toLocaleDateString('en-IN')}</td>
                    <td className="text-slate-400 text-xs max-w-[280px] truncate">{r.authority}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-bold text-white">Record a CDSCO ruling</h3>
              <button className="btn-close" onClick={() => setShowForm(false)} aria-label="Close">
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="mb-3 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-sm">{error}</div>
            )}
            {saved && (
              <div className="mb-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-300 text-sm">
                Ruling saved · on-chain {saved.blockchain?.status}
              </div>
            )}
            {isBlocking && (
              <div className="mb-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-300 text-sm flex gap-2">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                Blocking rulings immediately stop receive/transfer/dispense for the affected packs and open an alert.
              </div>
            )}

            <form onSubmit={submit} className="space-y-4">
              <div className="form-grid">
                <div className="form-group">
                  <label>Medicine</label>
                  <select required value={form.medicineId} onChange={(e) => setForm({ ...form, medicineId: e.target.value, batchId: '' })}>
                    <option value="">Select medicine…</option>
                    {(medicines || []).map((m) => (
                      <option key={m.id} value={m.id}>{m.name} ({m.medicine_code})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Scope</label>
                  <select value={form.batchId} onChange={(e) => setForm({ ...form, batchId: e.target.value })}>
                    <option value="">Entire medicine (all batches)</option>
                    {batchesForMedicine.map((b) => (
                      <option key={b.id} value={b.id}>Batch {b.batch_number}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="PERMITTED">PERMITTED</option>
                    <option value="RESTRICTED">RESTRICTED</option>
                    <option value="PROHIBITED">PROHIBITED</option>
                    <option value="RECALLED">RECALLED</option>
                    <option value="UNKNOWN">UNKNOWN</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Notification reference</label>
                  <input value={form.referenceNumber} onChange={(e) => setForm({ ...form, referenceNumber: e.target.value })} placeholder="S.O. 3285(E)" />
                </div>
                <div className="form-group">
                  <label>Effective date</label>
                  <input type="date" required value={form.effectiveDate} onChange={(e) => setForm({ ...form, effectiveDate: e.target.value })} />
                </div>
              </div>

              <div className="form-group">
                <label>Reason / order details</label>
                <textarea rows={3} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Why is this medicine blocked or permitted?" />
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={busy} className="btn-primary flex items-center gap-2">
                  {busy && <Loader2 className="w-4 h-4 animate-spin" />} Save ruling
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
