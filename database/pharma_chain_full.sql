--
-- PostgreSQL database dump
--

\restrict QOv0QPSh3c4c3jUw4Ytd2F4O7DzrRAN6re0tE6cBHqDpNh9Tf2uLYZOpApPa0aA

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: pharma_admin
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO pharma_admin;

--
-- Name: alert_severity_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.alert_severity_enum AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'CRITICAL'
);


ALTER TYPE public.alert_severity_enum OWNER TO postgres;

--
-- Name: alert_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.alert_status_enum AS ENUM (
    'OPEN',
    'ACKNOWLEDGED',
    'RESOLVED'
);


ALTER TYPE public.alert_status_enum OWNER TO postgres;

--
-- Name: alert_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.alert_type_enum AS ENUM (
    'EXPIRY',
    'REGULATORY_BLOCK',
    'COUNTERFEIT',
    'SUPPLY_CHAIN_MISMATCH',
    'DUPLICATE_SERIAL',
    'RECALL'
);


ALTER TYPE public.alert_type_enum OWNER TO postgres;

--
-- Name: allergy_severity_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.allergy_severity_enum AS ENUM (
    'MILD',
    'MODERATE',
    'SEVERE',
    'LIFE_THREATENING'
);


ALTER TYPE public.allergy_severity_enum OWNER TO postgres;

--
-- Name: audit_action_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.audit_action_enum AS ENUM (
    'CREATE',
    'UPDATE',
    'DELETE',
    'LOGIN',
    'LOGOUT',
    'RECEIVE',
    'TRANSFER',
    'DISPENSE',
    'REGULATORY_CHANGE',
    'BLOCK',
    'RECALL',
    'EXPORT',
    'PRINT',
    'SYNC'
);


ALTER TYPE public.audit_action_enum OWNER TO postgres;

--
-- Name: batch_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.batch_status_enum AS ENUM (
    'ACTIVE',
    'BLOCKED',
    'EXPIRED',
    'RECALLED'
);


ALTER TYPE public.batch_status_enum OWNER TO postgres;

--
-- Name: billing_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.billing_status_enum AS ENUM (
    'DRAFT',
    'ISSUED',
    'PAID',
    'PARTIALLY_PAID',
    'VOID',
    'REFUNDED'
);


ALTER TYPE public.billing_status_enum OWNER TO postgres;

--
-- Name: interaction_severity_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.interaction_severity_enum AS ENUM (
    'MILD',
    'MODERATE',
    'SEVERE',
    'CONTRAINDICATED'
);


ALTER TYPE public.interaction_severity_enum OWNER TO postgres;

--
-- Name: org_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.org_status_enum AS ENUM (
    'ACTIVE',
    'SUSPENDED',
    'REVOKED'
);


ALTER TYPE public.org_status_enum OWNER TO postgres;

--
-- Name: org_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.org_type_enum AS ENUM (
    'DISTRIBUTOR',
    'PHARMACY',
    'REGULATOR'
);


ALTER TYPE public.org_type_enum OWNER TO postgres;

--
-- Name: payment_method_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.payment_method_enum AS ENUM (
    'CASH',
    'CARD',
    'UPI',
    'NET_BANKING',
    'INSURANCE',
    'CREDIT'
);


ALTER TYPE public.payment_method_enum OWNER TO postgres;

--
-- Name: prescription_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.prescription_status_enum AS ENUM (
    'DRAFT',
    'PENDING_APPROVAL',
    'APPROVED',
    'DISPENSED',
    'PARTIALLY_DISPENSED',
    'CANCELLED',
    'EXPIRED'
);


ALTER TYPE public.prescription_status_enum OWNER TO postgres;

--
-- Name: reg_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.reg_status_enum AS ENUM (
    'PERMITTED',
    'PROHIBITED',
    'RESTRICTED',
    'RECALLED',
    'UNKNOWN'
);


ALTER TYPE public.reg_status_enum OWNER TO postgres;

--
-- Name: serial_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.serial_status_enum AS ENUM (
    'IN_TRANSIT',
    'IN_STOCK',
    'DISPENSED',
    'BLOCKED',
    'FLAGGED_SUSPICIOUS'
);


ALTER TYPE public.serial_status_enum OWNER TO postgres;

--
-- Name: sync_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.sync_status_enum AS ENUM (
    'PENDING',
    'SYNCED',
    'FAILED',
    'CONFLICT'
);


ALTER TYPE public.sync_status_enum OWNER TO postgres;

--
-- Name: txn_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.txn_type_enum AS ENUM (
    'RECEIVE',
    'TRANSFER',
    'BLOCK',
    'UNBLOCK',
    'DISPENSE'
);


ALTER TYPE public.txn_type_enum OWNER TO postgres;

--
-- Name: user_role_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_role_enum AS ENUM (
    'ADMIN',
    'DISTRIBUTOR_STAFF',
    'PHARMACY_STAFF'
);


ALTER TYPE public.user_role_enum OWNER TO postgres;

--
-- Name: generate_bill_number(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.generate_bill_number() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF NEW.bill_number IS NULL THEN
    NEW.bill_number := 'INV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
      LPAD(CAST(nextval('bills_id_seq') AS TEXT), 5, '0');
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.generate_bill_number() OWNER TO postgres;

--
-- Name: generate_prescription_number(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.generate_prescription_number() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF NEW.prescription_number IS NULL THEN
    NEW.prescription_number := 'RX-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
      LPAD(CAST(nextval('prescriptions_id_seq') AS TEXT), 5, '0');
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.generate_prescription_number() OWNER TO postgres;

--
-- Name: touch_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.touch_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.touch_updated_at() OWNER TO postgres;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: alerts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.alerts (
    id integer NOT NULL,
    type public.alert_type_enum NOT NULL,
    medicine_id integer,
    batch_id integer,
    message text NOT NULL,
    severity public.alert_severity_enum DEFAULT 'MEDIUM'::public.alert_severity_enum NOT NULL,
    status public.alert_status_enum DEFAULT 'OPEN'::public.alert_status_enum NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.alerts OWNER TO postgres;

--
-- Name: alerts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.alerts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.alerts_id_seq OWNER TO postgres;

--
-- Name: alerts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.alerts_id_seq OWNED BY public.alerts.id;


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id integer NOT NULL,
    user_id integer,
    organization_id integer,
    action public.audit_action_enum NOT NULL,
    entity_type character varying(100),
    entity_id integer,
    details jsonb,
    ip_address inet,
    user_agent text,
    "timestamp" timestamp without time zone DEFAULT now()
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.audit_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.audit_logs_id_seq OWNER TO postgres;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- Name: batches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.batches (
    id integer NOT NULL,
    batch_number character varying(50) NOT NULL,
    medicine_id integer NOT NULL,
    manufacturing_date date NOT NULL,
    expiry_date date NOT NULL,
    quantity integer NOT NULL,
    status public.batch_status_enum DEFAULT 'ACTIVE'::public.batch_status_enum NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT batches_quantity_check CHECK ((quantity >= 0)),
    CONSTRAINT chk_batch_dates CHECK ((expiry_date > manufacturing_date))
);


ALTER TABLE public.batches OWNER TO postgres;

--
-- Name: batches_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.batches_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.batches_id_seq OWNER TO postgres;

--
-- Name: batches_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.batches_id_seq OWNED BY public.batches.id;


--
-- Name: bill_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bill_items (
    id integer NOT NULL,
    bill_id integer NOT NULL,
    prescription_item_id integer,
    medicine_id integer NOT NULL,
    serial_number_id integer,
    description character varying(255),
    hsn_code character varying(20),
    quantity integer DEFAULT 1 NOT NULL,
    unit_price numeric(12,2) NOT NULL,
    discount_rate numeric(5,2) DEFAULT 0,
    discount_amount numeric(12,2) DEFAULT 0,
    taxable_amount numeric(12,2) NOT NULL,
    gst_rate numeric(5,2) DEFAULT 12.00,
    gst_amount numeric(12,2) DEFAULT 0,
    total_amount numeric(12,2) NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.bill_items OWNER TO postgres;

--
-- Name: bill_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bill_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bill_items_id_seq OWNER TO postgres;

--
-- Name: bill_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bill_items_id_seq OWNED BY public.bill_items.id;


--
-- Name: bills; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bills (
    id integer NOT NULL,
    bill_number character varying(50) NOT NULL,
    prescription_id integer,
    patient_id integer NOT NULL,
    pharmacy_id integer NOT NULL,
    issued_by integer,
    status public.billing_status_enum DEFAULT 'DRAFT'::public.billing_status_enum,
    payment_method public.payment_method_enum,
    subtotal numeric(12,2) DEFAULT 0,
    cgst_rate numeric(5,2) DEFAULT 5.00,
    cgst_amount numeric(12,2) DEFAULT 0,
    sgst_rate numeric(5,2) DEFAULT 5.00,
    sgst_amount numeric(12,2) DEFAULT 0,
    igst_rate numeric(5,2) DEFAULT 0,
    igst_amount numeric(12,2) DEFAULT 0,
    total_tax numeric(12,2) DEFAULT 0,
    discount numeric(12,2) DEFAULT 0,
    grand_total numeric(12,2) DEFAULT 0,
    amount_paid numeric(12,2) DEFAULT 0,
    balance_due numeric(12,2) DEFAULT 0,
    gstin_pharmacy character varying(20),
    gstin_patient character varying(20),
    digital_signature text,
    notes text,
    issued_at timestamp without time zone DEFAULT now(),
    paid_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.bills OWNER TO postgres;

--
-- Name: bills_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bills_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bills_id_seq OWNER TO postgres;

--
-- Name: bills_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bills_id_seq OWNED BY public.bills.id;


--
-- Name: dispensing; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dispensing (
    id integer NOT NULL,
    serial_number_id integer NOT NULL,
    batch_id integer NOT NULL,
    pharmacy_id integer NOT NULL,
    patient_reference character varying(100),
    dispensed_by_user integer,
    "timestamp" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.dispensing OWNER TO postgres;

--
-- Name: dispensing_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.dispensing_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.dispensing_id_seq OWNER TO postgres;

--
-- Name: dispensing_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.dispensing_id_seq OWNED BY public.dispensing.id;


--
-- Name: doctors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.doctors (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    registration_number character varying(100) NOT NULL,
    qualification character varying(255),
    specialization character varying(255),
    hospital character varying(255),
    phone character varying(20),
    email character varying(255),
    license_authority character varying(255) DEFAULT 'Medical Council of India'::character varying,
    is_verified boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.doctors OWNER TO postgres;

--
-- Name: doctors_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.doctors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.doctors_id_seq OWNER TO postgres;

--
-- Name: doctors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.doctors_id_seq OWNED BY public.doctors.id;


--
-- Name: drug_interactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.drug_interactions (
    id integer NOT NULL,
    drug_a_name character varying(255) NOT NULL,
    drug_b_name character varying(255) NOT NULL,
    severity public.interaction_severity_enum NOT NULL,
    description text NOT NULL,
    clinical_effect text,
    management text,
    source character varying(255) DEFAULT 'CDSCO / Drug Database'::character varying,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.drug_interactions OWNER TO postgres;

--
-- Name: drug_interactions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.drug_interactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.drug_interactions_id_seq OWNER TO postgres;

--
-- Name: drug_interactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.drug_interactions_id_seq OWNED BY public.drug_interactions.id;


--
-- Name: inventory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventory (
    id integer NOT NULL,
    organization_id integer NOT NULL,
    batch_id integer NOT NULL,
    quantity integer DEFAULT 0 NOT NULL,
    status public.batch_status_enum DEFAULT 'ACTIVE'::public.batch_status_enum NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT inventory_quantity_check CHECK ((quantity >= 0))
);


ALTER TABLE public.inventory OWNER TO postgres;

--
-- Name: inventory_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.inventory_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.inventory_id_seq OWNER TO postgres;

--
-- Name: inventory_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.inventory_id_seq OWNED BY public.inventory.id;


--
-- Name: medicines; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.medicines (
    id integer NOT NULL,
    medicine_code character varying(50) NOT NULL,
    name character varying(200) NOT NULL,
    manufacturer_name character varying(200) NOT NULL,
    composition text,
    dosage character varying(100),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.medicines OWNER TO postgres;

--
-- Name: medicines_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.medicines_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.medicines_id_seq OWNER TO postgres;

--
-- Name: medicines_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.medicines_id_seq OWNED BY public.medicines.id;


--
-- Name: offline_sync_queue; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.offline_sync_queue (
    id integer NOT NULL,
    user_id integer,
    organization_id integer,
    operation character varying(50) NOT NULL,
    entity_type character varying(100) NOT NULL,
    entity_id integer,
    payload jsonb NOT NULL,
    status public.sync_status_enum DEFAULT 'PENDING'::public.sync_status_enum,
    retry_count integer DEFAULT 0,
    max_retries integer DEFAULT 3,
    error_message text,
    created_at timestamp without time zone DEFAULT now(),
    synced_at timestamp without time zone
);


ALTER TABLE public.offline_sync_queue OWNER TO postgres;

--
-- Name: offline_sync_queue_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.offline_sync_queue_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.offline_sync_queue_id_seq OWNER TO postgres;

--
-- Name: offline_sync_queue_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.offline_sync_queue_id_seq OWNED BY public.offline_sync_queue.id;


--
-- Name: organizations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.organizations (
    id integer NOT NULL,
    name character varying(200) NOT NULL,
    type public.org_type_enum NOT NULL,
    license_number character varying(100),
    address text,
    status public.org_status_enum DEFAULT 'ACTIVE'::public.org_status_enum NOT NULL,
    blockchain_address character varying(100),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.organizations OWNER TO postgres;

--
-- Name: organizations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.organizations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.organizations_id_seq OWNER TO postgres;

--
-- Name: organizations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.organizations_id_seq OWNED BY public.organizations.id;


--
-- Name: patient_allergies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.patient_allergies (
    id integer NOT NULL,
    patient_id integer NOT NULL,
    allergen character varying(255) NOT NULL,
    severity public.allergy_severity_enum DEFAULT 'MODERATE'::public.allergy_severity_enum,
    reaction_description text,
    verified boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.patient_allergies OWNER TO postgres;

--
-- Name: patient_allergies_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.patient_allergies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.patient_allergies_id_seq OWNER TO postgres;

--
-- Name: patient_allergies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.patient_allergies_id_seq OWNED BY public.patient_allergies.id;


--
-- Name: patients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.patients (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    date_of_birth date,
    gender character varying(20),
    phone character varying(20),
    email character varying(255),
    address text,
    blood_group character varying(10),
    emergency_contact_name character varying(255),
    emergency_contact_phone character varying(20),
    aadhaar_last4 character varying(4),
    photo_url text,
    notes text,
    status character varying(20) DEFAULT 'ACTIVE'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.patients OWNER TO postgres;

--
-- Name: patients_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.patients_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.patients_id_seq OWNER TO postgres;

--
-- Name: patients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.patients_id_seq OWNED BY public.patients.id;


--
-- Name: prescription_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.prescription_items (
    id integer NOT NULL,
    prescription_id integer NOT NULL,
    medicine_id integer NOT NULL,
    dosage character varying(100),
    frequency character varying(100),
    duration character varying(100),
    quantity integer DEFAULT 1,
    instructions text,
    dispensed_serial_id integer,
    dispensed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.prescription_items OWNER TO postgres;

--
-- Name: prescription_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.prescription_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.prescription_items_id_seq OWNER TO postgres;

--
-- Name: prescription_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.prescription_items_id_seq OWNED BY public.prescription_items.id;


--
-- Name: prescriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.prescriptions (
    id integer NOT NULL,
    prescription_number character varying(50) NOT NULL,
    doctor_id integer NOT NULL,
    patient_id integer NOT NULL,
    pharmacy_id integer,
    status public.prescription_status_enum DEFAULT 'DRAFT'::public.prescription_status_enum,
    diagnosis text,
    notes text,
    issued_date date DEFAULT CURRENT_DATE,
    valid_until date,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.prescriptions OWNER TO postgres;

--
-- Name: prescriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.prescriptions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.prescriptions_id_seq OWNER TO postgres;

--
-- Name: prescriptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.prescriptions_id_seq OWNED BY public.prescriptions.id;


--
-- Name: regulatory_status; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.regulatory_status (
    id integer NOT NULL,
    medicine_id integer NOT NULL,
    batch_id integer,
    status public.reg_status_enum DEFAULT 'UNKNOWN'::public.reg_status_enum NOT NULL,
    authority character varying(150) NOT NULL,
    reference_number character varying(100),
    effective_date date NOT NULL,
    reason text,
    source text,
    is_simulated boolean DEFAULT true NOT NULL,
    last_updated timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.regulatory_status OWNER TO postgres;

--
-- Name: regulatory_status_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.regulatory_status_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.regulatory_status_id_seq OWNER TO postgres;

--
-- Name: regulatory_status_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.regulatory_status_id_seq OWNED BY public.regulatory_status.id;


--
-- Name: serial_numbers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.serial_numbers (
    id integer NOT NULL,
    serial_number character varying(50) NOT NULL,
    batch_id integer NOT NULL,
    status public.serial_status_enum DEFAULT 'IN_TRANSIT'::public.serial_status_enum NOT NULL,
    current_owner integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.serial_numbers OWNER TO postgres;

--
-- Name: serial_numbers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.serial_numbers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.serial_numbers_id_seq OWNER TO postgres;

--
-- Name: serial_numbers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.serial_numbers_id_seq OWNED BY public.serial_numbers.id;


--
-- Name: transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transactions (
    id integer NOT NULL,
    batch_id integer NOT NULL,
    serial_number_id integer,
    from_organization_id integer,
    to_organization_id integer,
    quantity integer DEFAULT 1 NOT NULL,
    transaction_type public.txn_type_enum NOT NULL,
    blockchain_transaction_hash character varying(100),
    "timestamp" timestamp with time zone DEFAULT now() NOT NULL,
    blockchain_status character varying(20) DEFAULT 'PENDING'::character varying,
    blockchain_tx_hash character varying(66) DEFAULT NULL::character varying,
    CONSTRAINT transactions_quantity_check CHECK ((quantity > 0))
);


ALTER TABLE public.transactions OWNER TO postgres;

--
-- Name: COLUMN transactions.blockchain_status; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.transactions.blockchain_status IS 'PENDING=not yet submitted, CONFIRMED=on-chain success, FAILED=blockchain error (retry candidate)';


--
-- Name: COLUMN transactions.blockchain_tx_hash; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.transactions.blockchain_tx_hash IS 'Ethereum transaction hash from PharmaSupplyChain smart contract event';


--
-- Name: transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.transactions_id_seq OWNER TO postgres;

--
-- Name: transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.transactions_id_seq OWNED BY public.transactions.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(150) NOT NULL,
    email character varying(150) NOT NULL,
    password_hash character varying(255) NOT NULL,
    role public.user_role_enum NOT NULL,
    organization_id integer,
    status public.org_status_enum DEFAULT 'ACTIVE'::public.org_status_enum NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_user_org_role CHECK (((role = 'ADMIN'::public.user_role_enum) OR (organization_id IS NOT NULL)))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: v_dashboard_stats; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_dashboard_stats AS
 SELECT ( SELECT count(*) AS count
           FROM public.medicines) AS total_medicines,
    ( SELECT count(*) AS count
           FROM public.batches
          WHERE (batches.status = 'ACTIVE'::public.batch_status_enum)) AS active_batches,
    ( SELECT count(*) AS count
           FROM public.serial_numbers
          WHERE (serial_numbers.status = 'IN_STOCK'::public.serial_status_enum)) AS in_stock,
    ( SELECT count(*) AS count
           FROM public.serial_numbers
          WHERE (serial_numbers.status = 'IN_TRANSIT'::public.serial_status_enum)) AS in_transit,
    ( SELECT count(*) AS count
           FROM public.serial_numbers
          WHERE (serial_numbers.status = 'DISPENSED'::public.serial_status_enum)) AS dispensed,
    ( SELECT count(*) AS count
           FROM public.alerts
          WHERE (alerts.status = 'OPEN'::public.alert_status_enum)) AS open_alerts,
    ( SELECT count(*) AS count
           FROM public.patients) AS total_patients,
    ( SELECT count(*) AS count
           FROM public.prescriptions
          WHERE (prescriptions.status = ANY (ARRAY['APPROVED'::public.prescription_status_enum, 'PENDING_APPROVAL'::public.prescription_status_enum]))) AS pending_prescriptions,
    ( SELECT count(*) AS count
           FROM public.bills
          WHERE (bills.status = 'ISSUED'::public.billing_status_enum)) AS pending_bills,
    ( SELECT COALESCE(sum(bills.grand_total), (0)::numeric) AS "coalesce"
           FROM public.bills
          WHERE ((bills.status = 'PAID'::public.billing_status_enum) AND (bills.paid_at >= date_trunc('month'::text, now())))) AS monthly_revenue;


ALTER VIEW public.v_dashboard_stats OWNER TO postgres;

--
-- Name: v_expiry_alerts; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_expiry_alerts AS
 SELECT b.id AS batch_id,
    b.batch_number,
    m.name AS medicine_name,
    m.medicine_code,
    b.expiry_date,
    b.quantity,
    b.status AS batch_status,
    o.name AS holder_name,
    sn.current_owner,
    (b.expiry_date - CURRENT_DATE) AS days_until_expiry
   FROM (((public.batches b
     JOIN public.medicines m ON ((b.medicine_id = m.id)))
     LEFT JOIN public.serial_numbers sn ON ((sn.batch_id = b.id)))
     LEFT JOIN public.organizations o ON ((sn.current_owner = o.id)))
  WHERE ((b.expiry_date <= (now() + '90 days'::interval)) AND (b.status <> ALL (ARRAY['EXPIRED'::public.batch_status_enum, 'BLOCKED'::public.batch_status_enum, 'RECALLED'::public.batch_status_enum])) AND (sn.status <> ALL (ARRAY['DISPENSED'::public.serial_status_enum, 'BLOCKED'::public.serial_status_enum])))
  ORDER BY b.expiry_date;


ALTER VIEW public.v_expiry_alerts OWNER TO postgres;

--
-- Name: warehouses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.warehouses (
    id integer NOT NULL,
    organization_id integer NOT NULL,
    name character varying(255) NOT NULL,
    code character varying(50) NOT NULL,
    address text,
    city character varying(100),
    state character varying(100),
    pincode character varying(10),
    capacity integer DEFAULT 0,
    manager_name character varying(255),
    contact_phone character varying(20),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.warehouses OWNER TO postgres;

--
-- Name: v_full_inventory; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_full_inventory AS
 SELECT sn.id AS serial_id,
    sn.serial_number,
    sn.status AS serial_status,
    sn.current_owner,
    b.id AS batch_id,
    b.batch_number,
    b.manufacturing_date,
    b.expiry_date,
    b.status AS batch_status,
    m.id AS medicine_id,
    m.medicine_code,
    m.name AS medicine_name,
    m.manufacturer_name,
    m.composition,
    m.dosage,
    o.name AS organization_name,
    o.type AS organization_type,
    rs_med.status AS medicine_reg_status,
    rs_batch.status AS batch_reg_status,
        CASE
            WHEN (b.expiry_date < now()) THEN true
            ELSE false
        END AS is_expired,
        CASE
            WHEN (b.expiry_date < now()) THEN 'EXPIRED'::text
            WHEN (b.expiry_date < (now() + '30 days'::interval)) THEN 'EXPIRING_SOON'::text
            ELSE 'VALID'::text
        END AS expiry_status,
    w.name AS warehouse_name,
    w.code AS warehouse_code
   FROM ((((((public.serial_numbers sn
     JOIN public.batches b ON ((sn.batch_id = b.id)))
     JOIN public.medicines m ON ((b.medicine_id = m.id)))
     LEFT JOIN public.organizations o ON ((sn.current_owner = o.id)))
     LEFT JOIN public.regulatory_status rs_med ON (((rs_med.medicine_id = m.id) AND (rs_med.batch_id IS NULL))))
     LEFT JOIN public.regulatory_status rs_batch ON ((rs_batch.batch_id = b.id)))
     LEFT JOIN public.warehouses w ON ((w.organization_id = sn.current_owner)));


ALTER VIEW public.v_full_inventory OWNER TO postgres;

--
-- Name: v_sales_summary; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_sales_summary AS
 SELECT date(t."timestamp") AS sale_date,
    m.name AS medicine_name,
    m.medicine_code,
    b.batch_number,
    count(*) AS units_dispensed,
    sum(bi.total_amount) AS revenue,
    sum(bi.gst_amount) AS tax_collected
   FROM (((((public.transactions t
     JOIN public.serial_numbers sn ON ((t.serial_number_id = sn.id)))
     JOIN public.batches b ON ((t.batch_id = b.id)))
     JOIN public.medicines m ON ((b.medicine_id = m.id)))
     LEFT JOIN public.bill_items bi ON ((bi.serial_number_id = sn.id)))
     LEFT JOIN public.bills bl ON ((bi.bill_id = bl.id)))
  WHERE (t.transaction_type = 'DISPENSE'::public.txn_type_enum)
  GROUP BY (date(t."timestamp")), m.name, m.medicine_code, b.batch_number
  ORDER BY (date(t."timestamp")) DESC;


ALTER VIEW public.v_sales_summary OWNER TO postgres;

--
-- Name: warehouses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.warehouses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.warehouses_id_seq OWNER TO postgres;

--
-- Name: warehouses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.warehouses_id_seq OWNED BY public.warehouses.id;


--
-- Name: alerts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alerts ALTER COLUMN id SET DEFAULT nextval('public.alerts_id_seq'::regclass);


--
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- Name: batches id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.batches ALTER COLUMN id SET DEFAULT nextval('public.batches_id_seq'::regclass);


--
-- Name: bill_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bill_items ALTER COLUMN id SET DEFAULT nextval('public.bill_items_id_seq'::regclass);


--
-- Name: bills id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bills ALTER COLUMN id SET DEFAULT nextval('public.bills_id_seq'::regclass);


--
-- Name: dispensing id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dispensing ALTER COLUMN id SET DEFAULT nextval('public.dispensing_id_seq'::regclass);


--
-- Name: doctors id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors ALTER COLUMN id SET DEFAULT nextval('public.doctors_id_seq'::regclass);


--
-- Name: drug_interactions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drug_interactions ALTER COLUMN id SET DEFAULT nextval('public.drug_interactions_id_seq'::regclass);


--
-- Name: inventory id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory ALTER COLUMN id SET DEFAULT nextval('public.inventory_id_seq'::regclass);


--
-- Name: medicines id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medicines ALTER COLUMN id SET DEFAULT nextval('public.medicines_id_seq'::regclass);


--
-- Name: offline_sync_queue id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.offline_sync_queue ALTER COLUMN id SET DEFAULT nextval('public.offline_sync_queue_id_seq'::regclass);


--
-- Name: organizations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizations ALTER COLUMN id SET DEFAULT nextval('public.organizations_id_seq'::regclass);


--
-- Name: patient_allergies id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_allergies ALTER COLUMN id SET DEFAULT nextval('public.patient_allergies_id_seq'::regclass);


--
-- Name: patients id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients ALTER COLUMN id SET DEFAULT nextval('public.patients_id_seq'::regclass);


--
-- Name: prescription_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescription_items ALTER COLUMN id SET DEFAULT nextval('public.prescription_items_id_seq'::regclass);


--
-- Name: prescriptions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescriptions ALTER COLUMN id SET DEFAULT nextval('public.prescriptions_id_seq'::regclass);


--
-- Name: regulatory_status id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.regulatory_status ALTER COLUMN id SET DEFAULT nextval('public.regulatory_status_id_seq'::regclass);


--
-- Name: serial_numbers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.serial_numbers ALTER COLUMN id SET DEFAULT nextval('public.serial_numbers_id_seq'::regclass);


--
-- Name: transactions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions ALTER COLUMN id SET DEFAULT nextval('public.transactions_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: warehouses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouses ALTER COLUMN id SET DEFAULT nextval('public.warehouses_id_seq'::regclass);


--
-- Data for Name: alerts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.alerts (id, type, medicine_id, batch_id, message, severity, status, created_at) FROM stdin;
1	REGULATORY_BLOCK	2	3	CDSCO ALERT: Amoxicillin & Potassium Clavulanate Tablets IP 625 (MED002) declared PROHIBITED vide Gazette Notification S.O. 3285(E) dated 02.08.2024. The FDC lacks therapeutic justification under Section 26A of the D&C Act, 1940. All inventory at MediCore Distributors Pvt Ltd has been BLOCKED. Immediate quarantine and recall action required. Ref: CDSCO Drug Alert August 2024.	CRITICAL	OPEN	2026-08-30 12:47:11.973438+05:30
2	RECALL	3	4	CDSCO RECALL: Batch B-MED003-01 of Dextromethorphan Hydrobromide Syrup IP declared Not of Standard Quality (NSQ) by CDL, Kolkata vide Drug Alert File No. IMP-12018/19/2025. Active ingredient content below specified limits. Mandatory recall under Section 26A of the D&C Act, 1940. All supply chain actors must cease distribution of this batch. Ref: CDSCO NSQ Alert July 2025.	HIGH	OPEN	2026-08-30 12:47:11.973438+05:30
3	REGULATORY_BLOCK	4	\N	CDSCO PROHIBITION: Acetyl Salicylic acid + Ethoheptazine prohibited vide S.O. 3068(E) dated 11.06.2026. FDC lacks therapeutic justification. Prohibited under Section 26A of the Drugs and Cosmetics Act, 1940. All manufacture, sale, and distribution prohibited with immediate effect.	CRITICAL	OPEN	2026-08-30 12:47:54.389411+05:30
4	REGULATORY_BLOCK	5	\N	CDSCO PROHIBITION: Aloe Extract + Allantoin + Alphatocopherol Acetate + D-Penthenol + Vitamin A prohibited vide S.O. 3069(E) dated 11.06.2026. Dermal preparation lacks therapeutic justification. Prohibited under Section 26A of the D&C Act, 1940. All manufacture, sale, and distribution prohibited with immediate effect.	CRITICAL	OPEN	2026-08-30 12:47:54.389411+05:30
5	REGULATORY_BLOCK	6	\N	CDSCO PROHIBITION: Aloe Extract + Vitamin E + Dimethicone + Glycerine prohibited vide S.O. 3070(E) dated 11.06.2026. Dermal preparation lacks therapeutic justification. Prohibited under Section 26A of the D&C Act, 1940. All manufacture, sale, and distribution prohibited with immediate effect.	CRITICAL	OPEN	2026-08-30 12:47:54.389411+05:30
6	REGULATORY_BLOCK	7	\N	CDSCO PROHIBITION: Aloe Vera + Jojoba Oil + Vitamin E prohibited vide S.O. 3071(E) dated 11.06.2026. Dermal preparation lacks therapeutic justification. Prohibited under Section 26A of the D&C Act, 1940. All manufacture, sale, and distribution prohibited with immediate effect.	CRITICAL	OPEN	2026-08-30 12:47:54.389411+05:30
7	REGULATORY_BLOCK	8	\N	CDSCO PROHIBITION: Aloe vera + Orange oil prohibited vide S.O. 3072(E) dated 11.06.2026. Dermal preparation lacks therapeutic justification. Prohibited under Section 26A of the D&C Act, 1940. All manufacture, sale, and distribution prohibited with immediate effect.	CRITICAL	OPEN	2026-08-30 12:47:54.389411+05:30
8	REGULATORY_BLOCK	9	\N	CDSCO PROHIBITION: Aloe vera + Jojoba oil + Wheat germ oil + Tea tree oil prohibited vide S.O. 3073(E) dated 11.06.2026. Dermal preparation lacks therapeutic justification. Prohibited under Section 26A of the D&C Act, 1940. All manufacture, sale, and distribution prohibited with immediate effect.	CRITICAL	OPEN	2026-08-30 12:47:54.389411+05:30
9	REGULATORY_BLOCK	10	\N	CDSCO PROHIBITION: Aloe vera + Vitamin E + Herbal prohibited vide S.O. 3074(E) dated 11.06.2026. Dermal preparation lacks therapeutic justification. Prohibited under Section 26A of the D&C Act, 1940. All manufacture, sale, and distribution prohibited with immediate effect.	CRITICAL	OPEN	2026-08-30 12:47:54.389411+05:30
10	REGULATORY_BLOCK	11	\N	CDSCO PROHIBITION: Dicyclomine + Paracetamol + Clidinium Bromide prohibited vide S.O. 3075(E) dated 11.06.2026. FDC lacks therapeutic justification. Prohibited under Section 26A of the D&C Act, 1940. All manufacture, sale, and distribution prohibited with immediate effect.	CRITICAL	OPEN	2026-08-30 12:47:54.389411+05:30
11	REGULATORY_BLOCK	12	\N	CDSCO PROHIBITION: Dicyclomine + Paracetamol + Clidinium Bromide + Chlordiazepoxide prohibited vide S.O. 3076(E) dated 11.06.2026. FDC lacks therapeutic justification. Prohibited under Section 26A of the D&C Act, 1940. All manufacture, sale, and distribution prohibited with immediate effect.	CRITICAL	OPEN	2026-08-30 12:47:54.389411+05:30
12	REGULATORY_BLOCK	13	\N	CDSCO PROHIBITION: Gliclazide + Chromium Picolinate prohibited vide S.O. 3077(E) dated 11.06.2026. FDC lacks therapeutic justification. Prohibited under Section 26A of the D&C Act, 1940. All manufacture, sale, and distribution prohibited with immediate effect.	CRITICAL	OPEN	2026-08-30 12:47:54.389411+05:30
13	REGULATORY_BLOCK	14	\N	CDSCO PROHIBITION: Paracetamol + Lignocaine prohibited vide S.O. 3078(E) dated 11.06.2026. FDC lacks therapeutic justification. Prohibited under Section 26A of the D&C Act, 1940. All manufacture, sale, and distribution prohibited with immediate effect.	CRITICAL	OPEN	2026-08-30 12:47:54.389411+05:30
14	REGULATORY_BLOCK	15	\N	CDSCO PROHIBITION: Amoxicillin + Serratiopeptidase + Lactobacillus Sporogenes prohibited vide S.O. 3079(E) dated 11.06.2026. FDC lacks therapeutic justification. Prohibited under Section 26A of the D&C Act, 1940. All manufacture, sale, and distribution prohibited with immediate effect.	CRITICAL	OPEN	2026-08-30 12:47:54.389411+05:30
15	REGULATORY_BLOCK	16	\N	CDSCO PROHIBITION: Amoxicillin + Cloxacillin + Lactic acid bacillus + Serratiopeptidase prohibited vide S.O. 3080(E) dated 11.06.2026. FDC lacks therapeutic justification. Prohibited under Section 26A of the D&C Act, 1940. All manufacture, sale, and distribution prohibited with immediate effect.	CRITICAL	OPEN	2026-08-30 12:47:54.389411+05:30
16	REGULATORY_BLOCK	17	\N	CDSCO PROHIBITION: Amoxicillin + Serratiopeptidase prohibited vide S.O. 3081(E) dated 11.06.2026. FDC lacks therapeutic justification. Prohibited under Section 26A of the D&C Act, 1940. All manufacture, sale, and distribution prohibited with immediate effect.	CRITICAL	OPEN	2026-08-30 12:47:54.389411+05:30
17	REGULATORY_BLOCK	18	\N	CDSCO PROHIBITION: Cefadroxyl + Probenecid prohibited vide S.O. 3082(E) dated 11.06.2026. FDC lacks therapeutic justification. Prohibited under Section 26A of the D&C Act, 1940. All manufacture, sale, and distribution prohibited with immediate effect.	CRITICAL	OPEN	2026-08-30 12:47:54.389411+05:30
18	REGULATORY_BLOCK	19	\N	CDSCO PROHIBITION: Cefuroxime + Serratiopeptidase prohibited vide S.O. 3083(E) dated 11.06.2026. FDC lacks therapeutic justification. Prohibited under Section 26A of the D&C Act, 1940. All manufacture, sale, and distribution prohibited with immediate effect.	CRITICAL	OPEN	2026-08-30 12:47:54.389411+05:30
19	REGULATORY_BLOCK	20	\N	CDSCO PROHIBITION: Amoxicillin + Potassium Clavulanate (500mg:125mg) prohibited vide S.O. 3285(E) to S.O. 3440(E) dated 02.08.2024. FDC lacks therapeutic justification. Prohibited under Section 26A of the D&C Act, 1940. All manufacture, sale, and distribution prohibited with immediate effect.	CRITICAL	OPEN	2026-08-30 12:47:54.389411+05:30
20	REGULATORY_BLOCK	21	\N	CDSCO PROHIBITION: Cetirizine + Phenylephrine prohibited vide S.O. 3285(E) to S.O. 3440(E) dated 02.08.2024. FDC lacks therapeutic justification. Prohibited under Section 26A of the D&C Act, 1940. All manufacture, sale, and distribution prohibited with immediate effect.	CRITICAL	OPEN	2026-08-30 12:47:54.389411+05:30
21	REGULATORY_BLOCK	22	\N	CDSCO PROHIBITION: Levocetirizine + Phenylephrine + Paracetamol prohibited vide S.O. 3285(E) to S.O. 3440(E) dated 02.08.2024. FDC lacks therapeutic justification. Prohibited under Section 26A of the D&C Act, 1940. All manufacture, sale, and distribution prohibited with immediate effect.	CRITICAL	OPEN	2026-08-30 12:47:54.389411+05:30
22	REGULATORY_BLOCK	23	\N	CDSCO PROHIBITION: Cefixime + Acetylcysteine prohibited vide S.O. 3285(E) to S.O. 3440(E) dated 02.08.2024. FDC lacks therapeutic justification. Prohibited under Section 26A of the D&C Act, 1940. All manufacture, sale, and distribution prohibited with immediate effect.	CRITICAL	OPEN	2026-08-30 12:47:54.389411+05:30
23	REGULATORY_BLOCK	24	\N	CDSCO PROHIBITION: Cephalexin + Serratiopeptidase prohibited vide S.O. 3285(E) to S.O. 3440(E) dated 02.08.2024. FDC lacks therapeutic justification. Prohibited under Section 26A of the D&C Act, 1940. All manufacture, sale, and distribution prohibited with immediate effect.	CRITICAL	OPEN	2026-08-30 12:47:54.389411+05:30
24	REGULATORY_BLOCK	25	\N	CDSCO PROHIBITION: Sucralfate + Oxetacaine prohibited vide S.O. 3285(E) to S.O. 3440(E) dated 02.08.2024. FDC lacks therapeutic justification. Prohibited under Section 26A of the D&C Act, 1940. All manufacture, sale, and distribution prohibited with immediate effect.	CRITICAL	OPEN	2026-08-30 12:47:54.389411+05:30
25	RECALL	26	5	CDSCO NSQ ALERT: Batch PAN2025001 of Pantoprazole Tablets IP 40mg declared Not of Standard Quality by CDL, Kolkata. Dissolution failure - Below specified limits. All holders must cease distribution and quarantine remaining stock.	HIGH	OPEN	2026-08-30 12:47:54.389411+05:30
26	RECALL	27	6	CDSCO NSQ ALERT: Batch MTX2025001 of Methotrexate Tablets IP 7.5mg declared Not of Standard Quality by CDL, Kolkata. Assay non-compliance - Active ingredient content below specified limits. All holders must cease distribution and quarantine remaining stock.	HIGH	OPEN	2026-08-30 12:47:54.389411+05:30
27	RECALL	28	7	CDSCO NSQ ALERT: Batch CAL2025001 of Calcium and Vitamin D3 Tablets declared Not of Standard Quality by CDL, Kolkata. Content uniformity failure. All holders must cease distribution and quarantine remaining stock.	HIGH	OPEN	2026-08-30 12:47:54.389411+05:30
28	RECALL	29	8	CDSCO NSQ ALERT: Batch CLP2025001 of Clopidogrel Tablets IP 75mg declared Not of Standard Quality by CDL, Kolkata. Dissolution failure - Below specified limits. All holders must cease distribution and quarantine remaining stock.	HIGH	OPEN	2026-08-30 12:47:54.389411+05:30
29	RECALL	30	9	CDSCO NSQ ALERT: Batch TER2025001 of Terbutaline Sulphate Tablets IP 2.5mg declared Not of Standard Quality by CDL, Kolkata. Assay non-compliance - Active ingredient content below specified limits. All holders must cease distribution and quarantine remaining stock.	HIGH	OPEN	2026-08-30 12:47:54.389411+05:30
30	RECALL	31	10	CDSCO NSQ ALERT: Batch AMB2025001 of Ambroxol Hydrochloride Syrup IP declared Not of Standard Quality by CDL, Kolkata. Microbial contamination - Total aerobic microbial count exceeds limits. All holders must cease distribution and quarantine remaining stock.	HIGH	OPEN	2026-08-30 12:47:54.389411+05:30
31	RECALL	32	11	CDSCO NSQ ALERT: Batch GUA2025001 of Guaifenesin and Menthol Syrup declared Not of Standard Quality by State DT Lab, Maharashtra. Identification test failure - Active ingredient not detected. All holders must cease distribution and quarantine remaining stock.	HIGH	OPEN	2026-08-30 12:47:54.389411+05:30
32	RECALL	33	12	CDSCO NSQ ALERT: Batch LEV2025001 of Levosalbutamol and Guaifenesin Syrup declared Not of Standard Quality by CDL, Kolkata. Assay non-compliance - Active ingredient content below specified limits. All holders must cease distribution and quarantine remaining stock.	HIGH	OPEN	2026-08-30 12:47:54.389411+05:30
33	RECALL	34	13	CDSCO NSQ ALERT: Batch ASP2025001 of Aspirin Dispersible Tablets IP 75mg declared Not of Standard Quality by CDL, Kolkata. Dissolution failure - Below specified limits. All holders must cease distribution and quarantine remaining stock.	HIGH	OPEN	2026-08-30 12:47:54.389411+05:30
34	RECALL	35	14	CDSCO NSQ ALERT: Batch IRO2025001 of Iron and Folic Acid Syrup IP declared Not of Standard Quality by State DT Lab, Rajasthan. Content uniformity failure - Iron content variation exceeds limits. All holders must cease distribution and quarantine remaining stock.	HIGH	OPEN	2026-08-30 12:47:54.389411+05:30
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, user_id, organization_id, action, entity_type, entity_id, details, ip_address, user_agent, "timestamp") FROM stdin;
\.


--
-- Data for Name: batches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.batches (id, batch_number, medicine_id, manufacturing_date, expiry_date, quantity, status, created_at, updated_at) FROM stdin;
1	B-MED001-01	1	2025-06-01	2027-06-01	1000	ACTIVE	2026-08-30 12:47:11.904265+05:30	2026-08-30 12:47:11.904265+05:30
2	B-MED001-02	1	2023-01-01	2025-01-01	500	EXPIRED	2026-08-30 12:47:11.904265+05:30	2026-08-30 12:47:11.904265+05:30
3	B-MED002-01	2	2025-03-01	2027-03-01	800	BLOCKED	2026-08-30 12:47:11.904265+05:30	2026-08-30 12:47:11.944554+05:30
4	B-MED003-01	3	2025-05-01	2027-05-01	300	RECALLED	2026-08-30 12:47:11.904265+05:30	2026-08-30 12:47:11.954491+05:30
5	PAN2025001	26	2025-08-01	2027-07-31	0	BLOCKED	2026-08-30 12:47:54.389411+05:30	2026-08-30 12:47:54.389411+05:30
6	MTX2025001	27	2025-06-15	2027-06-14	0	BLOCKED	2026-08-30 12:47:54.389411+05:30	2026-08-30 12:47:54.389411+05:30
7	CAL2025001	28	2025-09-01	2027-08-31	0	BLOCKED	2026-08-30 12:47:54.389411+05:30	2026-08-30 12:47:54.389411+05:30
8	CLP2025001	29	2025-07-01	2027-06-30	0	BLOCKED	2026-08-30 12:47:54.389411+05:30	2026-08-30 12:47:54.389411+05:30
9	TER2025001	30	2025-05-01	2027-04-30	0	BLOCKED	2026-08-30 12:47:54.389411+05:30	2026-08-30 12:47:54.389411+05:30
10	AMB2025001	31	2025-10-01	2027-09-30	0	BLOCKED	2026-08-30 12:47:54.389411+05:30	2026-08-30 12:47:54.389411+05:30
11	GUA2025001	32	2025-11-01	2027-10-31	0	BLOCKED	2026-08-30 12:47:54.389411+05:30	2026-08-30 12:47:54.389411+05:30
12	LEV2025001	33	2025-09-15	2027-09-14	0	BLOCKED	2026-08-30 12:47:54.389411+05:30	2026-08-30 12:47:54.389411+05:30
13	ASP2025001	34	2025-08-01	2027-07-31	0	BLOCKED	2026-08-30 12:47:54.389411+05:30	2026-08-30 12:47:54.389411+05:30
14	IRO2025001	35	2025-10-01	2027-09-30	0	BLOCKED	2026-08-30 12:47:54.389411+05:30	2026-08-30 12:47:54.389411+05:30
15	TEST-001	1	2025-01-15	2027-01-15	500	ACTIVE	2026-08-30 20:50:55.686514+05:30	2026-08-30 20:50:55.686514+05:30
16	TEST-UI-001	1	2025-06-15	2027-06-15	100	ACTIVE	2026-08-30 20:55:12.038834+05:30	2026-08-30 20:55:12.038834+05:30
17	011	1	2026-07-01	2027-07-01	100	ACTIVE	2026-08-30 21:08:07.906511+05:30	2026-08-30 21:08:07.906511+05:30
18	B-E2E-675462	1	2026-09-01	2028-09-01	3	ACTIVE	2026-09-09 11:14:35.479107+05:30	2026-09-09 11:14:35.479107+05:30
19	B-E2E-958172	1	2026-09-01	2028-09-01	2	ACTIVE	2026-09-09 11:19:18.196106+05:30	2026-09-09 11:19:18.196106+05:30
20	01123	2	2026-09-09	2027-09-09	100	ACTIVE	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
21	9790	1	2026-09-09	2027-09-09	100	ACTIVE	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
22	5050	1	2026-09-09	2027-09-09	50	ACTIVE	2026-09-09 12:46:08.532769+05:30	2026-09-09 12:46:08.532769+05:30
23	0202	3	2026-09-09	2027-09-09	50	ACTIVE	2026-09-09 13:05:06.483394+05:30	2026-09-09 13:05:06.483394+05:30
24	2020	1	2026-09-09	2027-09-09	50	ACTIVE	2026-09-09 13:40:26.903304+05:30	2026-09-09 13:40:26.903304+05:30
25	0012	1	2026-10-05	2027-10-05	100	ACTIVE	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
26	1123	3	2026-10-06	2027-10-06	100	ACTIVE	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
27	1001	2	2026-10-05	2027-10-05	100	ACTIVE	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
28	1234	4	2026-10-10	2027-10-10	100	ACTIVE	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
29	12345	3	2026-10-10	2027-10-10	100	ACTIVE	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
\.


--
-- Data for Name: bill_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bill_items (id, bill_id, prescription_item_id, medicine_id, serial_number_id, description, hsn_code, quantity, unit_price, discount_rate, discount_amount, taxable_amount, gst_rate, gst_amount, total_amount, created_at) FROM stdin;
\.


--
-- Data for Name: bills; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bills (id, bill_number, prescription_id, patient_id, pharmacy_id, issued_by, status, payment_method, subtotal, cgst_rate, cgst_amount, sgst_rate, sgst_amount, igst_rate, igst_amount, total_tax, discount, grand_total, amount_paid, balance_due, gstin_pharmacy, gstin_patient, digital_signature, notes, issued_at, paid_at, created_at) FROM stdin;
\.


--
-- Data for Name: dispensing; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dispensing (id, serial_number_id, batch_id, pharmacy_id, patient_reference, dispensed_by_user, "timestamp") FROM stdin;
\.


--
-- Data for Name: doctors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.doctors (id, name, registration_number, qualification, specialization, hospital, phone, email, license_authority, is_verified, created_at) FROM stdin;
\.


--
-- Data for Name: drug_interactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.drug_interactions (id, drug_a_name, drug_b_name, severity, description, clinical_effect, management, source, is_active, created_at) FROM stdin;
21	Warfarin	Aspirin	CONTRAINDICATED	Increased bleeding risk	\N	Avoid combination or monitor INR	CDSCO / Drug Database	t	2026-09-08 16:35:54.940049
22	Metformin	Alcohol	SEVERE	Lactic acidosis risk	\N	Limit alcohol intake	CDSCO / Drug Database	t	2026-09-08 16:35:54.941709
23	Metoprolol	Verapamil	SEVERE	Severe bradycardia	\N	Avoid combination	CDSCO / Drug Database	t	2026-09-08 16:35:54.942913
24	Diazepam	Alcohol	SEVERE	Respiratory depression	\N	Strictly avoid	CDSCO / Drug Database	t	2026-09-08 16:35:54.943841
25	Ciprofloxacin	Dairy Products	MODERATE	Reduced absorption	\N	Take 2 hours before/after dairy	CDSCO / Drug Database	t	2026-09-08 16:35:54.944845
26	Levothyroxine	Iron Supplements	MODERATE	Reduced absorption	\N	Separate by 4 hours	CDSCO / Drug Database	t	2026-09-08 16:35:54.945948
\.


--
-- Data for Name: inventory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventory (id, organization_id, batch_id, quantity, status, updated_at) FROM stdin;
2	1	2	500	EXPIRED	2026-08-30 12:47:11.927146+05:30
3	1	3	800	BLOCKED	2026-08-30 12:47:11.927146+05:30
4	1	4	300	RECALLED	2026-08-30 12:47:11.927146+05:30
15	2	2	1	ACTIVE	2026-08-31 00:02:04.597475+05:30
13	1	17	4	ACTIVE	2026-08-31 00:05:24.10596+05:30
18	2	17	2	ACTIVE	2026-08-31 00:05:24.10596+05:30
1	1	1	1001	ACTIVE	2026-09-08 13:23:15.074887+05:30
22	1	18	1	ACTIVE	2026-09-09 11:14:35.532955+05:30
23	1	19	1	ACTIVE	2026-09-09 11:19:18.661965+05:30
25	2	21	1	ACTIVE	2026-09-09 11:27:03.717078+05:30
24	1	21	1	ACTIVE	2026-09-09 11:28:06.080102+05:30
27	1	24	0	ACTIVE	2026-09-09 13:42:47.332948+05:30
28	2	24	1	ACTIVE	2026-09-09 13:42:47.332948+05:30
29	1	25	0	ACTIVE	2026-10-05 22:47:45.429387+05:30
30	2	25	1	ACTIVE	2026-10-05 22:50:31.976357+05:30
33	2	26	2	ACTIVE	2026-10-06 19:31:51.365655+05:30
32	1	26	1	ACTIVE	2026-10-06 20:07:30.096241+05:30
37	1	29	0	ACTIVE	2026-10-06 20:27:10.009111+05:30
38	2	29	1	ACTIVE	2026-10-06 20:29:52.629744+05:30
\.


--
-- Data for Name: medicines; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.medicines (id, medicine_code, name, manufacturer_name, composition, dosage, created_at, updated_at) FROM stdin;
1	MED001	Paracetamol 500 IP	Ipca Laboratories Ltd., Mumbai	Paracetamol 500mg (IP)	Tablet, 500mg	2026-08-30 12:47:11.895454+05:30	2026-08-30 12:47:11.895454+05:30
2	MED002	Amoxicillin & Potassium Clavulanate Tablets IP 625	GenPharma Remedies Pvt. Ltd., Baddi	Amoxicillin Trihydrate 500mg + Potassium Clavulanate 125mg (IP)	Tablet, 625mg	2026-08-30 12:47:11.895454+05:30	2026-08-30 12:47:11.895454+05:30
3	MED003	Dextromethorphan Hydrobromide Syrup IP	Aristo Pharmaceuticals Pvt. Ltd., Sikkim	Dextromethorphan Hydrobromide 15mg/5ml, Chlorpheniramine Maleate 2mg/5ml, Menthol 1mg/5ml	Syrup, 100ml	2026-08-30 12:47:11.895454+05:30	2026-08-30 12:47:11.895454+05:30
4	CDSCO-2026-8952	Acetyl Salicylic acid + Ethoheptazine	CDSCO Banned FDC	Acetyl Salicylic acid + Ethoheptazine	Fixed Dose Combination	2026-08-30 12:47:54.389411+05:30	2026-08-30 12:47:54.389411+05:30
5	CDSCO-2026-3104	Aloe Extract + Allantoin + Alphatocopherol Acetate + D-Penthenol + Vitamin A	CDSCO Banned FDC	Aloe Extract + Allantoin + Alphatocopherol Acetate + D-Penthenol + Vitamin A	Fixed Dose Combination	2026-08-30 12:47:54.389411+05:30	2026-08-30 12:47:54.389411+05:30
6	CDSCO-2026-3296	Aloe Extract + Vitamin E + Dimethicone + Glycerine	CDSCO Banned FDC	Aloe Extract + Vitamin E + Dimethicone + Glycerine	Fixed Dose Combination	2026-08-30 12:47:54.389411+05:30	2026-08-30 12:47:54.389411+05:30
7	CDSCO-2026-2824	Aloe Vera + Jojoba Oil + Vitamin E	CDSCO Banned FDC	Aloe Vera + Jojoba Oil + Vitamin E	Fixed Dose Combination	2026-08-30 12:47:54.389411+05:30	2026-08-30 12:47:54.389411+05:30
8	CDSCO-2026-2129	Aloe vera + Orange oil	CDSCO Banned FDC	Aloe vera + Orange oil	Fixed Dose Combination	2026-08-30 12:47:54.389411+05:30	2026-08-30 12:47:54.389411+05:30
9	CDSCO-2026-5250	Aloe vera + Jojoba oil + Wheat germ oil + Tea tree oil	CDSCO Banned FDC	Aloe vera + Jojoba oil + Wheat germ oil + Tea tree oil	Fixed Dose Combination	2026-08-30 12:47:54.389411+05:30	2026-08-30 12:47:54.389411+05:30
10	CDSCO-2026-1214	Aloe vera + Vitamin E + Herbal	CDSCO Banned FDC	Aloe vera + Vitamin E + Herbal	Fixed Dose Combination	2026-08-30 12:47:54.389411+05:30	2026-08-30 12:47:54.389411+05:30
11	CDSCO-2026-4249	Dicyclomine + Paracetamol + Clidinium Bromide	CDSCO Banned FDC	Dicyclomine + Paracetamol + Clidinium Bromide	Fixed Dose Combination	2026-08-30 12:47:54.389411+05:30	2026-08-30 12:47:54.389411+05:30
12	CDSCO-2026-2748	Dicyclomine + Paracetamol + Clidinium Bromide + Chlordiazepoxide	CDSCO Banned FDC	Dicyclomine + Paracetamol + Clidinium Bromide + Chlordiazepoxide	Fixed Dose Combination	2026-08-30 12:47:54.389411+05:30	2026-08-30 12:47:54.389411+05:30
13	CDSCO-2026-7120	Gliclazide + Chromium Picolinate	CDSCO Banned FDC	Gliclazide + Chromium Picolinate	Fixed Dose Combination	2026-08-30 12:47:54.389411+05:30	2026-08-30 12:47:54.389411+05:30
14	CDSCO-2026-1354	Paracetamol + Lignocaine	CDSCO Banned FDC	Paracetamol + Lignocaine	Fixed Dose Combination	2026-08-30 12:47:54.389411+05:30	2026-08-30 12:47:54.389411+05:30
15	CDSCO-2026-9055	Amoxicillin + Serratiopeptidase + Lactobacillus Sporogenes	CDSCO Banned FDC	Amoxicillin + Serratiopeptidase + Lactobacillus Sporogenes	Fixed Dose Combination	2026-08-30 12:47:54.389411+05:30	2026-08-30 12:47:54.389411+05:30
16	CDSCO-2026-5116	Amoxicillin + Cloxacillin + Lactic acid bacillus + Serratiopeptidase	CDSCO Banned FDC	Amoxicillin + Cloxacillin + Lactic acid bacillus + Serratiopeptidase	Fixed Dose Combination	2026-08-30 12:47:54.389411+05:30	2026-08-30 12:47:54.389411+05:30
17	CDSCO-2026-7894	Amoxicillin + Serratiopeptidase	CDSCO Banned FDC	Amoxicillin + Serratiopeptidase	Fixed Dose Combination	2026-08-30 12:47:54.389411+05:30	2026-08-30 12:47:54.389411+05:30
18	CDSCO-2026-2169	Cefadroxyl + Probenecid	CDSCO Banned FDC	Cefadroxyl + Probenecid	Fixed Dose Combination	2026-08-30 12:47:54.389411+05:30	2026-08-30 12:47:54.389411+05:30
19	CDSCO-2026-3670	Cefuroxime + Serratiopeptidase	CDSCO Banned FDC	Cefuroxime + Serratiopeptidase	Fixed Dose Combination	2026-08-30 12:47:54.389411+05:30	2026-08-30 12:47:54.389411+05:30
20	CDSCO-2024-9434	Amoxicillin + Potassium Clavulanate (500mg:125mg)	CDSCO Banned FDC	Amoxicillin + Potassium Clavulanate (500mg:125mg)	Fixed Dose Combination	2026-08-30 12:47:54.389411+05:30	2026-08-30 12:47:54.389411+05:30
21	CDSCO-2024-9339	Cetirizine + Phenylephrine	CDSCO Banned FDC	Cetirizine + Phenylephrine	Fixed Dose Combination	2026-08-30 12:47:54.389411+05:30	2026-08-30 12:47:54.389411+05:30
22	CDSCO-2024-7315	Levocetirizine + Phenylephrine + Paracetamol	CDSCO Banned FDC	Levocetirizine + Phenylephrine + Paracetamol	Fixed Dose Combination	2026-08-30 12:47:54.389411+05:30	2026-08-30 12:47:54.389411+05:30
23	CDSCO-2024-3868	Cefixime + Acetylcysteine	CDSCO Banned FDC	Cefixime + Acetylcysteine	Fixed Dose Combination	2026-08-30 12:47:54.389411+05:30	2026-08-30 12:47:54.389411+05:30
24	CDSCO-2024-3867	Cephalexin + Serratiopeptidase	CDSCO Banned FDC	Cephalexin + Serratiopeptidase	Fixed Dose Combination	2026-08-30 12:47:54.389411+05:30	2026-08-30 12:47:54.389411+05:30
25	CDSCO-2024-3961	Sucralfate + Oxetacaine	CDSCO Banned FDC	Sucralfate + Oxetacaine	Fixed Dose Combination	2026-08-30 12:47:54.389411+05:30	2026-08-30 12:47:54.389411+05:30
26	NSQ-2026-1875	Pantoprazole Tablets IP 40mg	Finecure Pharmaceuticals Ltd., Roorkee, Uttarakhand	Pantoprazole Tablets IP 40mg	Tablet/Syrup	2026-08-30 12:47:54.389411+05:30	2026-08-30 12:47:54.389411+05:30
27	NSQ-2026-6472	Methotrexate Tablets IP 7.5mg	Macmillon Pharmaceuticals Pvt. Ltd., Baddi, Himachal Pradesh	Methotrexate Tablets IP 7.5mg	Tablet/Syrup	2026-08-30 12:47:54.389411+05:30	2026-08-30 12:47:54.389411+05:30
28	NSQ-2026-5128	Calcium and Vitamin D3 Tablets	Athens Life Sciences, Kala Amb, Himachal Pradesh	Calcium and Vitamin D3 Tablets	Tablet/Syrup	2026-08-30 12:47:54.389411+05:30	2026-08-30 12:47:54.389411+05:30
29	NSQ-2026-7508	Clopidogrel Tablets IP 75mg	Sanofi India Ltd., Tarapur, Maharashtra	Clopidogrel Tablets IP 75mg	Tablet/Syrup	2026-08-30 12:47:54.389411+05:30	2026-08-30 12:47:54.389411+05:30
30	NSQ-2026-9667	Terbutaline Sulphate Tablets IP 2.5mg	Galpha Laboratories Ltd., Baddi, Himachal Pradesh	Terbutaline Sulphate Tablets IP 2.5mg	Tablet/Syrup	2026-08-30 12:47:54.389411+05:30	2026-08-30 12:47:54.389411+05:30
31	NSQ-2026-6284	Ambroxol Hydrochloride Syrup IP	Biocenna Healthcare Pvt Ltd., Roorkee, Uttarakhand	Ambroxol Hydrochloride Syrup IP	Tablet/Syrup	2026-08-30 12:47:54.389411+05:30	2026-08-30 12:47:54.389411+05:30
32	NSQ-2026-2748	Guaifenesin and Menthol Syrup	Athens Life Sciences, Kala Amb, Himachal Pradesh	Guaifenesin and Menthol Syrup	Tablet/Syrup	2026-08-30 12:47:54.389411+05:30	2026-08-30 12:47:54.389411+05:30
33	NSQ-2026-8082	Levosalbutamol and Guaifenesin Syrup	Galpha Laboratories Ltd., Baddi, Himachal Pradesh	Levosalbutamol and Guaifenesin Syrup	Tablet/Syrup	2026-08-30 12:47:54.389411+05:30	2026-08-30 12:47:54.389411+05:30
34	NSQ-2026-8146	Aspirin Dispersible Tablets IP 75mg	Sanofi India Ltd., Tarapur, Maharashtra	Aspirin Dispersible Tablets IP 75mg	Tablet/Syrup	2026-08-30 12:47:54.389411+05:30	2026-08-30 12:47:54.389411+05:30
35	NSQ-2026-2279	Iron and Folic Acid Syrup IP	Biocenna Healthcare Pvt Ltd., Roorkee, Uttarakhand	Iron and Folic Acid Syrup IP	Tablet/Syrup	2026-08-30 12:47:54.389411+05:30	2026-08-30 12:47:54.389411+05:30
159	MED004	Combiflam	Sanofi India Ltd., Mumbai	Ibuprofen 400mg + Paracetamol 325mg	Tablet	2026-09-08 16:35:54.852574+05:30	2026-09-08 16:35:54.852574+05:30
160	MED005	Brufen 400	Abbott Healthcare Pvt. Ltd.	Ibuprofen IP 400mg	Tablet	2026-09-08 16:35:54.880681+05:30	2026-09-08 16:35:54.880681+05:30
161	MED006	Volini Gel	Sun Pharmaceutical Industries Ltd.	Diclofenac Diethylamine 1% + Menthol 5%	Gel	2026-09-08 16:35:54.882353+05:30	2026-09-08 16:35:54.882353+05:30
162	MED007	Voveran SR 100	Novartis India Ltd.	Diclofenac Sodium SR 100mg	Tablet SR	2026-09-08 16:35:54.883771+05:30	2026-09-08 16:35:54.883771+05:30
163	MED008	Nimesulide 100mg	Dr. Reddys Laboratories Ltd.	Nimesulide IP 100mg	Tablet	2026-09-08 16:35:54.884966+05:30	2026-09-08 16:35:54.884966+05:30
164	MED009	Pan 40	Alkem Laboratories Ltd.	Pantoprazole 40mg	Tablet	2026-09-08 16:35:54.886504+05:30	2026-09-08 16:35:54.886504+05:30
165	MED010	Omez 20	Dr. Reddys Laboratories Ltd.	Omeprazole 20mg	Capsule	2026-09-08 16:35:54.887582+05:30	2026-09-08 16:35:54.887582+05:30
166	MED011	Amoxicillin 500	Cipla Ltd., Mumbai	Amoxicillin Trihydrate IP 500mg	Capsule	2026-09-08 16:35:54.8896+05:30	2026-09-08 16:35:54.8896+05:30
167	MED012	Azithromycin 500	Zydus Cadila, Ahmedabad	Azithromycin IP 500mg	Tablet	2026-09-08 16:35:54.890986+05:30	2026-09-08 16:35:54.890986+05:30
168	MED013	Cefixime 200	Lupin Ltd., Mumbai	Cefixime Trihydrate IP 200mg	Tablet	2026-09-08 16:35:54.89218+05:30	2026-09-08 16:35:54.89218+05:30
169	MED014	Ciprofloxacin 500	Ranbaxy Laboratories Ltd.	Ciprofloxacin HCl IP 500mg	Tablet	2026-09-08 16:35:54.893142+05:30	2026-09-08 16:35:54.893142+05:30
170	MED015	Metronidazole 400	Ipca Laboratories Ltd.	Metronidazole IP 400mg	Tablet	2026-09-08 16:35:54.894126+05:30	2026-09-08 16:35:54.894126+05:30
171	MED016	Augmentin 625	GlaxoSmithKline Pharmaceuticals Ltd.	Amoxicillin 500mg + Clavulanate 125mg	Tablet	2026-09-08 16:35:54.895581+05:30	2026-09-08 16:35:54.895581+05:30
172	MED017	Doxycycline 100	Cipla Ltd., Mumbai	Doxycycline Hyclate IP 100mg	Capsule	2026-09-08 16:35:54.896578+05:30	2026-09-08 16:35:54.896578+05:30
173	MED018	Levofloxacin 500	Sun Pharmaceutical Industries Ltd.	Levofloxacin IP 500mg	Tablet	2026-09-08 16:35:54.897625+05:30	2026-09-08 16:35:54.897625+05:30
174	MED019	Cefpodoxime 200	Cipla Ltd., Mumbai	Cefpodoxime Proxetil IP 200mg	Tablet	2026-09-08 16:35:54.898778+05:30	2026-09-08 16:35:54.898778+05:30
175	MED020	Clarithromycin 500	Abbott Healthcare Pvt. Ltd.	Clarithromycin IP 500mg	Tablet	2026-09-08 16:35:54.899787+05:30	2026-09-08 16:35:54.899787+05:30
176	MED021	Amlodipine 5	Cipla Ltd., Mumbai	Amlodipine Besylate IP 5mg	Tablet	2026-09-08 16:35:54.900574+05:30	2026-09-08 16:35:54.900574+05:30
177	MED022	Telma 40	Glenmark Pharmaceuticals Ltd.	Telmisartan IP 40mg	Tablet	2026-09-08 16:35:54.901565+05:30	2026-09-08 16:35:54.901565+05:30
178	MED023	Atorvastatin 10	Ranbaxy Laboratories Ltd.	Atorvastatin Calcium IP 10mg	Tablet	2026-09-08 16:35:54.90249+05:30	2026-09-08 16:35:54.90249+05:30
179	MED024	Metoprolol 50	AstraZeneca Pharma India Ltd.	Metoprolol Succinate 50mg ER	Tablet ER	2026-09-08 16:35:54.90354+05:30	2026-09-08 16:35:54.90354+05:30
180	MED025	Losartan 50	Sun Pharmaceutical Industries Ltd.	Losartan Potassium IP 50mg	Tablet	2026-09-08 16:35:54.905401+05:30	2026-09-08 16:35:54.905401+05:30
181	MED026	Clopidogrel 75	Sanofi India Ltd.	Clopidogrel Bisulfate IP 75mg	Tablet	2026-09-08 16:35:54.906808+05:30	2026-09-08 16:35:54.906808+05:30
182	MED027	Aspirin 75	Bayer Zydus Pharma Pvt. Ltd.	Aspirin IP 75mg	Dispersible Tablet	2026-09-08 16:35:54.907836+05:30	2026-09-08 16:35:54.907836+05:30
183	MED028	Nitroglycerin 0.5	Cipla Ltd., Mumbai	Nitroglycerin IP 0.5mg	Sublingual Tablet	2026-09-08 16:35:54.908773+05:30	2026-09-08 16:35:54.908773+05:30
184	MED029	Digoxin 0.25	GlaxoSmithKline Pharmaceuticals Ltd.	Digoxin IP 0.25mg	Tablet	2026-09-08 16:35:54.909723+05:30	2026-09-08 16:35:54.909723+05:30
185	MED030	Furosemide 40	Sanofi India Ltd.	Furosemide IP 40mg	Tablet	2026-09-08 16:35:54.910647+05:30	2026-09-08 16:35:54.910647+05:30
186	MED031	Metformin 500	USV Pvt. Ltd., Mumbai	Metformin HCl IP 500mg	Tablet	2026-09-08 16:35:54.911678+05:30	2026-09-08 16:35:54.911678+05:30
187	MED032	Glycomet GP 1	Unichem Laboratories Ltd.	Glimepiride 1mg + Metformin 500mg	Tablet	2026-09-08 16:35:54.912666+05:30	2026-09-08 16:35:54.912666+05:30
188	MED033	Januvia 100	Merck & Co./MSD Pharmaceuticals	Sitagliptin 100mg	Tablet	2026-09-08 16:35:54.913933+05:30	2026-09-08 16:35:54.913933+05:30
189	MED034	Voglibose 0.3	Glenmark Pharmaceuticals Ltd.	Voglibose IP 0.3mg	Tablet	2026-09-08 16:35:54.914982+05:30	2026-09-08 16:35:54.914982+05:30
190	MED035	Insulin Human R	Biocon Ltd., Bengaluru	Human Insulin 100 IU/ml	Injection	2026-09-08 16:35:54.915881+05:30	2026-09-08 16:35:54.915881+05:30
191	MED036	Pioglitazone 15	Sun Pharmaceutical Industries Ltd.	Pioglitazone HCl IP 15mg	Tablet	2026-09-08 16:35:54.916798+05:30	2026-09-08 16:35:54.916798+05:30
192	MED037	Glimepiride 2	Dr. Reddys Laboratories Ltd.	Glimepiride IP 2mg	Tablet	2026-09-08 16:35:54.917694+05:30	2026-09-08 16:35:54.917694+05:30
193	MED038	Gliclazide 80	Micro Labs Ltd., Bengaluru	Gliclazide IP 80mg	Tablet	2026-09-08 16:35:54.918629+05:30	2026-09-08 16:35:54.918629+05:30
194	MED039	Asthalin Inhaler	Cipla Ltd., Mumbai	Salbutamol IP 100mcg/dose	Inhaler	2026-09-08 16:35:54.919516+05:30	2026-09-08 16:35:54.919516+05:30
195	MED040	Deriphyllin Retard 150	Dr. Reddys Laboratories Ltd.	Etophylline 150mg + Theophylline 25mg	Tablet SR	2026-09-08 16:35:54.920437+05:30	2026-09-08 16:35:54.920437+05:30
196	MED041	Budecort 200 Inhaler	AstraZeneca Pharma India Ltd.	Budesonide IP 200mcg/dose	Inhaler	2026-09-08 16:35:54.922171+05:30	2026-09-08 16:35:54.922171+05:30
197	MED042	Montair LC	Cipla Ltd., Mumbai	Montelukast 10mg + Levocetirizine 5mg	Tablet	2026-09-08 16:35:54.923451+05:30	2026-09-08 16:35:54.923451+05:30
198	MED043	Ambrolite-D	Lupin Ltd., Mumbai	Ambroxol HCl 30mg + Guaifenesin 200mg	Syrup	2026-09-08 16:35:54.924594+05:30	2026-09-08 16:35:54.924594+05:30
199	MED044	Dexorange Syrup	Panacea Biotec Ltd.	Ferric Ammonium Citrate 160mg + Cyanocobalamin 5mcg	Syrup	2026-09-08 16:35:54.925525+05:30	2026-09-08 16:35:54.925525+05:30
200	MED045	Sinarest	Micro Labs Ltd., Bengaluru	Paracetamol 325mg + Phenylephrine 10mg	Tablet	2026-09-08 16:35:54.926451+05:30	2026-09-08 16:35:54.926451+05:30
201	MED046	Cetirizine 10	Cipla Ltd., Mumbai	Cetirizine HCl IP 10mg	Tablet	2026-09-08 16:35:54.927506+05:30	2026-09-08 16:35:54.927506+05:30
202	MED047	Allegra 120	Sanofi India Ltd.	Fexofenadine 120mg	Tablet	2026-09-08 16:35:54.928547+05:30	2026-09-08 16:35:54.928547+05:30
203	MED048	Fluticasone Nasal Spray	GlaxoSmithKline Pharmaceuticals Ltd.	Fluticasone Propionate IP 50mcg	Nasal Spray	2026-09-08 16:35:54.929726+05:30	2026-09-08 16:35:54.929726+05:30
\.


--
-- Data for Name: offline_sync_queue; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.offline_sync_queue (id, user_id, organization_id, operation, entity_type, entity_id, payload, status, retry_count, max_retries, error_message, created_at, synced_at) FROM stdin;
\.


--
-- Data for Name: organizations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.organizations (id, name, type, license_number, address, status, blockchain_address, created_at, updated_at) FROM stdin;
1	MediCore Distributors Pvt Ltd	DISTRIBUTOR	DL-DIST-2024-001	Chennai, Tamil Nadu	ACTIVE	\N	2026-08-30 12:47:11.869022+05:30	2026-08-30 12:47:11.869022+05:30
2	Apollo City Pharmacy	PHARMACY	DL-PHARM-2024-014	Chennai, Tamil Nadu	ACTIVE	\N	2026-08-30 12:47:11.869022+05:30	2026-08-30 12:47:11.869022+05:30
3	Central Drugs Standard Control Organisation (CDSCO)	REGULATOR	CDSCO/REG/2024-001	FDA Bhawan, Kotla Road, New Delhi 110002	ACTIVE	\N	2026-08-30 12:47:11.869022+05:30	2026-08-30 12:47:11.869022+05:30
10	Admin Headquarters	DISTRIBUTOR	\N	\N	ACTIVE	0x0000000000000000000000000000000000000001	2026-09-08 16:35:54.814059+05:30	2026-09-08 16:35:54.814059+05:30
11	MediSupply Distributors Pvt. Ltd.	DISTRIBUTOR	\N	\N	ACTIVE	0x1111111111111111111111111111111111111111	2026-09-08 16:35:54.814059+05:30	2026-09-08 16:35:54.814059+05:30
12	HealthFirst Pharmaceuticals	DISTRIBUTOR	\N	\N	ACTIVE	0x2222222222222222222222222222222222222222	2026-09-08 16:35:54.814059+05:30	2026-09-08 16:35:54.814059+05:30
13	Apollo Pharmacy - Main Branch	PHARMACY	\N	\N	ACTIVE	0x3333333333333333333333333333333333333333	2026-09-08 16:35:54.814059+05:30	2026-09-08 16:35:54.814059+05:30
14	MedPlus Pharmacy - Central	PHARMACY	\N	\N	ACTIVE	0x4444444444444444444444444444444444444444	2026-09-08 16:35:54.814059+05:30	2026-09-08 16:35:54.814059+05:30
15	NetMeds Pharmacy	PHARMACY	\N	\N	ACTIVE	0x5555555555555555555555555555555555555555	2026-09-08 16:35:54.814059+05:30	2026-09-08 16:35:54.814059+05:30
\.


--
-- Data for Name: patient_allergies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.patient_allergies (id, patient_id, allergen, severity, reaction_description, verified, created_at) FROM stdin;
\.


--
-- Data for Name: patients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.patients (id, name, date_of_birth, gender, phone, email, address, blood_group, emergency_contact_name, emergency_contact_phone, aadhaar_last4, photo_url, notes, status, created_at, updated_at) FROM stdin;
1	Rahul Patel	1985-06-15	Male	9876543210	rahul.patel@email.com	42 MG Road, Mumbai	B+	\N	\N	\N	\N	\N	ACTIVE	2026-09-08 16:35:54.952226	2026-09-08 16:35:54.952226
2	Anita Desai	1992-03-22	Female	9876543220	anita.desai@email.com	15 Park Street, Kolkata	O+	\N	\N	\N	\N	\N	ACTIVE	2026-09-08 16:35:54.955492	2026-09-08 16:35:54.955492
3	Mohammed Khan	1978-11-08	Male	9876543230	m.khan@email.com	78 Civil Lines, Delhi	A-	\N	\N	\N	\N	\N	ACTIVE	2026-09-08 16:35:54.95686	2026-09-08 16:35:54.95686
\.


--
-- Data for Name: prescription_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.prescription_items (id, prescription_id, medicine_id, dosage, frequency, duration, quantity, instructions, dispensed_serial_id, dispensed_at, created_at) FROM stdin;
\.


--
-- Data for Name: prescriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.prescriptions (id, prescription_number, doctor_id, patient_id, pharmacy_id, status, diagnosis, notes, issued_date, valid_until, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: regulatory_status; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.regulatory_status (id, medicine_id, batch_id, status, authority, reference_number, effective_date, reason, source, is_simulated, last_updated, created_at) FROM stdin;
1	1	\N	PERMITTED	Central Drugs Standard Control Organisation (CDSCO), Ministry of Health & Family Welfare, Government of India	G.S.R. 45(E) dated 20.01.2026	2026-01-20	Paracetamol IP (500mg tablet) approved and listed under Schedule H of the Drugs Rules, 1945. No restrictions on manufacture, sale, or distribution. Product compliant with IP 2022 monograph standards.	https://cdsco.gov.in/opencms/opencms/en/Notifications/Gazette-Notifications/	t	2026-08-30 12:47:11.936566+05:30	2026-08-30 12:47:11.936566+05:30
2	2	\N	PROHIBITED	Central Drugs Standard Control Organisation (CDSCO), Ministry of Health & Family Welfare, Government of India	S.O. 3285(E) to S.O. 3440(E) dated 02.08.2024	2024-08-02	The Fixed Dose Combination of Amoxicillin Trihydrate and Potassium Clavulanate in the ratio 500mg:125mg (625mg tablet) has been prohibited under Section 26A of the Drugs and Cosmetics Act, 1940, vide Gazette Notification S.O. 3285(E). The FDC was found to lack therapeutic justification and poses risk to public health. All existing stock must be recalled and destroyed per CDSCO directives. Refer CDSCO Drug Alert August 2024 (NSQ Lab: CDL Kolkata) for batch-specific quality failures.	https://cdsco.gov.in/opencms/opencms/en/Notifications/Gazette-Notifications/	t	2026-08-30 12:47:11.936566+05:30	2026-08-30 12:47:11.936566+05:30
3	3	4	RECALLED	Central Drugs Standard Control Organisation (CDSCO), Ministry of Health & Family Welfare, Government of India	Drug Alert File No. IMP-12018/19/2025 (NSQ Alert July 2025)	2025-07-18	Batch B-MED003-01 of Dextromethorphan Hydrobromide Syrup IP declared Not of Standard Quality (NSQ) by Central Drug Testing Laboratory (CDL), Kolkata. Active ingredient content (Dextromethorphan HBr) found below specified limits during routine surveillance testing. Mandatory recall ordered under Section 26A of the Drugs and Cosmetics Act, 1940, in accordance with CDSCO Guidelines on Recall and Rapid Alert System for Drugs. All holders of this batch must cease distribution and quarantine remaining stock immediately.	https://cdsco.gov.in/opencms/opencms/en/Alerts/	t	2026-08-30 12:47:11.936566+05:30	2026-08-30 12:47:11.936566+05:30
4	4	\N	PROHIBITED	Central Drugs Standard Control Organisation (CDSCO), Ministry of Health & Family Welfare, Government of India	S.O. 3068(E) dated 11.06.2026	2026-06-15	FDC lacks therapeutic justification. Prohibited under Section 26A of the Drugs and Cosmetics Act, 1940.	https://cdsco.gov.in/opencms/opencms/en/Drugs/FDC/	f	2026-08-30 12:47:54.389411+05:30	2026-08-30 12:47:54.389411+05:30
5	5	\N	PROHIBITED	Central Drugs Standard Control Organisation (CDSCO), Ministry of Health & Family Welfare, Government of India	S.O. 3069(E) dated 11.06.2026	2026-06-15	Dermal preparation lacks therapeutic justification. Prohibited under Section 26A of the D&C Act, 1940.	https://cdsco.gov.in/opencms/opencms/en/Drugs/FDC/	f	2026-08-30 12:47:54.389411+05:30	2026-08-30 12:47:54.389411+05:30
6	6	\N	PROHIBITED	Central Drugs Standard Control Organisation (CDSCO), Ministry of Health & Family Welfare, Government of India	S.O. 3070(E) dated 11.06.2026	2026-06-15	Dermal preparation lacks therapeutic justification. Prohibited under Section 26A of the D&C Act, 1940.	https://cdsco.gov.in/opencms/opencms/en/Drugs/FDC/	f	2026-08-30 12:47:54.389411+05:30	2026-08-30 12:47:54.389411+05:30
7	7	\N	PROHIBITED	Central Drugs Standard Control Organisation (CDSCO), Ministry of Health & Family Welfare, Government of India	S.O. 3071(E) dated 11.06.2026	2026-06-15	Dermal preparation lacks therapeutic justification. Prohibited under Section 26A of the D&C Act, 1940.	https://cdsco.gov.in/opencms/opencms/en/Drugs/FDC/	f	2026-08-30 12:47:54.389411+05:30	2026-08-30 12:47:54.389411+05:30
8	8	\N	PROHIBITED	Central Drugs Standard Control Organisation (CDSCO), Ministry of Health & Family Welfare, Government of India	S.O. 3072(E) dated 11.06.2026	2026-06-15	Dermal preparation lacks therapeutic justification. Prohibited under Section 26A of the D&C Act, 1940.	https://cdsco.gov.in/opencms/opencms/en/Drugs/FDC/	f	2026-08-30 12:47:54.389411+05:30	2026-08-30 12:47:54.389411+05:30
9	9	\N	PROHIBITED	Central Drugs Standard Control Organisation (CDSCO), Ministry of Health & Family Welfare, Government of India	S.O. 3073(E) dated 11.06.2026	2026-06-15	Dermal preparation lacks therapeutic justification. Prohibited under Section 26A of the D&C Act, 1940.	https://cdsco.gov.in/opencms/opencms/en/Drugs/FDC/	f	2026-08-30 12:47:54.389411+05:30	2026-08-30 12:47:54.389411+05:30
10	10	\N	PROHIBITED	Central Drugs Standard Control Organisation (CDSCO), Ministry of Health & Family Welfare, Government of India	S.O. 3074(E) dated 11.06.2026	2026-06-15	Dermal preparation lacks therapeutic justification. Prohibited under Section 26A of the D&C Act, 1940.	https://cdsco.gov.in/opencms/opencms/en/Drugs/FDC/	f	2026-08-30 12:47:54.389411+05:30	2026-08-30 12:47:54.389411+05:30
11	11	\N	PROHIBITED	Central Drugs Standard Control Organisation (CDSCO), Ministry of Health & Family Welfare, Government of India	S.O. 3075(E) dated 11.06.2026	2026-06-15	FDC lacks therapeutic justification. Prohibited under Section 26A of the D&C Act, 1940.	https://cdsco.gov.in/opencms/opencms/en/Drugs/FDC/	f	2026-08-30 12:47:54.389411+05:30	2026-08-30 12:47:54.389411+05:30
12	12	\N	PROHIBITED	Central Drugs Standard Control Organisation (CDSCO), Ministry of Health & Family Welfare, Government of India	S.O. 3076(E) dated 11.06.2026	2026-06-15	FDC lacks therapeutic justification. Prohibited under Section 26A of the D&C Act, 1940.	https://cdsco.gov.in/opencms/opencms/en/Drugs/FDC/	f	2026-08-30 12:47:54.389411+05:30	2026-08-30 12:47:54.389411+05:30
13	13	\N	PROHIBITED	Central Drugs Standard Control Organisation (CDSCO), Ministry of Health & Family Welfare, Government of India	S.O. 3077(E) dated 11.06.2026	2026-06-15	FDC lacks therapeutic justification. Prohibited under Section 26A of the D&C Act, 1940.	https://cdsco.gov.in/opencms/opencms/en/Drugs/FDC/	f	2026-08-30 12:47:54.389411+05:30	2026-08-30 12:47:54.389411+05:30
14	14	\N	PROHIBITED	Central Drugs Standard Control Organisation (CDSCO), Ministry of Health & Family Welfare, Government of India	S.O. 3078(E) dated 11.06.2026	2026-06-15	FDC lacks therapeutic justification. Prohibited under Section 26A of the D&C Act, 1940.	https://cdsco.gov.in/opencms/opencms/en/Drugs/FDC/	f	2026-08-30 12:47:54.389411+05:30	2026-08-30 12:47:54.389411+05:30
15	15	\N	PROHIBITED	Central Drugs Standard Control Organisation (CDSCO), Ministry of Health & Family Welfare, Government of India	S.O. 3079(E) dated 11.06.2026	2026-06-15	FDC lacks therapeutic justification. Prohibited under Section 26A of the D&C Act, 1940.	https://cdsco.gov.in/opencms/opencms/en/Drugs/FDC/	f	2026-08-30 12:47:54.389411+05:30	2026-08-30 12:47:54.389411+05:30
16	16	\N	PROHIBITED	Central Drugs Standard Control Organisation (CDSCO), Ministry of Health & Family Welfare, Government of India	S.O. 3080(E) dated 11.06.2026	2026-06-15	FDC lacks therapeutic justification. Prohibited under Section 26A of the D&C Act, 1940.	https://cdsco.gov.in/opencms/opencms/en/Drugs/FDC/	f	2026-08-30 12:47:54.389411+05:30	2026-08-30 12:47:54.389411+05:30
17	17	\N	PROHIBITED	Central Drugs Standard Control Organisation (CDSCO), Ministry of Health & Family Welfare, Government of India	S.O. 3081(E) dated 11.06.2026	2026-06-15	FDC lacks therapeutic justification. Prohibited under Section 26A of the D&C Act, 1940.	https://cdsco.gov.in/opencms/opencms/en/Drugs/FDC/	f	2026-08-30 12:47:54.389411+05:30	2026-08-30 12:47:54.389411+05:30
18	18	\N	PROHIBITED	Central Drugs Standard Control Organisation (CDSCO), Ministry of Health & Family Welfare, Government of India	S.O. 3082(E) dated 11.06.2026	2026-06-15	FDC lacks therapeutic justification. Prohibited under Section 26A of the D&C Act, 1940.	https://cdsco.gov.in/opencms/opencms/en/Drugs/FDC/	f	2026-08-30 12:47:54.389411+05:30	2026-08-30 12:47:54.389411+05:30
19	19	\N	PROHIBITED	Central Drugs Standard Control Organisation (CDSCO), Ministry of Health & Family Welfare, Government of India	S.O. 3083(E) dated 11.06.2026	2026-06-15	FDC lacks therapeutic justification. Prohibited under Section 26A of the D&C Act, 1940.	https://cdsco.gov.in/opencms/opencms/en/Drugs/FDC/	f	2026-08-30 12:47:54.389411+05:30	2026-08-30 12:47:54.389411+05:30
20	20	\N	PROHIBITED	Central Drugs Standard Control Organisation (CDSCO), Ministry of Health & Family Welfare, Government of India	S.O. 3285(E) to S.O. 3440(E) dated 02.08.2024	2024-08-02	FDC lacks therapeutic justification. Prohibited under Section 26A of the D&C Act, 1940.	https://cdsco.gov.in/opencms/opencms/en/Drugs/FDC/	f	2026-08-30 12:47:54.389411+05:30	2026-08-30 12:47:54.389411+05:30
21	21	\N	PROHIBITED	Central Drugs Standard Control Organisation (CDSCO), Ministry of Health & Family Welfare, Government of India	S.O. 3285(E) to S.O. 3440(E) dated 02.08.2024	2024-08-02	FDC lacks therapeutic justification. Prohibited under Section 26A of the D&C Act, 1940.	https://cdsco.gov.in/opencms/opencms/en/Drugs/FDC/	f	2026-08-30 12:47:54.389411+05:30	2026-08-30 12:47:54.389411+05:30
22	22	\N	PROHIBITED	Central Drugs Standard Control Organisation (CDSCO), Ministry of Health & Family Welfare, Government of India	S.O. 3285(E) to S.O. 3440(E) dated 02.08.2024	2024-08-02	FDC lacks therapeutic justification. Prohibited under Section 26A of the D&C Act, 1940.	https://cdsco.gov.in/opencms/opencms/en/Drugs/FDC/	f	2026-08-30 12:47:54.389411+05:30	2026-08-30 12:47:54.389411+05:30
23	23	\N	PROHIBITED	Central Drugs Standard Control Organisation (CDSCO), Ministry of Health & Family Welfare, Government of India	S.O. 3285(E) to S.O. 3440(E) dated 02.08.2024	2024-08-02	FDC lacks therapeutic justification. Prohibited under Section 26A of the D&C Act, 1940.	https://cdsco.gov.in/opencms/opencms/en/Drugs/FDC/	f	2026-08-30 12:47:54.389411+05:30	2026-08-30 12:47:54.389411+05:30
24	24	\N	PROHIBITED	Central Drugs Standard Control Organisation (CDSCO), Ministry of Health & Family Welfare, Government of India	S.O. 3285(E) to S.O. 3440(E) dated 02.08.2024	2024-08-02	FDC lacks therapeutic justification. Prohibited under Section 26A of the D&C Act, 1940.	https://cdsco.gov.in/opencms/opencms/en/Drugs/FDC/	f	2026-08-30 12:47:54.389411+05:30	2026-08-30 12:47:54.389411+05:30
25	25	\N	PROHIBITED	Central Drugs Standard Control Organisation (CDSCO), Ministry of Health & Family Welfare, Government of India	S.O. 3285(E) to S.O. 3440(E) dated 02.08.2024	2024-08-02	FDC lacks therapeutic justification. Prohibited under Section 26A of the D&C Act, 1940.	https://cdsco.gov.in/opencms/opencms/en/Drugs/FDC/	f	2026-08-30 12:47:54.389411+05:30	2026-08-30 12:47:54.389411+05:30
26	26	5	RECALLED	Central Drugs Standard Control Organisation (CDSCO), Ministry of Health & Family Welfare, Government of India	CDSCO NSQ Alert - March 2026	2025-08-01	Batch PAN2025001 declared Not of Standard Quality (NSQ) by CDL, Kolkata. Dissolution failure - Below specified limits. Mandatory recall under Section 26A of the D&C Act, 1940.	https://cdsco.gov.in/opencms/opencms/en/Notifications/nsq-drugs/	f	2026-08-30 12:47:54.389411+05:30	2026-08-30 12:47:54.389411+05:30
27	27	6	RECALLED	Central Drugs Standard Control Organisation (CDSCO), Ministry of Health & Family Welfare, Government of India	CDSCO NSQ Alert - March 2026	2025-06-15	Batch MTX2025001 declared Not of Standard Quality (NSQ) by CDL, Kolkata. Assay non-compliance - Active ingredient content below specified limits. Mandatory recall under Section 26A of the D&C Act, 1940.	https://cdsco.gov.in/opencms/opencms/en/Notifications/nsq-drugs/	f	2026-08-30 12:47:54.389411+05:30	2026-08-30 12:47:54.389411+05:30
28	28	7	RECALLED	Central Drugs Standard Control Organisation (CDSCO), Ministry of Health & Family Welfare, Government of India	CDSCO NSQ Alert - March 2026	2025-09-01	Batch CAL2025001 declared Not of Standard Quality (NSQ) by CDL, Kolkata. Content uniformity failure. Mandatory recall under Section 26A of the D&C Act, 1940.	https://cdsco.gov.in/opencms/opencms/en/Notifications/nsq-drugs/	f	2026-08-30 12:47:54.389411+05:30	2026-08-30 12:47:54.389411+05:30
29	29	8	RECALLED	Central Drugs Standard Control Organisation (CDSCO), Ministry of Health & Family Welfare, Government of India	CDSCO NSQ Alert - March 2026	2025-07-01	Batch CLP2025001 declared Not of Standard Quality (NSQ) by CDL, Kolkata. Dissolution failure - Below specified limits. Mandatory recall under Section 26A of the D&C Act, 1940.	https://cdsco.gov.in/opencms/opencms/en/Notifications/nsq-drugs/	f	2026-08-30 12:47:54.389411+05:30	2026-08-30 12:47:54.389411+05:30
30	30	9	RECALLED	Central Drugs Standard Control Organisation (CDSCO), Ministry of Health & Family Welfare, Government of India	CDSCO NSQ Alert - March 2026	2025-05-01	Batch TER2025001 declared Not of Standard Quality (NSQ) by CDL, Kolkata. Assay non-compliance - Active ingredient content below specified limits. Mandatory recall under Section 26A of the D&C Act, 1940.	https://cdsco.gov.in/opencms/opencms/en/Notifications/nsq-drugs/	f	2026-08-30 12:47:54.389411+05:30	2026-08-30 12:47:54.389411+05:30
31	31	10	RECALLED	Central Drugs Standard Control Organisation (CDSCO), Ministry of Health & Family Welfare, Government of India	CDSCO NSQ Alert - March 2026	2025-10-01	Batch AMB2025001 declared Not of Standard Quality (NSQ) by CDL, Kolkata. Microbial contamination - Total aerobic microbial count exceeds limits. Mandatory recall under Section 26A of the D&C Act, 1940.	https://cdsco.gov.in/opencms/opencms/en/Notifications/nsq-drugs/	f	2026-08-30 12:47:54.389411+05:30	2026-08-30 12:47:54.389411+05:30
32	32	11	RECALLED	Central Drugs Standard Control Organisation (CDSCO), Ministry of Health & Family Welfare, Government of India	CDSCO NSQ Alert - March 2026	2025-11-01	Batch GUA2025001 declared Not of Standard Quality (NSQ) by State DT Lab, Maharashtra. Identification test failure - Active ingredient not detected. Mandatory recall under Section 26A of the D&C Act, 1940.	https://cdsco.gov.in/opencms/opencms/en/Notifications/nsq-drugs/	f	2026-08-30 12:47:54.389411+05:30	2026-08-30 12:47:54.389411+05:30
33	33	12	RECALLED	Central Drugs Standard Control Organisation (CDSCO), Ministry of Health & Family Welfare, Government of India	CDSCO NSQ Alert - March 2026	2025-09-15	Batch LEV2025001 declared Not of Standard Quality (NSQ) by CDL, Kolkata. Assay non-compliance - Active ingredient content below specified limits. Mandatory recall under Section 26A of the D&C Act, 1940.	https://cdsco.gov.in/opencms/opencms/en/Notifications/nsq-drugs/	f	2026-08-30 12:47:54.389411+05:30	2026-08-30 12:47:54.389411+05:30
34	34	13	RECALLED	Central Drugs Standard Control Organisation (CDSCO), Ministry of Health & Family Welfare, Government of India	CDSCO NSQ Alert - March 2026	2025-08-01	Batch ASP2025001 declared Not of Standard Quality (NSQ) by CDL, Kolkata. Dissolution failure - Below specified limits. Mandatory recall under Section 26A of the D&C Act, 1940.	https://cdsco.gov.in/opencms/opencms/en/Notifications/nsq-drugs/	f	2026-08-30 12:47:54.389411+05:30	2026-08-30 12:47:54.389411+05:30
35	35	14	RECALLED	Central Drugs Standard Control Organisation (CDSCO), Ministry of Health & Family Welfare, Government of India	CDSCO NSQ Alert - March 2026	2025-10-01	Batch IRO2025001 declared Not of Standard Quality (NSQ) by State DT Lab, Rajasthan. Content uniformity failure - Iron content variation exceeds limits. Mandatory recall under Section 26A of the D&C Act, 1940.	https://cdsco.gov.in/opencms/opencms/en/Notifications/nsq-drugs/	f	2026-08-30 12:47:54.389411+05:30	2026-08-30 12:47:54.389411+05:30
\.


--
-- Data for Name: serial_numbers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.serial_numbers (id, serial_number, batch_id, status, current_owner, created_at, updated_at) FROM stdin;
2	SN100002	2	IN_STOCK	1	2026-08-30 12:47:11.91536+05:30	2026-08-30 12:47:11.91536+05:30
3	SN100003	3	BLOCKED	1	2026-08-30 12:47:11.91536+05:30	2026-08-30 12:47:11.9575+05:30
4	SN100004	4	BLOCKED	1	2026-08-30 12:47:11.91536+05:30	2026-08-30 12:47:11.9575+05:30
5	SN200001	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
9	SN200005	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
10	SN200006	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
11	SN200007	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
12	SN200008	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
13	SN200009	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
14	SN200010	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
15	SN200011	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
16	SN200012	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
17	SN200013	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
18	SN200014	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
19	SN200015	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
20	SN200016	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
21	SN200017	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
22	SN200018	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
23	SN200019	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
24	SN200020	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
25	SN200021	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
26	SN200022	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
27	SN200023	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
28	SN200024	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
29	SN200025	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
30	SN200026	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
31	SN200027	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
32	SN200028	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
33	SN200029	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
34	SN200030	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
35	SN200031	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
36	SN200032	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
37	SN200033	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
38	SN200034	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
39	SN200035	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
40	SN200036	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
41	SN200037	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
42	SN200038	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
43	SN200039	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
44	SN200040	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
45	SN200041	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
46	SN200042	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
47	SN200043	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
48	SN200044	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
49	SN200045	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
50	SN200046	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
51	SN200047	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
52	SN200048	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
53	SN200049	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
54	SN200050	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
55	SN200051	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
56	SN200052	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
57	SN200053	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
58	SN200054	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
59	SN200055	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
60	SN200056	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
61	SN200057	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
62	SN200058	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
63	SN200059	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
64	SN200060	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
65	SN200061	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
66	SN200062	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
67	SN200063	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
68	SN200064	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
69	SN200065	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
70	SN200066	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
71	SN200067	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
72	SN200068	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
73	SN200069	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
74	SN200070	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
75	SN200071	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
76	SN200072	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
77	SN200073	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
78	SN200074	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
79	SN200075	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
80	SN200076	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
81	SN200077	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
82	SN200078	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
83	SN200079	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
84	SN200080	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
85	SN200081	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
86	SN200082	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
87	SN200083	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
88	SN200084	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
89	SN200085	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
90	SN200086	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
91	SN200087	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
92	SN200088	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
93	SN200089	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
94	SN200090	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
95	SN200091	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
96	SN200092	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
97	SN200093	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
98	SN200094	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
99	SN200095	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
100	SN200096	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
101	SN200097	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
102	SN200098	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
103	SN200099	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
104	SN200100	17	IN_TRANSIT	\N	2026-08-30 23:31:07.308644+05:30	2026-08-30 23:31:07.308644+05:30
6	SN200002	17	IN_STOCK	1	2026-08-30 23:31:07.308644+05:30	2026-08-31 00:01:53.292818+05:30
7	SN200003	17	IN_STOCK	1	2026-08-30 23:31:07.308644+05:30	2026-08-31 00:02:47.283096+05:30
8	SN200004	17	IN_TRANSIT	2	2026-08-30 23:31:07.308644+05:30	2026-08-31 00:05:24.10596+05:30
1	SN100001	1	IN_STOCK	1	2026-08-30 12:47:11.91536+05:30	2026-09-08 13:23:15.074887+05:30
106	SN200102	18	IN_TRANSIT	\N	2026-09-09 11:14:35.479107+05:30	2026-09-09 11:14:35.479107+05:30
107	SN200103	18	IN_TRANSIT	\N	2026-09-09 11:14:35.479107+05:30	2026-09-09 11:14:35.479107+05:30
105	SN200101	18	IN_STOCK	1	2026-09-09 11:14:35.479107+05:30	2026-09-09 11:14:35.532955+05:30
109	SN200105	19	IN_TRANSIT	\N	2026-09-09 11:19:18.196106+05:30	2026-09-09 11:19:18.196106+05:30
108	SN200104	19	IN_STOCK	1	2026-09-09 11:19:18.196106+05:30	2026-09-09 11:19:18.661965+05:30
110	SN200106	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
111	SN200107	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
112	SN200108	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
113	SN200109	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
114	SN200110	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
115	SN200111	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
116	SN200112	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
117	SN200113	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
118	SN200114	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
119	SN200115	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
120	SN200116	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
121	SN200117	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
122	SN200118	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
123	SN200119	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
124	SN200120	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
125	SN200121	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
126	SN200122	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
127	SN200123	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
128	SN200124	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
129	SN200125	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
130	SN200126	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
131	SN200127	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
132	SN200128	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
133	SN200129	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
134	SN200130	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
135	SN200131	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
136	SN200132	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
137	SN200133	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
138	SN200134	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
139	SN200135	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
140	SN200136	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
141	SN200137	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
142	SN200138	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
143	SN200139	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
144	SN200140	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
145	SN200141	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
146	SN200142	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
147	SN200143	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
148	SN200144	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
149	SN200145	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
150	SN200146	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
151	SN200147	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
152	SN200148	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
153	SN200149	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
154	SN200150	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
155	SN200151	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
156	SN200152	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
157	SN200153	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
158	SN200154	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
159	SN200155	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
160	SN200156	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
161	SN200157	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
162	SN200158	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
163	SN200159	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
164	SN200160	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
165	SN200161	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
166	SN200162	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
167	SN200163	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
168	SN200164	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
169	SN200165	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
170	SN200166	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
171	SN200167	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
172	SN200168	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
173	SN200169	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
174	SN200170	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
175	SN200171	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
176	SN200172	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
177	SN200173	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
178	SN200174	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
179	SN200175	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
180	SN200176	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
181	SN200177	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
182	SN200178	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
183	SN200179	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
184	SN200180	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
185	SN200181	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
186	SN200182	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
187	SN200183	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
188	SN200184	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
189	SN200185	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
190	SN200186	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
191	SN200187	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
192	SN200188	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
193	SN200189	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
194	SN200190	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
195	SN200191	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
196	SN200192	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
197	SN200193	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
198	SN200194	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
199	SN200195	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
200	SN200196	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
201	SN200197	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
202	SN200198	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
203	SN200199	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
204	SN200200	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
205	SN200201	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
206	SN200202	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
207	SN200203	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
208	SN200204	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
209	SN200205	20	IN_TRANSIT	\N	2026-09-09 11:21:51.541408+05:30	2026-09-09 11:21:51.541408+05:30
211	SN200207	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
212	SN200208	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
213	SN200209	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
214	SN200210	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
215	SN200211	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
216	SN200212	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
217	SN200213	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
218	SN200214	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
219	SN200215	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
220	SN200216	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
221	SN200217	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
222	SN200218	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
223	SN200219	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
224	SN200220	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
225	SN200221	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
226	SN200222	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
227	SN200223	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
228	SN200224	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
229	SN200225	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
230	SN200226	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
231	SN200227	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
232	SN200228	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
233	SN200229	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
234	SN200230	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
235	SN200231	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
236	SN200232	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
237	SN200233	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
238	SN200234	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
239	SN200235	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
240	SN200236	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
241	SN200237	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
242	SN200238	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
243	SN200239	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
244	SN200240	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
245	SN200241	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
246	SN200242	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
247	SN200243	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
248	SN200244	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
249	SN200245	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
250	SN200246	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
251	SN200247	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
252	SN200248	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
253	SN200249	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
254	SN200250	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
255	SN200251	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
256	SN200252	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
257	SN200253	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
258	SN200254	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
259	SN200255	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
260	SN200256	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
261	SN200257	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
262	SN200258	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
263	SN200259	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
264	SN200260	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
265	SN200261	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
266	SN200262	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
267	SN200263	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
268	SN200264	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
269	SN200265	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
270	SN200266	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
271	SN200267	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
272	SN200268	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
273	SN200269	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
274	SN200270	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
275	SN200271	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
276	SN200272	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
277	SN200273	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
278	SN200274	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
279	SN200275	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
280	SN200276	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
281	SN200277	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
282	SN200278	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
283	SN200279	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
284	SN200280	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
285	SN200281	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
286	SN200282	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
287	SN200283	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
288	SN200284	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
289	SN200285	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
290	SN200286	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
291	SN200287	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
292	SN200288	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
293	SN200289	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
294	SN200290	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
295	SN200291	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
296	SN200292	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
297	SN200293	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
298	SN200294	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
299	SN200295	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
300	SN200296	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
301	SN200297	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
302	SN200298	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
303	SN200299	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
304	SN200300	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
305	SN200301	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
306	SN200302	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
307	SN200303	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
308	SN200304	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
309	SN200305	21	IN_TRANSIT	\N	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:24:59.226362+05:30
210	SN200206	21	IN_STOCK	1	2026-09-09 11:24:59.226362+05:30	2026-09-09 11:28:06.080102+05:30
310	SN200306	22	IN_TRANSIT	\N	2026-09-09 12:46:08.532769+05:30	2026-09-09 12:46:08.532769+05:30
311	SN200307	22	IN_TRANSIT	\N	2026-09-09 12:46:08.532769+05:30	2026-09-09 12:46:08.532769+05:30
312	SN200308	22	IN_TRANSIT	\N	2026-09-09 12:46:08.532769+05:30	2026-09-09 12:46:08.532769+05:30
313	SN200309	22	IN_TRANSIT	\N	2026-09-09 12:46:08.532769+05:30	2026-09-09 12:46:08.532769+05:30
314	SN200310	22	IN_TRANSIT	\N	2026-09-09 12:46:08.532769+05:30	2026-09-09 12:46:08.532769+05:30
315	SN200311	22	IN_TRANSIT	\N	2026-09-09 12:46:08.532769+05:30	2026-09-09 12:46:08.532769+05:30
316	SN200312	22	IN_TRANSIT	\N	2026-09-09 12:46:08.532769+05:30	2026-09-09 12:46:08.532769+05:30
317	SN200313	22	IN_TRANSIT	\N	2026-09-09 12:46:08.532769+05:30	2026-09-09 12:46:08.532769+05:30
318	SN200314	22	IN_TRANSIT	\N	2026-09-09 12:46:08.532769+05:30	2026-09-09 12:46:08.532769+05:30
319	SN200315	22	IN_TRANSIT	\N	2026-09-09 12:46:08.532769+05:30	2026-09-09 12:46:08.532769+05:30
320	SN200316	22	IN_TRANSIT	\N	2026-09-09 12:46:08.532769+05:30	2026-09-09 12:46:08.532769+05:30
321	SN200317	22	IN_TRANSIT	\N	2026-09-09 12:46:08.532769+05:30	2026-09-09 12:46:08.532769+05:30
322	SN200318	22	IN_TRANSIT	\N	2026-09-09 12:46:08.532769+05:30	2026-09-09 12:46:08.532769+05:30
323	SN200319	22	IN_TRANSIT	\N	2026-09-09 12:46:08.532769+05:30	2026-09-09 12:46:08.532769+05:30
324	SN200320	22	IN_TRANSIT	\N	2026-09-09 12:46:08.532769+05:30	2026-09-09 12:46:08.532769+05:30
325	SN200321	22	IN_TRANSIT	\N	2026-09-09 12:46:08.532769+05:30	2026-09-09 12:46:08.532769+05:30
326	SN200322	22	IN_TRANSIT	\N	2026-09-09 12:46:08.532769+05:30	2026-09-09 12:46:08.532769+05:30
327	SN200323	22	IN_TRANSIT	\N	2026-09-09 12:46:08.532769+05:30	2026-09-09 12:46:08.532769+05:30
328	SN200324	22	IN_TRANSIT	\N	2026-09-09 12:46:08.532769+05:30	2026-09-09 12:46:08.532769+05:30
329	SN200325	22	IN_TRANSIT	\N	2026-09-09 12:46:08.532769+05:30	2026-09-09 12:46:08.532769+05:30
330	SN200326	22	IN_TRANSIT	\N	2026-09-09 12:46:08.532769+05:30	2026-09-09 12:46:08.532769+05:30
331	SN200327	22	IN_TRANSIT	\N	2026-09-09 12:46:08.532769+05:30	2026-09-09 12:46:08.532769+05:30
332	SN200328	22	IN_TRANSIT	\N	2026-09-09 12:46:08.532769+05:30	2026-09-09 12:46:08.532769+05:30
333	SN200329	22	IN_TRANSIT	\N	2026-09-09 12:46:08.532769+05:30	2026-09-09 12:46:08.532769+05:30
334	SN200330	22	IN_TRANSIT	\N	2026-09-09 12:46:08.532769+05:30	2026-09-09 12:46:08.532769+05:30
335	SN200331	22	IN_TRANSIT	\N	2026-09-09 12:46:08.532769+05:30	2026-09-09 12:46:08.532769+05:30
336	SN200332	22	IN_TRANSIT	\N	2026-09-09 12:46:08.532769+05:30	2026-09-09 12:46:08.532769+05:30
337	SN200333	22	IN_TRANSIT	\N	2026-09-09 12:46:08.532769+05:30	2026-09-09 12:46:08.532769+05:30
338	SN200334	22	IN_TRANSIT	\N	2026-09-09 12:46:08.532769+05:30	2026-09-09 12:46:08.532769+05:30
339	SN200335	22	IN_TRANSIT	\N	2026-09-09 12:46:08.532769+05:30	2026-09-09 12:46:08.532769+05:30
340	SN200336	22	IN_TRANSIT	\N	2026-09-09 12:46:08.532769+05:30	2026-09-09 12:46:08.532769+05:30
341	SN200337	22	IN_TRANSIT	\N	2026-09-09 12:46:08.532769+05:30	2026-09-09 12:46:08.532769+05:30
342	SN200338	22	IN_TRANSIT	\N	2026-09-09 12:46:08.532769+05:30	2026-09-09 12:46:08.532769+05:30
343	SN200339	22	IN_TRANSIT	\N	2026-09-09 12:46:08.532769+05:30	2026-09-09 12:46:08.532769+05:30
344	SN200340	22	IN_TRANSIT	\N	2026-09-09 12:46:08.532769+05:30	2026-09-09 12:46:08.532769+05:30
345	SN200341	22	IN_TRANSIT	\N	2026-09-09 12:46:08.532769+05:30	2026-09-09 12:46:08.532769+05:30
346	SN200342	22	IN_TRANSIT	\N	2026-09-09 12:46:08.532769+05:30	2026-09-09 12:46:08.532769+05:30
347	SN200343	22	IN_TRANSIT	\N	2026-09-09 12:46:08.532769+05:30	2026-09-09 12:46:08.532769+05:30
348	SN200344	22	IN_TRANSIT	\N	2026-09-09 12:46:08.532769+05:30	2026-09-09 12:46:08.532769+05:30
349	SN200345	22	IN_TRANSIT	\N	2026-09-09 12:46:08.532769+05:30	2026-09-09 12:46:08.532769+05:30
350	SN200346	22	IN_TRANSIT	\N	2026-09-09 12:46:08.532769+05:30	2026-09-09 12:46:08.532769+05:30
351	SN200347	22	IN_TRANSIT	\N	2026-09-09 12:46:08.532769+05:30	2026-09-09 12:46:08.532769+05:30
352	SN200348	22	IN_TRANSIT	\N	2026-09-09 12:46:08.532769+05:30	2026-09-09 12:46:08.532769+05:30
353	SN200349	22	IN_TRANSIT	\N	2026-09-09 12:46:08.532769+05:30	2026-09-09 12:46:08.532769+05:30
354	SN200350	22	IN_TRANSIT	\N	2026-09-09 12:46:08.532769+05:30	2026-09-09 12:46:08.532769+05:30
355	SN200351	22	IN_TRANSIT	\N	2026-09-09 12:46:08.532769+05:30	2026-09-09 12:46:08.532769+05:30
356	SN200352	22	IN_TRANSIT	\N	2026-09-09 12:46:08.532769+05:30	2026-09-09 12:46:08.532769+05:30
357	SN200353	22	IN_TRANSIT	\N	2026-09-09 12:46:08.532769+05:30	2026-09-09 12:46:08.532769+05:30
358	SN200354	22	IN_TRANSIT	\N	2026-09-09 12:46:08.532769+05:30	2026-09-09 12:46:08.532769+05:30
359	SN200355	22	IN_TRANSIT	\N	2026-09-09 12:46:08.532769+05:30	2026-09-09 12:46:08.532769+05:30
360	SN200356	23	IN_TRANSIT	\N	2026-09-09 13:05:06.483394+05:30	2026-09-09 13:05:06.483394+05:30
361	SN200357	23	IN_TRANSIT	\N	2026-09-09 13:05:06.483394+05:30	2026-09-09 13:05:06.483394+05:30
362	SN200358	23	IN_TRANSIT	\N	2026-09-09 13:05:06.483394+05:30	2026-09-09 13:05:06.483394+05:30
363	SN200359	23	IN_TRANSIT	\N	2026-09-09 13:05:06.483394+05:30	2026-09-09 13:05:06.483394+05:30
364	SN200360	23	IN_TRANSIT	\N	2026-09-09 13:05:06.483394+05:30	2026-09-09 13:05:06.483394+05:30
365	SN200361	23	IN_TRANSIT	\N	2026-09-09 13:05:06.483394+05:30	2026-09-09 13:05:06.483394+05:30
366	SN200362	23	IN_TRANSIT	\N	2026-09-09 13:05:06.483394+05:30	2026-09-09 13:05:06.483394+05:30
367	SN200363	23	IN_TRANSIT	\N	2026-09-09 13:05:06.483394+05:30	2026-09-09 13:05:06.483394+05:30
368	SN200364	23	IN_TRANSIT	\N	2026-09-09 13:05:06.483394+05:30	2026-09-09 13:05:06.483394+05:30
369	SN200365	23	IN_TRANSIT	\N	2026-09-09 13:05:06.483394+05:30	2026-09-09 13:05:06.483394+05:30
370	SN200366	23	IN_TRANSIT	\N	2026-09-09 13:05:06.483394+05:30	2026-09-09 13:05:06.483394+05:30
371	SN200367	23	IN_TRANSIT	\N	2026-09-09 13:05:06.483394+05:30	2026-09-09 13:05:06.483394+05:30
372	SN200368	23	IN_TRANSIT	\N	2026-09-09 13:05:06.483394+05:30	2026-09-09 13:05:06.483394+05:30
373	SN200369	23	IN_TRANSIT	\N	2026-09-09 13:05:06.483394+05:30	2026-09-09 13:05:06.483394+05:30
374	SN200370	23	IN_TRANSIT	\N	2026-09-09 13:05:06.483394+05:30	2026-09-09 13:05:06.483394+05:30
375	SN200371	23	IN_TRANSIT	\N	2026-09-09 13:05:06.483394+05:30	2026-09-09 13:05:06.483394+05:30
376	SN200372	23	IN_TRANSIT	\N	2026-09-09 13:05:06.483394+05:30	2026-09-09 13:05:06.483394+05:30
377	SN200373	23	IN_TRANSIT	\N	2026-09-09 13:05:06.483394+05:30	2026-09-09 13:05:06.483394+05:30
378	SN200374	23	IN_TRANSIT	\N	2026-09-09 13:05:06.483394+05:30	2026-09-09 13:05:06.483394+05:30
379	SN200375	23	IN_TRANSIT	\N	2026-09-09 13:05:06.483394+05:30	2026-09-09 13:05:06.483394+05:30
380	SN200376	23	IN_TRANSIT	\N	2026-09-09 13:05:06.483394+05:30	2026-09-09 13:05:06.483394+05:30
381	SN200377	23	IN_TRANSIT	\N	2026-09-09 13:05:06.483394+05:30	2026-09-09 13:05:06.483394+05:30
382	SN200378	23	IN_TRANSIT	\N	2026-09-09 13:05:06.483394+05:30	2026-09-09 13:05:06.483394+05:30
383	SN200379	23	IN_TRANSIT	\N	2026-09-09 13:05:06.483394+05:30	2026-09-09 13:05:06.483394+05:30
384	SN200380	23	IN_TRANSIT	\N	2026-09-09 13:05:06.483394+05:30	2026-09-09 13:05:06.483394+05:30
385	SN200381	23	IN_TRANSIT	\N	2026-09-09 13:05:06.483394+05:30	2026-09-09 13:05:06.483394+05:30
386	SN200382	23	IN_TRANSIT	\N	2026-09-09 13:05:06.483394+05:30	2026-09-09 13:05:06.483394+05:30
387	SN200383	23	IN_TRANSIT	\N	2026-09-09 13:05:06.483394+05:30	2026-09-09 13:05:06.483394+05:30
388	SN200384	23	IN_TRANSIT	\N	2026-09-09 13:05:06.483394+05:30	2026-09-09 13:05:06.483394+05:30
389	SN200385	23	IN_TRANSIT	\N	2026-09-09 13:05:06.483394+05:30	2026-09-09 13:05:06.483394+05:30
390	SN200386	23	IN_TRANSIT	\N	2026-09-09 13:05:06.483394+05:30	2026-09-09 13:05:06.483394+05:30
391	SN200387	23	IN_TRANSIT	\N	2026-09-09 13:05:06.483394+05:30	2026-09-09 13:05:06.483394+05:30
392	SN200388	23	IN_TRANSIT	\N	2026-09-09 13:05:06.483394+05:30	2026-09-09 13:05:06.483394+05:30
393	SN200389	23	IN_TRANSIT	\N	2026-09-09 13:05:06.483394+05:30	2026-09-09 13:05:06.483394+05:30
394	SN200390	23	IN_TRANSIT	\N	2026-09-09 13:05:06.483394+05:30	2026-09-09 13:05:06.483394+05:30
395	SN200391	23	IN_TRANSIT	\N	2026-09-09 13:05:06.483394+05:30	2026-09-09 13:05:06.483394+05:30
396	SN200392	23	IN_TRANSIT	\N	2026-09-09 13:05:06.483394+05:30	2026-09-09 13:05:06.483394+05:30
397	SN200393	23	IN_TRANSIT	\N	2026-09-09 13:05:06.483394+05:30	2026-09-09 13:05:06.483394+05:30
398	SN200394	23	IN_TRANSIT	\N	2026-09-09 13:05:06.483394+05:30	2026-09-09 13:05:06.483394+05:30
399	SN200395	23	IN_TRANSIT	\N	2026-09-09 13:05:06.483394+05:30	2026-09-09 13:05:06.483394+05:30
400	SN200396	23	IN_TRANSIT	\N	2026-09-09 13:05:06.483394+05:30	2026-09-09 13:05:06.483394+05:30
401	SN200397	23	IN_TRANSIT	\N	2026-09-09 13:05:06.483394+05:30	2026-09-09 13:05:06.483394+05:30
402	SN200398	23	IN_TRANSIT	\N	2026-09-09 13:05:06.483394+05:30	2026-09-09 13:05:06.483394+05:30
403	SN200399	23	IN_TRANSIT	\N	2026-09-09 13:05:06.483394+05:30	2026-09-09 13:05:06.483394+05:30
404	SN200400	23	IN_TRANSIT	\N	2026-09-09 13:05:06.483394+05:30	2026-09-09 13:05:06.483394+05:30
405	SN200401	23	IN_TRANSIT	\N	2026-09-09 13:05:06.483394+05:30	2026-09-09 13:05:06.483394+05:30
406	SN200402	23	IN_TRANSIT	\N	2026-09-09 13:05:06.483394+05:30	2026-09-09 13:05:06.483394+05:30
407	SN200403	23	IN_TRANSIT	\N	2026-09-09 13:05:06.483394+05:30	2026-09-09 13:05:06.483394+05:30
408	SN200404	23	IN_TRANSIT	\N	2026-09-09 13:05:06.483394+05:30	2026-09-09 13:05:06.483394+05:30
409	SN200405	23	IN_TRANSIT	\N	2026-09-09 13:05:06.483394+05:30	2026-09-09 13:05:06.483394+05:30
411	SN200407	24	IN_TRANSIT	\N	2026-09-09 13:40:26.903304+05:30	2026-09-09 13:40:26.903304+05:30
412	SN200408	24	IN_TRANSIT	\N	2026-09-09 13:40:26.903304+05:30	2026-09-09 13:40:26.903304+05:30
413	SN200409	24	IN_TRANSIT	\N	2026-09-09 13:40:26.903304+05:30	2026-09-09 13:40:26.903304+05:30
414	SN200410	24	IN_TRANSIT	\N	2026-09-09 13:40:26.903304+05:30	2026-09-09 13:40:26.903304+05:30
415	SN200411	24	IN_TRANSIT	\N	2026-09-09 13:40:26.903304+05:30	2026-09-09 13:40:26.903304+05:30
416	SN200412	24	IN_TRANSIT	\N	2026-09-09 13:40:26.903304+05:30	2026-09-09 13:40:26.903304+05:30
417	SN200413	24	IN_TRANSIT	\N	2026-09-09 13:40:26.903304+05:30	2026-09-09 13:40:26.903304+05:30
418	SN200414	24	IN_TRANSIT	\N	2026-09-09 13:40:26.903304+05:30	2026-09-09 13:40:26.903304+05:30
419	SN200415	24	IN_TRANSIT	\N	2026-09-09 13:40:26.903304+05:30	2026-09-09 13:40:26.903304+05:30
420	SN200416	24	IN_TRANSIT	\N	2026-09-09 13:40:26.903304+05:30	2026-09-09 13:40:26.903304+05:30
421	SN200417	24	IN_TRANSIT	\N	2026-09-09 13:40:26.903304+05:30	2026-09-09 13:40:26.903304+05:30
422	SN200418	24	IN_TRANSIT	\N	2026-09-09 13:40:26.903304+05:30	2026-09-09 13:40:26.903304+05:30
423	SN200419	24	IN_TRANSIT	\N	2026-09-09 13:40:26.903304+05:30	2026-09-09 13:40:26.903304+05:30
424	SN200420	24	IN_TRANSIT	\N	2026-09-09 13:40:26.903304+05:30	2026-09-09 13:40:26.903304+05:30
425	SN200421	24	IN_TRANSIT	\N	2026-09-09 13:40:26.903304+05:30	2026-09-09 13:40:26.903304+05:30
426	SN200422	24	IN_TRANSIT	\N	2026-09-09 13:40:26.903304+05:30	2026-09-09 13:40:26.903304+05:30
427	SN200423	24	IN_TRANSIT	\N	2026-09-09 13:40:26.903304+05:30	2026-09-09 13:40:26.903304+05:30
428	SN200424	24	IN_TRANSIT	\N	2026-09-09 13:40:26.903304+05:30	2026-09-09 13:40:26.903304+05:30
429	SN200425	24	IN_TRANSIT	\N	2026-09-09 13:40:26.903304+05:30	2026-09-09 13:40:26.903304+05:30
430	SN200426	24	IN_TRANSIT	\N	2026-09-09 13:40:26.903304+05:30	2026-09-09 13:40:26.903304+05:30
431	SN200427	24	IN_TRANSIT	\N	2026-09-09 13:40:26.903304+05:30	2026-09-09 13:40:26.903304+05:30
432	SN200428	24	IN_TRANSIT	\N	2026-09-09 13:40:26.903304+05:30	2026-09-09 13:40:26.903304+05:30
433	SN200429	24	IN_TRANSIT	\N	2026-09-09 13:40:26.903304+05:30	2026-09-09 13:40:26.903304+05:30
434	SN200430	24	IN_TRANSIT	\N	2026-09-09 13:40:26.903304+05:30	2026-09-09 13:40:26.903304+05:30
435	SN200431	24	IN_TRANSIT	\N	2026-09-09 13:40:26.903304+05:30	2026-09-09 13:40:26.903304+05:30
436	SN200432	24	IN_TRANSIT	\N	2026-09-09 13:40:26.903304+05:30	2026-09-09 13:40:26.903304+05:30
437	SN200433	24	IN_TRANSIT	\N	2026-09-09 13:40:26.903304+05:30	2026-09-09 13:40:26.903304+05:30
438	SN200434	24	IN_TRANSIT	\N	2026-09-09 13:40:26.903304+05:30	2026-09-09 13:40:26.903304+05:30
439	SN200435	24	IN_TRANSIT	\N	2026-09-09 13:40:26.903304+05:30	2026-09-09 13:40:26.903304+05:30
440	SN200436	24	IN_TRANSIT	\N	2026-09-09 13:40:26.903304+05:30	2026-09-09 13:40:26.903304+05:30
441	SN200437	24	IN_TRANSIT	\N	2026-09-09 13:40:26.903304+05:30	2026-09-09 13:40:26.903304+05:30
442	SN200438	24	IN_TRANSIT	\N	2026-09-09 13:40:26.903304+05:30	2026-09-09 13:40:26.903304+05:30
443	SN200439	24	IN_TRANSIT	\N	2026-09-09 13:40:26.903304+05:30	2026-09-09 13:40:26.903304+05:30
444	SN200440	24	IN_TRANSIT	\N	2026-09-09 13:40:26.903304+05:30	2026-09-09 13:40:26.903304+05:30
445	SN200441	24	IN_TRANSIT	\N	2026-09-09 13:40:26.903304+05:30	2026-09-09 13:40:26.903304+05:30
446	SN200442	24	IN_TRANSIT	\N	2026-09-09 13:40:26.903304+05:30	2026-09-09 13:40:26.903304+05:30
447	SN200443	24	IN_TRANSIT	\N	2026-09-09 13:40:26.903304+05:30	2026-09-09 13:40:26.903304+05:30
448	SN200444	24	IN_TRANSIT	\N	2026-09-09 13:40:26.903304+05:30	2026-09-09 13:40:26.903304+05:30
449	SN200445	24	IN_TRANSIT	\N	2026-09-09 13:40:26.903304+05:30	2026-09-09 13:40:26.903304+05:30
450	SN200446	24	IN_TRANSIT	\N	2026-09-09 13:40:26.903304+05:30	2026-09-09 13:40:26.903304+05:30
451	SN200447	24	IN_TRANSIT	\N	2026-09-09 13:40:26.903304+05:30	2026-09-09 13:40:26.903304+05:30
452	SN200448	24	IN_TRANSIT	\N	2026-09-09 13:40:26.903304+05:30	2026-09-09 13:40:26.903304+05:30
453	SN200449	24	IN_TRANSIT	\N	2026-09-09 13:40:26.903304+05:30	2026-09-09 13:40:26.903304+05:30
454	SN200450	24	IN_TRANSIT	\N	2026-09-09 13:40:26.903304+05:30	2026-09-09 13:40:26.903304+05:30
455	SN200451	24	IN_TRANSIT	\N	2026-09-09 13:40:26.903304+05:30	2026-09-09 13:40:26.903304+05:30
456	SN200452	24	IN_TRANSIT	\N	2026-09-09 13:40:26.903304+05:30	2026-09-09 13:40:26.903304+05:30
457	SN200453	24	IN_TRANSIT	\N	2026-09-09 13:40:26.903304+05:30	2026-09-09 13:40:26.903304+05:30
458	SN200454	24	IN_TRANSIT	\N	2026-09-09 13:40:26.903304+05:30	2026-09-09 13:40:26.903304+05:30
459	SN200455	24	IN_TRANSIT	\N	2026-09-09 13:40:26.903304+05:30	2026-09-09 13:40:26.903304+05:30
410	SN200406	24	IN_TRANSIT	2	2026-09-09 13:40:26.903304+05:30	2026-09-09 13:42:47.332948+05:30
461	SN200457	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
462	SN200458	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
463	SN200459	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
464	SN200460	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
465	SN200461	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
466	SN200462	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
467	SN200463	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
468	SN200464	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
469	SN200465	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
470	SN200466	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
471	SN200467	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
460	SN200456	25	DISPENSED	2	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:50:31.976357+05:30
472	SN200468	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
473	SN200469	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
474	SN200470	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
475	SN200471	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
476	SN200472	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
477	SN200473	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
478	SN200474	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
479	SN200475	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
480	SN200476	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
481	SN200477	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
482	SN200478	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
483	SN200479	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
484	SN200480	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
485	SN200481	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
486	SN200482	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
487	SN200483	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
488	SN200484	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
489	SN200485	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
490	SN200486	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
491	SN200487	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
492	SN200488	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
493	SN200489	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
494	SN200490	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
495	SN200491	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
496	SN200492	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
497	SN200493	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
498	SN200494	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
499	SN200495	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
500	SN200496	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
501	SN200497	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
502	SN200498	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
503	SN200499	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
504	SN200500	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
505	SN200501	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
506	SN200502	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
507	SN200503	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
508	SN200504	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
509	SN200505	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
510	SN200506	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
511	SN200507	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
512	SN200508	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
513	SN200509	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
514	SN200510	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
515	SN200511	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
516	SN200512	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
517	SN200513	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
518	SN200514	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
519	SN200515	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
520	SN200516	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
521	SN200517	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
522	SN200518	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
523	SN200519	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
524	SN200520	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
525	SN200521	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
526	SN200522	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
527	SN200523	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
528	SN200524	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
529	SN200525	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
530	SN200526	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
531	SN200527	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
532	SN200528	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
533	SN200529	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
534	SN200530	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
535	SN200531	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
536	SN200532	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
537	SN200533	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
538	SN200534	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
539	SN200535	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
540	SN200536	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
541	SN200537	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
542	SN200538	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
543	SN200539	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
544	SN200540	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
545	SN200541	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
546	SN200542	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
547	SN200543	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
548	SN200544	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
549	SN200545	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
550	SN200546	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
551	SN200547	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
552	SN200548	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
553	SN200549	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
554	SN200550	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
555	SN200551	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
556	SN200552	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
557	SN200553	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
558	SN200554	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
559	SN200555	25	IN_TRANSIT	\N	2026-10-05 22:36:42.425914+05:30	2026-10-05 22:36:42.425914+05:30
563	SN200559	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
564	SN200560	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
565	SN200561	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
566	SN200562	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
567	SN200563	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
568	SN200564	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
569	SN200565	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
570	SN200566	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
571	SN200567	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
572	SN200568	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
573	SN200569	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
574	SN200570	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
575	SN200571	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
576	SN200572	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
577	SN200573	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
578	SN200574	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
579	SN200575	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
580	SN200576	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
581	SN200577	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
582	SN200578	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
583	SN200579	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
584	SN200580	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
585	SN200581	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
586	SN200582	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
587	SN200583	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
588	SN200584	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
589	SN200585	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
590	SN200586	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
591	SN200587	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
562	SN200558	26	IN_STOCK	1	2026-10-06 13:48:05.255808+05:30	2026-10-06 20:07:30.096241+05:30
592	SN200588	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
593	SN200589	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
594	SN200590	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
595	SN200591	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
596	SN200592	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
597	SN200593	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
598	SN200594	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
599	SN200595	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
600	SN200596	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
601	SN200597	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
602	SN200598	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
603	SN200599	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
604	SN200600	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
605	SN200601	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
606	SN200602	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
607	SN200603	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
608	SN200604	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
609	SN200605	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
610	SN200606	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
611	SN200607	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
612	SN200608	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
613	SN200609	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
614	SN200610	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
615	SN200611	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
616	SN200612	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
617	SN200613	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
618	SN200614	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
619	SN200615	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
620	SN200616	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
621	SN200617	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
622	SN200618	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
623	SN200619	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
624	SN200620	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
625	SN200621	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
626	SN200622	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
627	SN200623	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
628	SN200624	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
629	SN200625	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
630	SN200626	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
631	SN200627	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
632	SN200628	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
633	SN200629	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
634	SN200630	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
635	SN200631	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
636	SN200632	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
637	SN200633	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
638	SN200634	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
639	SN200635	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
640	SN200636	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
641	SN200637	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
642	SN200638	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
643	SN200639	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
644	SN200640	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
645	SN200641	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
646	SN200642	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
647	SN200643	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
648	SN200644	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
649	SN200645	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
650	SN200646	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
651	SN200647	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
652	SN200648	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
653	SN200649	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
654	SN200650	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
655	SN200651	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
656	SN200652	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
657	SN200653	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
658	SN200654	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
659	SN200655	26	IN_TRANSIT	\N	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:48:05.255808+05:30
560	SN200556	26	IN_TRANSIT	2	2026-10-06 13:48:05.255808+05:30	2026-10-06 13:50:18.057649+05:30
660	SN200656	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
661	SN200657	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
662	SN200658	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
663	SN200659	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
664	SN200660	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
665	SN200661	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
666	SN200662	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
667	SN200663	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
668	SN200664	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
669	SN200665	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
670	SN200666	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
671	SN200667	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
672	SN200668	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
673	SN200669	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
674	SN200670	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
675	SN200671	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
676	SN200672	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
677	SN200673	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
678	SN200674	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
679	SN200675	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
680	SN200676	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
681	SN200677	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
682	SN200678	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
683	SN200679	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
684	SN200680	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
685	SN200681	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
686	SN200682	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
687	SN200683	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
688	SN200684	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
689	SN200685	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
690	SN200686	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
691	SN200687	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
692	SN200688	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
693	SN200689	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
694	SN200690	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
695	SN200691	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
696	SN200692	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
697	SN200693	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
698	SN200694	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
699	SN200695	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
700	SN200696	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
701	SN200697	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
702	SN200698	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
703	SN200699	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
704	SN200700	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
705	SN200701	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
706	SN200702	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
707	SN200703	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
708	SN200704	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
709	SN200705	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
710	SN200706	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
711	SN200707	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
712	SN200708	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
713	SN200709	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
714	SN200710	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
715	SN200711	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
716	SN200712	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
717	SN200713	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
718	SN200714	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
719	SN200715	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
720	SN200716	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
721	SN200717	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
722	SN200718	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
723	SN200719	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
724	SN200720	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
725	SN200721	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
726	SN200722	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
727	SN200723	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
728	SN200724	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
729	SN200725	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
730	SN200726	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
731	SN200727	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
732	SN200728	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
733	SN200729	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
734	SN200730	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
735	SN200731	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
736	SN200732	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
737	SN200733	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
738	SN200734	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
739	SN200735	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
740	SN200736	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
741	SN200737	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
742	SN200738	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
743	SN200739	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
744	SN200740	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
745	SN200741	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
746	SN200742	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
747	SN200743	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
748	SN200744	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
749	SN200745	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
750	SN200746	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
751	SN200747	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
752	SN200748	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
753	SN200749	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
754	SN200750	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
755	SN200751	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
756	SN200752	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
757	SN200753	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
758	SN200754	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
759	SN200755	27	IN_TRANSIT	\N	2026-10-06 14:01:06.669588+05:30	2026-10-06 14:01:06.669588+05:30
561	SN200557	26	IN_TRANSIT	2	2026-10-06 13:48:05.255808+05:30	2026-10-06 19:31:51.365655+05:30
760	SN200756	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
761	SN200757	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
762	SN200758	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
763	SN200759	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
764	SN200760	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
765	SN200761	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
766	SN200762	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
767	SN200763	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
768	SN200764	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
769	SN200765	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
770	SN200766	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
771	SN200767	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
772	SN200768	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
773	SN200769	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
774	SN200770	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
775	SN200771	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
776	SN200772	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
777	SN200773	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
778	SN200774	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
779	SN200775	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
780	SN200776	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
781	SN200777	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
782	SN200778	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
783	SN200779	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
784	SN200780	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
785	SN200781	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
786	SN200782	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
787	SN200783	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
788	SN200784	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
789	SN200785	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
790	SN200786	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
791	SN200787	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
792	SN200788	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
793	SN200789	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
794	SN200790	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
795	SN200791	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
796	SN200792	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
797	SN200793	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
798	SN200794	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
799	SN200795	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
800	SN200796	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
801	SN200797	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
802	SN200798	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
803	SN200799	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
804	SN200800	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
805	SN200801	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
806	SN200802	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
807	SN200803	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
808	SN200804	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
809	SN200805	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
810	SN200806	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
811	SN200807	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
812	SN200808	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
813	SN200809	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
814	SN200810	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
815	SN200811	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
816	SN200812	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
817	SN200813	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
818	SN200814	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
819	SN200815	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
820	SN200816	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
821	SN200817	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
822	SN200818	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
823	SN200819	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
824	SN200820	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
825	SN200821	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
826	SN200822	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
827	SN200823	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
828	SN200824	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
829	SN200825	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
830	SN200826	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
831	SN200827	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
832	SN200828	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
833	SN200829	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
834	SN200830	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
835	SN200831	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
836	SN200832	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
837	SN200833	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
838	SN200834	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
839	SN200835	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
840	SN200836	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
841	SN200837	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
842	SN200838	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
843	SN200839	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
844	SN200840	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
845	SN200841	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
846	SN200842	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
847	SN200843	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
848	SN200844	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
849	SN200845	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
850	SN200846	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
851	SN200847	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
852	SN200848	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
853	SN200849	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
854	SN200850	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
855	SN200851	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
856	SN200852	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
857	SN200853	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
858	SN200854	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
859	SN200855	28	IN_TRANSIT	\N	2026-10-06 20:22:55.223673+05:30	2026-10-06 20:22:55.223673+05:30
861	SN200857	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
862	SN200858	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
863	SN200859	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
864	SN200860	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
865	SN200861	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
866	SN200862	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
867	SN200863	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
868	SN200864	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
869	SN200865	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
870	SN200866	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
871	SN200867	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
872	SN200868	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
873	SN200869	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
874	SN200870	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
875	SN200871	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
876	SN200872	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
877	SN200873	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
878	SN200874	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
879	SN200875	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
880	SN200876	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
881	SN200877	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
882	SN200878	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
883	SN200879	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
884	SN200880	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
885	SN200881	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
886	SN200882	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
887	SN200883	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
888	SN200884	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
889	SN200885	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
890	SN200886	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
891	SN200887	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
892	SN200888	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
893	SN200889	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
894	SN200890	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
895	SN200891	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
896	SN200892	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
897	SN200893	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
898	SN200894	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
899	SN200895	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
900	SN200896	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
901	SN200897	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
902	SN200898	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
903	SN200899	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
904	SN200900	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
905	SN200901	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
906	SN200902	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
907	SN200903	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
908	SN200904	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
909	SN200905	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
910	SN200906	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
911	SN200907	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
912	SN200908	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
913	SN200909	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
914	SN200910	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
915	SN200911	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
916	SN200912	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
917	SN200913	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
918	SN200914	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
919	SN200915	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
920	SN200916	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
921	SN200917	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
922	SN200918	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
923	SN200919	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
924	SN200920	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
925	SN200921	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
926	SN200922	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
927	SN200923	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
928	SN200924	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
929	SN200925	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
930	SN200926	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
931	SN200927	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
932	SN200928	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
933	SN200929	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
934	SN200930	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
935	SN200931	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
936	SN200932	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
937	SN200933	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
938	SN200934	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
939	SN200935	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
940	SN200936	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
941	SN200937	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
942	SN200938	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
943	SN200939	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
944	SN200940	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
945	SN200941	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
946	SN200942	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
947	SN200943	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
948	SN200944	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
949	SN200945	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
950	SN200946	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
951	SN200947	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
952	SN200948	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
953	SN200949	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
954	SN200950	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
955	SN200951	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
956	SN200952	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
957	SN200953	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
958	SN200954	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
959	SN200955	29	IN_TRANSIT	\N	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:25:02.623094+05:30
860	SN200856	29	DISPENSED	2	2026-10-06 20:25:02.623094+05:30	2026-10-06 20:29:52.629744+05:30
\.


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transactions (id, batch_id, serial_number_id, from_organization_id, to_organization_id, quantity, transaction_type, blockchain_transaction_hash, "timestamp", blockchain_status, blockchain_tx_hash) FROM stdin;
1	1	1	\N	1	1000	RECEIVE	\N	2026-08-30 12:47:11.959151+05:30	PENDING	\N
2	2	2	\N	1	500	RECEIVE	\N	2026-08-30 12:47:11.959151+05:30	PENDING	\N
3	3	3	\N	1	800	RECEIVE	\N	2026-08-30 12:47:11.959151+05:30	PENDING	\N
4	4	4	\N	1	300	RECEIVE	\N	2026-08-30 12:47:11.959151+05:30	PENDING	\N
5	3	3	\N	\N	800	BLOCK	\N	2026-08-30 12:47:11.959151+05:30	PENDING	\N
6	4	4	\N	\N	300	BLOCK	\N	2026-08-30 12:47:11.959151+05:30	PENDING	\N
7	17	6	\N	1	1	RECEIVE	\N	2026-08-31 00:01:13.153463+05:30	PENDING	\N
8	17	6	\N	1	1	RECEIVE	\N	2026-08-31 00:01:53.292818+05:30	PENDING	\N
9	2	7	\N	2	1	RECEIVE	\N	2026-08-31 00:02:04.597475+05:30	PENDING	\N
10	17	7	\N	1	1	RECEIVE	\N	2026-08-31 00:02:47.283096+05:30	PENDING	\N
11	17	8	\N	1	1	RECEIVE	\N	2026-08-31 00:03:15.530917+05:30	PENDING	\N
12	17	8	\N	2	1	RECEIVE	\N	2026-08-31 00:03:30.312768+05:30	PENDING	\N
13	17	8	\N	1	1	RECEIVE	\N	2026-08-31 00:04:29.943079+05:30	FAILED	\N
14	17	8	1	2	1	TRANSFER	\N	2026-08-31 00:05:24.10596+05:30	FAILED	\N
15	1	1	\N	1	1	RECEIVE	0xaac215e10a2a0138bef11f5d189c71df57713315bc56146e29e786be1f161df8	2026-09-08 13:23:15.074887+05:30	CONFIRMED	\N
16	18	105	\N	1	1	RECEIVE	\N	2026-09-09 11:14:35.532955+05:30	FAILED	\N
17	19	108	\N	1	1	RECEIVE	0x14ded6e52225548301c7e54347befe6f3669850b9eaa017a5ca9321fa2f262b4	2026-09-09 11:19:18.661965+05:30	CONFIRMED	\N
18	21	210	\N	1	1	RECEIVE	0xdeedf7a00c37f799eb9e51dcf17a6c1255c53329c40fe2ea298434ba1ebb7e9d	2026-09-09 11:26:38.370835+05:30	CONFIRMED	\N
19	21	210	1	2	1	TRANSFER	0x7c7092084b5a342ef45604e62a2ef5bdf8794cd37f92ede660c9adb0b218e4a3	2026-09-09 11:27:03.717078+05:30	CONFIRMED	\N
20	21	210	\N	1	1	RECEIVE	0x5aa9c8c94bb20c38f8bb4749258bd8a6ff68da01937a36656eaf37f504001fcb	2026-09-09 11:28:06.080102+05:30	CONFIRMED	\N
21	24	410	\N	1	1	RECEIVE	0x07dd2dfc787d1a325ed192a60ec3bc2c1d679bfd04da790e56c6271dcb14557d	2026-09-09 13:42:06.572658+05:30	CONFIRMED	\N
22	24	410	1	2	1	TRANSFER	0xd682f4c6b546880dff903396bf6711bca7ac7125287a572d2e3b1c6aa7bed0ee	2026-09-09 13:42:47.332948+05:30	CONFIRMED	\N
23	25	460	\N	1	1	RECEIVE	\N	2026-10-05 22:46:52.771932+05:30	FAILED	\N
24	25	460	1	2	1	TRANSFER	\N	2026-10-05 22:47:45.429387+05:30	FAILED	\N
25	25	460	\N	2	1	RECEIVE	\N	2026-10-05 22:50:10.275549+05:30	FAILED	\N
26	25	460	2	\N	1	DISPENSE	\N	2026-10-05 22:50:31.976357+05:30	FAILED	\N
27	26	560	\N	1	1	RECEIVE	\N	2026-10-06 13:49:23.15707+05:30	FAILED	\N
28	26	560	1	2	1	TRANSFER	\N	2026-10-06 13:50:18.057649+05:30	FAILED	\N
29	26	561	\N	1	1	RECEIVE	0x95ff900d1f580606214bdbae039e05d13797719046d1d4e9daf14b71070b1e67	2026-10-06 19:31:12.014788+05:30	CONFIRMED	\N
30	26	561	1	2	1	TRANSFER	0x689564288e70e9ae539f037cd27a27036e07b5d51d62b6eccc34c44de3192f56	2026-10-06 19:31:51.365655+05:30	CONFIRMED	\N
31	26	562	\N	1	1	RECEIVE	0x725d212897bda55cc419a8161078614dc6524f604af298651dd06e5dc8fccf57	2026-10-06 20:07:30.096241+05:30	CONFIRMED	\N
32	29	860	\N	1	1	RECEIVE	0x027796a253438a1deb454337cc8808baaa5c75751f13ae02bee3806124c7116a	2026-10-06 20:25:56.285735+05:30	CONFIRMED	\N
33	29	860	1	2	1	TRANSFER	0x614227acaf9192b2f5afd91ba23d46c219ee2cb3b02f20c4efe9a8678e567278	2026-10-06 20:27:10.009111+05:30	CONFIRMED	\N
34	29	860	\N	2	1	RECEIVE	0x68ffe9e3d81f6e6e5c3e442298091b21377da45b6798012dcb6d4db498e74ecb	2026-10-06 20:29:08.058932+05:30	CONFIRMED	\N
35	29	860	2	\N	1	DISPENSE	0x18787d44db75e2d03faabb9be862aa3ca1d9afed4f9f9a041d6e4f7ebf29b901	2026-10-06 20:29:52.629744+05:30	CONFIRMED	\N
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, password_hash, role, organization_id, status, created_at, updated_at) FROM stdin;
1	Regulatory Admin	admin@pharmachain.test	$2b$10$placeholderHashAdmin000000000000000000000000	ADMIN	\N	ACTIVE	2026-08-30 12:47:11.886281+05:30	2026-08-30 12:47:11.886281+05:30
2	Distributor Staff 1	ops@medicore.test	$2b$10$placeholderHashDist0000000000000000000000000	DISTRIBUTOR_STAFF	1	ACTIVE	2026-08-30 12:47:11.886281+05:30	2026-08-30 12:47:11.886281+05:30
3	Pharmacist 1	pharmacist@apollocity.test	$2b$10$placeholderHashPharm000000000000000000000000	PHARMACY_STAFF	2	ACTIVE	2026-08-30 12:47:11.886281+05:30	2026-08-30 12:47:11.886281+05:30
\.


--
-- Data for Name: warehouses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.warehouses (id, organization_id, name, code, address, city, state, pincode, capacity, manager_name, contact_phone, is_active, created_at) FROM stdin;
\.


--
-- Name: alerts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.alerts_id_seq', 34, true);


--
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 1, false);


--
-- Name: batches_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.batches_id_seq', 29, true);


--
-- Name: bill_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bill_items_id_seq', 1, false);


--
-- Name: bills_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bills_id_seq', 1, false);


--
-- Name: dispensing_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.dispensing_id_seq', 1, false);


--
-- Name: doctors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.doctors_id_seq', 1, false);


--
-- Name: drug_interactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.drug_interactions_id_seq', 26, true);


--
-- Name: inventory_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.inventory_id_seq', 39, true);


--
-- Name: medicines_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.medicines_id_seq', 203, true);


--
-- Name: offline_sync_queue_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.offline_sync_queue_id_seq', 1, false);


--
-- Name: organizations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.organizations_id_seq', 15, true);


--
-- Name: patient_allergies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.patient_allergies_id_seq', 1, false);


--
-- Name: patients_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.patients_id_seq', 3, true);


--
-- Name: prescription_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.prescription_items_id_seq', 1, false);


--
-- Name: prescriptions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.prescriptions_id_seq', 1, false);


--
-- Name: regulatory_status_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.regulatory_status_id_seq', 43, true);


--
-- Name: serial_numbers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.serial_numbers_id_seq', 959, true);


--
-- Name: transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.transactions_id_seq', 35, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 7, true);


--
-- Name: warehouses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.warehouses_id_seq', 1, false);


--
-- Name: alerts alerts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alerts
    ADD CONSTRAINT alerts_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: batches batches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.batches
    ADD CONSTRAINT batches_pkey PRIMARY KEY (id);


--
-- Name: bill_items bill_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bill_items
    ADD CONSTRAINT bill_items_pkey PRIMARY KEY (id);


--
-- Name: bills bills_bill_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bills
    ADD CONSTRAINT bills_bill_number_key UNIQUE (bill_number);


--
-- Name: bills bills_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bills
    ADD CONSTRAINT bills_pkey PRIMARY KEY (id);


--
-- Name: dispensing dispensing_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dispensing
    ADD CONSTRAINT dispensing_pkey PRIMARY KEY (id);


--
-- Name: dispensing dispensing_serial_number_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dispensing
    ADD CONSTRAINT dispensing_serial_number_id_key UNIQUE (serial_number_id);


--
-- Name: doctors doctors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_pkey PRIMARY KEY (id);


--
-- Name: doctors doctors_registration_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_registration_number_key UNIQUE (registration_number);


--
-- Name: drug_interactions drug_interactions_drug_a_name_drug_b_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drug_interactions
    ADD CONSTRAINT drug_interactions_drug_a_name_drug_b_name_key UNIQUE (drug_a_name, drug_b_name);


--
-- Name: drug_interactions drug_interactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drug_interactions
    ADD CONSTRAINT drug_interactions_pkey PRIMARY KEY (id);


--
-- Name: inventory inventory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT inventory_pkey PRIMARY KEY (id);


--
-- Name: medicines medicines_medicine_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medicines
    ADD CONSTRAINT medicines_medicine_code_key UNIQUE (medicine_code);


--
-- Name: medicines medicines_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medicines
    ADD CONSTRAINT medicines_pkey PRIMARY KEY (id);


--
-- Name: offline_sync_queue offline_sync_queue_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.offline_sync_queue
    ADD CONSTRAINT offline_sync_queue_pkey PRIMARY KEY (id);


--
-- Name: organizations organizations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_pkey PRIMARY KEY (id);


--
-- Name: patient_allergies patient_allergies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_allergies
    ADD CONSTRAINT patient_allergies_pkey PRIMARY KEY (id);


--
-- Name: patients patients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_pkey PRIMARY KEY (id);


--
-- Name: prescription_items prescription_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescription_items
    ADD CONSTRAINT prescription_items_pkey PRIMARY KEY (id);


--
-- Name: prescriptions prescriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT prescriptions_pkey PRIMARY KEY (id);


--
-- Name: prescriptions prescriptions_prescription_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT prescriptions_prescription_number_key UNIQUE (prescription_number);


--
-- Name: regulatory_status regulatory_status_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.regulatory_status
    ADD CONSTRAINT regulatory_status_pkey PRIMARY KEY (id);


--
-- Name: serial_numbers serial_numbers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.serial_numbers
    ADD CONSTRAINT serial_numbers_pkey PRIMARY KEY (id);


--
-- Name: serial_numbers serial_numbers_serial_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.serial_numbers
    ADD CONSTRAINT serial_numbers_serial_number_key UNIQUE (serial_number);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: batches uq_batch_per_medicine; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.batches
    ADD CONSTRAINT uq_batch_per_medicine UNIQUE (medicine_id, batch_number);


--
-- Name: inventory uq_inventory_org_batch; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT uq_inventory_org_batch UNIQUE (organization_id, batch_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: warehouses warehouses_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouses
    ADD CONSTRAINT warehouses_code_key UNIQUE (code);


--
-- Name: warehouses warehouses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouses
    ADD CONSTRAINT warehouses_pkey PRIMARY KEY (id);


--
-- Name: idx_alerts_batch; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_alerts_batch ON public.alerts USING btree (batch_id);


--
-- Name: idx_alerts_medicine; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_alerts_medicine ON public.alerts USING btree (medicine_id);


--
-- Name: idx_alerts_severity; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_alerts_severity ON public.alerts USING btree (severity);


--
-- Name: idx_alerts_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_alerts_status ON public.alerts USING btree (status);


--
-- Name: idx_audit_logs_action; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_logs_action ON public.audit_logs USING btree (action);


--
-- Name: idx_audit_logs_entity; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_logs_entity ON public.audit_logs USING btree (entity_type, entity_id);


--
-- Name: idx_audit_logs_org; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_logs_org ON public.audit_logs USING btree (organization_id);


--
-- Name: idx_audit_logs_timestamp; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_logs_timestamp ON public.audit_logs USING btree ("timestamp" DESC);


--
-- Name: idx_audit_logs_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_logs_user ON public.audit_logs USING btree (user_id);


--
-- Name: idx_batches_expiry; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_batches_expiry ON public.batches USING btree (expiry_date);


--
-- Name: idx_batches_medicine; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_batches_medicine ON public.batches USING btree (medicine_id);


--
-- Name: idx_batches_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_batches_status ON public.batches USING btree (status);


--
-- Name: idx_bill_items_bill; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bill_items_bill ON public.bill_items USING btree (bill_id);


--
-- Name: idx_bills_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bills_number ON public.bills USING btree (bill_number);


--
-- Name: idx_bills_patient; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bills_patient ON public.bills USING btree (patient_id);


--
-- Name: idx_bills_pharmacy; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bills_pharmacy ON public.bills USING btree (pharmacy_id);


--
-- Name: idx_bills_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bills_status ON public.bills USING btree (status);


--
-- Name: idx_dispensing_batch; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dispensing_batch ON public.dispensing USING btree (batch_id);


--
-- Name: idx_dispensing_pharmacy; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dispensing_pharmacy ON public.dispensing USING btree (pharmacy_id);


--
-- Name: idx_doctors_reg; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_doctors_reg ON public.doctors USING btree (registration_number);


--
-- Name: idx_drug_interactions_a; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_drug_interactions_a ON public.drug_interactions USING btree (drug_a_name);


--
-- Name: idx_drug_interactions_b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_drug_interactions_b ON public.drug_interactions USING btree (drug_b_name);


--
-- Name: idx_inventory_batch; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_inventory_batch ON public.inventory USING btree (batch_id);


--
-- Name: idx_inventory_org; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_inventory_org ON public.inventory USING btree (organization_id);


--
-- Name: idx_medicines_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_medicines_code ON public.medicines USING btree (medicine_code);


--
-- Name: idx_medicines_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_medicines_name ON public.medicines USING btree (name);


--
-- Name: idx_offline_sync_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_offline_sync_status ON public.offline_sync_queue USING btree (status);


--
-- Name: idx_offline_sync_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_offline_sync_user ON public.offline_sync_queue USING btree (user_id);


--
-- Name: idx_organizations_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_organizations_status ON public.organizations USING btree (status);


--
-- Name: idx_organizations_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_organizations_type ON public.organizations USING btree (type);


--
-- Name: idx_patient_allergies_patient; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_patient_allergies_patient ON public.patient_allergies USING btree (patient_id);


--
-- Name: idx_patients_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_patients_name ON public.patients USING btree (name);


--
-- Name: idx_patients_phone; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_patients_phone ON public.patients USING btree (phone);


--
-- Name: idx_prescription_items_rx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_prescription_items_rx ON public.prescription_items USING btree (prescription_id);


--
-- Name: idx_prescriptions_doctor; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_prescriptions_doctor ON public.prescriptions USING btree (doctor_id);


--
-- Name: idx_prescriptions_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_prescriptions_number ON public.prescriptions USING btree (prescription_number);


--
-- Name: idx_prescriptions_patient; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_prescriptions_patient ON public.prescriptions USING btree (patient_id);


--
-- Name: idx_prescriptions_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_prescriptions_status ON public.prescriptions USING btree (status);


--
-- Name: idx_regstatus_batch; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_regstatus_batch ON public.regulatory_status USING btree (batch_id);


--
-- Name: idx_regstatus_medicine; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_regstatus_medicine ON public.regulatory_status USING btree (medicine_id);


--
-- Name: idx_regstatus_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_regstatus_status ON public.regulatory_status USING btree (status);


--
-- Name: idx_serials_batch; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_serials_batch ON public.serial_numbers USING btree (batch_id);


--
-- Name: idx_serials_lookup; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_serials_lookup ON public.serial_numbers USING btree (serial_number);


--
-- Name: idx_serials_owner; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_serials_owner ON public.serial_numbers USING btree (current_owner);


--
-- Name: idx_serials_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_serials_status ON public.serial_numbers USING btree (status);


--
-- Name: idx_transactions_batch; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_transactions_batch ON public.transactions USING btree (batch_id);


--
-- Name: idx_transactions_blockchain_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_transactions_blockchain_status ON public.transactions USING btree (blockchain_status);


--
-- Name: idx_transactions_from; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_transactions_from ON public.transactions USING btree (from_organization_id);


--
-- Name: idx_transactions_hash; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_transactions_hash ON public.transactions USING btree (blockchain_transaction_hash);


--
-- Name: idx_transactions_serial; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_transactions_serial ON public.transactions USING btree (serial_number_id);


--
-- Name: idx_transactions_to; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_transactions_to ON public.transactions USING btree (to_organization_id);


--
-- Name: idx_transactions_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_transactions_type ON public.transactions USING btree (transaction_type);


--
-- Name: idx_users_organization; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_organization ON public.users USING btree (organization_id);


--
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- Name: idx_warehouses_org; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_warehouses_org ON public.warehouses USING btree (organization_id);


--
-- Name: batches trg_batches_updated; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_batches_updated BEFORE UPDATE ON public.batches FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: bills trg_generate_bill_number; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_generate_bill_number BEFORE INSERT ON public.bills FOR EACH ROW EXECUTE FUNCTION public.generate_bill_number();


--
-- Name: prescriptions trg_generate_rx_number; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_generate_rx_number BEFORE INSERT ON public.prescriptions FOR EACH ROW EXECUTE FUNCTION public.generate_prescription_number();


--
-- Name: medicines trg_medicines_updated; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_medicines_updated BEFORE UPDATE ON public.medicines FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: organizations trg_organizations_updated; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_organizations_updated BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: serial_numbers trg_serials_updated; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_serials_updated BEFORE UPDATE ON public.serial_numbers FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: users trg_users_updated; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_users_updated BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: patients update_patients_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: prescriptions update_prescriptions_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON public.prescriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: alerts alerts_batch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alerts
    ADD CONSTRAINT alerts_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES public.batches(id) ON DELETE CASCADE;


--
-- Name: alerts alerts_medicine_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alerts
    ADD CONSTRAINT alerts_medicine_id_fkey FOREIGN KEY (medicine_id) REFERENCES public.medicines(id) ON DELETE CASCADE;


--
-- Name: audit_logs audit_logs_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: audit_logs audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: batches batches_medicine_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.batches
    ADD CONSTRAINT batches_medicine_id_fkey FOREIGN KEY (medicine_id) REFERENCES public.medicines(id) ON DELETE RESTRICT;


--
-- Name: bill_items bill_items_bill_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bill_items
    ADD CONSTRAINT bill_items_bill_id_fkey FOREIGN KEY (bill_id) REFERENCES public.bills(id) ON DELETE CASCADE;


--
-- Name: bill_items bill_items_medicine_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bill_items
    ADD CONSTRAINT bill_items_medicine_id_fkey FOREIGN KEY (medicine_id) REFERENCES public.medicines(id);


--
-- Name: bill_items bill_items_prescription_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bill_items
    ADD CONSTRAINT bill_items_prescription_item_id_fkey FOREIGN KEY (prescription_item_id) REFERENCES public.prescription_items(id);


--
-- Name: bill_items bill_items_serial_number_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bill_items
    ADD CONSTRAINT bill_items_serial_number_id_fkey FOREIGN KEY (serial_number_id) REFERENCES public.serial_numbers(id);


--
-- Name: bills bills_issued_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bills
    ADD CONSTRAINT bills_issued_by_fkey FOREIGN KEY (issued_by) REFERENCES public.users(id);


--
-- Name: bills bills_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bills
    ADD CONSTRAINT bills_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id);


--
-- Name: bills bills_pharmacy_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bills
    ADD CONSTRAINT bills_pharmacy_id_fkey FOREIGN KEY (pharmacy_id) REFERENCES public.organizations(id);


--
-- Name: bills bills_prescription_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bills
    ADD CONSTRAINT bills_prescription_id_fkey FOREIGN KEY (prescription_id) REFERENCES public.prescriptions(id);


--
-- Name: dispensing dispensing_batch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dispensing
    ADD CONSTRAINT dispensing_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES public.batches(id) ON DELETE RESTRICT;


--
-- Name: dispensing dispensing_dispensed_by_user_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dispensing
    ADD CONSTRAINT dispensing_dispensed_by_user_fkey FOREIGN KEY (dispensed_by_user) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: dispensing dispensing_pharmacy_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dispensing
    ADD CONSTRAINT dispensing_pharmacy_id_fkey FOREIGN KEY (pharmacy_id) REFERENCES public.organizations(id) ON DELETE RESTRICT;


--
-- Name: dispensing dispensing_serial_number_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dispensing
    ADD CONSTRAINT dispensing_serial_number_id_fkey FOREIGN KEY (serial_number_id) REFERENCES public.serial_numbers(id) ON DELETE RESTRICT;


--
-- Name: inventory inventory_batch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT inventory_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES public.batches(id) ON DELETE RESTRICT;


--
-- Name: inventory inventory_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT inventory_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: offline_sync_queue offline_sync_queue_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.offline_sync_queue
    ADD CONSTRAINT offline_sync_queue_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: offline_sync_queue offline_sync_queue_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.offline_sync_queue
    ADD CONSTRAINT offline_sync_queue_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: patient_allergies patient_allergies_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_allergies
    ADD CONSTRAINT patient_allergies_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;


--
-- Name: prescription_items prescription_items_dispensed_serial_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescription_items
    ADD CONSTRAINT prescription_items_dispensed_serial_id_fkey FOREIGN KEY (dispensed_serial_id) REFERENCES public.serial_numbers(id);


--
-- Name: prescription_items prescription_items_medicine_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescription_items
    ADD CONSTRAINT prescription_items_medicine_id_fkey FOREIGN KEY (medicine_id) REFERENCES public.medicines(id);


--
-- Name: prescription_items prescription_items_prescription_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescription_items
    ADD CONSTRAINT prescription_items_prescription_id_fkey FOREIGN KEY (prescription_id) REFERENCES public.prescriptions(id) ON DELETE CASCADE;


--
-- Name: prescriptions prescriptions_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT prescriptions_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(id);


--
-- Name: prescriptions prescriptions_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT prescriptions_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id);


--
-- Name: prescriptions prescriptions_pharmacy_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT prescriptions_pharmacy_id_fkey FOREIGN KEY (pharmacy_id) REFERENCES public.organizations(id);


--
-- Name: regulatory_status regulatory_status_batch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.regulatory_status
    ADD CONSTRAINT regulatory_status_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES public.batches(id) ON DELETE CASCADE;


--
-- Name: regulatory_status regulatory_status_medicine_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.regulatory_status
    ADD CONSTRAINT regulatory_status_medicine_id_fkey FOREIGN KEY (medicine_id) REFERENCES public.medicines(id) ON DELETE CASCADE;


--
-- Name: serial_numbers serial_numbers_batch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.serial_numbers
    ADD CONSTRAINT serial_numbers_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES public.batches(id) ON DELETE RESTRICT;


--
-- Name: serial_numbers serial_numbers_current_owner_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.serial_numbers
    ADD CONSTRAINT serial_numbers_current_owner_fkey FOREIGN KEY (current_owner) REFERENCES public.organizations(id) ON DELETE SET NULL;


--
-- Name: transactions transactions_batch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES public.batches(id) ON DELETE RESTRICT;


--
-- Name: transactions transactions_from_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_from_organization_id_fkey FOREIGN KEY (from_organization_id) REFERENCES public.organizations(id) ON DELETE SET NULL;


--
-- Name: transactions transactions_serial_number_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_serial_number_id_fkey FOREIGN KEY (serial_number_id) REFERENCES public.serial_numbers(id) ON DELETE SET NULL;


--
-- Name: transactions transactions_to_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_to_organization_id_fkey FOREIGN KEY (to_organization_id) REFERENCES public.organizations(id) ON DELETE SET NULL;


--
-- Name: users users_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE SET NULL;


--
-- Name: warehouses warehouses_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouses
    ADD CONSTRAINT warehouses_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict QOv0QPSh3c4c3jUw4Ytd2F4O7DzrRAN6re0tE6cBHqDpNh9Tf2uLYZOpApPa0aA

