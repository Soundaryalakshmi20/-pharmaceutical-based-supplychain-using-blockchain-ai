'use strict';

const db = require('../config/db');
const { ApiError } = require('../utils/response');

class MedicineService {
  async listMedicines({ search, page = 1, limit = 200, withRegulatory = true } = {}) {
    let query = `
      SELECT m.*,
             r.status AS regulatory_status,
             r.authority AS regulatory_authority,
             COALESCE((SELECT COUNT(*) FROM batches b WHERE b.medicine_id = m.id), 0) AS batch_count
      FROM medicines m
      LEFT JOIN regulatory_status r ON r.medicine_id = m.id AND r.batch_id IS NULL
      WHERE 1=1`;
    const params = [];
    let idx = 1;

    if (search) {
      query += ` AND (m.name ILIKE $${idx} OR m.medicine_code ILIKE $${idx} OR m.composition ILIKE $${idx} OR m.manufacturer_name ILIKE $${idx})`;
      params.push(`%${search}%`);
      idx++;
    }

    query += ` ORDER BY m.name ASC LIMIT $${idx} OFFSET $${idx + 1}`;
    params.push(limit, (page - 1) * limit);

    const result = await db.query(query, params);

    if (!withRegulatory) return result.rows;
    return result.rows.map((row) => ({
      ...row,
      regulatory_status: row.regulatory_status || 'UNKNOWN',
    }));
  }

  async getMedicineById(id) {
    const result = await db.query('SELECT * FROM medicines WHERE id = $1', [id]);
    if (result.rows.length === 0) throw new ApiError(404, 'MEDICINE_NOT_FOUND', 'Medicine not found');
    return result.rows[0];
  }

  async createMedicine({ medicineCode, name, manufacturerName, composition, dosage }) {
    if (!name) throw new ApiError(400, 'MISSING_FIELD', 'Medicine name is required');

    const code = medicineCode || `MED${String(Date.now()).slice(-6)}`;
    const result = await db.query(
      `INSERT INTO medicines (medicine_code, name, manufacturer_name, composition, dosage)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (medicine_code) DO UPDATE
         SET name = EXCLUDED.name,
             manufacturer_name = EXCLUDED.manufacturer_name,
             composition = EXCLUDED.composition,
             dosage = EXCLUDED.dosage,
             updated_at = NOW()
       RETURNING *`,
      [code, name, manufacturerName || 'Unknown Manufacturer', composition || null, dosage || null]
    );
    return result.rows[0];
  }

  async updateMedicine(id, updates) {
    const existing = await db.query('SELECT id FROM medicines WHERE id = $1', [id]);
    if (existing.rows.length === 0) throw new ApiError(404, 'MEDICINE_NOT_FOUND', 'Medicine not found');

    const { medicineCode, name, manufacturerName, composition, dosage } = updates;
    const result = await db.query(
      `UPDATE medicines SET
         medicine_code = COALESCE($1, medicine_code),
         name = COALESCE($2, name),
         manufacturer_name = COALESCE($3, manufacturer_name),
         composition = COALESCE($4, composition),
         dosage = COALESCE($5, dosage),
         updated_at = NOW()
       WHERE id = $6 RETURNING *`,
      [medicineCode, name, manufacturerName, composition, dosage, id]
    );
    return result.rows[0];
  }

  async deleteMedicine(id) {
    try {
      const result = await db.query('DELETE FROM medicines WHERE id = $1 RETURNING id', [id]);
      if (result.rows.length === 0) throw new ApiError(404, 'MEDICINE_NOT_FOUND', 'Medicine not found');
      return { deleted: true };
    } catch (err) {
      if (err.code === '23503') {
        throw new ApiError(409, 'MEDICINE_IN_USE', 'Medicine has batches or prescriptions and cannot be deleted');
      }
      throw err;
    }
  }
}

module.exports = new MedicineService();
