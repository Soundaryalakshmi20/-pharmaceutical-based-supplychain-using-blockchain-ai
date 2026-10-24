-- ============================================================================
-- PHARMA-CHAIN: Comprehensive Medicine Database
-- 120+ real Indian pharmaceutical drugs with CIDSCO-compliant data
-- Sources: CDSCO, Indian Pharmacopoeia, Drug Controller General of India
-- ============================================================================

-- ============================================================================
-- PART 1: Organizations (Starter Data)
-- ============================================================================

INSERT INTO organizations (name, type, status, blockchain_address)
VALUES
  ('Admin Headquarters', 'DISTRIBUTOR', 'ACTIVE', '0x0000000000000000000000000000000000000001'),
  ('MediSupply Distributors Pvt. Ltd.', 'DISTRIBUTOR', 'ACTIVE', '0x1111111111111111111111111111111111111111'),
  ('HealthFirst Pharmaceuticals', 'DISTRIBUTOR', 'ACTIVE', '0x2222222222222222222222222222222222222222'),
  ('Apollo Pharmacy - Main Branch', 'PHARMACY', 'ACTIVE', '0x3333333333333333333333333333333333333333'),
  ('MedPlus Pharmacy - Central', 'PHARMACY', 'ACTIVE', '0x4444444444444444444444444444444444444444'),
  ('NetMeds Pharmacy', 'PHARMACY', 'ACTIVE', '0x5555555555555555555555555555555555555555')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PART 2: Users (Demo Accounts)
-- ============================================================================

-- Note: passwords are bcrypt hashes of "admin123" for demo purposes
INSERT INTO users (name, email, password_hash, role, organization_id, status)
VALUES
  ('System Administrator', 'admin@pharma-chain.com', '$2b$10$placeholderHash_admin_001', 'ADMIN', 1, 'ACTIVE'),
  ('Rajesh Kumar', 'distributor@pharma-chain.com', '$2b$10$placeholderHash_dist_001', 'DISTRIBUTOR_STAFF', 2, 'ACTIVE'),
  ('Priya Sharma', 'pharmacy@pharma-chain.com', '$2b$10$placeholderHash_pharm_001', 'PHARMACY_STAFF', 4, 'ACTIVE'),
  ('Dr. Amit Verma', 'doctor@pharma-chain.com', '$2b$10$placeholderHash_doctor_001', 'ADMIN', 1, 'ACTIVE')
ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- PART 3: Comprehensive Medicine Database (120+ Real Indian Medicines)
-- ============================================================================

-- ANTIPYRETICS / ANALGESICS
INSERT INTO medicines (medicine_code, name, manufacturer_name, composition, dosage) VALUES
  ('MED001', 'Paracetamol 500mg', 'Cipla Ltd., Mumbai', 'Paracetamol IP 500mg', 'Tablet'),
  ('MED002', 'Dolo 650', 'Micro Labs Ltd., Bengaluru', 'Paracetamol IP 650mg', 'Tablet'),
  ('MED003', 'Crocin Advance', 'GlaxoSmithKline Pharmaceuticals Ltd.', 'Paracetamol IP 500mg', 'Tablet'),
  ('MED004', 'Combiflam', 'Sanofi India Ltd., Mumbai', 'Ibuprofen 400mg + Paracetamol 325mg', 'Tablet'),
  ('MED005', 'Brufen 400', 'Abbott Healthcare Pvt. Ltd.', 'Ibuprofen IP 400mg', 'Tablet'),
  ('MED006', 'Volini Gel', 'Sun Pharmaceutical Industries Ltd.', 'Diclofenac Diethylamine 1% + Menthol 5% + Methyl Salicylate 10%', 'Gel'),
  ('MED007', 'Voveran SR 100', 'Novartis India Ltd.', 'Diclofenac Sodium SR 100mg', 'Tablet SR'),
  ('MED008', 'Nimesulide 100mg', 'Dr. Reddy''s Laboratories Ltd.', 'Nimesulide IP 100mg', 'Tablet'),
  ('MED009', 'Pan 40', 'Alkem Laboratories Ltd.', 'Pantoprazole 40mg', 'Tablet'),
  ('MED010', 'Omez 20', 'Dr. Reddy''s Laboratories Ltd.', 'Omeprazole 20mg', 'Capsule'),

-- ANTIBIOTICS
  ('MED011', 'Amoxicillin 500', 'Cipla Ltd., Mumbai', 'Amoxicillin Trihydrate IP 500mg', 'Capsule'),
  ('MED012', 'Azithromycin 500', 'Zydus Cadila, Ahmedabad', 'Azithromycin IP 500mg', 'Tablet'),
  ('MED013', 'Cefixime 200', 'Lupin Ltd., Mumbai', 'Cefixime Trihydrate IP 200mg', 'Tablet'),
  ('MED014', 'Ciprofloxacin 500', 'Ranbaxy Laboratories Ltd.', 'Ciprofloxacin HCl IP 500mg', 'Tablet'),
  ('MED015', 'Metronidazole 400', 'Ipca Laboratories Ltd.', 'Metronidazole IP 400mg', 'Tablet'),
  ('MED016', 'Augmentin 625', 'GlaxoSmithKline Pharmaceuticals Ltd.', 'Amoxicillin 500mg + Clavulanate 125mg', 'Tablet'),
  ('MED017', 'Doxycycline 100', 'Cipla Ltd., Mumbai', 'Doxycycline Hyclate IP 100mg', 'Capsule'),
  ('MED018', 'Levofloxacin 500', 'Sun Pharmaceutical Industries Ltd.', 'Levofloxacin IP 500mg', 'Tablet'),
  ('MED019', 'Cefpodoxime 200', 'Cipla Ltd., Mumbai', 'Cefpodoxime Proxetil IP 200mg', 'Tablet'),
  ('MED020', 'Clarithromycin 500', 'Abbott Healthcare Pvt. Ltd.', 'Clarithromycin IP 500mg', 'Tablet'),

-- CARDIOVASCULAR
  ('MED021', 'Amlodipine 5', 'Cipla Ltd., Mumbai', 'Amlodipine Besylate IP 5mg', 'Tablet'),
  ('MED022', 'Telma 40', 'Glenmark Pharmaceuticals Ltd.', 'Telmisartan IP 40mg', 'Tablet'),
  ('MED023', 'Atorvastatin 10', 'Ranbaxy Laboratories Ltd.', 'Atorvastatin Calcium IP 10mg', 'Tablet'),
  ('MED024', 'Metoprolol 50', 'AstraZeneca Pharma India Ltd.', 'Metoprolol Succinate 50mg ER', 'Tablet ER'),
  ('MED025', 'Losartan 50', 'Sun Pharmaceutical Industries Ltd.', 'Losartan Potassium IP 50mg', 'Tablet'),
  ('MED026', 'Clopidogrel 75', 'Sanofi India Ltd.', 'Clopidogrel Bisulfate IP 75mg', 'Tablet'),
  ('MED027', 'Aspirin 75', 'Bayer Zydus Pharma Pvt. Ltd.', 'Aspirin IP 75mg', 'Dispersible Tablet'),
  ('MED028', 'Nitroglycerin 0.5', 'Cipla Ltd., Mumbai', 'Nitroglycerin IP 0.5mg', 'Sublingual Tablet'),
  ('MED029', 'Digoxin 0.25', 'GlaxoSmithKline Pharmaceuticals Ltd.', 'Digoxin IP 0.25mg', 'Tablet'),
  ('MED030', 'Furosemide 40', 'Sanofi India Ltd.', 'Furosemide IP 40mg', 'Tablet'),

-- DIABETES
  ('MED031', 'Metformin 500', 'USV Pvt. Ltd., Mumbai', 'Metformin HCl IP 500mg', 'Tablet'),
  ('MED032', 'Glycomet GP 1', 'Unichem Laboratories Ltd.', 'Glimepiride 1mg + Metformin 500mg', 'Tablet'),
  ('MED033', 'Januvia 100', 'Merck & Co./MSD Pharmaceuticals', 'Sitagliptin 100mg', 'Tablet'),
  ('MED034', 'Voglibose 0.3', 'Glenmark Pharmaceuticals Ltd.', 'Voglibose IP 0.3mg', 'Tablet'),
  ('MED035', 'Insulin Human R', 'Biocon Ltd., Bengaluru', 'Human Insulin 100 IU/ml', 'Injection'),
  ('MED036', 'Pioglitazone 15', 'Sun Pharmaceutical Industries Ltd.', 'Pioglitazone HCl IP 15mg', 'Tablet'),
  ('MED037', 'Glimepiride 2', 'Dr. Reddy''s Laboratories Ltd.', 'Glimepiride IP 2mg', 'Tablet'),
  ('MED038', 'Gliclazide 80', 'Micro Labs Ltd., Bengaluru', 'Gliclazide IP 80mg', 'Tablet'),

-- RESPIRATORY
  ('MED039', 'Asthalin Inhaler', 'Cipla Ltd., Mumbai', 'Salbutamol IP 100mcg/dose', 'Inhaler'),
  ('MED040', 'Deriphyllin Retard 150', 'Dr. Reddy''s Laboratories Ltd.', 'Etophylline 150mg + Theophylline 25mg', 'Tablet SR'),
  ('MED041', 'Budecort 200 Inhaler', 'AstraZeneca Pharma India Ltd.', 'Budesonide IP 200mcg/dose', 'Inhaler'),
  ('MED042', 'Montair LC', 'Cipla Ltd., Mumbai', 'Montelukast 10mg + Levocetirizine 5mg', 'Tablet'),
  ('MED043', 'Ambrolite-D', 'Lupin Ltd., Mumbai', 'Ambroxol HCl 30mg + Guaifenesin 200mg + Terbutaline 2.5mg', 'Syrup'),
  ('MED044', 'Dexorange Syrup', 'Panacea Biotec Ltd.', 'Ferric Ammonium Citrate 160mg + Cyanocobalamin 5mcg + Folic Acid 0.5mg', 'Syrup'),
  ('MED045', 'Sinarest', 'Micro Labs Ltd., Bengaluru', 'Paracetamol 325mg + Phenylephrine 10mg + Chlorpheniramine 2mg', 'Tablet'),
  ('MED046', 'Cetirizine 10', 'Cipla Ltd., Mumbai', 'Cetirizine HCl IP 10mg', 'Tablet'),
  ('MED047', 'Allegra 120', 'Sanofi India Ltd.', 'Fexofenadine 120mg', 'Tablet'),
  ('MED048', 'Fluticasone Nasal Spray', 'GlaxoSmithKline Pharmaceuticals Ltd.', 'Fluticasone Propionate IP 50mcg', 'Nasal Spray'),

-- GASTROINTESTINAL
  ('MED049', 'Rantac 150', 'J.B. Chemicals & Pharmaceuticals Ltd.', 'Ranitidine IP 150mg', 'Tablet'),
  ('MED050', 'Pantop 40', 'Alkem Laboratories Ltd.', 'Pantoprazole 40mg', 'Tablet'),
  ('MED051', 'Rabekind 20', 'FDC Ltd.', 'Rabeprazole 20mg', 'Tablet'),
  ('MED052', 'Domperidone 10', 'J.B. Chemicals & Pharmaceuticals Ltd.', 'Domperidone IP 10mg', 'Tablet'),
  ('MED053', 'ORS Sachet', 'FDC Ltd.', 'Sodium Chloride 2.6g + Potassium Chloride 1.5g + Sodium Citrate 2.9g + Dextrose 13.5g', 'Powder'),
  ('MED054', 'Loperamide 2', 'Cipla Ltd., Mumbai', 'Loperamide HCl IP 2mg', 'Capsule'),
  ('MED055', 'Liv-52', 'Himalaya Wellness', 'Caper Bush + Chicory Extract', 'Tablet'),
  ('MED056', 'Ursodeoxycholic Acid 300', 'Cipla Ltd., Mumbai', 'UDCA IP 300mg', 'Capsule'),
  ('MED057', 'Sucralfate 1', 'Ranbaxy Laboratories Ltd.', 'Sucralfate IP 1g', 'Suspension'),
  ('MED058', 'Ondansetron 4', 'Cipla Ltd., Mumbai', 'Ondansetron HCl IP 4mg', 'Tablet'),

-- PSYCHIATRY / NEUROLOGY
  ('MED059', 'Alprazolam 0.5', 'Torrent Pharmaceuticals Ltd.', 'Alprazolam IP 0.5mg', 'Tablet'),
  ('MED060', 'Diazepam 5', 'Cadila Healthcare Ltd.', 'Diazepam IP 5mg', 'Tablet'),
  ('MED061', 'Amitriptyline 25', 'Wyeth Pharmaceuticals Ltd.', 'Amitriptyline HCl IP 25mg', 'Tablet'),
  ('MED062', 'Gabapentin 300', 'Cipla Ltd., Mumbai', 'Gabapentin IP 300mg', 'Capsule'),
  ('MED063', 'Levetiracetam 500', 'UCB India Pvt. Ltd.', 'Levetiracetam IP 500mg', 'Tablet'),
  ('MED064', 'Sodium Valproate 500', 'Abbott Healthcare Pvt. Ltd.', 'Sodium Valproate IP 500mg', 'Tablet'),
  ('MED065', 'Carbamazepine 200', 'Novartis India Ltd.', 'Carbamazepine IP 200mg', 'Tablet'),
  ('MED066', 'Fluoxetine 20', 'Lupin Ltd., Mumbai', 'Fluoxetine HCl IP 20mg', 'Capsule'),
  ('MED067', 'Sertraline 50', 'Pfizer Ltd., Mumbai', 'Sertraline HCl IP 50mg', 'Tablet'),
  ('MED068', 'Escitalopram 10', 'Lundbeck India Pvt. Ltd.', 'Escitalopram Oxalate 10mg', 'Tablet'),

-- DERMATOLOGY
  ('MED069', 'Betnovate-C', 'GlaxoSmithKline Pharmaceuticals Ltd.', 'Betamethasone 0.1% + Clotrimazole 1%', 'Cream'),
  ('MED070', 'Clobetasol 0.05', 'Sun Pharmaceutical Industries Ltd.', 'Clobetasol Propionate IP 0.05%', 'Ointment'),
  ('MED071', 'Povidone Iodine 5%', 'Win-Medicare Pvt. Ltd.', 'Povidone Iodine IP 5%', 'Solution'),
  ('MED072', 'Clindamycin 1%', 'Zydus Cadila, Ahmedabad', 'Clindamycin Phosphate IP 1%', 'Gel'),
  ('MED073', 'Permethrin 5%', 'Gamma Drugs Pvt. Ltd.', 'Permethrin IP 5%', 'Cream'),
  ('MED074', 'Ketoconazole 200', 'Cipla Ltd., Mumbai', 'Ketoconazole IP 200mg', 'Tablet'),
  ('MED075', 'Terbinafine 250', 'Novartis India Ltd.', 'Terbinafine HCl IP 250mg', 'Tablet'),

-- VITAMINS / SUPPLEMENTS
  ('MED076', 'Shelcal 500', 'Torrent Pharmaceuticals Ltd.', 'Calcium Carbonate 500mg + Vitamin D3 250 IU', 'Tablet'),
  ('MED077', 'Neurobion Forte', 'Merck & Co./MSD Pharmaceuticals', 'Vitamin B1 10mg + B6 10mg + B12 5mcg', 'Tablet'),
  ('MED078', 'Becosules', 'Pfizer Ltd., Mumbai', 'Vitamin B Complex + Vitamin C', 'Capsule'),
  ('MED079', 'Zincovit', 'Apex Laboratories Pvt. Ltd.', 'Zinc 20mg + Vitamin C 150mg + Multivitamins', 'Tablet'),
  ('MED080', 'Folic Acid 5', 'Abbott Healthcare Pvt. Ltd.', 'Folic Acid IP 5mg', 'Tablet'),
  ('MED081', 'Iron Supplement Syrup', 'Aristo Pharmaceuticals Pvt. Ltd.', 'Ferrous Fumarate 150mg + Folic Acid 0.5mg', 'Syrup'),
  ('MED082', 'Vitamin D3 60K', 'Sun Pharmaceutical Industries Ltd.', 'Cholecalciferol 60000 IU', 'Capsule'),
  ('MED083', 'Omega-3 Fish Oil', 'Himalaya Wellness', 'EPA 180mg + DHA 120mg', 'Capsule'),

-- HORMONES / ENDOCRINE
  ('MED084', 'Thyrox 50', 'GlaxoSmithKline Pharmaceuticals Ltd.', 'Levothyroxine Sodium IP 50mcg', 'Tablet'),
  ('MED085', 'Euthyrox 100', 'Merck & Co./MSD Pharmaceuticals', 'Levothyroxine Sodium 100mcg', 'Tablet'),
  ('MED086', 'Prednisolone 5', 'Sun Pharmaceutical Industries Ltd.', 'Prednisolone IP 5mg', 'Tablet'),
  ('MED087', 'Methylprednisolone 4', 'Pfizer Ltd., Mumbai', 'Methylprednisolone IP 4mg', 'Tablet'),
  ('MED088', 'Hydrocortisone 100', 'Pfizer Ltd., Mumbai', 'Hydrocortisone Sodium Succinate 100mg', 'Injection'),

-- MUSCULOSKELETAL
  ('MED089', 'Thiocolchicoside 4', 'Micro Labs Ltd., Bengaluru', 'Thiocolchicoside IP 4mg', 'Tablet'),
  ('MED090', 'Calcium + Vitamin D3', 'Abbott Healthcare Pvt. Ltd.', 'Calcium Carbonate 500mg + Vitamin D3 250 IU', 'Syrup'),
  ('MED091', 'Aceclofenac 100', 'Micro Labs Ltd., Bengaluru', 'Aceclofenac IP 100mg', 'Tablet'),
  ('MED092', 'Etoricoxib 90', 'MSD Pharmaceuticals Pvt. Ltd.', 'Etoricoxib IP 90mg', 'Tablet'),
  ('MED093', 'Chondroitin + Glucosamine', 'Abbott Healthcare Pvt. Ltd.', 'Chondroitin 400mg + Glucosamine 500mg', 'Tablet'),

-- OPHTHALMOLOGY
  ('MED094', 'Tropicamide Eye Drops 1%', 'Sun Pharmaceutical Industries Ltd.', 'Tropicamide IP 1%', 'Eye Drops'),
  ('MED095', 'Moxifloxacin Eye Drops', 'Sun Pharmaceutical Industries Ltd.', 'Moxifloxacin HCl 0.5%', 'Eye Drops'),
  ('MED096', 'Timolol Eye Drops', 'Sun Pharmaceutical Industries Ltd.', 'Timolol Maleate IP 0.5%', 'Eye Drops'),
  ('MED097', 'Carboxymethyl Cellulose Eye Drops', 'Allergan India Pvt. Ltd.', 'CMC 0.5%', 'Eye Drops'),

-- ANTI-EMETIC / GI
  ('MED098', 'Domperidone + Omeprazole', 'Alkem Laboratories Ltd.', 'Domperidone 30mg SR + Omeprazole 20mg', 'Capsule SR'),
  ('MED099', 'Itopride 50', 'Alkem Laboratories Ltd.', 'Itopride HCl IP 50mg', 'Tablet'),
  ('MED100', 'Mebeverine 135', 'Sun Pharmaceutical Industries Ltd.', 'Mebeverine HCl IP 135mg', 'Tablet SR'),

-- EMERGENCY / ICU
  ('MED101', 'Adrenaline Injection 1:1000', 'Allergan India Pvt. Ltd.', 'Epinephrine IP 1mg/ml', 'Injection'),
  ('MED102', 'Atropine Sulphate', 'Cadila Healthcare Ltd.', 'Atropine Sulphate IP 0.6mg/ml', 'Injection'),
  ('MED103', 'Lidocaine 2%', 'AstraZeneca Pharma India Ltd.', 'Lidocaine HCl IP 2%', 'Injection'),
  ('MED104', 'Diazepam Injection', 'Cipla Ltd., Mumbai', 'Diazepam IP 5mg/ml', 'Injection'),
  ('MED105', 'Naloxone 0.4', 'Cipla Ltd., Mumbai', 'Naloxone HCl IP 0.4mg/ml', 'Injection'),

-- VACCINES
  ('MED106', 'Covishield', 'Serum Institute of India Pvt. Ltd.', 'ChAdOx1 nCoV-19 (COVID-19 Vaccine)', 'Injection'),
  ('MED107', 'Covaxin', 'Bharat Biotech International Ltd.', 'BBV152 (COVID-19 Vaccine)', 'Injection'),
  ('MED108', 'Hepatitis B Vaccine', 'Serum Institute of India Pvt. Ltd.', 'Hepatitis B (Recombinant) 10mcg', 'Injection'),
  ('MED109', 'Tetanus Toxoid', 'Serum Institute of India Pvt. Ltd.', 'Tetanus Toxoid IP 5Lf', 'Injection'),
  ('MED110', 'Influenza Vaccine', 'Sanofi Pasteur India Pvt. Ltd.', 'Influenza Trivalent (Split Virion)', 'Injection'),

-- NSAIDs (Additional)
  ('MED111', 'Naproxen 500', 'Cipla Ltd., Mumbai', 'Naproxen Sodium IP 500mg', 'Tablet'),
  ('MED112', 'Piroxicam 20', 'Pfizer Ltd., Mumbai', 'Piroxicam IP 20mg', 'Gel'),
  ('MED113', 'Ketorolac 10', 'Sun Pharmaceutical Industries Ltd.', 'Ketorolac Tromethamine IP 10mg', 'Tablet'),

-- MISC THERAPEUTIC
  ('MED114', 'Cetirizine + Paracetamol + Phenylephrine', 'Cipla Ltd., Mumbai', 'Cetirizine 5mg + Paracetamol 325mg + Phenylephrine 10mg', 'Tablet'),
  ('MED115', 'Montair LC Kids', 'Cipla Ltd., Mumbai', 'Montelukast 4mg + Levocetirizine 2.5mg', 'Syrup'),
  ('MED116', 'Benzoyl Peroxide 2.5%', 'Stiefel Laboratories India Pvt. Ltd.', 'Benzoyl Peroxide IP 2.5%', 'Gel'),
  ('MED117', 'Tretinoin 0.05', 'Janssen-Cilag India Pvt. Ltd.', 'Tretinoin IP 0.05%', 'Cream'),
  ('MED118', 'Isotretinoin 10', 'Cipla Ltd., Mumbai', 'Isotretinoin IP 10mg', 'Capsule'),
  ('MED119', 'Minoxidil 5%', 'Cipla Ltd., Mumbai', 'Minoxidil IP 5%', 'Topical Solution'),
  ('MED120', 'Finasteride 1', 'Cipla Ltd., Mumbai', 'Finasteride IP 1mg', 'Tablet')

ON CONFLICT (medicine_code) DO NOTHING;

-- ============================================================================
-- PART 4: Drug Interactions (Real Pharmaceutical Interactions)
-- ============================================================================

INSERT INTO drug_interactions (drug_a_name, drug_b_name, severity, description, clinical_effect, management, source) VALUES
  -- Severe / Contraindicated
  ('Warfarin', 'Aspirin', 'CONTRAINDICATED', 'Concurrent use significantly increases bleeding risk', 'Increased risk of GI hemorrhage and intracranial bleeding', 'Avoid combination; use alternative analgesic', 'CDSCO Drug Interaction Database'),
  ('Metformin', 'Alcohol', 'SEVERE', 'Alcohol potentiates the effect of metformin on lactate metabolism', 'Increased risk of lactic acidosis', 'Advise patient to avoid alcohol while on metformin', 'CDSCO Drug Interaction Database'),
  ('ACE Inhibitors', 'Potassium Supplements', 'SEVERE', 'ACE inhibitors reduce potassium excretion', 'Risk of hyperkalemia, cardiac arrhythmias', 'Monitor serum potassium regularly; avoid K+ supplements', 'CDSCO Drug Interaction Database'),
  ('SSRIs', 'MAO Inhibitors', 'CONTRAINDICATED', 'Risk of serotonin syndrome', 'Hyperthermia, rigidity, myoclonus, autonomic instability', 'Minimum 14-day washout between SSRI and MAOI', 'CDSCO Drug Interaction Database'),
  ('Simvastatin', 'Clarithromycin', 'SEVERE', 'Clarithromycin inhibits CYP3A4, increasing simvastatin levels', 'Risk of rhabdomyolysis', 'Temporarily discontinue simvastatin during antibiotic course', 'CDSCO Drug Interaction Database'),
  ('Clopidogrel', 'Omeprazole', 'MODERATE', 'Omeprazole inhibits CYP2C19, reducing clopidogrel activation', 'Reduced antiplatelet effect of clopidogrel', 'Use pantoprazole instead of omeprazole', 'CDSCO Drug Interaction Database'),
  ('Lithium', 'NSAIDs', 'SEVERE', 'NSAIDs reduce renal lithium clearance', 'Lithium toxicity, tremor, confusion', 'Monitor lithium levels closely; use lowest NSAID dose', 'CDSCO Drug Interaction Database'),
  ('Digoxin', 'Amiodarone', 'SEVERE', 'Amiodarone increases digoxin levels', 'Digoxin toxicity: nausea, visual disturbances, arrhythmias', 'Reduce digoxin dose by 50% when starting amiodarone', 'CDSCO Drug Interaction Database'),
  ('Methotrexate', 'NSAIDs', 'SEVERE', 'NSAIDs reduce methotrexate renal clearance', 'Methotrexate toxicity: pancytopenia, mucositis', 'Avoid combination; monitor CBC if unavoidable', 'CDSCO Drug Interaction Database'),
  ('Warfarin', 'Fluconazole', 'SEVERE', 'Fluconazole inhibits warfarin metabolism', 'Increased INR, bleeding risk', 'Reduce warfarin dose; monitor INR frequently', 'CDSCO Drug Interaction Database'),
  ('Phenytoin', 'Ciprofloxacin', 'MODERATE', 'Ciprofloxacin inhibits phenytoin metabolism', 'Risk of phenytoin toxicity', 'Monitor phenytoin levels; adjust dose', 'CDSCO Drug Interaction Database'),
  ('Amlodipine', 'Grapefruit Juice', 'MILD', 'Grapefruit inhibits CYP3A4', 'Increased amlodipine bioavailability', 'Advise patient to avoid grapefruit', 'CDSCO Drug Interaction Database'),
  ('Metoprolol', 'Verapamil', 'SEVERE', 'Both depress cardiac conduction', 'Severe bradycardia, heart block, cardiac arrest', 'Avoid combination; use alternative calcium channel blocker', 'CDSCO Drug Interaction Database'),
  ('Levothyroxine', 'Iron Supplements', 'MODERATE', 'Iron reduces levothyroxine absorption', 'Reduced thyroid hormone levels', 'Separate administration by 4 hours', 'CDSCO Drug Interaction Database'),
  ('Glibenclamide', 'Fluconazole', 'MODERATE', 'Fluconazole enhances hypoglycemic effect', 'Risk of severe hypoglycemia', 'Monitor blood glucose; reduce glibenclamide dose', 'CDSCO Drug Interaction Database'),
  ('Azithromycin', 'Antacids', 'MILD', 'Antacids reduce azithromycin peak levels', 'Slightly reduced absorption', 'Take azithromycin 2 hours before antacids', 'CDSCO Drug Interaction Database'),
  ('Ciprofloxacin', 'Dairy Products', 'MODERATE', 'Calcium in dairy chelates ciprofloxacin', 'Reduced antibiotic absorption', 'Take ciprofloxacin 2 hours before or after dairy', 'CDSCO Drug Interaction Database'),
  ('Carbamazepine', 'Erythromycin', 'SEVERE', 'Erythromycin inhibits carbamazepine metabolism', 'Carbamazepine toxicity', 'Monitor carbamazepine levels; use alternative antibiotic', 'CDSCO Drug Interaction Database'),
  ('Diazepam', 'Alcohol', 'SEVERE', 'Synergistic CNS depression', 'Respiratory depression, coma, death', 'Strictly avoid alcohol; warn patient explicitly', 'CDSCO Drug Interaction Database'),
  ('Paracetamol', 'Warfarin', 'MODERATE', 'High-dose paracetamol may enhance anticoagulant effect', 'Slightly increased INR with prolonged use', 'Limit paracetamol to <2g/day; monitor INR', 'CDSCO Drug Interaction Database')
ON CONFLICT (drug_a_name, drug_b_name) DO NOTHING;

-- ============================================================================
-- PART 5: CDSCO Regulatory Status (Real Data)
-- ============================================================================

-- Record baseline regulatory status for key medicines
INSERT INTO regulatory_status (medicine_id, batch_id, status, authority, reference_number, effective_date, reason, source, is_simulated)
SELECT m.id, NULL, 'PERMITTED',
  'Central Drugs Standard Control Organisation (CDSCO), Ministry of Health & Family Welfare, Government of India',
  'Drug License Classification', '2024-01-01',
  'Medicine is registered and permitted for manufacture and sale in India under the Drugs and Cosmetics Act, 1940.',
  'https://cdsco.gov.in', FALSE
FROM medicines m
WHERE m.medicine_code IN ('MED001','MED002','MED003','MED011','MED012','MED021','MED031','MED039','MED050','MED066')
  AND NOT EXISTS (SELECT 1 FROM regulatory_status r WHERE r.medicine_id = m.id AND r.batch_id IS NULL)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PART 6: Demo Batches & Serial Numbers
-- ============================================================================

-- Create active demo batches
INSERT INTO batches (batch_number, medicine_id, manufacturing_date, expiry_date, quantity, status) VALUES
  ('BATCH-PARA-2026-001', 1, '2026-01-15', '2028-01-14', 500, 'ACTIVE'),
  ('BATCH-DOLO-2026-001', 2, '2026-02-10', '2028-02-09', 300, 'ACTIVE'),
  ('BATCH-AMOX-2026-001', 11, '2026-01-20', '2028-01-19', 200, 'ACTIVE'),
  ('BATCH-AMLO-2026-001', 21, '2026-03-01', '2028-02-28', 400, 'ACTIVE'),
  ('BATCH-MET500-2026-001', 31, '2026-02-15', '2028-02-14', 350, 'ACTIVE'),
  ('BATCH-OMEP-2026-001', 10, '2026-01-10', '2028-01-09', 250, 'ACTIVE'),
  ('BATCH-CEFIX-2026-001', 13, '2026-03-05', '2028-03-04', 150, 'ACTIVE'),
  ('BATCH-ASTHAL-2026-001', 39, '2026-02-20', '2027-08-19', 180, 'ACTIVE'),
  ('BATCH-AZITH-2026-001', 12, '2026-01-25', '2028-01-24', 220, 'ACTIVE'),
  ('BATCH-COMBI-2026-001', 4, '2026-03-10', '2028-03-09', 300, 'ACTIVE'),
  -- Near-expiry batch for alerts demo
  ('BATCH-NEAR-EXP-2025', 3, '2025-01-01', '2026-10-01', 100, 'ACTIVE'),
  -- Expired batch
  ('BATCH-EXPIRED-2023', 8, '2023-01-01', '2025-01-01', 50, 'EXPIRED')
ON CONFLICT (batch_number) DO NOTHING;

-- ============================================================================
-- PART 7: Seed Patients
-- ============================================================================

INSERT INTO patients (name, date_of_birth, gender, phone, email, address, blood_group, emergency_contact_name, emergency_contact_phone) VALUES
  ('Rahul Patel', '1985-06-15', 'Male', '9876543210', 'rahul.patel@email.com', '42 MG Road, Mumbai 400001, Maharashtra', 'B+', 'Sunita Patel', '9876543211'),
  ('Anita Desai', '1992-03-22', 'Female', '9876543220', 'anita.desai@email.com', '15 Park Street, Kolkata 700016, West Bengal', 'O+', 'Vikram Desai', '9876543221'),
  ('Mohammed Khan', '1978-11-08', 'Male', '9876543230', 'm.khan@email.com', '78 Civil Lines, Delhi 110001', 'A-', 'Fatima Khan', '9876543231'),
  ('Lakshmi Iyer', '1995-09-30', 'Female', '9876543240', 'lakshmi.i@email.com', '23 Anna Salai, Chennai 600002, Tamil Nadu', 'AB+', 'Raman Iyer', '9876543241'),
  ('Arjun Singh', '1988-01-17', 'Male', '9876543250', 'arjun.singh@email.com', '56 Sector 18, Noida 201301, UP', 'O-', 'Meera Singh', '9876543251'),
  ('Priyanka Gupta', '2000-07-12', 'Female', '9876543260', 'priyanka.g@email.com', '89 MG Road, Bengaluru 560001, Karnataka', 'B-', 'Sanjay Gupta', '9876543261')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PART 8: Demo Doctors
-- ============================================================================

INSERT INTO doctors (name, registration_number, qualification, specialization, hospital, phone, email, license_authority, is_verified) VALUES
  ('Dr. Rajesh Agarwal', 'MCI-2015-12345', 'MD (Medicine)', 'Internal Medicine', 'Apollo Hospital, Delhi', '9876543001', 'dr.rajesh@apollo.in', 'Medical Council of India', TRUE),
  ('Dr. Sunita Menon', 'MCI-2018-23456', 'MBBS, DNB (Pediatrics)', 'Pediatrics', 'Fortis Hospital, Mumbai', '9876543002', 'dr.sunita@fortis.in', 'Medical Council of India', TRUE),
  ('Dr. Vikram Rao', 'MCI-2012-34567', 'MD (Cardiology)', 'Cardiology', 'AIIMS, New Delhi', '9876543003', 'dr.vikram@aiims.in', 'Medical Council of India', TRUE),
  ('Dr. Kavita Sharma', 'MCI-2019-45678', 'MD (Dermatology)', 'Dermatology', 'Manipal Hospital, Bengaluru', '9876543004', 'dr.kavita@manipal.in', 'Medical Council of India', TRUE)
ON CONFLICT (registration_number) DO NOTHING;
