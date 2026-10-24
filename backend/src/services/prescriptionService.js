'use strict';

const db = require('../config/db');
const { ApiError } = require('../utils/response');

class PrescriptionService {
  async createPrescription({ doctorId, patientId, pharmacyId, diagnosis, notes, validUntil, items }) {
    // Verify doctor exists
    const docCheck = await db.query('SELECT id FROM doctors WHERE id = $1', [doctorId]);
    if (docCheck.rows.length === 0) throw new ApiError(404, 'DOCTOR_NOT_FOUND', 'Doctor not found');

    // Verify patient exists
    const patCheck = await db.query('SELECT id FROM patients WHERE id = $1', [patientId]);
    if (patCheck.rows.length === 0) throw new ApiError(404, 'PATIENT_NOT_FOUND', 'Patient not found');

    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      const result = await client.query(
        `INSERT INTO prescriptions (doctor_id, patient_id, pharmacy_id, diagnosis, notes, valid_until, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'DRAFT')
         RETURNING *`,
        [doctorId, patientId, pharmacyId || null, diagnosis || null, notes || null, validUntil || null]
      );
      const prescription = result.rows[0];

      // Insert prescription items
      if (items && items.length > 0) {
        for (const item of items) {
          const medCheck = await client.query('SELECT id FROM medicines WHERE id = $1', [item.medicineId]);
          if (medCheck.rows.length === 0) {
            throw new ApiError(400, 'INVALID_MEDICINE', `Medicine ID ${item.medicineId} not found`);
          }
          await client.query(
            `INSERT INTO prescription_items (prescription_id, medicine_id, dosage, frequency, duration, quantity, instructions)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [prescription.id, item.medicineId, item.dosage || null, item.frequency || null, item.duration || null, item.quantity || 1, item.instructions || null]
          );
        }
      }

      await client.query('COMMIT');

      // Return full prescription with items
      return this.getPrescriptionById(prescription.id);
    } catch (err) {
      try { await client.query('ROLLBACK'); } catch (_) {}
      throw err;
    } finally {
      client.release();
    }
  }

  async getPrescriptionById(id) {
    const result = await db.query(
      `SELECT p.*,
              d.name as doctor_name, d.registration_number as doctor_reg, d.specialization,
              pt.name as patient_name, pt.phone as patient_phone, pt.gender as patient_gender
       FROM prescriptions p
       JOIN doctors d ON p.doctor_id = d.id
       JOIN patients pt ON p.patient_id = pt.id
       WHERE p.id = $1`,
      [id]
    );
    if (result.rows.length === 0) throw new ApiError(404, 'PRESCRIPTION_NOT_FOUND', 'Prescription not found');

    const prescription = result.rows[0];

    // Get items with medicine details
    const items = await db.query(
      `SELECT pi.*, m.name as medicine_name, m.medicine_code, m.composition, m.dosage as med_dosage
       FROM prescription_items pi
       JOIN medicines m ON pi.medicine_id = m.id
       WHERE pi.prescription_id = $1`,
      [id]
    );
    prescription.items = items.rows;

    return prescription;
  }

  async getAllPrescriptions({ status, patientId, doctorId, page = 1, limit = 50 } = {}) {
    let query = `SELECT p.*, d.name as doctor_name, pt.name as patient_name
                 FROM prescriptions p
                 JOIN doctors d ON p.doctor_id = d.id
                 JOIN patients pt ON p.patient_id = pt.id WHERE 1=1`;
    const params = [];
    let idx = 1;

    if (status) {
      query += ` AND p.status = $${idx}`;
      params.push(status);
      idx++;
    }
    if (patientId) {
      query += ` AND p.patient_id = $${idx}`;
      params.push(patientId);
      idx++;
    }
    if (doctorId) {
      query += ` AND p.doctor_id = $${idx}`;
      params.push(doctorId);
      idx++;
    }

    query += ` ORDER BY p.created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`;
    params.push(limit, (page - 1) * limit);

    const result = await db.query(query, params);
    return result.rows;
  }

  async updatePrescriptionStatus(id, status, { pharmacyId } = {}) {
    const validStatuses = ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'DISPENSED', 'PARTIALLY_DISPENSED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      throw new ApiError(400, 'INVALID_STATUS', `Invalid prescription status: ${status}`);
    }

    const result = await db.query(
      `UPDATE prescriptions SET status = $1, pharmacy_id = COALESCE($2, pharmacy_id), updated_at = NOW()
       WHERE id = $3 RETURNING *`,
      [status, pharmacyId || null, id]
    );
    if (result.rows.length === 0) throw new ApiError(404, 'PRESCRIPTION_NOT_FOUND', 'Prescription not found');
    return result.rows[0];
  }

  async dispensePrescriptionItem(prescriptionItemId, serialNumber, userId) {
    const itemResult = await db.query(
      `SELECT pi.*, p.patient_id, p.status as rx_status
       FROM prescription_items pi
       JOIN prescriptions p ON pi.prescription_id = p.id
       WHERE pi.id = $1`,
      [prescriptionItemId]
    );
    if (itemResult.rows.length === 0) throw new ApiError(404, 'PRESCRIPTION_ITEM_NOT_FOUND', 'Prescription item not found');

    const item = itemResult.rows[0];
    if (item.rx_status !== 'APPROVED') throw new ApiError(400, 'RX_NOT_APPROVED', 'Prescription must be approved before dispensing');
    if (item.dispensed_serial_id) throw new ApiError(400, 'ALREADY_DISPENSED', 'This prescription item has already been dispensed');

    // Verify serial number is available
    const serialResult = await db.query(
      `SELECT sn.*, b.expiry_date, b.status as batch_status
       FROM serial_numbers sn JOIN batches b ON sn.batch_id = b.id
       WHERE sn.serial_number = $1 AND sn.status = 'IN_STOCK'`,
      [serialNumber]
    );
    if (serialResult.rows.length === 0) throw new ApiError(404, 'SERIAL_UNAVAILABLE', 'Serial number not available for dispensing');

    const serial = serialResult.rows[0];
    if (new Date(serial.expiry_date) < new Date()) throw new ApiError(400, 'EXPIRED', 'Cannot dispense expired medicine');

    // Update prescription item
    await db.query(
      `UPDATE prescription_items SET dispensed_serial_id = $1, dispensed_at = NOW() WHERE id = $2`,
      [serial.id, prescriptionItemId]
    );

    // Check if all items dispensed
    const allItems = await db.query(
      `SELECT dispensed_serial_id FROM prescription_items WHERE prescription_id = $1`,
      [item.prescription_id]
    );
    const allDispensed = allItems.rows.every(i => i.dispensed_serial_id !== null);
    await db.query(
      `UPDATE prescriptions SET status = $1, updated_at = NOW() WHERE id = $2`,
      [allDispensed ? 'DISPENSED' : 'PARTIALLY_DISPENSED', item.prescription_id]
    );

    return { success: true, message: 'Prescription item dispensed' };
  }

  async checkDrugInteractions(prescriptionId) {
    const items = await db.query(
      `SELECT m.name as medicine_name FROM prescription_items pi
       JOIN medicines m ON pi.medicine_id = m.id
       WHERE pi.prescription_id = $1`,
      [prescriptionId]
    );

    if (items.rows.length < 2) return { interactions: [], safe: true };

    const medNames = items.rows.map(i => i.medicine_name);
    const interactions = [];

    for (let i = 0; i < medNames.length; i++) {
      for (let j = i + 1; j < medNames.length; j++) {
        const result = await db.query(
          `SELECT * FROM drug_interactions
           WHERE (drug_a_name ILIKE $1 AND drug_b_name ILIKE $2)
              OR (drug_a_name ILIKE $2 AND drug_b_name ILIKE $1)`,
          [`%${medNames[i]}%`, `%${medNames[j]}%`]
        );
        if (result.rows.length > 0) {
          interactions.push(...result.rows);
        }
      }
    }

    // Also check patient allergies
    const patientCheck = await db.query(
      `SELECT p.patient_id FROM prescriptions p WHERE p.id = $1`, [prescriptionId]
    );
    if (patientCheck.rows.length > 0) {
      const allergies = await db.query(
        `SELECT * FROM patient_allergies WHERE patient_id = $1`, [patientCheck.rows[0].patient_id]
      );
      for (const allergy of allergies.rows) {
        for (const med of medNames) {
          if (med.toLowerCase().includes(allergy.allergen.toLowerCase()) ||
              allergy.allergen.toLowerCase().includes(med.toLowerCase().split(' ')[0])) {
            interactions.push({
              drug_a_name: med,
              drug_b_name: `PATIENT ALLERGY: ${allergy.allergen}`,
              severity: allergy.severity === 'LIFE_THREATENING' ? 'CONTRAINDICATED' :
                        allergy.severity === 'SEVERE' ? 'SEVERE' : 'MODERATE',
              description: `Patient has documented allergy to ${allergy.allergen}. ${allergy.reaction_description || ''}`,
              clinical_effect: `Potential allergic reaction: ${allergy.severity} severity`,
              management: 'Review allergy history; consider alternative medication',
              source: 'Patient Allergy Record',
            });
          }
        }
      }
    }

    const safe = interactions.every(i => i.severity === 'MILD');
    const hasSevere = interactions.some(i => i.severity === 'SEVERE' || i.severity === 'CONTRAINDICATED');

    return {
      interactions,
      safe,
      hasSevere,
      recommendation: hasSevere
        ? 'CRITICAL: Severe drug interaction detected. Consult physician before dispensing.'
        : interactions.length > 0
          ? 'Moderate interactions found. Review and monitor patient.'
          : 'No significant drug interactions detected.',
    };
  }
}

module.exports = new PrescriptionService();
