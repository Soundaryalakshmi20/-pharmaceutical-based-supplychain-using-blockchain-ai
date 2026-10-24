import React, { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { getPatients, createPatient, updatePatient, addPatientAllergy, removePatientAllergy, deletePatient } from '../../api/patients';
import StatusBadge from '../../components/StatusBadge';
import { Users, Plus, Search, Edit3, Trash2, AlertTriangle, X, Printer, Download } from 'lucide-react';
import { printHTML, reportHeader, reportFooter, statusBadge, downloadCSV } from '../../utils/printUtils';

export default function PatientsPage() {
  const { data, execute: refresh } = useApi(() => getPatients());
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [allergyForm, setAllergyForm] = useState({ allergen: '', severity: 'MODERATE', reactionDescription: '' });
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: '', dateOfBirth: '', gender: '', phone: '', email: '',
    address: '', bloodGroup: '', emergencyContactName: '', emergencyContactPhone: '', notes: ''
  });

  const filteredPatients = data?.patients?.filter(p =>
    !search || p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.phone?.includes(search) || p.email?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  function handlePrint() {
    const patients = filteredPatients;
    const rows = patients.map((p, i) => `<tr><td>${i + 1}</td><td class="bold">${p.name}</td><td class="mono">${p.phone || '—'}</td><td>${p.email || '—'}</td><td>${p.gender || '—'}</td><td>${p.blood_group || '—'}</td><td>${p.prescriptionCount || 0}</td><td>${p.allergies?.length || 0}</td></tr>`).join('');
    const html = `
      ${reportHeader('Patient Directory', 'Complete list of registered patients')}
      <table>
        <thead><tr><th>#</th><th>Name</th><th>Phone</th><th>Email</th><th>Gender</th><th>Blood Group</th><th>Prescriptions</th><th>Allergies</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="8" style="text-align:center">No patients found.</td></tr>'}</tbody>
      </table>
      <p style="text-align:right;font-size:11px;color:#6b7280">Total: ${patients.length} patients</p>
      ${reportFooter()}`;
    printHTML(html, 'Patient Directory — PharmaChain');
  }

  function handleDownloadCSV() {
    downloadCSV('patient-directory.csv', ['Name', 'Phone', 'Email', 'Gender', 'Blood Group', 'Address', 'Emergency Contact'],
      filteredPatients.map(p => [p.name, p.phone || '', p.email || '', p.gender || '', p.blood_group || '', p.address || '', p.emergency_contact_name || ''])
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingPatient) {
        await updatePatient(editingPatient.id, form);
      } else {
        await createPatient(form);
      }
      setShowForm(false);
      setEditingPatient(null);
      setForm({ name: '', dateOfBirth: '', gender: '', phone: '', email: '', address: '', bloodGroup: '', emergencyContactName: '', emergencyContactPhone: '', notes: '' });
      refresh();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (patient) => {
    setEditingPatient(patient);
    setForm({
      name: patient.name || '', dateOfBirth: patient.date_of_birth?.split('T')[0] || '',
      gender: patient.gender || '', phone: patient.phone || '', email: patient.email || '',
      address: patient.address || '', bloodGroup: patient.blood_group || '',
      emergencyContactName: patient.emergency_contact_name || '', emergencyContactPhone: patient.emergency_contact_phone || '',
      notes: patient.notes || ''
    });
    setShowForm(true);
  };

  const handleAddAllergy = async (e) => {
    e.preventDefault();
    if (!selectedPatient || !allergyForm.allergen) return;
    try {
      await addPatientAllergy(selectedPatient.id, allergyForm);
      setAllergyForm({ allergen: '', severity: 'MODERATE', reactionDescription: '' });
      const updated = await getPatients({ search });
      refresh();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to add allergy');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this patient record?')) return;
    try {
      await deletePatient(id);
      refresh();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-400" /> Patient Management
        </h2>
        <div className="flex gap-2">
          <button onClick={handlePrint} className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition">
            <Printer className="w-4 h-4" /> Print
          </button>
          <button onClick={handleDownloadCSV} className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition">
            <Download className="w-4 h-4" /> CSV
          </button>
          <button onClick={() => { setShowForm(!showForm); setEditingPatient(null); setForm({ name: '', dateOfBirth: '', gender: '', phone: '', email: '', address: '', bloodGroup: '', emergencyContactName: '', emergencyContactPhone: '', notes: '' }); }}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition">
            <Plus className="w-4 h-4" /> Add Patient
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, phone, or email..."
          className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:border-emerald-500 outline-none" />
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-slate-300">{editingPatient ? 'Edit Patient' : 'Register New Patient'}</h3>
            <button onClick={() => { setShowForm(false); setEditingPatient(null); }} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Full Name', key: 'name', required: true, type: 'text' },
              { label: 'Date of Birth', key: 'dateOfBirth', type: 'date' },
              { label: 'Gender', key: 'gender', type: 'select', options: ['', 'Male', 'Female', 'Other'] },
              { label: 'Phone', key: 'phone', type: 'tel' },
              { label: 'Email', key: 'email', type: 'email' },
              { label: 'Blood Group', key: 'bloodGroup', type: 'select', options: ['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
              { label: 'Address', key: 'address', type: 'textarea', colSpan: 3 },
              { label: 'Emergency Contact Name', key: 'emergencyContactName', type: 'text' },
              { label: 'Emergency Contact Phone', key: 'emergencyContactPhone', type: 'tel' },
              { label: 'Notes', key: 'notes', type: 'textarea', colSpan: 3 },
            ].map(field => (
              <div key={field.key} className={field.colSpan === 3 ? 'md:col-span-3' : ''}>
                <label className="block text-xs text-slate-400 mb-1">{field.label}</label>
                {field.type === 'select' ? (
                  <select value={form[field.key]} onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none">
                    {field.options.map(o => <option key={o} value={o}>{o || 'Select...'}</option>)}
                  </select>
                ) : field.type === 'textarea' ? (
                  <textarea value={form[field.key]} onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none" rows={2} />
                ) : (
                  <input required={field.required} type={field.type} value={form[field.key]}
                    onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none" />
                )}
              </div>
            ))}
            <div className="md:col-span-3">
              <button disabled={loading} type="submit" className="bg-emerald-600 text-white px-6 py-2 rounded text-sm disabled:opacity-50">
                {loading ? 'Saving...' : editingPatient ? 'Update Patient' : 'Register Patient'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Patient List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950 text-slate-400 text-xs uppercase border-b border-slate-800">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Gender</th>
              <th className="px-4 py-3 font-medium">Blood Group</th>
              <th className="px-4 py-3 font-medium">Rx Count</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredPatients.map(p => (
              <tr key={p.id} className="hover:bg-slate-800/50">
                <td className="px-4 py-3">
                  <p className="text-white font-medium">{p.name}</p>
                  <p className="text-[10px] text-slate-500">{p.email || '—'}</p>
                </td>
                <td className="px-4 py-3 font-mono text-xs">{p.phone || '—'}</td>
                <td className="px-4 py-3">{p.gender || '—'}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 bg-red-500/10 text-red-400 rounded text-xs font-mono">{p.blood_group || '—'}</span></td>
                <td className="px-4 py-3">{p.prescriptionCount || 0}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => setSelectedPatient(p)} className="text-purple-400 hover:text-purple-300 text-xs">View</button>
                    <button onClick={() => handleEdit(p)} className="text-emerald-400 hover:text-emerald-300"><Edit3 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(p.id)} className="text-rose-400 hover:text-rose-300"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredPatients.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">No patients found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Patient Detail Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setSelectedPatient(null)}>
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">{selectedPatient.name}</h3>
              <button onClick={() => setSelectedPatient(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
              <div><span className="text-slate-500">Phone:</span> <span className="text-white">{selectedPatient.phone || '—'}</span></div>
              <div><span className="text-slate-500">Email:</span> <span className="text-white">{selectedPatient.email || '—'}</span></div>
              <div><span className="text-slate-500">Gender:</span> <span className="text-white">{selectedPatient.gender || '—'}</span></div>
              <div><span className="text-slate-500">Blood Group:</span> <span className="text-white">{selectedPatient.blood_group || '—'}</span></div>
              <div className="col-span-2"><span className="text-slate-500">Address:</span> <span className="text-white">{selectedPatient.address || '—'}</span></div>
            </div>

            {/* Allergies */}
            <div className="mb-4">
              <h4 className="text-sm font-bold text-slate-300 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" /> Known Allergies
              </h4>
              {selectedPatient.allergies?.length > 0 ? (
                <div className="space-y-2">
                  {selectedPatient.allergies.map(a => (
                    <div key={a.id} className="flex justify-between items-center bg-amber-500/10 border border-amber-500/20 rounded px-3 py-2">
                      <div>
                        <span className="text-sm text-white font-medium">{a.allergen}</span>
                        <span className={`ml-2 text-xs px-2 py-0.5 rounded ${a.severity === 'LIFE_THREATENING' ? 'bg-red-500/20 text-red-400' : a.severity === 'SEVERE' ? 'bg-orange-500/20 text-orange-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{a.severity}</span>
                        {a.reaction_description && <p className="text-xs text-slate-400 mt-1">{a.reaction_description}</p>}
                      </div>
                      <button onClick={async () => { await removePatientAllergy(selectedPatient.id, a.id); const updated = await getPatients({ search }); refresh(); }} className="text-rose-400 hover:text-rose-300"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">No known allergies recorded.</p>
              )}

              <form onSubmit={handleAddAllergy} className="mt-3 flex gap-2">
                <input value={allergyForm.allergen} onChange={e => setAllergyForm({ ...allergyForm, allergen: e.target.value })}
                  placeholder="Allergen name..." className="flex-1 bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-white focus:border-amber-500 outline-none" />
                <select value={allergyForm.severity} onChange={e => setAllergyForm({ ...allergyForm, severity: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-xs text-white outline-none">
                  <option value="MILD">Mild</option>
                  <option value="MODERATE">Moderate</option>
                  <option value="SEVERE">Severe</option>
                  <option value="LIFE_THREATENING">Life-threatening</option>
                </select>
                <button type="submit" className="bg-amber-600 text-white px-3 py-1.5 rounded text-xs">Add</button>
              </form>
            </div>

            {/* Recent Prescriptions */}
            {selectedPatient.recentPrescriptions?.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-slate-300 mb-2">Recent Prescriptions</h4>
                <div className="space-y-2">
                  {selectedPatient.recentPrescriptions.map(rx => (
                    <div key={rx.id} className="bg-slate-800/50 border border-slate-700/50 rounded px-3 py-2 flex justify-between items-center">
                      <div>
                        <p className="text-xs font-mono text-emerald-400">{rx.prescription_number}</p>
                        <p className="text-xs text-slate-400">{rx.doctor_name} • {rx.specialization}</p>
                      </div>
                      <StatusBadge status={rx.status} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
