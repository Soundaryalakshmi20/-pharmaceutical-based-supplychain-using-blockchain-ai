import React, { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { getBatches, createBatch, updateBatchStatus } from '../../api/batches';
import { getMedicines } from '../../api/medicines';
import StatusBadge from '../../components/StatusBadge';
import { Boxes, Plus, Search, X, Loader2, ShieldAlert, ShieldCheck } from 'lucide-react';

const EMPTY = {
  medicineId: '',
  batchNumber: '',
  manufacturingDate: new Date().toISOString().slice(0, 10),
  expiryDate: '',
  quantity: 100,
};

export default function ManageBatches() {
  const { data: batches, loading, execute: refresh } = useApi(() => getBatches());
  const { data: medicines } = useApi(getMedicines);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState(null);

  const rows = (batches || []).filter((b) => {
    if (!search) return true;
    const hay = `${b.batch_number} ${b.medicine_name} ${b.medicine_code}`.toLowerCase();
    return hay.includes(search.toLowerCase());
  });

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    setCreated(null);
    try {
      const payload = {
        medicineId: parseInt(form.medicineId, 10),
        batchNumber: form.batchNumber,
        manufacturingDate: form.manufacturingDate,
        expiryDate: form.expiryDate,
        quantity: parseInt(form.quantity, 10),
      };
      const result = await createBatch(payload);
      setCreated(result);
      setForm(EMPTY);
      refresh();
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message);
    } finally {
      setBusy(false);
    }
  }

  async function markBlocked(batch) {
    try {
      await updateBatchStatus(batch.id, 'BLOCKED');
      refresh();
    } catch (err) {
      window.alert(err.response?.data?.error?.message || err.message);
    }
  }

  async function activate(batch) {
    try {
      await updateBatchStatus(batch.id, 'ACTIVE');
      refresh();
    } catch (err) {
      window.alert(err.response?.data?.error?.message || err.message);
    }
  }

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Boxes className="w-5 h-5 text-emerald-400" /> Batches &amp; Serial Numbers
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Creating a batch mints one unique serial number per unit and registers the batch on-chain.
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setError(''); setCreated(null); }}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          <Plus className="w-4 h-4" /> New batch
        </button>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search batch number or medicine…"
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-emerald-500 outline-none"
        />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-500 text-sm">Loading batches…</div>
        ) : rows.length === 0 ? (
          <div className="p-10 text-center text-slate-500 text-sm">No batches found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Batch</th><th>Medicine</th><th>Expiry</th><th>Serials</th><th>In stock</th>
                  <th>Regulatory</th><th>Status</th><th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((b) => (
                  <tr key={b.id}>
                    <td className="font-mono text-emerald-400">{b.batch_number}</td>
                    <td className="text-white">
                      {b.medicine_name}
                      <span className="block text-[11px] text-slate-500 font-mono">{b.medicine_code}</span>
                    </td>
                    <td>
                      {new Date(b.expiry_date).toLocaleDateString('en-IN')}
                      <span className={`block text-[11px] ${b.expiry_status === 'VALID' ? 'text-slate-500' : 'text-rose-400'}`}>
                        {b.expiry_status}
                      </span>
                    </td>
                    <td className="font-mono text-slate-300">{b.serial_count}</td>
                    <td className="font-mono text-slate-300">{b.in_stock}</td>
                    <td><StatusBadge status={b.regulatory_status} /></td>
                    <td><StatusBadge status={b.status} /></td>
                    <td>
                      <div className="flex justify-end">
                        {b.status === 'ACTIVE' ? (
                          <button
                            onClick={() => markBlocked(b)}
                            className="flex items-center gap-1.5 text-[11px] text-rose-400 hover:text-rose-300 border border-rose-500/30 rounded px-2 py-1"
                          >
                            <ShieldAlert className="w-3 h-3" /> Block
                          </button>
                        ) : (
                          <button
                            onClick={() => activate(b)}
                            className="flex items-center gap-1.5 text-[11px] text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 rounded px-2 py-1"
                          >
                            <ShieldCheck className="w-3 h-3" /> Activate
                          </button>
                        )}
                      </div>
                    </td>
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
              <h3 className="text-lg font-bold text-white">Create batch &amp; serials</h3>
              <button className="btn-close" onClick={() => setShowForm(false)} aria-label="Close">
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="mb-3 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-sm">{error}</div>
            )}
            {created && (
              <div className="mb-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-300 text-sm">
                Batch <span className="font-mono">{created.batch.batch_number}</span> created with{' '}
                {created.serialsGenerated} serials ({created.firstSerial} … {created.lastSerial}).
                On-chain: <span className="font-semibold">{created.blockchain?.status}</span>
              </div>
            )}

            <form onSubmit={submit} className="space-y-4">
              <div className="form-grid">
                <div className="form-group">
                  <label>Medicine</label>
                  <select required value={form.medicineId} onChange={(e) => setForm({ ...form, medicineId: e.target.value })}>
                    <option value="">Select medicine…</option>
                    {(medicines || []).map((m) => (
                      <option key={m.id} value={m.id}>{m.name} ({m.medicine_code})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Batch number</label>
                  <input required value={form.batchNumber} onChange={(e) => setForm({ ...form, batchNumber: e.target.value })} placeholder="B-MED001-09" />
                </div>
                <div className="form-group">
                  <label>Manufactured on</label>
                  <input type="date" required value={form.manufacturingDate} onChange={(e) => setForm({ ...form, manufacturingDate: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Expires on</label>
                  <input type="date" required value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Units (serials to mint)</label>
                  <input type="number" min="1" max="5000" required value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={busy} className="btn-primary flex items-center gap-2">
                  {busy && <Loader2 className="w-4 h-4 animate-spin" />} Create batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
