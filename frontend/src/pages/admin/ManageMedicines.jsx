import React, { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { getMedicines, createMedicine, updateMedicine, deleteMedicine } from '../../api/medicines';
import StatusBadge from '../../components/StatusBadge';
import { Package, Plus, Search, Pencil, Trash2, X, Loader2 } from 'lucide-react';
import { printHTML, reportHeader, reportFooter, downloadCSV } from '../../utils/printUtils';

const EMPTY = { medicineCode: '', name: '', manufacturerName: '', composition: '', dosage: '' };

export default function ManageMedicines() {
  const { data: medicines, loading, execute: refresh } = useApi(() => getMedicines());
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const rows = (medicines || []).filter((m) => {
    if (!search) return true;
    const hay = `${m.name} ${m.medicine_code} ${m.manufacturer_name} ${m.composition}`.toLowerCase();
    return hay.includes(search.toLowerCase());
  });

  function openCreate() {
    setEditing(null);
    setForm(EMPTY);
    setError('');
    setShowForm(true);
  }

  function openEdit(med) {
    setEditing(med);
    setForm({
      medicineCode: med.medicine_code,
      name: med.name,
      manufacturerName: med.manufacturer_name,
      composition: med.composition || '',
      dosage: med.dosage || '',
    });
    setError('');
    setShowForm(true);
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (editing) await updateMedicine(editing.id, form);
      else await createMedicine(form);
      setShowForm(false);
      setForm(EMPTY);
      setEditing(null);
      refresh();
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(med) {
    if (!window.confirm(`Delete ${med.name}?`)) return;
    try {
      await deleteMedicine(med.id);
      refresh();
    } catch (err) {
      window.alert(err.response?.data?.error?.message || err.message);
    }
  }

  function printCatalog() {
    const body = rows
      .map((m, i) => `<tr><td>${i + 1}</td><td class="mono">${m.medicine_code}</td><td>${m.name}</td><td>${m.manufacturer_name}</td><td>${m.composition || '—'}</td><td>${m.regulatory_status || 'UNKNOWN'}</td></tr>`)
      .join('');
    printHTML(
      `${reportHeader('Medicine Catalog', 'Registered medicines with CDSCO status')}
       <table><thead><tr><th>#</th><th>Code</th><th>Name</th><th>Manufacturer</th><th>Composition</th><th>Regulatory</th></tr></thead>
       <tbody>${body || '<tr><td colspan="6">No medicines</td></tr>'}</tbody></table>
       <p style="text-align:right;font-size:11px;color:#6b7280">Total: ${rows.length}</p>${reportFooter()}`,
      'Medicine Catalog — PharmaChain'
    );
  }

  function downloadCsv() {
    downloadCSV(
      'medicine-catalog.csv',
      ['Code', 'Name', 'Manufacturer', 'Composition', 'Dosage', 'Regulatory'],
      rows.map((m) => [m.medicine_code, m.name, m.manufacturer_name, m.composition || '', m.dosage || '', m.regulatory_status || ''])
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-400" /> Medicine Catalog
          </h2>
          <p className="text-xs text-slate-400 mt-1">{rows.length} medicines registered</p>
        </div>
        <div className="flex gap-2">
          <button onClick={printCatalog} className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition">
            Print
          </button>
          <button onClick={downloadCsv} className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition">
            CSV
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
            <Plus className="w-4 h-4" /> Add medicine
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, code, manufacturer or composition…"
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-emerald-500 outline-none"
        />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-500 text-sm">Loading catalog…</div>
        ) : rows.length === 0 ? (
          <div className="p-10 text-center text-slate-500 text-sm">No medicines match your search.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th><th>Name</th><th>Manufacturer</th><th>Composition</th><th>Regulatory</th><th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((m) => (
                  <tr key={m.id}>
                    <td className="font-mono text-emerald-400">{m.medicine_code}</td>
                    <td className="text-white">
                      {m.name}
                      {m.dosage && <span className="block text-[11px] text-slate-500">{m.dosage}</span>}
                    </td>
                    <td className="text-slate-400">{m.manufacturer_name}</td>
                    <td className="max-w-[260px] truncate text-slate-400">{m.composition || '—'}</td>
                    <td><StatusBadge status={m.regulatory_status || 'UNKNOWN'} /></td>
                    <td>
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => openEdit(m)} className="text-slate-400 hover:text-sky-400 transition" aria-label="Edit">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => remove(m)} className="text-slate-400 hover:text-rose-400 transition" aria-label="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
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
              <h3 className="text-lg font-bold text-white">{editing ? 'Edit medicine' : 'Add medicine'}</h3>
              <button className="btn-close" onClick={() => setShowForm(false)} aria-label="Close">
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="mb-3 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={submit} className="space-y-4">
              <div className="form-grid">
                <div className="form-group">
                  <label>Medicine code</label>
                  <input value={form.medicineCode} onChange={(e) => setForm({ ...form, medicineCode: e.target.value })} placeholder="MED101" />
                </div>
                <div className="form-group">
                  <label>Brand name</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Paracetamol 500mg" />
                </div>
                <div className="form-group">
                  <label>Manufacturer</label>
                  <input required value={form.manufacturerName} onChange={(e) => setForm({ ...form, manufacturerName: e.target.value })} placeholder="Cipla Ltd." />
                </div>
                <div className="form-group">
                  <label>Dosage form</label>
                  <input value={form.dosage} onChange={(e) => setForm({ ...form, dosage: e.target.value })} placeholder="Tablet" />
                </div>
              </div>

              <div className="form-group">
                <label>Composition</label>
                <textarea rows={3} value={form.composition} onChange={(e) => setForm({ ...form, composition: e.target.value })} placeholder="Paracetamol IP 500mg" />
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={busy} className="btn-primary flex items-center gap-2">
                  {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editing ? 'Save changes' : 'Create medicine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
