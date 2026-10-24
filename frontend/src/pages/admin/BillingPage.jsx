import { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { getBills, createBill, getSalesSummary } from '../../api/billing';

const GST_RATES = { 0: 0, 5: 0.05, 12: 0.12, 18: 0.18, 28: 0.28 };

function generateInvoiceNumber() {
  const d = new Date();
  return `INV-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}-${Date.now().toString(36).toUpperCase()}`;
}

export default function BillingPage() {
  const { data: billsData, loading: billsLoading, execute: refreshBills } = useApi(() => getBills());
  const [showNewInvoice, setShowNewInvoice] = useState(false);
  const [showPrintView, setShowPrintView] = useState(null);
  const [filter, setFilter] = useState('all');
  const [creating, setCreating] = useState(false);

  const invoices = billsData?.bills || billsData || [];

  const [form, setForm] = useState({
    patient_id: '',
    patient_name: '',
    prescription_id: '',
    items: [{ medicine_id: '', medicine_name: '', batch_number: '', quantity: 1, unit_price: 0, gst_rate: 18, discount: 0 }],
    payment_method: 'cash',
    notes: '',
  });

  useEffect(() => { refreshBills(); }, [filter]);

  function addItem() {
    setForm(f => ({
      ...f,
      items: [...f.items, { medicine_id: '', medicine_name: '', batch_number: '', quantity: 1, unit_price: 0, gst_rate: 18, discount: 0 }],
    }));
  }

  function removeItem(idx) {
    setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
  }

  function updateItem(idx, field, value) {
    setForm(f => {
      const items = [...f.items];
      items[idx] = { ...items[idx], [field]: value };
      return { ...f, items };
    });
  }

  function calcTotals(items) {
    let subtotal = 0, totalCGST = 0, totalSGST = 0, totalDiscount = 0;
    items.forEach(item => {
      const lineTotal = item.quantity * item.unit_price;
      const discountAmt = lineTotal * (item.discount / 100);
      const taxable = lineTotal - discountAmt;
      const cgst = taxable * (item.gst_rate / 200);
      const sgst = taxable * (item.gst_rate / 200);
      subtotal += taxable;
      totalCGST += cgst;
      totalSGST += sgst;
      totalDiscount += discountAmt;
    });
    return { subtotal, totalCGST, totalSGST, totalDiscount, grandTotal: subtotal + totalCGST + totalSGST };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setCreating(true);
    try {
      const totals = calcTotals(form.items);
      const invoice = {
        patient_id: form.patient_id,
        patient_name: form.patient_name,
        prescription_id: form.prescription_id || undefined,
        items: form.items,
        payment_method: form.payment_method,
        notes: form.notes,
        invoice_number: generateInvoiceNumber(),
        subtotal: totals.subtotal,
        cgst: totals.totalCGST,
        sgst: totals.totalSGST,
        discount: totals.totalDiscount,
        total_amount: totals.grandTotal,
        status: 'issued',
      };
      await createBill(invoice);
      setShowNewInvoice(false);
      refreshBills();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to create invoice');
    } finally {
      setCreating(false);
    }
  }

  function handlePrint(invoice) {
    setShowPrintView(invoice);
    setTimeout(() => window.print(), 300);
  }

  const totals = calcTotals(form.items);

  if (showPrintView) {
    const inv = showPrintView;
    return (
      <div className="print-invoice">
        <div className="no-print mb-4">
          <button onClick={() => setShowPrintView(null)} className="btn-secondary">← Back</button>
          <button onClick={() => window.print()} className="btn-primary ml-2">🖨️ Print Invoice</button>
        </div>
        <div className="invoice-printable">
          <div className="invoice-header">
            <div className="company-info">
              <h1>PharmaChain</h1>
              <p>Pharmaceutical Supply Chain Management</p>
              <p>License: CDSCO/MH/2024/XXXX</p>
              <p>GSTIN: 27AABCP1234A1Z5</p>
            </div>
            <div className="invoice-title">
              <h2>TAX INVOICE</h2>
              <p><strong>Invoice #:</strong> {inv.invoice_number || generateInvoiceNumber()}</p>
              <p><strong>Date:</strong> {new Date(inv.created_at || Date.now()).toLocaleDateString('en-IN')}</p>
            </div>
          </div>
          <div className="invoice-parties">
            <div className="bill-to">
              <h3>Bill To:</h3>
              <p><strong>{inv.patient_name || 'Patient'}</strong></p>
              <p>ID: {inv.patient_id}</p>
            </div>
            <div className="payment-info">
              <h3>Payment Details:</h3>
              <p>Method: {(inv.payment_method || 'cash').toUpperCase()}</p>
              <p>Status: {inv.status}</p>
            </div>
          </div>
          <table className="invoice-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Medicine</th>
                <th>Batch</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Disc%</th>
                <th>CGST</th>
                <th>SGST</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {(inv.items || []).map((item, i) => {
                const line = item.quantity * item.unit_price;
                const disc = line * (item.discount / 100);
                const taxable = line - disc;
                return (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{item.medicine_name}</td>
                    <td>{item.batch_number || '-'}</td>
                    <td>{item.quantity}</td>
                    <td>₹{item.unit_price.toFixed(2)}</td>
                    <td>{item.discount}%</td>
                    <td>₹{(taxable * item.gst_rate / 200).toFixed(2)}</td>
                    <td>₹{(taxable * item.gst_rate / 200).toFixed(2)}</td>
                    <td>₹{taxable.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="invoice-totals">
            <table>
              <tbody>
                <tr><td>Subtotal:</td><td>₹{(inv.subtotal || totals.subtotal).toFixed(2)}</td></tr>
                <tr><td>Total CGST:</td><td>₹{(inv.cgst || totals.totalCGST).toFixed(2)}</td></tr>
                <tr><td>Total SGST:</td><td>₹{(inv.sgst || totals.totalSGST).toFixed(2)}</td></tr>
                <tr><td>Discount:</td><td>-₹{(inv.discount || totals.totalDiscount).toFixed(2)}</td></tr>
                <tr className="grand-total"><td><strong>Grand Total:</strong></td><td><strong>₹{(inv.total_amount || totals.grandTotal).toFixed(2)}</strong></td></tr>
              </tbody>
            </table>
          </div>
          <div className="invoice-footer">
            <p>Terms: All medicines sold subject to CDSCO regulations. Prescription drugs dispensed only with valid prescription.</p>
            <p>Return policy: Unopened medicines within 30 days with receipt. Temperature-sensitive items non-returnable.</p>
            <div className="invoice-signatures">
              <div>Authorized Signatory</div>
              <div>Patient Signature</div>
            </div>
            <p className="page-number">Page 1 of 1 | Generated: {new Date().toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>💰 Billing & Invoicing</h1>
        <button onClick={() => setShowNewInvoice(true)} className="btn-primary">+ New Invoice</button>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <select value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All Invoices</option>
          <option value="issued">Issued</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Invoice Form Modal */}
      {showNewInvoice && (
        <div className="modal-overlay">
          <div className="modal-content modal-large">
            <div className="modal-header">
              <h2>Create Invoice</h2>
              <button onClick={() => setShowNewInvoice(false)} className="btn-close">✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Patient ID *</label>
                  <input type="text" required value={form.patient_id} onChange={e => setForm(f => ({ ...f, patient_id: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Patient Name</label>
                  <input type="text" value={form.patient_name} onChange={e => setForm(f => ({ ...f, patient_name: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Prescription ID</label>
                  <input type="text" value={form.prescription_id} onChange={e => setForm(f => ({ ...f, prescription_id: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Payment Method</label>
                  <select value={form.payment_method} onChange={e => setForm(f => ({ ...f, payment_method: e.target.value }))}>
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI</option>
                    <option value="netbanking">Net Banking</option>
                    <option value="insurance">Insurance</option>
                  </select>
                </div>
              </div>

              <h3 className="mt-4 mb-2">Medicine Items</h3>
              {form.items.map((item, i) => (
                <div key={i} className="invoice-item-row">
                  <input type="text" placeholder="Medicine Name" value={item.medicine_name} onChange={e => updateItem(i, 'medicine_name', e.target.value)} className="flex-2" />
                  <input type="text" placeholder="Batch #" value={item.batch_number} onChange={e => updateItem(i, 'batch_number', e.target.value)} className="flex-1" />
                  <input type="number" placeholder="Qty" min="1" value={item.quantity} onChange={e => updateItem(i, 'quantity', parseInt(e.target.value) || 1)} className="flex-1" />
                  <input type="number" placeholder="Price" min="0" step="0.01" value={item.unit_price} onChange={e => updateItem(i, 'unit_price', parseFloat(e.target.value) || 0)} className="flex-1" />
                  <select value={item.gst_rate} onChange={e => updateItem(i, 'gst_rate', parseInt(e.target.value))} className="flex-1">
                    <option value={0}>GST 0%</option>
                    <option value={5}>GST 5%</option>
                    <option value={12}>GST 12%</option>
                    <option value={18}>GST 18%</option>
                    <option value={28}>GST 28%</option>
                  </select>
                  <input type="number" placeholder="Disc%" min="0" max="100" value={item.discount} onChange={e => updateItem(i, 'discount', parseFloat(e.target.value) || 0)} className="flex-1" />
                  {form.items.length > 1 && <button type="button" onClick={() => removeItem(i)} className="btn-danger-sm">✕</button>}
                </div>
              ))}
              <button type="button" onClick={addItem} className="btn-secondary mt-2">+ Add Item</button>

              <div className="invoice-preview-totals mt-4">
                <p>Subtotal: <strong>₹{totals.subtotal.toFixed(2)}</strong></p>
                <p>CGST: <strong>₹{totals.totalCGST.toFixed(2)}</strong></p>
                <p>SGST: <strong>₹{totals.totalSGST.toFixed(2)}</strong></p>
                <p>Discount: <strong>-₹{totals.totalDiscount.toFixed(2)}</strong></p>
                <p className="grand-total-line">Grand Total: <strong>₹{totals.grandTotal.toFixed(2)}</strong></p>
              </div>

              <div className="form-group mt-4">
                <label>Notes</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows="2" />
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowNewInvoice(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={creating} className="btn-primary">{creating ? 'Creating...' : 'Create Invoice'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice List */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Patient</th>
              <th>Date</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {billsLoading ? (
              <tr><td colSpan="7" className="text-center">Loading...</td></tr>
            ) : invoices.length === 0 ? (
              <tr><td colSpan="7" className="text-center">No invoices found. Create your first invoice!</td></tr>
            ) : invoices.map(inv => (
              <tr key={inv.id}>
                <td className="font-mono">{inv.invoice_number}</td>
                <td>{inv.patient_name || inv.patient_id}</td>
                <td>{new Date(inv.created_at).toLocaleDateString('en-IN')}</td>
                <td>{inv.items?.length || 0}</td>
                <td className="font-bold">₹{inv.total_amount?.toFixed(2)}</td>
                <td><span className={`badge badge-${inv.status}`}>{inv.status}</span></td>
                <td>
                  <button onClick={() => handlePrint(inv)} className="btn-sm">🖨️ Print</button>
                  <button onClick={() => setShowPrintView(inv)} className="btn-sm ml-1">👁️ View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
