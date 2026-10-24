'use strict';

const db = require('../config/db');
const { ApiError } = require('../utils/response');

class PatientService {
  async createPatient({ name, dateOfBirth, gender, phone, email, address, bloodGroup, emergencyContactName, emergencyContactPhone, aadhaarLast4, notes }) {
    try {
      const result = await db.query(
        `INSERT INTO patients (name, date_of_birth, gender, phone, email, address, blood_group, emergency_contact_name, emergency_contact_phone, aadhaar_last4, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING *`,
        [name, dateOfBirth || null, gender || null, phone || null, email || null, address || null, bloodGroup || null, emergencyContactName || null, emergencyContactPhone || null, aadhaarLast4 || null, notes || null]
      );
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  }

  async getAllPatients({ search, page = 1, limit = 50 } = {}) {
    let query = `SELECT * FROM patients WHERE 1=1`;
    const params = [];
    let idx = 1;

    if (search) {
      query += ` AND (name ILIKE $${idx} OR phone ILIKE $${idx} OR email ILIKE $${idx})`;
      params.push(`%${search}%`);
      idx++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`;
    params.push(limit, (page - 1) * limit);

    const result = await db.query(query, params);

    const countQuery = `SELECT COUNT(*) FROM patients ${search ? `WHERE (name ILIKE $1 OR phone ILIKE $1 OR email ILIKE $1)` : ''}`;
    const countResult = await db.query(countQuery, search ? [`%${search}%`] : []);

    return {
      patients: result.rows,
      total: parseInt(countResult.rows[0].count),
      page,
      totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
    };
  }

  async getPatientById(id) {
    const result = await db.query(`SELECT * FROM patients WHERE id = $1`, [id]);
    if (result.rows.length === 0) throw new ApiError(404, 'PATIENT_NOT_FOUND', 'Patient not found');

    const patient = result.rows[0];

    // Fetch allergies
    const allergies = await db.query(`SELECT * FROM patient_allergies WHERE patient_id = $1 ORDER BY created_at DESC`, [id]);
    patient.allergies = allergies.rows;

    // Fetch prescriptions count
    const rxCount = await db.query(`SELECT COUNT(*) FROM prescriptions WHERE patient_id = $1`, [id]);
    patient.prescriptionCount = parseInt(rxCount.rows[0].count);

    // Fetch recent prescriptions
    const rxRecent = await db.query(
      `SELECT p.*, d.name as doctor_name, d.specialization
       FROM prescriptions p JOIN doctors d ON p.doctor_id = d.id
       WHERE p.patient_id = $1 ORDER BY p.created_at DESC LIMIT 5`, [id]
    );
    patient.recentPrescriptions = rxRecent.rows;

    return patient;
  }

  async updatePatient(id, updates) {
    const existing = await db.query('SELECT id FROM patients WHERE id = $1', [id]);
    if (existing.rows.length === 0) throw new ApiError(404, 'PATIENT_NOT_FOUND', 'Patient not found');

    const { name, dateOfBirth, gender, phone, email, address, bloodGroup, emergencyContactName, emergencyContactPhone, notes } = updates;
    const result = await db.query(
      `UPDATE patients SET
        name = COALESCE($1, name), date_of_birth = COALESCE($2, date_of_birth),
        gender = COALESCE($3, gender), phone = COALESCE($4, phone),
        email = COALESCE($5, email), address = COALESCE($6, address),
        blood_group = COALESCE($7, blood_group),
        emergency_contact_name = COALESCE($8, emergency_contact_name),
        emergency_contact_phone = COALESCE($9, emergency_contact_phone),
        notes = COALESCE($10, notes), updated_at = NOW()
       WHERE id = $11 RETURNING *`,
      [name, dateOfBirth, gender, phone, email, address, bloodGroup, emergencyContactName, emergencyContactPhone, notes, id]
    );
    return result.rows[0];
  }

  async addAllergy(patientId, { allergen, severity, reactionDescription }) {
    const existing = await db.query('SELECT id FROM patients WHERE id = $1', [patientId]);
    if (existing.rows.length === 0) throw new ApiError(404, 'PATIENT_NOT_FOUND', 'Patient not found');

    const result = await db.query(
      `INSERT INTO patient_allergies (patient_id, allergen, severity, reaction_description)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [patientId, allergen, severity || 'MODERATE', reactionDescription || null]
    );
    return result.rows[0];
  }

  async removeAllergy(allergyId) {
    await db.query('DELETE FROM patient_allergies WHERE id = $1', [allergyId]);
  }

  async deletePatient(id) {
    const result = await db.query('DELETE FROM patients WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) throw new ApiError(404, 'PATIENT_NOT_FOUND', 'Patient not found');
    return { deleted: true };
  }
}

module.exports = new PatientService();
