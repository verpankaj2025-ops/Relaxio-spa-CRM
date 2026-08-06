-- =========================================================
-- RELAXIO SPA CUSTOMER MANAGEMENT SYSTEM
-- SUPABASE / POSTGRESQL COMPLETE DATABASE SCHEMA & POLICIES
-- =========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------
-- 1. ROLES TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS roles (
  id VARCHAR(50) PRIMARY KEY,
  role_name VARCHAR(100) NOT NULL UNIQUE,
  permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Default Roles
INSERT INTO roles (id, role_name, permissions) VALUES
('super_admin', 'Super Admin', '["all", "manage_users", "export_data", "backup_restore", "manage_settings", "delete_records"]'::jsonb),
('admin', 'Admin', '["manage_customers", "view_reports", "manage_staff", "manage_therapists", "manage_rooms", "manage_services"]'::jsonb),
('staff', 'Staff', '["create_customer", "view_customers", "update_session_status", "view_rooms"]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------
-- 2. USERS & PROFILES TABLES
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE,
  role_id VARCHAR(50) NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  password_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'staff',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Initial Super Admin verpankaj2025@gmail.com
INSERT INTO users (id, name, email, phone, role_id, status) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Super Admin (Pankaj)', 'verpankaj2025@gmail.com', '9876543210', 'super_admin', 'active')
ON CONFLICT (email) DO UPDATE SET role_id = 'super_admin', status = 'active';

INSERT INTO profiles (id, email, full_name, role, is_active) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'verpankaj2025@gmail.com', 'Super Admin', 'super_admin', true)
ON CONFLICT (email) DO UPDATE SET role = 'super_admin', is_active = true;

-- ---------------------------------------------------------
-- 3. THERAPISTS TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS therapists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) UNIQUE,
  specialization VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'on_leave')),
  total_sessions INT DEFAULT 0,
  total_revenue NUMERIC(12, 2) DEFAULT 0.00,
  rating NUMERIC(3, 2) DEFAULT 4.8,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Initial Therapists
INSERT INTO therapists (name, phone, specialization, status, total_sessions, total_revenue, rating) VALUES
('Maya Lin', '9876000001', 'Deep Tissue & Swedish Massage', 'active', 42, 126000.00, 4.9),
('Aarav Mehta', '9876000002', 'Ayurvedic Abhyanga & Panchakarma', 'active', 38, 114000.00, 4.8),
('Elena Rostova', '9876000003', 'Aromatherapy & Hot Stone Therapy', 'active', 29, 87000.00, 4.7),
('Rohan Kapoor', '9876000004', 'Thai Massage & Reflexology', 'on_leave', 15, 45000.00, 4.6)
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------
-- 4. ROOMS TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_number VARCHAR(50) NOT NULL UNIQUE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('Standard', 'VIP Deluxe', 'Couples Suite', 'Ayurvedic Room')),
  status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Initial Rooms
INSERT INTO rooms (room_number, type, status) VALUES
('Room 101', 'VIP Deluxe', 'available'),
('Room 102', 'Couples Suite', 'occupied'),
('Room 103', 'Standard', 'available'),
('Room 104', 'Ayurvedic Room', 'available'),
('Room 105', 'Standard', 'maintenance')
ON CONFLICT (room_number) DO NOTHING;

-- ---------------------------------------------------------
-- 5. AGENTS TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) UNIQUE,
  commission_pct NUMERIC(5, 2) DEFAULT 10.00,
  total_referrals INT DEFAULT 0,
  total_revenue_generated NUMERIC(12, 2) DEFAULT 0.00,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Initial Agents
INSERT INTO agents (name, phone, commission_pct, total_referrals, total_revenue_generated, status) VALUES
('Grand Hyatt Concierge Desk', '9988776655', 12.00, 18, 54000.00, 'active'),
('TravelSphere Mumbai', '9988776644', 10.00, 12, 36000.00, 'active'),
('Vikram Singh (Local Tour Agent)', '9988776633', 15.00, 8, 24000.00, 'active')
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------
-- 6. SERVICES TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  duration_mins INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Initial Services
INSERT INTO services (name, category, price, duration_mins) VALUES
('Swedish Deep Relaxation Massage', 'Massage Therapy', 3000.00, 60),
('Royal Ayurvedic Abhyanga Massage', 'Ayurveda', 4500.00, 90),
('Signature Hot Stone Rejuvenation', 'Specialty', 5000.00, 75),
('Aromatherapy Stress Relief Session', 'Massage Therapy', 3500.00, 60),
('Thai Traditional Body Therapy', 'Body Work', 2800.00, 60)
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------
-- 7. CUSTOMERS TABLE & AUTO INVOICE SEQUENCE
-- ---------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS invoice_seq START 1001;

CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  mobile VARCHAR(20) NOT NULL,
  gender VARCHAR(20) CHECK (gender IN ('Male', 'Female', 'Other')),
  age INT,
  visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  check_in_time TIME NOT NULL DEFAULT CURRENT_TIME,
  check_out_time TIME,
  room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
  room_number VARCHAR(50),
  therapist_id UUID REFERENCES therapists(id) ON DELETE SET NULL,
  therapist_name VARCHAR(255),
  amount_paid NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  payment_method VARCHAR(20) NOT NULL DEFAULT 'Cash' CHECK (payment_method IN ('Cash', 'UPI', 'Card', 'Wallet')),
  customer_type VARCHAR(30) NOT NULL DEFAULT 'Walk In' CHECK (customer_type IN ('Walk In', 'Agent Customer', 'Referral', 'Membership')),
  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  agent_name VARCHAR(255),
  services JSONB NOT NULL DEFAULT '[]'::jsonb,
  remarks TEXT,
  photo_url TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'Running' CHECK (status IN ('Completed', 'Running', 'Cancelled')),
  created_by VARCHAR(255) NOT NULL DEFAULT 'System',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for lightning fast lookups
CREATE INDEX IF NOT EXISTS idx_customers_mobile ON customers(mobile);
CREATE INDEX IF NOT EXISTS idx_customers_visit_date ON customers(visit_date);
CREATE INDEX IF NOT EXISTS idx_customers_invoice ON customers(invoice_number);

-- Auto Generate Invoice Trigger Function
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
    NEW.invoice_number := 'RLX-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD(NEXTVAL('invoice_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_auto_invoice ON customers;
CREATE TRIGGER trg_auto_invoice
BEFORE INSERT ON customers
FOR EACH ROW
EXECUTE FUNCTION generate_invoice_number();

-- ---------------------------------------------------------
-- 8. PAYMENTS TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  invoice_number VARCHAR(50) NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  payment_method VARCHAR(20) NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 9. VISIT HISTORY TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS visit_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_mobile VARCHAR(20) NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  invoice_number VARCHAR(50) NOT NULL,
  visit_date DATE NOT NULL,
  services_taken TEXT,
  amount_paid NUMERIC(12, 2) NOT NULL,
  therapist_name VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 10. AUDIT LOGS TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  user_name VARCHAR(255) NOT NULL,
  user_role VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL,
  target_entity VARCHAR(100) NOT NULL,
  target_id VARCHAR(100),
  details TEXT NOT NULL,
  ip_address VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 11. SETTINGS TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS settings (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert Default Spa Settings
INSERT INTO settings (key, value) VALUES
('general', '{
  "spaName": "Relaxio Spa & Wellness",
  "tagline": "Luxury Rejuvenation & Holistic Care",
  "phone": "+91 98765 43210",
  "email": "contact@relaxiospa.com",
  "address": "Suite 402, Golden Palm Tower, MG Road, Mumbai",
  "gstNumber": "27AABCR1234F1ZP",
  "currencySymbol": "₹",
  "inactivityTimeoutMins": 5,
  "autoBackupEnabled": true,
  "theme": "dark"
}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- ---------------------------------------------------------
-- 12. SUPABASE STORAGE CONFIGURATION FOR CUSTOMER PHOTOS
-- ---------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'customer-photos',
  'customer-photos',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies (Authenticated Users Only)
DROP POLICY IF EXISTS "Public Read Access for Customer Photos" ON storage.objects;
DROP POLICY IF EXISTS "Public & Authenticated Upload for Customer Photos" ON storage.objects;
DROP POLICY IF EXISTS "Public & Authenticated Update for Customer Photos" ON storage.objects;

CREATE POLICY "Authenticated Read Access for Customer Photos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'customer-photos');

CREATE POLICY "Authenticated Upload for Customer Photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'customer-photos');

CREATE POLICY "Authenticated Update for Customer Photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'customer-photos');

-- ---------------------------------------------------------
-- 13. SECURITY HELPER FUNCTIONS
-- ---------------------------------------------------------

-- Helper function: Check if user is authenticated via Supabase Auth
CREATE OR REPLACE FUNCTION is_authenticated()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (auth.role() = 'authenticated');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Helper function: Get current user role from profiles or users table
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS VARCHAR AS $$
DECLARE
  u_role VARCHAR;
  u_email VARCHAR;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN 'anon';
  END IF;

  u_email := LOWER(COALESCE(auth.jwt() ->> 'email', ''));

  IF u_email = 'verpankaj2025@gmail.com' THEN
    RETURN 'super_admin';
  END IF;

  SELECT role INTO u_role FROM public.profiles WHERE id = auth.uid() AND is_active = true LIMIT 1;
  IF u_role IS NOT NULL THEN
    RETURN u_role;
  END IF;

  SELECT role_id INTO u_role FROM public.users WHERE (id = auth.uid() OR LOWER(email) = u_email) AND status = 'active' LIMIT 1;
  IF u_role IS NOT NULL THEN
    RETURN u_role;
  END IF;

  RETURN 'staff';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Role Check Functions
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (is_authenticated() AND get_current_user_role() = 'super_admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION is_admin_or_super()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (is_authenticated() AND get_current_user_role() IN ('super_admin', 'admin'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION is_active_staff()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (is_authenticated() AND get_current_user_role() IN ('super_admin', 'admin', 'staff'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ---------------------------------------------------------
-- 14. ROW LEVEL SECURITY (RLS) POLICIES
-- ---------------------------------------------------------
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapists ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE visit_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Drop old insecure policies
DROP POLICY IF EXISTS "Allow read access to all" ON roles;
DROP POLICY IF EXISTS "Allow read access to all" ON users;
DROP POLICY IF EXISTS "Allow write access to users" ON users;
DROP POLICY IF EXISTS "Allow all operations on profiles" ON profiles;
DROP POLICY IF EXISTS "Allow all operations on customers" ON customers;
DROP POLICY IF EXISTS "Allow all operations on therapists" ON therapists;
DROP POLICY IF EXISTS "Allow all operations on rooms" ON rooms;
DROP POLICY IF EXISTS "Allow all operations on agents" ON agents;
DROP POLICY IF EXISTS "Allow all operations on services" ON services;
DROP POLICY IF EXISTS "Allow all operations on payments" ON payments;
DROP POLICY IF EXISTS "Allow all operations on visit_history" ON visit_history;
DROP POLICY IF EXISTS "Allow all operations on audit_logs" ON audit_logs;
DROP POLICY IF EXISTS "Allow all operations on settings" ON settings;

-- ROLES TABLE POLICIES
CREATE POLICY "Roles - Authenticated Read" ON roles FOR SELECT TO authenticated USING (is_authenticated());
CREATE POLICY "Roles - Super Admin Manage" ON roles FOR ALL TO authenticated USING (is_super_admin()) WITH CHECK (is_super_admin());

-- PROFILES TABLE POLICIES
CREATE POLICY "Profiles - Authenticated Read" ON profiles FOR SELECT TO authenticated USING (is_authenticated());
CREATE POLICY "Profiles - User Own Insert" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id OR is_super_admin());
CREATE POLICY "Profiles - User Own or Super Admin Update" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id OR is_super_admin()) WITH CHECK (auth.uid() = id OR is_super_admin());
CREATE POLICY "Profiles - Super Admin Delete" ON profiles FOR DELETE TO authenticated USING (is_super_admin());

-- USERS TABLE POLICIES
CREATE POLICY "Users - Authenticated Read" ON users FOR SELECT TO authenticated USING (is_authenticated());
CREATE POLICY "Users - Admin or Super Insert" ON users FOR INSERT TO authenticated WITH CHECK (is_admin_or_super());
CREATE POLICY "Users - Admin or Super Update" ON users FOR UPDATE TO authenticated USING (is_super_admin() OR (is_admin_or_super() AND role_id = 'staff')) WITH CHECK (is_super_admin() OR (is_admin_or_super() AND role_id = 'staff'));
CREATE POLICY "Users - Super Admin Delete" ON users FOR DELETE TO authenticated USING (is_super_admin());

-- CUSTOMERS TABLE POLICIES
CREATE POLICY "Customers - Active Staff Read" ON customers FOR SELECT TO authenticated USING (is_active_staff());
CREATE POLICY "Customers - Active Staff Insert" ON customers FOR INSERT TO authenticated WITH CHECK (is_active_staff());
CREATE POLICY "Customers - Active Staff Update" ON customers FOR UPDATE TO authenticated USING (is_active_staff()) WITH CHECK (is_active_staff());
CREATE POLICY "Customers - Admin or Super Delete" ON customers FOR DELETE TO authenticated USING (is_admin_or_super());

-- THERAPISTS TABLE POLICIES
CREATE POLICY "Therapists - Active Staff Read" ON therapists FOR SELECT TO authenticated USING (is_active_staff());
CREATE POLICY "Therapists - Admin or Super Insert" ON therapists FOR INSERT TO authenticated WITH CHECK (is_admin_or_super());
CREATE POLICY "Therapists - Admin or Super Update" ON therapists FOR UPDATE TO authenticated USING (is_admin_or_super()) WITH CHECK (is_admin_or_super());
CREATE POLICY "Therapists - Super Admin Delete" ON therapists FOR DELETE TO authenticated USING (is_super_admin());

-- ROOMS TABLE POLICIES
CREATE POLICY "Rooms - Active Staff Read" ON rooms FOR SELECT TO authenticated USING (is_active_staff());
CREATE POLICY "Rooms - Admin or Super Insert" ON rooms FOR INSERT TO authenticated WITH CHECK (is_admin_or_super());
CREATE POLICY "Rooms - Active Staff Status Update" ON rooms FOR UPDATE TO authenticated USING (is_active_staff()) WITH CHECK (is_active_staff());
CREATE POLICY "Rooms - Super Admin Delete" ON rooms FOR DELETE TO authenticated USING (is_super_admin());

-- AGENTS TABLE POLICIES
CREATE POLICY "Agents - Active Staff Read" ON agents FOR SELECT TO authenticated USING (is_active_staff());
CREATE POLICY "Agents - Admin or Super Insert" ON agents FOR INSERT TO authenticated WITH CHECK (is_admin_or_super());
CREATE POLICY "Agents - Admin or Super Update" ON agents FOR UPDATE TO authenticated USING (is_admin_or_super()) WITH CHECK (is_admin_or_super());
CREATE POLICY "Agents - Super Admin Delete" ON agents FOR DELETE TO authenticated USING (is_super_admin());

-- SERVICES TABLE POLICIES
CREATE POLICY "Services - Active Staff Read" ON services FOR SELECT TO authenticated USING (is_active_staff());
CREATE POLICY "Services - Admin or Super Insert" ON services FOR INSERT TO authenticated WITH CHECK (is_admin_or_super());
CREATE POLICY "Services - Admin or Super Update" ON services FOR UPDATE TO authenticated USING (is_admin_or_super()) WITH CHECK (is_admin_or_super());
CREATE POLICY "Services - Super Admin Delete" ON services FOR DELETE TO authenticated USING (is_super_admin());

-- PAYMENTS TABLE POLICIES
CREATE POLICY "Payments - Active Staff Read" ON payments FOR SELECT TO authenticated USING (is_active_staff());
CREATE POLICY "Payments - Active Staff Insert" ON payments FOR INSERT TO authenticated WITH CHECK (is_active_staff());
CREATE POLICY "Payments - Admin or Super Update" ON payments FOR UPDATE TO authenticated USING (is_admin_or_super()) WITH CHECK (is_admin_or_super());
CREATE POLICY "Payments - Admin or Super Delete" ON payments FOR DELETE TO authenticated USING (is_admin_or_super());

-- VISIT HISTORY TABLE POLICIES
CREATE POLICY "Visit History - Active Staff Read" ON visit_history FOR SELECT TO authenticated USING (is_active_staff());
CREATE POLICY "Visit History - Active Staff Insert" ON visit_history FOR INSERT TO authenticated WITH CHECK (is_active_staff());
CREATE POLICY "Visit History - Admin or Super Update" ON visit_history FOR UPDATE TO authenticated USING (is_admin_or_super()) WITH CHECK (is_admin_or_super());
CREATE POLICY "Visit History - Admin or Super Delete" ON visit_history FOR DELETE TO authenticated USING (is_admin_or_super());

-- AUDIT LOGS TABLE POLICIES
CREATE POLICY "Audit Logs - Admin or Super Read" ON audit_logs FOR SELECT TO authenticated USING (is_admin_or_super());
CREATE POLICY "Audit Logs - Active Staff Insert" ON audit_logs FOR INSERT TO authenticated WITH CHECK (is_active_staff());
CREATE POLICY "Audit Logs - Super Admin Delete" ON audit_logs FOR DELETE TO authenticated USING (is_super_admin());

-- SETTINGS TABLE POLICIES
CREATE POLICY "Settings - Active Staff Read" ON settings FOR SELECT TO authenticated USING (is_active_staff());
CREATE POLICY "Settings - Super Admin Manage" ON settings FOR ALL TO authenticated USING (is_super_admin()) WITH CHECK (is_super_admin());
