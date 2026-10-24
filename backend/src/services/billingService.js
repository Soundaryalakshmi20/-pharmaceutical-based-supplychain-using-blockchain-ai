'use strict';

const db = require('../config/db');
const { ApiError } = require('../utils/response');

class BillingService {
  /**
   * Create a GST-compliant bill from a prescription or ad-hoc items.
   */
  async createBill({ patientId, pharmacyId, prescriptionId, issuedBy, items, paymentMethod, discount = 0, gstinPatient, notes }) {
    if (!items || items.length === 0) throw new ApiError(400, 'NO_ITEMS', 'Bill must have at least one item');

    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      let subtotal = 0;
      const billItems = [];

      for (const item of items) {
        // Verify medicine exists and get price info
        const medResult = await client.query(
          `SELECT id, name, medicine_code FROM medicines WHERE id = $1`, [item.medicineId]
        );
        if (medResult.rows.length === 0) throw new ApiError(400, 'INVALID_MEDICINE', `Medicine ${item.medicineId} not found`);

        const med = medResult.rows[0];
        const unitPrice = item.unitPrice || 0;
        const qty = item.quantity || 1;
        const itemDiscount = (unitPrice * qty * (item.discountRate || 0)) / 100;
        const taxableAmount = (unitPrice * qty) - itemDiscount;
        const gstRate = item.gstRate || 12;
        const gstAmount = (taxableAmount * gstRate) / 100;
        const totalAmount = taxableAmount + gstAmount;

        billItems.push({
          medicineId: med.id,
          serialNumberId: item.serialNumberId || null,
          prescriptionItemId: item.prescriptionItemId || null,
          description: item.description || med.name,
          hsnCode: item.hsnCode || '3004', // Pharmaceutical HSN
          quantity: qty,
          unitPrice,
          discountRate: item.discountRate || 0,
          discountAmount: itemDiscount,
          taxableAmount,
          gstRate,
          gstAmount,
          totalAmount,
        });

        subtotal += unitPrice * qty;
      }

      // Calculate GST summary (IGST for inter-state, CGST+SGST for intra-state)
      const totalDiscount = billItems.reduce((sum, i) => sum + i.discountAmount, 0);
      const totalTaxable = billItems.reduce((sum, i) => sum + i.taxableAmount, 0);
      const totalGST = billItems.reduce((sum, i) => sum + i.gstAmount, 0);
      // Simplified: assume intra-state (CGST + SGST split equally)
      const cgstRate = 6; // Half of 12% standard GST
      const sgstRate = 6;
      const cgstAmount = totalGST / 2;
      const sgstAmount = totalGST / 2;
      const grandTotal = totalTaxable + totalGST - discount;

      // Get pharmacy GSTIN
      const orgResult = await client.query(
        `SELECT name FROM organizations WHERE id = $1`, [pharmacyId]
      );
      const pharmacyName = orgResult.rows[0]?.name || 'Pharmacy';

      const billResult = await client.query(
        `INSERT INTO bills (prescription_id, patient_id, pharmacy_id, issued_by, status, payment_method,
           subtotal, cgst_rate, cgst_amount, sgst_rate, sgst_amount, total_tax,
           discount, grand_total, amount_paid, balance_due, gstin_pharmacy, gstin_patient, notes)
         VALUES ($1,$2,$3,$4,'ISSUED',$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
         RETURNING *`,
        [
          prescriptionId || null, patientId, pharmacyId, issuedBy || null,
          paymentMethod || null, subtotal, cgstRate, cgstAmount, sgstRate, sgstAmount, totalGST,
          discount, grandTotal, paymentMethod === 'CASH' || paymentMethod === 'CARD' ? grandTotal : 0,
          paymentMethod === 'CASH' || paymentMethod === 'CARD' ? 0 : grandTotal,
          null, gstinPatient || null, notes || null,
        ]
      );
      const bill = billResult.rows[0];

      // Insert bill items
      for (const bi of billItems) {
        await client.query(
          `INSERT INTO bill_items (bill_id, prescription_item_id, medicine_id, serial_number_id,
             description, hsn_code, quantity, unit_price, discount_rate, discount_amount,
             taxable_amount, gst_rate, gst_amount, total_amount)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
          [
            bill.id, bi.prescriptionItemId, bi.medicineId, bi.serialNumberId,
            bi.description, bi.hsnCode, bi.quantity, bi.unitPrice, bi.discountRate, bi.discountAmount,
            bi.taxableAmount, bi.gstRate, bi.gstAmount, bi.totalAmount,
          ]
        );
      }

      // Update status to PAID if paid
      if (paymentMethod === 'CASH' || paymentMethod === 'CARD') {
        await client.query(
          `UPDATE bills SET status = 'PAID', paid_at = NOW() WHERE id = $1`, [bill.id]
        );
        bill.status = 'PAID';
      }

      await client.query('COMMIT');

      return this.getBillById(bill.id);
    } catch (err) {
      try { await client.query('ROLLBACK'); } catch (_) {}
      throw err;
    } finally {
      client.release();
    }
  }

  async getBillById(id) {
    const result = await db.query(
      `SELECT b.*, pt.name as patient_name, pt.phone as patient_phone,
              o.name as pharmacy_name, u.name as issued_by_name
       FROM bills b
       JOIN patients pt ON b.patient_id = pt.id
       JOIN organizations o ON b.pharmacy_id = o.id
       LEFT JOIN users u ON b.issued_by = u.id
       WHERE b.id = $1`,
      [id]
    );
    if (result.rows.length === 0) throw new ApiError(404, 'BILL_NOT_FOUND', 'Bill not found');

    const bill = result.rows[0];

    const items = await db.query(
      `SELECT bi.*, m.name as medicine_name, m.medicine_code
       FROM bill_items bi
       JOIN medicines m ON bi.medicine_id = m.id
       WHERE bi.bill_id = $1`,
      [id]
    );
    bill.items = items.rows;

    return bill;
  }

  async getAllBills({ status, patientId, pharmacyId, dateFrom, dateTo, page = 1, limit = 50 } = {}) {
    let query = `SELECT b.*, pt.name as patient_name, o.name as pharmacy_name
                 FROM bills b
                 JOIN patients pt ON b.patient_id = pt.id
                 JOIN organizations o ON b.pharmacy_id = o.id
                 WHERE 1=1`;
    const params = [];
    let idx = 1;

    if (status) { query += ` AND b.status = $${idx++}`; params.push(status); }
    if (patientId) { query += ` AND b.patient_id = $${idx++}`; params.push(patientId); }
    if (pharmacyId) { query += ` AND b.pharmacy_id = $${idx++}`; params.push(pharmacyId); }
    if (dateFrom) { query += ` AND b.issued_at >= $${idx++}`; params.push(dateFrom); }
    if (dateTo) { query += ` AND b.issued_at <= $${idx++}`; params.push(dateTo); }

    query += ` ORDER BY b.issued_at DESC LIMIT $${idx} OFFSET $${idx + 1}`;
    params.push(limit, (page - 1) * limit);

    const result = await db.query(query, params);
    return result.rows;
  }

  async getSalesSummary({ dateFrom, dateTo, pharmacyId } = {}) {
    let query = `
      SELECT
        DATE(b.issued_at) as sale_date,
        COUNT(DISTINCT b.id) as bill_count,
        SUM(b.subtotal) as total_subtotal,
        SUM(b.total_tax) as total_tax,
        SUM(b.discount) as total_discount,
        SUM(b.grand_total) as total_revenue,
        SUM(b.amount_paid) as collected,
        SUM(b.balance_due) as pending
      FROM bills b WHERE b.status IN ('PAID', 'ISSUED')
    `;
    const params = [];
    let idx = 1;

    if (dateFrom) { query += ` AND b.issued_at >= $${idx++}`; params.push(dateFrom); }
    if (dateTo) { query += ` AND b.issued_at <= $${idx++}`; params.push(dateTo); }
    if (pharmacyId) { query += ` AND b.pharmacy_id = $${idx++}`; params.push(pharmacyId); }

    query += ` GROUP BY DATE(b.issued_at) ORDER BY sale_date DESC`;

    const result = await db.query(query, params);

    // Also get overall summary
    const totalResult = await db.query(
      `SELECT COUNT(DISTINCT id) as total_bills,
              COALESCE(SUM(grand_total), 0) as total_revenue,
              COALESCE(SUM(total_tax), 0) as total_tax,
              COALESCE(SUM(amount_paid), 0) as total_collected,
              COALESCE(SUM(balance_due), 0) as total_pending
       FROM bills WHERE status IN ('PAID','ISSUED')
       ${dateFrom ? `AND issued_at >= $1` : ''}
       ${dateTo ? `AND issued_at <= ${dateFrom ? '$2' : '$1'}` : ''}`,
      [...(dateFrom ? [dateFrom] : []), ...(dateTo ? [dateTo] : [])]
    );

    return {
      daily: result.rows,
      summary: totalResult.rows[0],
    };
  }

  async voidBill(id) {
    const result = await db.query(
      `UPDATE bills SET status = 'VOID' WHERE id = $1 AND status != 'VOID' RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) throw new ApiError(404, 'BILL_NOT_FOUND', 'Bill not found or already voided');
    return result.rows[0];
  }
}

module.exports = new BillingService();
