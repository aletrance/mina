-- ============================================
-- Mine Vehicle Management - Supabase Schema
-- ============================================

-- Enums
CREATE TYPE user_role AS ENUM ('super_admin', 'admin');
CREATE TYPE vehicle_type AS ENUM ('auto', 'camioneta', 'camion');
CREATE TYPE assignment_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');

-- ============================================
-- Tables
-- ============================================

CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'admin',
  tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  plate TEXT NOT NULL,
  type vehicle_type NOT NULL,
  brand TEXT,
  model TEXT,
  year INTEGER,
  driver_name TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, plate)
);

CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  date_from DATE NOT NULL,
  date_to DATE NOT NULL,
  status assignment_status NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_date_range CHECK (date_to >= date_from),
  -- Prevent overlapping assignments for the same vehicle (only active statuses)
  EXCLUDE USING gist (
    vehicle_id WITH =,
    daterange(date_from, date_to, '[]') WITH &&
  ) WHERE (status IN ('scheduled', 'in_progress'))
);

-- ============================================
-- Indexes
-- ============================================

CREATE INDEX idx_vehicles_tenant ON vehicles(tenant_id);
CREATE INDEX idx_assignments_vehicle ON assignments(vehicle_id);
CREATE INDEX idx_assignments_tenant ON assignments(tenant_id);
CREATE INDEX idx_assignments_dates ON assignments(date_from, date_to);
CREATE INDEX idx_users_tenant ON users(tenant_id);

-- ============================================
-- Trigger: auto-set tenant_id on assignments from vehicle
-- ============================================

CREATE OR REPLACE FUNCTION set_assignment_tenant()
RETURNS TRIGGER AS $$
BEGIN
  SELECT tenant_id INTO NEW.tenant_id FROM vehicles WHERE id = NEW.vehicle_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_assignment_tenant
  BEFORE INSERT ON assignments
  FOR EACH ROW
  EXECUTE FUNCTION set_assignment_tenant();

-- ============================================
-- Updated_at trigger
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_tenants_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_vehicles_updated_at BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_assignments_updated_at BEFORE UPDATE ON assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- Row Level Security
-- ============================================

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT role FROM users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function to get current user's tenant
CREATE OR REPLACE FUNCTION get_user_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- TENANTS policies
CREATE POLICY "super_admin_all_tenants" ON tenants FOR ALL USING (get_user_role() = 'super_admin');
CREATE POLICY "admin_read_own_tenant" ON tenants FOR SELECT USING (id = get_user_tenant_id());

-- USERS policies
CREATE POLICY "super_admin_all_users" ON users FOR ALL USING (get_user_role() = 'super_admin');
CREATE POLICY "admin_read_own_user" ON users FOR SELECT USING (id = auth.uid());

-- VEHICLES policies
CREATE POLICY "super_admin_read_vehicles" ON vehicles FOR SELECT USING (get_user_role() = 'super_admin');
CREATE POLICY "admin_all_tenant_vehicles" ON vehicles FOR ALL USING (tenant_id = get_user_tenant_id());

-- ASSIGNMENTS policies
CREATE POLICY "super_admin_read_assignments" ON assignments FOR SELECT USING (get_user_role() = 'super_admin');
CREATE POLICY "admin_all_tenant_assignments" ON assignments FOR ALL USING (tenant_id = get_user_tenant_id());
