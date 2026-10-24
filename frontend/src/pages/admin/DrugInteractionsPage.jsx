import { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { getDrugInteractions, checkDrugInteractions } from '../../api/drugInteractions';

const SEVERITY_COLORS = {
  mild: '#22c55e',
  moderate: '#f59e0b',
  severe: '#ef4444',
  critical: '#7c3aed',
};

export default function DrugInteractionsPage() {
  const [patientId, setPatientId] = useState('');
  const [medicines, setMedicines] = useState(['', '']);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  function addMedicine() {
    setMedicines(m => [...m, '']);
  }

  function updateMedicine(idx, val) {
    setMedicines(m => { const n = [...m]; n[idx] = val; return n; });
  }

  async function handleCheck() {
    const valid = medicines.filter(m => m.trim());
    if (valid.length < 2) return;
    setLoading(true);
    try {
      const res = await checkDrugInteractions(valid);
      setResults(res || { interactions: [], total_checked: valid.length });
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to check interactions');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-container">
      <h1>⚠️ Drug Interaction Checker</h1>

      <div className="card mt-4">
        <h3>Check Drug Interactions</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Patient ID (optional — for allergy checks)</label>
            <input type="text" value={patientId} onChange={e => setPatientId(e.target.value)} placeholder="Enter patient ID" />
          </div>
        </div>

        <h4 className="mt-4">Medicines to Check</h4>
        {medicines.map((med, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input
              type="text"
              value={med}
              onChange={e => updateMedicine(i, e.target.value)}
              placeholder={`Medicine ${i + 1} name`}
              className="flex-1"
            />
            {medicines.length > 2 && (
              <button onClick={() => setMedicines(m => m.filter((_, idx) => idx !== i))} className="btn-danger-sm">✕</button>
            )}
          </div>
        ))}
        <button onClick={addMedicine} className="btn-secondary mt-2">+ Add Medicine</button>

        <div className="mt-4">
          <button onClick={handleCheck} disabled={loading} className="btn-primary">
            {loading ? 'Checking...' : '🔍 Check Interactions'}
          </button>
        </div>
      </div>

      {/* Interaction Results */}
      {results && (
        <div className="card mt-4">
          <h3>Interaction Results</h3>
          <p className="text-muted">{results.total_checked || 0} combinations checked, {results.interactions?.length || 0} interactions found</p>

          {results.interactions?.length === 0 ? (
            <div className="alert alert-success">✅ No interactions found between selected medicines.</div>
          ) : (
            <div className="interactions-list">
              {results.interactions?.map((inter, i) => (
                <div key={i} className="interaction-card" style={{ borderLeftColor: SEVERITY_COLORS[inter.severity] || '#999' }}>
                  <div className="interaction-header">
                    <span className="severity-badge" style={{ backgroundColor: SEVERITY_COLORS[inter.severity] || '#999' }}>
                      {(inter.severity || 'UNKNOWN').toUpperCase()}
                    </span>
                    <span>{inter.drug_a_name || inter.medicine_a || 'Drug A'} ↔ {inter.drug_b_name || inter.medicine_b || 'Drug B'}</span>
                  </div>
                  <p className="interaction-effect"><strong>Effect:</strong> {inter.description || inter.interaction_effect}</p>
                  {inter.management && <p className="interaction-recommendation"><strong>Management:</strong> {inter.management}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Drug Interaction Database Reference */}
      <div className="card mt-4">
        <h3>📋 Common Drug Interactions Reference</h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Drug A</th>
                <th>Drug B</th>
                <th>Severity</th>
                <th>Effect</th>
                <th>Recommendation</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Warfarin</td><td>Aspirin</td><td><span className="severity-badge" style={{ backgroundColor: SEVERITY_COLORS.critical }}>CRITICAL</span></td>
                <td>Increased bleeding risk</td><td>Avoid combination or monitor INR closely</td>
              </tr>
              <tr>
                <td>Metformin</td><td>Alcohol</td><td><span className="severity-badge" style={{ backgroundColor: SEVERITY_COLORS.severe }}>SEVERE</span></td>
                <td>Lactic acidosis risk</td><td>Limit alcohol intake</td>
              </tr>
              <tr>
                <td>Lisinopril</td><td>Potassium supplements</td><td><span className="severity-badge" style={{ backgroundColor: SEVERITY_COLORS.moderate }}>MODERATE</span></td>
                <td>Hyperkalemia risk</td><td>Monitor potassium levels</td>
              </tr>
              <tr>
                <td>Ciprofloxacin</td><td>Milk/Antacids</td><td><span className="severity-badge" style={{ backgroundColor: SEVERITY_COLORS.moderate }}>MODERATE</span></td>
                <td>Reduced absorption</td><td>Take 2 hours before or after</td>
              </tr>
              <tr>
                <td>Ibuprofen</td><td>Lisinopril</td><td><span className="severity-badge" style={{ backgroundColor: SEVERITY_COLORS.moderate }}>MODERATE</span></td>
                <td>Reduced antihypertensive effect</td><td>Use paracetamol instead</td>
              </tr>
              <tr>
                <td>Metoprolol</td><td>Verapamil</td><td><span className="severity-badge" style={{ backgroundColor: SEVERITY_COLORS.severe }}>SEVERE</span></td>
                <td>Severe bradycardia, heart block</td><td>Avoid combination</td>
              </tr>
              <tr>
                <td>Diazepam</td><td>Alcohol</td><td><span className="severity-badge" style={{ backgroundColor: SEVERITY_COLORS.critical }}>CRITICAL</span></td>
                <td>Excessive sedation, respiratory depression</td><td>Strictly avoid</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
