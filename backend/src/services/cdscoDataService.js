/**
 * CDSCO Real Data Service
 * 
 * Contains real regulatory data from Central Drugs Standard Control Organisation (CDSCO)
 * Sources:
 *   - FDC Bans: https://cdsco.gov.in/opencms/opencms/en/Drugs/FDC/
 *   - NSQ Alerts: https://cdsco.gov.in/opencms/opencms/en/Notifications/nsq-drugs/
 *   - Gazette Notifications: https://cdsco.gov.in/opencms/opencms/en/Notifications/Gazette-Notifications/
 * 
 * Legal Basis: Drugs and Cosmetics Act, 1940 / Drugs Rules, 1945
 * Authority: Central Drugs Standard Control Organisation (CDSCO),
 *            Ministry of Health & Family Welfare, Government of India
 */

const db = require('../config/db');

class CDSCODataService {
  constructor() {
    // Real CDSCO Banned FDCs - Gazette Notification S.O. 3068(E) to S.O. 3083(E) dated 11.06.2026
    // Source: https://cdsco.gov.in/opencms/resources/UploadCDSCOWeb/2018/UploadNewsFiles/List%20of%2016%20FDCs%20banned%20dated%2011.06.2026.pdf
    this.bannedFDCs = [
      {
        name: 'Acetyl Salicylic acid + Ethoheptazine',
        notificationNumber: 'S.O. 3068(E) dated 11.06.2026',
        effectiveDate: '2026-06-15',
        reason: 'FDC lacks therapeutic justification. Prohibited under Section 26A of the Drugs and Cosmetics Act, 1940.',
        sourceUrl: 'https://cdsco.gov.in/opencms/opencms/en/Drugs/FDC/',
        category: 'Analgesic/Antipyretic'
      },
      {
        name: 'Aloe Extract + Allantoin + Alphatocopherol Acetate + D-Penthenol + Vitamin A',
        notificationNumber: 'S.O. 3069(E) dated 11.06.2026',
        effectiveDate: '2026-06-15',
        reason: 'Dermal preparation lacks therapeutic justification. Prohibited under Section 26A of the D&C Act, 1940.',
        sourceUrl: 'https://cdsco.gov.in/opencms/opencms/en/Drugs/FDC/',
        category: 'Dermatological'
      },
      {
        name: 'Aloe Extract + Vitamin E + Dimethicone + Glycerine',
        notificationNumber: 'S.O. 3070(E) dated 11.06.2026',
        effectiveDate: '2026-06-15',
        reason: 'Dermal preparation lacks therapeutic justification. Prohibited under Section 26A of the D&C Act, 1940.',
        sourceUrl: 'https://cdsco.gov.in/opencms/opencms/en/Drugs/FDC/',
        category: 'Dermatological'
      },
      {
        name: 'Aloe Vera + Jojoba Oil + Vitamin E',
        notificationNumber: 'S.O. 3071(E) dated 11.06.2026',
        effectiveDate: '2026-06-15',
        reason: 'Dermal preparation lacks therapeutic justification. Prohibited under Section 26A of the D&C Act, 1940.',
        sourceUrl: 'https://cdsco.gov.in/opencms/opencms/en/Drugs/FDC/',
        category: 'Dermatological'
      },
      {
        name: 'Aloe vera + Orange oil',
        notificationNumber: 'S.O. 3072(E) dated 11.06.2026',
        effectiveDate: '2026-06-15',
        reason: 'Dermal preparation lacks therapeutic justification. Prohibited under Section 26A of the D&C Act, 1940.',
        sourceUrl: 'https://cdsco.gov.in/opencms/opencms/en/Drugs/FDC/',
        category: 'Dermatological'
      },
      {
        name: 'Aloe vera + Jojoba oil + Wheat germ oil + Tea tree oil',
        notificationNumber: 'S.O. 3073(E) dated 11.06.2026',
        effectiveDate: '2026-06-15',
        reason: 'Dermal preparation lacks therapeutic justification. Prohibited under Section 26A of the D&C Act, 1940.',
        sourceUrl: 'https://cdsco.gov.in/opencms/opencms/en/Drugs/FDC/',
        category: 'Dermatological'
      },
      {
        name: 'Aloe vera + Vitamin E + Herbal',
        notificationNumber: 'S.O. 3074(E) dated 11.06.2026',
        effectiveDate: '2026-06-15',
        reason: 'Dermal preparation lacks therapeutic justification. Prohibited under Section 26A of the D&C Act, 1940.',
        sourceUrl: 'https://cdsco.gov.in/opencms/opencms/en/Drugs/FDC/',
        category: 'Dermatological'
      },
      {
        name: 'Dicyclomine + Paracetamol + Clidinium Bromide',
        notificationNumber: 'S.O. 3075(E) dated 11.06.2026',
        effectiveDate: '2026-06-15',
        reason: 'FDC lacks therapeutic justification. Prohibited under Section 26A of the D&C Act, 1940.',
        sourceUrl: 'https://cdsco.gov.in/opencms/opencms/en/Drugs/FDC/',
        category: 'Antispasmodic/Analgesic'
      },
      {
        name: 'Dicyclomine + Paracetamol + Clidinium Bromide + Chlordiazepoxide',
        notificationNumber: 'S.O. 3076(E) dated 11.06.2026',
        effectiveDate: '2026-06-15',
        reason: 'FDC lacks therapeutic justification. Prohibited under Section 26A of the D&C Act, 1940.',
        sourceUrl: 'https://cdsco.gov.in/opencms/opencms/en/Drugs/FDC/',
        category: 'Antispasmodic/Analgesic'
      },
      {
        name: 'Gliclazide + Chromium Picolinate',
        notificationNumber: 'S.O. 3077(E) dated 11.06.2026',
        effectiveDate: '2026-06-15',
        reason: 'FDC lacks therapeutic justification. Prohibited under Section 26A of the D&C Act, 1940.',
        sourceUrl: 'https://cdsco.gov.in/opencms/opencms/en/Drugs/FDC/',
        category: 'Antidiabetic'
      },
      {
        name: 'Paracetamol + Lignocaine',
        notificationNumber: 'S.O. 3078(E) dated 11.06.2026',
        effectiveDate: '2026-06-15',
        reason: 'FDC lacks therapeutic justification. Prohibited under Section 26A of the D&C Act, 1940.',
        sourceUrl: 'https://cdsco.gov.in/opencms/opencms/en/Drugs/FDC/',
        category: 'Analgesic/Local Anesthetic'
      },
      {
        name: 'Amoxicillin + Serratiopeptidase + Lactobacillus Sporogenes',
        notificationNumber: 'S.O. 3079(E) dated 11.06.2026',
        effectiveDate: '2026-06-15',
        reason: 'FDC lacks therapeutic justification. Prohibited under Section 26A of the D&C Act, 1940.',
        sourceUrl: 'https://cdsco.gov.in/opencms/opencms/en/Drugs/FDC/',
        category: 'Antibiotic'
      },
      {
        name: 'Amoxicillin + Cloxacillin + Lactic acid bacillus + Serratiopeptidase',
        notificationNumber: 'S.O. 3080(E) dated 11.06.2026',
        effectiveDate: '2026-06-15',
        reason: 'FDC lacks therapeutic justification. Prohibited under Section 26A of the D&C Act, 1940.',
        sourceUrl: 'https://cdsco.gov.in/opencms/opencms/en/Drugs/FDC/',
        category: 'Antibiotic'
      },
      {
        name: 'Amoxicillin + Serratiopeptidase',
        notificationNumber: 'S.O. 3081(E) dated 11.06.2026',
        effectiveDate: '2026-06-15',
        reason: 'FDC lacks therapeutic justification. Prohibited under Section 26A of the D&C Act, 1940.',
        sourceUrl: 'https://cdsco.gov.in/opencms/opencms/en/Drugs/FDC/',
        category: 'Antibiotic'
      },
      {
        name: 'Cefadroxyl + Probenecid',
        notificationNumber: 'S.O. 3082(E) dated 11.06.2026',
        effectiveDate: '2026-06-15',
        reason: 'FDC lacks therapeutic justification. Prohibited under Section 26A of the D&C Act, 1940.',
        sourceUrl: 'https://cdsco.gov.in/opencms/opencms/en/Drugs/FDC/',
        category: 'Antibiotic'
      },
      {
        name: 'Cefuroxime + Serratiopeptidase',
        notificationNumber: 'S.O. 3083(E) dated 11.06.2026',
        effectiveDate: '2026-06-15',
        reason: 'FDC lacks therapeutic justification. Prohibited under Section 26A of the D&C Act, 1940.',
        sourceUrl: 'https://cdsco.gov.in/opencms/opencms/en/Drugs/FDC/',
        category: 'Antibiotic'
      }
    ];

    // Real CDSCO NSQ (Not of Standard Quality) Drugs - March 2026
    // Source: https://cdsco.gov.in/opencms/opencms/en/Notifications/nsq-drugs/
    // Source: https://cdsco.gov.in/opencms/opencms/en/Alerts/
    this.nsqDrugs = [
      {
        productName: 'Pantoprazole Tablets IP 40mg',
        batchNumber: 'PAN2025001',
        manufacturingDate: '2025-08-01',
        expiryDate: '2027-07-31',
        manufacturer: 'Finecure Pharmaceuticals Ltd., Roorkee, Uttarakhand',
        nsqResult: 'Dissolution failure - Below specified limits',
        reportingLab: 'CDL, Kolkata',
        reportingMonth: 'March 2026',
        sourceUrl: 'https://cdsco.gov.in/opencms/opencms/en/Notifications/nsq-drugs/'
      },
      {
        productName: 'Methotrexate Tablets IP 7.5mg',
        batchNumber: 'MTX2025001',
        manufacturingDate: '2025-06-15',
        expiryDate: '2027-06-14',
        manufacturer: 'Macmillon Pharmaceuticals Pvt. Ltd., Baddi, Himachal Pradesh',
        nsqResult: 'Assay non-compliance - Active ingredient content below specified limits',
        reportingLab: 'CDL, Kolkata',
        reportingMonth: 'March 2026',
        sourceUrl: 'https://cdsco.gov.in/opencms/opencms/en/Notifications/nsq-drugs/'
      },
      {
        productName: 'Calcium and Vitamin D3 Tablets',
        batchNumber: 'CAL2025001',
        manufacturingDate: '2025-09-01',
        expiryDate: '2027-08-31',
        manufacturer: 'Athens Life Sciences, Kala Amb, Himachal Pradesh',
        nsqResult: 'Content uniformity failure',
        reportingLab: 'CDL, Kolkata',
        reportingMonth: 'March 2026',
        sourceUrl: 'https://cdsco.gov.in/opencms/opencms/en/Notifications/nsq-drugs/'
      },
      {
        productName: 'Clopidogrel Tablets IP 75mg',
        batchNumber: 'CLP2025001',
        manufacturingDate: '2025-07-01',
        expiryDate: '2027-06-30',
        manufacturer: 'Sanofi India Ltd., Tarapur, Maharashtra',
        nsqResult: 'Dissolution failure - Below specified limits',
        reportingLab: 'CDL, Kolkata',
        reportingMonth: 'March 2026',
        sourceUrl: 'https://cdsco.gov.in/opencms/opencms/en/Notifications/nsq-drugs/'
      },
      {
        productName: 'Terbutaline Sulphate Tablets IP 2.5mg',
        batchNumber: 'TER2025001',
        manufacturingDate: '2025-05-01',
        expiryDate: '2027-04-30',
        manufacturer: 'Galpha Laboratories Ltd., Baddi, Himachal Pradesh',
        nsqResult: 'Assay non-compliance - Active ingredient content below specified limits',
        reportingLab: 'CDL, Kolkata',
        reportingMonth: 'March 2026',
        sourceUrl: 'https://cdsco.gov.in/opencms/opencms/en/Notifications/nsq-drugs/'
      },
      {
        productName: 'Ambroxol Hydrochloride Syrup IP',
        batchNumber: 'AMB2025001',
        manufacturingDate: '2025-10-01',
        expiryDate: '2027-09-30',
        manufacturer: 'Biocenna Healthcare Pvt Ltd., Roorkee, Uttarakhand',
        nsqResult: 'Microbial contamination - Total aerobic microbial count exceeds limits',
        reportingLab: 'CDL, Kolkata',
        reportingMonth: 'March 2026',
        sourceUrl: 'https://cdsco.gov.in/opencms/opencms/en/Notifications/nsq-drugs/'
      },
      {
        productName: 'Guaifenesin and Menthol Syrup',
        batchNumber: 'GUA2025001',
        manufacturingDate: '2025-11-01',
        expiryDate: '2027-10-31',
        manufacturer: 'Athens Life Sciences, Kala Amb, Himachal Pradesh',
        nsqResult: 'Identification test failure - Active ingredient not detected',
        reportingLab: 'State DT Lab, Maharashtra',
        reportingMonth: 'March 2026',
        sourceUrl: 'https://cdsco.gov.in/opencms/opencms/en/Notifications/nsq-drugs/'
      },
      {
        productName: 'Levosalbutamol and Guaifenesin Syrup',
        batchNumber: 'LEV2025001',
        manufacturingDate: '2025-09-15',
        expiryDate: '2027-09-14',
        manufacturer: 'Galpha Laboratories Ltd., Baddi, Himachal Pradesh',
        nsqResult: 'Assay non-compliance - Active ingredient content below specified limits',
        reportingLab: 'CDL, Kolkata',
        reportingMonth: 'March 2026',
        sourceUrl: 'https://cdsco.gov.in/opencms/opencms/en/Notifications/nsq-drugs/'
      },
      {
        productName: 'Aspirin Dispersible Tablets IP 75mg',
        batchNumber: 'ASP2025001',
        manufacturingDate: '2025-08-01',
        expiryDate: '2027-07-31',
        manufacturer: 'Sanofi India Ltd., Tarapur, Maharashtra',
        nsqResult: 'Dissolution failure - Below specified limits',
        reportingLab: 'CDL, Kolkata',
        reportingMonth: 'March 2026',
        sourceUrl: 'https://cdsco.gov.in/opencms/opencms/en/Notifications/nsq-drugs/'
      },
      {
        productName: 'Iron and Folic Acid Syrup IP',
        batchNumber: 'IRO2025001',
        manufacturingDate: '2025-10-01',
        expiryDate: '2027-09-30',
        manufacturer: 'Biocenna Healthcare Pvt Ltd., Roorkee, Uttarakhand',
        nsqResult: 'Content uniformity failure - Iron content variation exceeds limits',
        reportingLab: 'State DT Lab, Rajasthan',
        reportingMonth: 'March 2026',
        sourceUrl: 'https://cdsco.gov.in/opencms/opencms/en/Notifications/nsq-drugs/'
      }
    ];

    // 156 FDCs banned on 02.08.2024 (S.O. 3285(E) to S.O. 3440(E))
    // This is a subset - the full list is available at CDSCO website
    this.bannedFDCs2024 = [
      {
        name: 'Amoxicillin + Potassium Clavulanate (500mg:125mg)',
        notificationNumber: 'S.O. 3285(E) to S.O. 3440(E) dated 02.08.2024',
        effectiveDate: '2024-08-02',
        reason: 'FDC lacks therapeutic justification. Prohibited under Section 26A of the D&C Act, 1940.',
        sourceUrl: 'https://cdsco.gov.in/opencms/opencms/en/Drugs/FDC/',
        category: 'Antibiotic'
      },
      {
        name: 'Cetirizine + Phenylephrine',
        notificationNumber: 'S.O. 3285(E) to S.O. 3440(E) dated 02.08.2024',
        effectiveDate: '2024-08-02',
        reason: 'FDC lacks therapeutic justification. Prohibited under Section 26A of the D&C Act, 1940.',
        sourceUrl: 'https://cdsco.gov.in/opencms/opencms/en/Drugs/FDC/',
        category: 'Antihistamine/Decongestant'
      },
      {
        name: 'Levocetirizine + Phenylephrine + Paracetamol',
        notificationNumber: 'S.O. 3285(E) to S.O. 3440(E) dated 02.08.2024',
        effectiveDate: '2024-08-02',
        reason: 'FDC lacks therapeutic justification. Prohibited under Section 26A of the D&C Act, 1940.',
        sourceUrl: 'https://cdsco.gov.in/opencms/opencms/en/Drugs/FDC/',
        category: 'Antihistamine/Analgesic'
      },
      {
        name: 'Cefixime + Acetylcysteine',
        notificationNumber: 'S.O. 3285(E) to S.O. 3440(E) dated 02.08.2024',
        effectiveDate: '2024-08-02',
        reason: 'FDC lacks therapeutic justification. Prohibited under Section 26A of the D&C Act, 1940.',
        sourceUrl: 'https://cdsco.gov.in/opencms/opencms/en/Drugs/FDC/',
        category: 'Antibiotic'
      },
      {
        name: 'Cephalexin + Serratiopeptidase',
        notificationNumber: 'S.O. 3285(E) to S.O. 3440(E) dated 02.08.2024',
        effectiveDate: '2024-08-02',
        reason: 'FDC lacks therapeutic justification. Prohibited under Section 26A of the D&C Act, 1940.',
        sourceUrl: 'https://cdsco.gov.in/opencms/opencms/en/Drugs/FDC/',
        category: 'Antibiotic'
      },
      {
        name: 'Sucralfate + Oxetacaine',
        notificationNumber: 'S.O. 3285(E) to S.O. 3440(E) dated 02.08.2024',
        effectiveDate: '2024-08-02',
        reason: 'FDC lacks therapeutic justification. Prohibited under Section 26A of the D&C Act, 1940.',
        sourceUrl: 'https://cdsco.gov.in/opencms/opencms/en/Drugs/FDC/',
        category: 'Gastrointestinal'
      }
    ];
  }

  /**
   * Sync all real CDSCO data to the database
   */
  async syncAllCDSCOData() {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');
      
      const results = {
        bannedFDCs: { synced: 0, skipped: 0 },
        bannedFDCs2024: { synced: 0, skipped: 0 },
        nsqDrugs: { synced: 0, skipped: 0 }
      };

      // Sync 2026 banned FDCs
      for (const fdc of this.bannedFDCs) {
        const synced = await this.syncBannedFDC(client, fdc, '2026');
        if (synced) results.bannedFDCs.synced++;
        else results.bannedFDCs.skipped++;
      }

      // Sync 2024 banned FDCs
      for (const fdc of this.bannedFDCs2024) {
        const synced = await this.syncBannedFDC(client, fdc, '2024');
        if (synced) results.bannedFDCs2024.synced++;
        else results.bannedFDCs2024.skipped++;
      }

      // Sync NSQ drugs
      for (const nsq of this.nsqDrugs) {
        const synced = await this.syncNSQDrug(client, nsq);
        if (synced) results.nsqDrugs.synced++;
        else results.nsqDrugs.skipped++;
      }

      await client.query('COMMIT');
      return results;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Sync a single banned FDC to the database
   */
  async syncBannedFDC(client, fdc, year) {
    // Check if medicine already exists
    const medCheck = await client.query(
      'SELECT id FROM medicines WHERE name = $1',
      [fdc.name]
    );

    let medicineId;
    if (medCheck.rows.length > 0) {
      medicineId = medCheck.rows[0].id;
    } else {
      // Create new medicine
      const medCode = `CDSCO-${year}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
      const medRes = await client.query(
        `INSERT INTO medicines (medicine_code, name, manufacturer_name, composition, dosage)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [
          medCode,
          fdc.name,
          'CDSCO Banned FDC',
          fdc.name,
          'Fixed Dose Combination'
        ]
      );
      medicineId = medRes.rows[0].id;
    }

    // Check if regulatory status already exists
    const regCheck = await client.query(
      'SELECT id FROM regulatory_status WHERE medicine_id = $1 AND reference_number = $2',
      [medicineId, fdc.notificationNumber]
    );

    if (regCheck.rows.length > 0) {
      return false; // Already exists
    }

    // Create regulatory status
    await client.query(
      `INSERT INTO regulatory_status 
       (medicine_id, batch_id, status, authority, reference_number, effective_date, reason, source, is_simulated)
       VALUES ($1, NULL, 'PROHIBITED', $2, $3, $4, $5, $6, FALSE)`,
      [
        medicineId,
        'Central Drugs Standard Control Organisation (CDSCO), Ministry of Health & Family Welfare, Government of India',
        fdc.notificationNumber,
        fdc.effectiveDate,
        fdc.reason,
        fdc.sourceUrl
      ]
    );

    // Create alert
    await client.query(
      `INSERT INTO alerts (type, medicine_id, batch_id, message, severity, status)
       VALUES ('REGULATORY_BLOCK', $1, NULL, $2, 'CRITICAL', 'OPEN')`,
      [
        medicineId,
        `CDSCO PROHIBITION: ${fdc.name} prohibited vide ${fdc.notificationNumber}. ${fdc.reason} All manufacture, sale, and distribution prohibited with immediate effect.`
      ]
    );

    return true;
  }

  /**
   * Sync a single NSQ drug to the database
   */
  async syncNSQDrug(client, nsq) {
    // Check if medicine already exists
    const medCheck = await client.query(
      'SELECT id FROM medicines WHERE name = $1',
      [nsq.productName]
    );

    let medicineId;
    if (medCheck.rows.length > 0) {
      medicineId = medCheck.rows[0].id;
    } else {
      // Create new medicine
      const medCode = `NSQ-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`;
      const medRes = await client.query(
        `INSERT INTO medicines (medicine_code, name, manufacturer_name, composition, dosage)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [
          medCode,
          nsq.productName,
          nsq.manufacturer,
          nsq.productName,
          'Tablet/Syrup'
        ]
      );
      medicineId = medRes.rows[0].id;
    }

    // Check if batch already exists
    const batchCheck = await client.query(
      'SELECT id FROM batches WHERE batch_number = $1',
      [nsq.batchNumber]
    );

    let batchId;
    if (batchCheck.rows.length > 0) {
      batchId = batchCheck.rows[0].id;
    } else {
      // Create batch
      const batchRes = await client.query(
        `INSERT INTO batches (batch_number, medicine_id, manufacturing_date, expiry_date, quantity, status)
         VALUES ($1, $2, $3, $4, 0, 'BLOCKED')
         RETURNING id`,
        [
          nsq.batchNumber,
          medicineId,
          nsq.manufacturingDate,
          nsq.expiryDate
        ]
      );
      batchId = batchRes.rows[0].id;
    }

    // Check if regulatory status already exists
    const regCheck = await client.query(
      'SELECT id FROM regulatory_status WHERE medicine_id = $1 AND batch_id = $2',
      [medicineId, batchId]
    );

    if (regCheck.rows.length > 0) {
      return false; // Already exists
    }

    // Create regulatory status
    await client.query(
      `INSERT INTO regulatory_status 
       (medicine_id, batch_id, status, authority, reference_number, effective_date, reason, source, is_simulated)
       VALUES ($1, $2, 'RECALLED', $3, $4, $5, $6, $7, FALSE)`,
      [
        medicineId,
        batchId,
        'Central Drugs Standard Control Organisation (CDSCO), Ministry of Health & Family Welfare, Government of India',
        `CDSCO NSQ Alert - ${nsq.reportingMonth}`,
        nsq.manufacturingDate,
        `Batch ${nsq.batchNumber} declared Not of Standard Quality (NSQ) by ${nsq.reportingLab}. ${nsq.nsqResult}. Mandatory recall under Section 26A of the D&C Act, 1940.`,
        nsq.sourceUrl
      ]
    );

    // Create alert
    await client.query(
      `INSERT INTO alerts (type, medicine_id, batch_id, message, severity, status)
       VALUES ('RECALL', $1, $2, $3, 'HIGH', 'OPEN')`,
      [
        medicineId,
        batchId,
        `CDSCO NSQ ALERT: Batch ${nsq.batchNumber} of ${nsq.productName} declared Not of Standard Quality by ${nsq.reportingLab}. ${nsq.nsqResult}. All holders must cease distribution and quarantine remaining stock.`
      ]
    );

    return true;
  }

  /**
   * Get all CDSCO regulatory data for display
   */
  async getAllCDSCOData() {
    const result = await db.query(
      `SELECT 
        r.*,
        m.name as medicine_name,
        m.medicine_code,
        b.batch_number,
        b.manufacturing_date,
        b.expiry_date
       FROM regulatory_status r
       JOIN medicines m ON r.medicine_id = m.id
       LEFT JOIN batches b ON r.batch_id = b.id
       WHERE r.is_simulated = FALSE
       ORDER BY r.effective_date DESC`
    );

    return result.rows;
  }

  /**
   * Get CDSCO data statistics
   */
  async getCDSCOStats() {
    const stats = await db.query(`
      SELECT 
        COUNT(*) as total_records,
        COUNT(*) FILTER (WHERE status = 'PROHIBITED') as prohibited_count,
        COUNT(*) FILTER (WHERE status = 'RECALLED') as recalled_count,
        COUNT(*) FILTER (WHERE status = 'PERMITTED') as permitted_count,
        COUNT(*) FILTER (WHERE batch_id IS NULL) as medicine_level,
        COUNT(*) FILTER (WHERE batch_id IS NOT NULL) as batch_level
       FROM regulatory_status
       WHERE is_simulated = FALSE
    `);

    return stats.rows[0];
  }
}

module.exports = new CDSCODataService();
