'use strict';

const db = require('../config/db');

class DrugInteractionService {
  async getAllInteractions({ severity, search, page = 1, limit = 100 } = {}) {
    let query = `SELECT * FROM drug_interactions WHERE is_active = TRUE`;
    const params = [];
    let idx = 1;

    if (severity) { query += ` AND severity = $${idx++}`; params.push(severity); }
    if (search) {
      query += ` AND (drug_a_name ILIKE $${idx} OR drug_b_name ILIKE $${idx})`;
      params.push(`%${search}%`);
      idx++;
    }

    query += ` ORDER BY
      CASE severity WHEN 'CONTRAINDICATED' THEN 1 WHEN 'SEVERE' THEN 2 WHEN 'MODERATE' THEN 3 ELSE 4 END,
      drug_a_name LIMIT $${idx} OFFSET $${idx + 1}`;
    params.push(limit, (page - 1) * limit);

    const result = await db.query(query, params);
    return result.rows;
  }

  async checkInteractions(medicineNames) {
    if (!medicineNames || medicineNames.length < 2) {
      return { interactions: [], safe: true, hasContraindicated: false, hasSevere: false };
    }

    const interactions = [];

    for (let i = 0; i < medicineNames.length; i++) {
      for (let j = i + 1; j < medicineNames.length; j++) {
        // Normalize: try exact match then ILIKE
        const result = await db.query(
          `SELECT * FROM drug_interactions WHERE is_active = TRUE
           AND (
             (LOWER(drug_a_name) = LOWER($1) AND LOWER(drug_b_name) = LOWER($2))
             OR (LOWER(drug_a_name) = LOWER($2) AND LOWER(drug_b_name) = LOWER($1))
             OR (drug_a_name ILIKE $3 AND drug_b_name ILIKE $4)
             OR (drug_a_name ILIKE $4 AND drug_b_name ILIKE $3)
           )`,
          [medicineNames[i], medicineNames[j], `%${medicineNames[i]}%`, `%${medicineNames[j]}%`]
        );
        if (result.rows.length > 0) {
          interactions.push(...result.rows);
        }
      }
    }

    // Deduplicate
    const seen = new Set();
    const unique = interactions.filter(i => {
      const key = `${i.drug_a_name}-${i.drug_b_name}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return {
      interactions: unique,
      safe: unique.every(i => i.severity === 'MILD'),
      hasContraindicated: unique.some(i => i.severity === 'CONTRAINDICATED'),
      hasSevere: unique.some(i => i.severity === 'SEVERE'),
      summary: unique.length === 0
        ? 'No known interactions found between the selected medications.'
        : `Found ${unique.length} interaction(s). ${
            unique.some(i => i.severity === 'CONTRAINDICATED')
              ? '⚠️ CONTRAINDICATED combinations detected — do NOT co-administer.'
              : unique.some(i => i.severity === 'SEVERE')
                ? '⚠️ Severe interactions detected — use with caution and close monitoring.'
                : 'Moderate/mild interactions — review and monitor patient.'
          }`,
    };
  }

  async addInteraction({ drugAName, drugBName, severity, description, clinicalEffect, management, source }) {
    const result = await db.query(
      `INSERT INTO drug_interactions (drug_a_name, drug_b_name, severity, description, clinical_effect, management, source)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (drug_a_name, drug_b_name)
       DO UPDATE SET severity = $3, description = $4, clinical_effect = $5, management = $6
       RETURNING *`,
      [drugAName, drugBName, severity, description, clinicalEffect || null, management || null, source || 'Manual Entry']
    );
    return result.rows[0];
  }

  async deactivateInteraction(id) {
    await db.query('UPDATE drug_interactions SET is_active = FALSE WHERE id = $1', [id]);
  }
}

module.exports = new DrugInteractionService();
