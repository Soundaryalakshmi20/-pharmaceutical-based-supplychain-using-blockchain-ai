import React, { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { getPrescriptions, getPrescriptionById, createPrescription, updatePrescriptionStatus, checkPrescriptionInteractions } from '../../api/prescriptions';
import { getPatients } from '../../api/patients';
import { getMedicines } from '../../api/medicines';
import StatusBadge from '../../components/StatusBadge';
import { FileText, Plus, AlertTriangle, CheckCircle2, X, Search, Printer, Download } from 'lucide-react';
import { printHTML, reportHeader, reportFooter, statusBadge, downloadCSV } from '../../utils/printUtils';

export default function PrescriptionsPage() {
  const { data: prescriptions, execute: refresh } = useApi(() => getPrescriptions());
  const { data: patientsData } = useApi(() => getPatients());
  const { data: medicines } = useApi(getMedicines);
  const [showForm, setShowForm] = useState(false);
  const [selectedRx, setSelectedRx] = useState(null);
  const [interactions, setInteractions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  const [form, setForm] = useState({
    doctorId: 1, patientId: '', diagnosis: '', notes: '', validUntil: '',
    items: [{ medicineId: '', dosage: '', frequency: '', duration: '', quantity: 1, instructions: '' }]
  });

  const filteredPrescriptions = (prescriptions || []).filter(rx =>
    !statusFilter || rx.status === statusFilter
  );

  const addItem = () => {
    setForm({ ...form, items: [...form.items, { medicineId: '', dosage: '', frequency: '', duration: '', quantity: 1, instructions: '' }] });
  };

  const removeItem = (idx) => {
    setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });
  };

  const updateItem = (idx, field, value) => {
    const items = [...form.items];
    items[idx] = { ...items[idx], [field]: value };
    setForm({ ...form, items });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, patientId: parseInt(form.patientId), items: form.items.map(i => ({ ...i, medicineId: parseInt(i.medicineId), quantity: parseInt(i.quantity) || 1 })) };
      await createPrescription(payload);
      setShowForm(false);
      setForm({ doctorId: 1, patientId: '', diagnosis: '', notes: '', validUntil: '', items: [{ medicineId: '', dosage: '', frequency: '', duration: '', quantity: 1, instructions: '' }] });
      refresh();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to create prescription');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await updatePrescriptionStatus(id, { status });
      refresh();
      if (selectedRx?.id === id) {
        const updated = await getPrescriptionById(id);
        setSelectedRx(updated);
      }
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to update status');
    }
  };

  const handleCheckInteractions = async (id) => {
    try {
      const result = await checkPrescriptionInteractions(id);
      setInteractions(result);
    } catch (err) {
      alert('Failed to check interactions');
    }
  };

  function handlePrint() {
    const rxs = filteredPrescriptions;
    const rows = rxs.map((rx, i) => `<tr><td>${i + 1}</td><td class="mono">${rx.prescription_number}</td><td class="bold">${rx.patient_name}</td><td>${rx.doctor_name}</td><td>${rx.diagnosis || '—'}</td><td>${statusBadge(rx.status)}</td><td>${new Date(rx.created_at || Date.now()).toLocaleDateString('en-IN')}</td></tr>`).join('');
    const html = `
      ${reportHeader('Prescription Records', 'All prescriptions with status and details')}
      <table>
        <thead><tr><th>#</th><th>Rx Number</th><th>Patient</th><th>Doctor</th><th>Diagnosis</th><th>Status</th><th>Date</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="7" style="text-align:center">No prescriptions found.</td></tr>'}</tbody>
      </table>
      <p style="text-align:right;font-size:11px;color:#6b7280">Total: ${rxs.length} prescriptions</p>
      ${reportFooter()}`;
    printHTML(html, 'Prescription Records — PharmaChain');
  }

  function handleDownloadCSV() {
    downloadCSV('prescription-records.csv', ['Rx Number', 'Patient', 'Doctor', 'Diagnosis', 'Status', 'Date'],
      filteredPrescriptions.map(rx => [rx.prescription_number, rx.patient_name, rx.doctor_name, rx.diagnosis || '', rx.status, new Date(rx.created_at || Date.now()).toLocaleDateString('en-IN')])
    );
  }

  const patients = patientsData?.patients || [];
  const meds = medicines || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-400" /> Prescription Management
        </h2>
        <div className="flex gap-2">
          <button onClick={handlePrint} className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition">
            <Printer className="w-4 h-4" /> Print
          </button>
          <button onClick={handleDownloadCSV} className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition">
            <Download className="w-4 h-4" /> CSV
          </button>
          <button onClick={() => setShowForm(!showForm)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition">
            <Plus className="w-4 h-4" /> New Prescription
          </button>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 flex-wrap">
        {['', 'DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'DISPENSED', 'CANCELLED'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${statusFilter === s ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-slate-300">New Prescription</h3>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Patient *</label>
                <select required value={form.patientId} onChange={e => setForm({ ...form, patientId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none">
                  <option value="">Select Patient</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Diagnosis</label>
                <input value={form.diagnosis} onChange={e => setForm({ ...form, diagnosis: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none" placeholder="e.g. Upper respiratory infection" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Valid Until</label>
                <input type="date" value={form.validUntil} onChange={e => setForm({ ...form, validUntil: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Clinical Notes</label>
              <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none" placeholder="Additional notes for the prescription..." />
            </div>

            {/* Medication Items */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-xs font-bold text-slate-400">Medications</h4>
                <button type="button" onClick={addItem} className="text-emerald-400 text-xs hover:underline">+ Add Medication</button>
              </div>
              <div className="space-y-3">
                {form.items.map((item, idx) => (
                  <div key={idx} className="bg-slate-950 border border-slate-800 rounded p-3 grid grid-cols-1 md:grid-cols-5 gap-3">
                    <div className="md:col-span-2">
                      <select required value={item.medicineId} onChange={e => updateItem(idx, 'medicineId', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-white outline-none">
                        <option value="">Select Medicine</option>
                        {meds.map(m => <option key={m.id} value={m.id}>{m.name} ({m.medicine_code})</option>)}
                      </select>
                    </div>
                    <input value={item.dosage} onChange={e => updateItem(idx, 'dosage', e.target.value)} placeholder="Dosage"
                      className="bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-white outline-none" />
                    <input value={item.frequency} onChange={e => updateItem(idx, 'frequency', e.target.value)} placeholder="Frequency (e.g. 1-0-1)"
                      className="bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-white outline-none" />
                    <div className="flex gap-2">
                      <input value={item.duration} onChange={e => updateItem(idx, 'duration', e.target.value)} placeholder="Duration"
                        className="flex-1 bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-white outline-none" />
                      {form.items.length > 1 && <button type="button" onClick={() => removeItem(idx)} className="text-rose-400 hover:text-rose-300"><X className="w-3.5 h-3.5" /></button>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button disabled={loading} type="submit" className="bg-emerald-600 text-white px-6 py-2 rounded text-sm disabled:opacity-50">
              {loading ? 'Creating...' : 'Create Prescription'}
            </button>
          </form>
        </div>
      )}

      {/* Prescriptions List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950 text-slate-400 text-xs uppercase border-b border-slate-800">
            <tr>
              <th className="px-4 py-3 font-medium">Rx Number</th>
              <th className="px-4 py-3 font-medium">Patient</th>
              <th className="px-4 py-3 font-medium">Doctor</th>
              <th className="px-4 py-3 font-medium">Diagnosis</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredPrescriptions.map(rx => (
              <tr key={rx.id} className="hover:bg-slate-800/50">
                <td className="px-4 py-3 font-mono text-xs text-emerald-400">{rx.prescription_number}</td>
                <td className="px-4 py-3 text-white text-sm">{rx.patient_name}</td>
                <td className="px-4 py-3 text-xs">{rx.doctor_name}</td>
                <td className="px-4 py-3 text-xs text-slate-400 max-w-[200px] truncate">{rx.diagnosis || '—'}</td>
                <td className="px-4 py-3"><StatusBadge status={rx.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={async () => { const d = await getPrescriptionById(rx.id); setSelectedRx(d); }} className="text-blue-400 hover:text-blue-300 text-xs">View</button>
                    <button onClick={() => handleCheckInteractions(rx.id)} className="text-amber-400 hover:text-amber-300 text-xs">Check Rx</button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredPrescriptions.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">No prescriptions found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Interaction Results */}
      {interactions && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> Drug Interaction Check
            </h3>
            <button onClick={() => setInteractions(null)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
          </div>
          <p className={`text-sm mb-3 ${interactions.hasSevere ? 'text-red-400' : interactions.safe ? 'text-emerald-400' : 'text-amber-400'}`}>
            {interactions.recommendation}
          </p>
          {interactions.interactions?.length > 0 && (
            <div className="space-y-2">
              {interactions.interactions.map((ix, i) => (
                <div key={i} className={`p-3 rounded-lg border ${ix.severity === 'CONTRAINDICATED' ? 'bg-red-500/10 border-red-500/20' : ix.severity === 'SEVERE' ? 'bg-orange-500/10 border-orange-500/20' : 'bg-amber-500/10 border-amber-500/20'}`}>
                  <div className="flex gap-2 items-center mb-1">
                    <span className={`text-xs font-bold ${ix.severity === 'CONTRAINDICATED' ? 'text-red-400' : ix.severity === 'SEVERE' ? 'text-orange-400' : 'text-amber-400'}`}>{ix.severity}</span>
                    <span className="text-xs text-slate-400">{ix.drug_a_name} ↔ {ix.drug_b_name}</span>
                  </div>
                  <p className="text-xs text-slate-300">{ix.description}</p>
                  {ix.management && <p className="text-xs text-slate-500 mt-1">Management: {ix.management}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Prescription Detail Modal */}
      {selectedRx && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setSelectedRx(null)}>
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">{selectedRx.prescription_number}</h3>
              <button onClick={() => setSelectedRx(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
              <div><span className="text-slate-500">Patient:</span> <span className="text-white">{selectedRx.patient_name}</span></div>
              <div><span className="text-slate-500">Doctor:</span> <span className="text-white">{selectedRx.doctor_name}</span></div>
              <div><span className="text-slate-500">Diagnosis:</span> <span className="text-white">{selectedRx.diagnosis || '—'}</span></div>
              <div><span className="text-slate-500">Status:</span> <StatusBadge status={selectedRx.status} /></div>
            </div>

            {/* Items */}
            {selectedRx.items?.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-bold text-slate-400 mb-2">Prescribed Medications</h4>
                <div className="space-y-2">
                  {selectedRx.items.map(item => (
                    <div key={item.id} className="bg-slate-800/50 border border-slate-700/50 rounded px-3 py-2">
                      <p className="text-sm text-white font-medium">{item.medicine_name} <span className="text-xs text-slate-500">({item.medicine_code})</span></p>
                      <p className="text-xs text-slate-400 mt-1">{item.dosage} • {item.frequency} • {item.duration}</p>
                      {item.instructions && <p className="text-xs text-slate-500 italic mt-1">{item.instructions}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 flex-wrap">
              {selectedRx.status === 'DRAFT' && (
                <button onClick={() => handleStatusUpdate(selectedRx.id, 'PENDING_APPROVAL')} className="bg-amber-600 text-white px-3 py-1.5 rounded text-xs">Submit for Approval</button>
              )}
              {selectedRx.status === 'PENDING_APPROVAL' && (
                <button onClick={() => handleStatusUpdate(selectedRx.id, 'APPROVED')} className="bg-emerald-600 text-white px-3 py-1.5 rounded text-xs flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Approve</button>
              )}
              {selectedRx.status !== 'CANCELLED' && selectedRx.status !== 'DISPENSED' && (
                <button onClick={() => handleStatusUpdate(selectedRx.id, 'CANCELLED')} className="bg-rose-600 text-white px-3 py-1.5 rounded text-xs">Cancel</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
