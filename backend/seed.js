require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function seed() {
  try {
    // Organizations
    await pool.query(`
      INSERT INTO organizations (name, type, status, blockchain_address) VALUES
        ('Admin Headquarters', 'DISTRIBUTOR', 'ACTIVE', '0x0000000000000000000000000000000000000001'),
        ('MediSupply Distributors Pvt. Ltd.', 'DISTRIBUTOR', 'ACTIVE', '0x1111111111111111111111111111111111111111'),
        ('HealthFirst Pharmaceuticals', 'DISTRIBUTOR', 'ACTIVE', '0x2222222222222222222222222222222222222222'),
        ('Apollo Pharmacy - Main Branch', 'PHARMACY', 'ACTIVE', '0x3333333333333333333333333333333333333333'),
        ('MedPlus Pharmacy - Central', 'PHARMACY', 'ACTIVE', '0x4444444444444444444444444444444444444444'),
        ('NetMeds Pharmacy', 'PHARMACY', 'ACTIVE', '0x5555555555555555555555555555555555555555')
      ON CONFLICT DO NOTHING
    `);
    console.log('✅ Organizations seeded');
  } catch(e) { console.log('Organizations:', e.message); }

  try {
    const { rows: existing } = await pool.query('SELECT COUNT(*) FROM medicines');
    console.log('Existing medicines:', existing[0].count);
    
    if (parseInt(existing[0].count) < 50) {
      const medicines = [
        ['MED001', 'Paracetamol 500mg', 'Cipla Ltd., Mumbai', 'Paracetamol IP 500mg', 'Tablet'],
        ['MED002', 'Dolo 650', 'Micro Labs Ltd., Bengaluru', 'Paracetamol IP 650mg', 'Tablet'],
        ['MED003', 'Crocin Advance', 'GlaxoSmithKline Pharmaceuticals Ltd.', 'Paracetamol IP 500mg', 'Tablet'],
        ['MED004', 'Combiflam', 'Sanofi India Ltd., Mumbai', 'Ibuprofen 400mg + Paracetamol 325mg', 'Tablet'],
        ['MED005', 'Brufen 400', 'Abbott Healthcare Pvt. Ltd.', 'Ibuprofen IP 400mg', 'Tablet'],
        ['MED006', 'Volini Gel', 'Sun Pharmaceutical Industries Ltd.', 'Diclofenac Diethylamine 1% + Menthol 5%', 'Gel'],
        ['MED007', 'Voveran SR 100', 'Novartis India Ltd.', 'Diclofenac Sodium SR 100mg', 'Tablet SR'],
        ['MED008', 'Nimesulide 100mg', 'Dr. Reddys Laboratories Ltd.', 'Nimesulide IP 100mg', 'Tablet'],
        ['MED009', 'Pan 40', 'Alkem Laboratories Ltd.', 'Pantoprazole 40mg', 'Tablet'],
        ['MED010', 'Omez 20', 'Dr. Reddys Laboratories Ltd.', 'Omeprazole 20mg', 'Capsule'],
        ['MED011', 'Amoxicillin 500', 'Cipla Ltd., Mumbai', 'Amoxicillin Trihydrate IP 500mg', 'Capsule'],
        ['MED012', 'Azithromycin 500', 'Zydus Cadila, Ahmedabad', 'Azithromycin IP 500mg', 'Tablet'],
        ['MED013', 'Cefixime 200', 'Lupin Ltd., Mumbai', 'Cefixime Trihydrate IP 200mg', 'Tablet'],
        ['MED014', 'Ciprofloxacin 500', 'Ranbaxy Laboratories Ltd.', 'Ciprofloxacin HCl IP 500mg', 'Tablet'],
        ['MED015', 'Metronidazole 400', 'Ipca Laboratories Ltd.', 'Metronidazole IP 400mg', 'Tablet'],
        ['MED016', 'Augmentin 625', 'GlaxoSmithKline Pharmaceuticals Ltd.', 'Amoxicillin 500mg + Clavulanate 125mg', 'Tablet'],
        ['MED017', 'Doxycycline 100', 'Cipla Ltd., Mumbai', 'Doxycycline Hyclate IP 100mg', 'Capsule'],
        ['MED018', 'Levofloxacin 500', 'Sun Pharmaceutical Industries Ltd.', 'Levofloxacin IP 500mg', 'Tablet'],
        ['MED019', 'Cefpodoxime 200', 'Cipla Ltd., Mumbai', 'Cefpodoxime Proxetil IP 200mg', 'Tablet'],
        ['MED020', 'Clarithromycin 500', 'Abbott Healthcare Pvt. Ltd.', 'Clarithromycin IP 500mg', 'Tablet'],
        ['MED021', 'Amlodipine 5', 'Cipla Ltd., Mumbai', 'Amlodipine Besylate IP 5mg', 'Tablet'],
        ['MED022', 'Telma 40', 'Glenmark Pharmaceuticals Ltd.', 'Telmisartan IP 40mg', 'Tablet'],
        ['MED023', 'Atorvastatin 10', 'Ranbaxy Laboratories Ltd.', 'Atorvastatin Calcium IP 10mg', 'Tablet'],
        ['MED024', 'Metoprolol 50', 'AstraZeneca Pharma India Ltd.', 'Metoprolol Succinate 50mg ER', 'Tablet ER'],
        ['MED025', 'Losartan 50', 'Sun Pharmaceutical Industries Ltd.', 'Losartan Potassium IP 50mg', 'Tablet'],
        ['MED026', 'Clopidogrel 75', 'Sanofi India Ltd.', 'Clopidogrel Bisulfate IP 75mg', 'Tablet'],
        ['MED027', 'Aspirin 75', 'Bayer Zydus Pharma Pvt. Ltd.', 'Aspirin IP 75mg', 'Dispersible Tablet'],
        ['MED028', 'Nitroglycerin 0.5', 'Cipla Ltd., Mumbai', 'Nitroglycerin IP 0.5mg', 'Sublingual Tablet'],
        ['MED029', 'Digoxin 0.25', 'GlaxoSmithKline Pharmaceuticals Ltd.', 'Digoxin IP 0.25mg', 'Tablet'],
        ['MED030', 'Furosemide 40', 'Sanofi India Ltd.', 'Furosemide IP 40mg', 'Tablet'],
        ['MED031', 'Metformin 500', 'USV Pvt. Ltd., Mumbai', 'Metformin HCl IP 500mg', 'Tablet'],
        ['MED032', 'Glycomet GP 1', 'Unichem Laboratories Ltd.', 'Glimepiride 1mg + Metformin 500mg', 'Tablet'],
        ['MED033', 'Januvia 100', 'Merck & Co./MSD Pharmaceuticals', 'Sitagliptin 100mg', 'Tablet'],
        ['MED034', 'Voglibose 0.3', 'Glenmark Pharmaceuticals Ltd.', 'Voglibose IP 0.3mg', 'Tablet'],
        ['MED035', 'Insulin Human R', 'Biocon Ltd., Bengaluru', 'Human Insulin 100 IU/ml', 'Injection'],
        ['MED036', 'Pioglitazone 15', 'Sun Pharmaceutical Industries Ltd.', 'Pioglitazone HCl IP 15mg', 'Tablet'],
        ['MED037', 'Glimepiride 2', 'Dr. Reddys Laboratories Ltd.', 'Glimepiride IP 2mg', 'Tablet'],
        ['MED038', 'Gliclazide 80', 'Micro Labs Ltd., Bengaluru', 'Gliclazide IP 80mg', 'Tablet'],
        ['MED039', 'Asthalin Inhaler', 'Cipla Ltd., Mumbai', 'Salbutamol IP 100mcg/dose', 'Inhaler'],
        ['MED040', 'Deriphyllin Retard 150', 'Dr. Reddys Laboratories Ltd.', 'Etophylline 150mg + Theophylline 25mg', 'Tablet SR'],
        ['MED041', 'Budecort 200 Inhaler', 'AstraZeneca Pharma India Ltd.', 'Budesonide IP 200mcg/dose', 'Inhaler'],
        ['MED042', 'Montair LC', 'Cipla Ltd., Mumbai', 'Montelukast 10mg + Levocetirizine 5mg', 'Tablet'],
        ['MED043', 'Ambrolite-D', 'Lupin Ltd., Mumbai', 'Ambroxol HCl 30mg + Guaifenesin 200mg', 'Syrup'],
        ['MED044', 'Dexorange Syrup', 'Panacea Biotec Ltd.', 'Ferric Ammonium Citrate 160mg + Cyanocobalamin 5mcg', 'Syrup'],
        ['MED045', 'Sinarest', 'Micro Labs Ltd., Bengaluru', 'Paracetamol 325mg + Phenylephrine 10mg', 'Tablet'],
        ['MED046', 'Cetirizine 10', 'Cipla Ltd., Mumbai', 'Cetirizine HCl IP 10mg', 'Tablet'],
        ['MED047', 'Allegra 120', 'Sanofi India Ltd.', 'Fexofenadine 120mg', 'Tablet'],
        ['MED048', 'Fluticasone Nasal Spray', 'GlaxoSmithKline Pharmaceuticals Ltd.', 'Fluticasone Propionate IP 50mcg', 'Nasal Spray'],
      ];
      
      for (const m of medicines) {
        await pool.query(
          'INSERT INTO medicines (medicine_code, name, manufacturer_name, composition, dosage) VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING',
          m
        );
      }
      console.log('✅ Medicines seeded:', medicines.length);
    } else {
      console.log('✅ Medicines already seeded');
    }
  } catch(e) { console.log('Medicines error:', e.message); }

  try {
    const { rows: count } = await pool.query('SELECT COUNT(*) FROM drug_interactions');
    if (parseInt(count[0].count) === 0) {
      const interactions = [
        ['Warfarin', 'Aspirin', 'CONTRAINDICATED', 'Increased bleeding risk', 'Avoid combination or monitor INR'],
        ['Metformin', 'Alcohol', 'SEVERE', 'Lactic acidosis risk', 'Limit alcohol intake'],
        ['Metoprolol', 'Verapamil', 'SEVERE', 'Severe bradycardia', 'Avoid combination'],
        ['Diazepam', 'Alcohol', 'SEVERE', 'Respiratory depression', 'Strictly avoid'],
        ['Ciprofloxacin', 'Dairy Products', 'MODERATE', 'Reduced absorption', 'Take 2 hours before/after dairy'],
        ['Levothyroxine', 'Iron Supplements', 'MODERATE', 'Reduced absorption', 'Separate by 4 hours'],
      ];
      for (const i of interactions) {
        await pool.query(
          'INSERT INTO drug_interactions (drug_a_name, drug_b_name, severity, description, management) VALUES ($1,$2,$3,$4,$5)',
          i
        );
      }
      console.log('✅ Drug interactions seeded');
    } else {
      console.log('✅ Drug interactions already seeded');
    }
  } catch(e) { console.log('Interactions:', e.message); }

  try {
    const { rows: pcount } = await pool.query('SELECT COUNT(*) FROM patients');
    if (parseInt(pcount[0].count) === 0) {
      const patients = [
        ['Rahul Patel', '1985-06-15', 'Male', '9876543210', 'rahul.patel@email.com', '42 MG Road, Mumbai', 'B+'],
        ['Anita Desai', '1992-03-22', 'Female', '9876543220', 'anita.desai@email.com', '15 Park Street, Kolkata', 'O+'],
        ['Mohammed Khan', '1978-11-08', 'Male', '9876543230', 'm.khan@email.com', '78 Civil Lines, Delhi', 'A-'],
      ];
      for (const p of patients) {
        await pool.query(
          'INSERT INTO patients (name, date_of_birth, gender, phone, email, address, blood_group) VALUES ($1,$2,$3,$4,$5,$6,$7)',
          p
        );
      }
      console.log('✅ Patients seeded');
    } else {
      console.log('✅ Patients already seeded');
    }
  } catch(e) { console.log('Patients:', e.message); }

  const finalCount = await pool.query('SELECT COUNT(*) FROM medicines');
  console.log('Final medicine count:', finalCount.rows[0].count);
  await pool.end();
}

seed().catch(e => { console.error('Error:', e.message); process.exit(1); });
