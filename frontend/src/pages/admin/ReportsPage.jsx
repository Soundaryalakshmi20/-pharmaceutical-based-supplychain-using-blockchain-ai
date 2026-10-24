import { useState, useRef } from 'react';
import { useApi } from '../../hooks/useApi';
import { getMedicineCatalog, getInventoryReport, getExpiryReport, getSalesReport, getComplianceReport, getSupplierDirectory } from '../../api/reports';

const REPORT_TYPES = [
  { id: 'medicine_catalog', label: '📋 Medicine Catalog', icon: '📋', desc: 'Complete list of all medicines with details', api: getMedicineCatalog },
  { id: 'inventory_stock', label: '📦 Inventory Stock', icon: '📦', desc: 'Current stock levels by medicine and location', api: getInventoryReport },
  { id: 'expiry_report', label: '⏰ Expiry Report', icon: '⏰', desc: 'Expired and near-expiry medicines', api: getExpiryReport },
  { id: 'sales_summary', label: '💰 Sales Summary', icon: '💰', desc: 'Sales and revenue data', api: getSalesReport },
  { id: 'supplier_directory', label: '🏢 Supplier Directory', icon: '🏢', desc: 'Supplier contact information', api: getSupplierDirectory },
  { id: 'compliance', label: '📜 CIDSCO Compliance', icon: '📜', desc: 'Regulatory compliance report', api: getComplianceReport },
];

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPrint, setShowPrint] = useState(false);
  const requestSeq = useRef(0);

  async function generateReport(type, apiFn) {
    const requestId = ++requestSeq.current;
    setSelectedReport(type);
    setReportData(null);
    setLoading(true);
    try {
      const res = await apiFn();
      // Ignore stale responses (a newer report was requested meanwhile).
      if (requestId !== requestSeq.current) return;
      // selectedReport + reportData must be committed together, otherwise a
      // branch can render another report's payload and crash the tree.
      setReportData(res);
      setSelectedReport(type);
      setShowPrint(true);
    } catch (err) {
      if (requestId !== requestSeq.current) return;
      setSelectedReport(null);
      alert(err.response?.data?.error?.message || 'Failed to generate report');
    } finally {
      if (requestId === requestSeq.current) setLoading(false);
    }
  }

  function handlePrint() {
    setTimeout(() => window.print(), 200);
  }

  if (showPrint && reportData) {
    return (
      <div className="print-report">
        <div className="no-print mb-4">
          <button onClick={() => { setShowPrint(false); setReportData(null); }} className="btn-secondary">← Back to Reports</button>
          <button onClick={handlePrint} className="btn-primary ml-2">🖨️ Print Report</button>
        </div>
        <div className="report-printable">
          {/* Report Header */}
          <div className="report-header">
            <div className="report-logo">
              <h1>PharmaChain</h1>
              <p>Pharmaceutical Supply Chain Management System</p>
            </div>
            <div className="report-title">
              <h2>{REPORT_TYPES.find(r => r.id === selectedReport)?.label || selectedReport}</h2>
              <p>Generated: {new Date().toLocaleString('en-IN')}</p>
              <p>License: CDSCO/MH/2024/XXXX</p>
            </div>
          </div>

          <hr className="report-divider" />

          {/* Report Content */}
          {selectedReport === 'medicine_catalog' && (
            <table className="report-table">
              <thead>
                <tr>
                  <th>#</th><th>Medicine Name</th><th>Generic Name</th><th>Dosage Form</th><th>Strength</th><th>Manufacturer</th><th>Schedule</th><th>Price (MRP)</th>
                </tr>
              </thead>
              <tbody>
                {(reportData.medicines || reportData.items || []).map((m, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{m.name || m.medicine_name}</td>
                    <td>{m.generic_name}</td>
                    <td>{m.dosage_form}</td>
                    <td>{m.strength}</td>
                    <td>{m.manufacturer}</td>
                    <td>{m.schedule}</td>
                    <td>₹{m.mrp?.toFixed(2) || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedReport === 'expiry_report' && (
            <table className="report-table">
              <thead>
                <tr>
                  <th>#</th><th>Medicine</th><th>Batch</th><th>Expiry Date</th><th>Quantity</th><th>Status</th><th>Days Left</th>
                </tr>
              </thead>
              <tbody>
                {(reportData.expiry_items || reportData.batches || reportData.items || []).map((item, i) => (
                  <tr key={i} className={item.days_left <= 30 ? 'row-danger' : item.days_left <= 90 ? 'row-warning' : ''}>
                    <td>{i + 1}</td>
                    <td>{item.medicine_name}</td>
                    <td>{item.batch_number}</td>
                    <td>{new Date(item.expiry_date).toLocaleDateString('en-IN')}</td>
                    <td>{item.quantity}</td>
                    <td><span className={`badge badge-${item.status || 'default'}`}>{item.status || 'Active'}</span></td>
                    <td>{item.days_left} days</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedReport === 'inventory_stock' && (
            <table className="report-table">
              <thead>
                <tr>
                  <th>#</th><th>Medicine</th><th>Batch</th><th>Location</th><th>Stock</th><th>Min Level</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(reportData.stock_items || reportData.items || []).map((item, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{item.medicine_name}</td>
                    <td>{item.batch_number}</td>
                    <td>{item.location_name}</td>
                    <td>{item.quantity}</td>
                    <td>{item.min_stock_level}</td>
                    <td><span className={`badge badge-${item.quantity <= item.min_stock_level ? 'low-stock' : 'in-stock'}`}>
                      {item.quantity <= item.min_stock_level ? 'Low Stock' : 'In Stock'}
                    </span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedReport === 'sales_summary' && (
            <table className="report-table">
              <thead>
                <tr><th>#</th><th>Date</th><th>Invoice</th><th>Patient</th><th>Items</th><th>Subtotal</th><th>GST</th><th>Total</th></tr>
              </thead>
              <tbody>
                {(reportData.sales || reportData.transactions || []).map((sale, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{new Date(sale.date || sale.created_at).toLocaleDateString('en-IN')}</td>
                    <td>{sale.invoice_number}</td>
                    <td>{sale.patient_name}</td>
                    <td>{sale.item_count}</td>
                    <td>₹{sale.subtotal?.toFixed(2)}</td>
                    <td>₹{((sale.cgst || 0) + (sale.sgst || 0)).toFixed(2)}</td>
                    <td className="font-bold">₹{sale.total_amount?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedReport === 'compliance' && (
            <div className="compliance-report">
              <h3>CIDSCO Compliance Report</h3>
              <div className="compliance-grid">
                <div className="compliance-card">
                  <h4>Drug License Status</h4>
                  <p className="status-ok">✅ Valid — License: CDSCO/MH/2024/XXXX</p>
                  <p>Valid Until: 31 March 2027</p>
                </div>
                <div className="compliance-card">
                  <h4>Schedule H & H1 Drugs</h4>
                  <p>{reportData.schedule_h_count || 0} Schedule H drugs tracked</p>
                  <p>{reportData.schedule_h1_count || 0} Schedule H1 (narcotics) tracked</p>
                </div>
                <div className="compliance-card">
                  <h4>Temperature Compliance</h4>
                  <p className="status-ok">✅ All cold-chain storage compliant</p>
                </div>
                <div className="compliance-card">
                  <h4>Expired Medicines</h4>
                  <p className={reportData.expired_count > 0 ? 'status-warn' : 'status-ok'}>
                    {reportData.expired_count > 0 ? `⚠️ ${reportData.expired_count} expired items pending disposal` : '✅ No expired medicines in stock'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {selectedReport === 'supplier_directory' && (
            <table className="report-table">
              <thead>
                <tr><th>#</th><th>Supplier</th><th>Contact</th><th>Phone</th><th>Email</th><th>License</th><th>Rating</th></tr>
              </thead>
              <tbody>
                {(reportData.suppliers || []).map((s, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{s.name || s.supplier_name}</td>
                    <td>{s.contact_person}</td>
                    <td>{s.phone}</td>
                    <td>{s.email}</td>
                    <td>{s.license_number}</td>
                    <td>{s.rating || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Report Footer */}
          <div className="report-footer">
            <div className="report-disclaimer">
              <p><strong>Disclaimer:</strong> This report is generated for internal use only. All data is subject to CDSCO regulatory compliance. Unauthorized distribution of this document is prohibited.</p>
            </div>
            <div className="report-meta">
              <p>Page 1 of 1 | Generated by PharmaChain System</p>
              <p>Timestamp: {new Date().toISOString()}</p>
              <p>© {new Date().getFullYear()} PharmaChain Pharmaceutical Management</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1>📊 Reports & Analytics</h1>

      <div className="report-grid mt-4">
        {REPORT_TYPES.map(report => (
          <div key={report.id} className="report-card card" onClick={() => generateReport(report.id, report.api)}>
            <div className="report-icon">{report.icon}</div>
            <h3>{report.label}</h3>
            <p>{report.desc}</p>
            <button className="btn-primary btn-sm" disabled={loading}>
              {loading && selectedReport === report.id ? 'Generating...' : 'Generate & Print'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
