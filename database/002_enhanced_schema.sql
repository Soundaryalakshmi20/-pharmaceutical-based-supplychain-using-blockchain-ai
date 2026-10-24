-- ============================================================================
-- PHARMA-CHAIN: Enhanced Schema (Phase 8 — Production-Ready System)
-- Extends the base 001_schema.sql with:
--   - Patient profiles, prescriptions, prescription items
--   - Drug interaction matrix
--   - GST-compliant billing & line items
--   - Audit trail logging
--   - Multi-location / warehouse support
--   - Drug allergies & contraindications
--   - Print-ready report queue
--   - Offline sync queue
-- ============================================================================

-- ============================================================================
-- ENUMS
-- ============================================================================

DO $$ BEGIN
  CREATE TYPE prescription_status_enum AS ENUM (
    'DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'DISPENSED', 'PARTIALLY_DISPENSED', 'CANCELLED', 'EXPIRED'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE billing_status_enum AS ENUM (
    'DRAFT', 'ISSUED', 'PAID', 'PARTIALLY_PAID', 'VOID', 'REFUNDED'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_method_enum AS ENUM (
    'CASH', 'CARD', 'UPI', 'NET_BANKING', 'INSURANCE', 'CREDIT'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE audit_action_enum AS ENUM (
    'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'RECEIVE', 'TRANSFER', 'DISPENSE',
    'REGULATORY_CHANGE', 'BLOCK', 'RECALL', 'EXPORT', 'PRINT', 'SYNC'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE allergy_severity_enum AS ENUM (
    'MILD', 'MODERATE', 'SEVERE', 'LIFE_THREATENING'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE interaction_severity_enum AS ENUM (
    'MILD', 'MODERATE', 'SEVERE', 'CONTRAINDICATED'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE sync_status_enum AS ENUM (
    'PENDING', 'SYNCED', 'FAILED', 'CONFLICT'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================================
-- TABLES
-- ============================================================================

-- Patient profiles (no login — spec-compliant)
CREATE TABLE IF NOT EXISTS patients (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  date_of_birth DATE,
  gender VARCHAR(20),
  phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  blood_group VARCHAR(10),
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(20),
  aadhaar_last4 VARCHAR(4),  -- Only last 4 digits for identification, no full Aadhaar stored
  photo_url TEXT,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(name);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone);

-- Patient allergies
CREATE TABLE IF NOT EXISTS patient_allergies (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  allergen VARCHAR(255) NOT NULL,
  severity allergy_severity_enum DEFAULT 'MODERATE',
  reaction_description TEXT,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patient_allergies_patient ON patient_allergies(patient_id);

-- Doctor profiles (for prescriptions)
CREATE TABLE IF NOT EXISTS doctors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  registration_number VARCHAR(100) UNIQUE NOT NULL,
  qualification VARCHAR(255),
  specialization VARCHAR(255),
  hospital VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(255),
  license_authority VARCHAR(255) DEFAULT 'Medical Council of India',
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_doctors_reg ON doctors(registration_number);

-- Prescriptions
CREATE TABLE IF NOT EXISTS prescriptions (
  id SERIAL PRIMARY KEY,
  prescription_number VARCHAR(50) UNIQUE NOT NULL,
  doctor_id INTEGER NOT NULL REFERENCES doctors(id),
  patient_id INTEGER NOT NULL REFERENCES patients(id),
  pharmacy_id INTEGER REFERENCES organizations(id),
  status prescription_status_enum DEFAULT 'DRAFT',
  diagnosis TEXT,
  notes TEXT,
  issued_date DATE DEFAULT CURRENT_DATE,
  valid_until DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prescriptions_number ON prescriptions(prescription_number);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor ON prescriptions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_status ON prescriptions(status);

-- Prescription line items
CREATE TABLE IF NOT EXISTS prescription_items (
  id SERIAL PRIMARY KEY,
  prescription_id INTEGER NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
  medicine_id INTEGER NOT NULL REFERENCES medicines(id),
  dosage VARCHAR(100),
  frequency VARCHAR(100),
  duration VARCHAR(100),
  quantity INTEGER DEFAULT 1,
  instructions TEXT,
  dispensed_serial_id INTEGER REFERENCES serial_numbers(id),
  dispensed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prescription_items_rx ON prescription_items(prescription_id);

-- Drug interaction matrix
CREATE TABLE IF NOT EXISTS drug_interactions (
  id SERIAL PRIMARY KEY,
  drug_a_name VARCHAR(255) NOT NULL,
  drug_b_name VARCHAR(255) NOT NULL,
  severity interaction_severity_enum NOT NULL,
  description TEXT NOT NULL,
  clinical_effect TEXT,
  management TEXT,
  source VARCHAR(255) DEFAULT 'CDSCO / Drug Database',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(drug_a_name, drug_b_name)
);

CREATE INDEX IF NOT EXISTS idx_drug_interactions_a ON drug_interactions(drug_a_name);
CREATE INDEX IF NOT EXISTS idx_drug_interactions_b ON drug_interactions(drug_b_name);

-- GST-compliant billing
CREATE TABLE IF NOT EXISTS bills (
  id SERIAL PRIMARY KEY,
  bill_number VARCHAR(50) UNIQUE NOT NULL,
  prescription_id INTEGER REFERENCES prescriptions(id),
  patient_id INTEGER NOT NULL REFERENCES patients(id),
  pharmacy_id INTEGER NOT NULL REFERENCES organizations(id),
  issued_by INTEGER REFERENCES users(id),
  status billing_status_enum DEFAULT 'DRAFT',
  payment_method payment_method_enum,
  subtotal DECIMAL(12,2) DEFAULT 0,
  cgst_rate DECIMAL(5,2) DEFAULT 5.00,
  cgst_amount DECIMAL(12,2) DEFAULT 0,
  sgst_rate DECIMAL(5,2) DEFAULT 5.00,
  sgst_amount DECIMAL(12,2) DEFAULT 0,
  igst_rate DECIMAL(5,2) DEFAULT 0,
  igst_amount DECIMAL(12,2) DEFAULT 0,
  total_tax DECIMAL(12,2) DEFAULT 0,
  discount DECIMAL(12,2) DEFAULT 0,
  grand_total DECIMAL(12,2) DEFAULT 0,
  amount_paid DECIMAL(12,2) DEFAULT 0,
  balance_due DECIMAL(12,2) DEFAULT 0,
  gstin_pharmacy VARCHAR(20),
  gstin_patient VARCHAR(20),
  digital_signature TEXT,
  notes TEXT,
  issued_at TIMESTAMP DEFAULT NOW(),
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bills_number ON bills(bill_number);
CREATE INDEX IF NOT EXISTS idx_bills_patient ON bills(patient_id);
CREATE INDEX IF NOT EXISTS idx_bills_pharmacy ON bills(pharmacy_id);
CREATE INDEX IF NOT EXISTS idx_bills_status ON bills(status);

-- Bill line items
CREATE TABLE IF NOT EXISTS bill_items (
  id SERIAL PRIMARY KEY,
  bill_id INTEGER NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  prescription_item_id INTEGER REFERENCES prescription_items(id),
  medicine_id INTEGER NOT NULL REFERENCES medicines(id),
  serial_number_id INTEGER REFERENCES serial_numbers(id),
  description VARCHAR(255),
  hsn_code VARCHAR(20),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(12,2) NOT NULL,
  discount_rate DECIMAL(5,2) DEFAULT 0,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  taxable_amount DECIMAL(12,2) NOT NULL,
  gst_rate DECIMAL(5,2) DEFAULT 12.00,
  gst_amount DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bill_items_bill ON bill_items(bill_id);

-- Audit trail (comprehensive logging)
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  organization_id INTEGER REFERENCES organizations(id),
  action audit_action_enum NOT NULL,
  entity_type VARCHAR(100),
  entity_id INTEGER,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org ON audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);

-- Multi-location warehouses
CREATE TABLE IF NOT EXISTS warehouses (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(10),
  capacity INTEGER DEFAULT 0,
  manager_name VARCHAR(255),
  contact_phone VARCHAR(20),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_warehouses_org ON warehouses(organization_id);

-- Offline sync queue
CREATE TABLE IF NOT EXISTS offline_sync_queue (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  organization_id INTEGER REFERENCES organizations(id),
  operation VARCHAR(50) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id INTEGER,
  payload JSONB NOT NULL,
  status sync_status_enum DEFAULT 'PENDING',
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  synced_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_offline_sync_status ON offline_sync_queue(status);
CREATE INDEX IF NOT EXISTS idx_offline_sync_user ON offline_sync_queue(user_id);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_patients_updated_at ON patients;
  CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN undefined_table THEN NULL; END $$;

DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_prescriptions_updated_at ON prescriptions;
  CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON prescriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN undefined_table THEN NULL; END $$;

-- Auto-generate prescription numbers
CREATE OR REPLACE FUNCTION generate_prescription_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.prescription_number IS NULL THEN
    NEW.prescription_number := 'RX-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
      LPAD(CAST(nextval('prescriptions_id_seq') AS TEXT), 5, '0');
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

DO $$ BEGIN
  DROP TRIGGER IF EXISTS trg_generate_rx_number ON prescriptions;
  CREATE TRIGGER trg_generate_rx_number BEFORE INSERT ON prescriptions
    FOR EACH ROW EXECUTE FUNCTION generate_prescription_number();
EXCEPTION WHEN undefined_table THEN NULL; END $$;

-- Auto-generate bill numbers
CREATE OR REPLACE FUNCTION generate_bill_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.bill_number IS NULL THEN
    NEW.bill_number := 'INV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
      LPAD(CAST(nextval('bills_id_seq') AS TEXT), 5, '0');
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

DO $$ BEGIN
  DROP TRIGGER IF EXISTS trg_generate_bill_number ON bills;
  CREATE TRIGGER trg_generate_bill_number BEFORE INSERT ON bills
    FOR EACH ROW EXECUTE FUNCTION generate_bill_number();
EXCEPTION WHEN undefined_table THEN NULL; END $$;

-- ============================================================================
-- VIEWS
-- ============================================================================

-- Comprehensive inventory view with all details
CREATE OR REPLACE VIEW v_full_inventory AS
SELECT
  sn.id as serial_id,
  sn.serial_number,
  sn.status as serial_status,
  sn.current_owner,
  b.id as batch_id,
  b.batch_number,
  b.manufacturing_date,
  b.expiry_date,
  b.status as batch_status,
  m.id as medicine_id,
  m.medicine_code,
  m.name as medicine_name,
  m.manufacturer_name,
  m.composition,
  m.dosage,
  o.name as organization_name,
  o.type as organization_type,
  rs_med.status as medicine_reg_status,
  rs_batch.status as batch_reg_status,
  CASE WHEN b.expiry_date < NOW() THEN TRUE ELSE FALSE END as is_expired,
  CASE
    WHEN b.expiry_date < NOW() THEN 'EXPIRED'
    WHEN b.expiry_date < NOW() + INTERVAL '30 days' THEN 'EXPIRING_SOON'
    ELSE 'VALID'
  END as expiry_status,
  w.name as warehouse_name,
  w.code as warehouse_code
FROM serial_numbers sn
JOIN batches b ON sn.batch_id = b.id
JOIN medicines m ON b.medicine_id = m.id
LEFT JOIN organizations o ON sn.current_owner = o.id
LEFT JOIN regulatory_status rs_med ON rs_med.medicine_id = m.id AND rs_med.batch_id IS NULL
LEFT JOIN regulatory_status rs_batch ON rs_batch.batch_id = b.id
LEFT JOIN warehouses w ON w.organization_id = sn.current_owner;

-- Expiry alerts view
CREATE OR REPLACE VIEW v_expiry_alerts AS
SELECT
  b.id as batch_id,
  b.batch_number,
  m.name as medicine_name,
  m.medicine_code,
  b.expiry_date,
  b.quantity,
  b.status as batch_status,
  o.name as holder_name,
  sn.current_owner,
  (b.expiry_date - CURRENT_DATE) as days_until_expiry
FROM batches b
JOIN medicines m ON b.medicine_id = m.id
LEFT JOIN serial_numbers sn ON sn.batch_id = b.id
LEFT JOIN organizations o ON sn.current_owner = o.id
WHERE b.expiry_date <= NOW() + INTERVAL '90 days'
  AND b.status NOT IN ('EXPIRED', 'BLOCKED', 'RECALLED')
  AND sn.status NOT IN ('DISPENSED', 'BLOCKED')
ORDER BY b.expiry_date ASC;

-- Sales summary view
CREATE OR REPLACE VIEW v_sales_summary AS
SELECT
  DATE(t.timestamp) as sale_date,
  m.name as medicine_name,
  m.medicine_code,
  b.batch_number,
  COUNT(*) as units_dispensed,
  SUM(bi.total_amount) as revenue,
  SUM(bi.gst_amount) as tax_collected
FROM transactions t
JOIN serial_numbers sn ON t.serial_number_id = sn.id
JOIN batches b ON t.batch_id = b.id
JOIN medicines m ON b.medicine_id = m.id
LEFT JOIN bill_items bi ON bi.serial_number_id = sn.id
LEFT JOIN bills bl ON bi.bill_id = bl.id
WHERE t.transaction_type = 'DISPENSE'
GROUP BY DATE(t.timestamp), m.name, m.medicine_code, b.batch_number
ORDER BY sale_date DESC;

-- Dashboard stats view
CREATE OR REPLACE VIEW v_dashboard_stats AS
SELECT
  (SELECT COUNT(*) FROM medicines) as total_medicines,
  (SELECT COUNT(*) FROM batches WHERE status = 'ACTIVE') as active_batches,
  (SELECT COUNT(*) FROM serial_numbers WHERE status = 'IN_STOCK') as in_stock,
  (SELECT COUNT(*) FROM serial_numbers WHERE status = 'IN_TRANSIT') as in_transit,
  (SELECT COUNT(*) FROM serial_numbers WHERE status = 'DISPENSED') as dispensed,
  (SELECT COUNT(*) FROM alerts WHERE status = 'OPEN') as open_alerts,
  (SELECT COUNT(*) FROM patients) as total_patients,
  (SELECT COUNT(*) FROM prescriptions WHERE status IN ('APPROVED', 'PENDING_APPROVAL')) as pending_prescriptions,
  (SELECT COUNT(*) FROM bills WHERE status = 'ISSUED') as pending_bills,
  (SELECT COALESCE(SUM(grand_total), 0) FROM bills WHERE status = 'PAID' AND paid_at >= DATE_TRUNC('month', NOW())) as monthly_revenue;
