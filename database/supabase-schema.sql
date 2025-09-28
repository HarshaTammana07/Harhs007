-- Family Business Management System - Supabase Schema
-- This schema supports the complete data model from your TypeScript types

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Family Members Table
CREATE TABLE family_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    nickname VARCHAR(100) NOT NULL,
    profile_photo TEXT, -- Base64 or file URL
    relationship VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Buildings Table
CREATE TABLE buildings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    building_code VARCHAR(10) NOT NULL,
    address TEXT NOT NULL,
    description TEXT,
    total_floors INTEGER NOT NULL,
    total_apartments INTEGER NOT NULL,
    amenities TEXT[], -- Array of amenities
    construction_year INTEGER,
    images TEXT[], -- Array of image URLs/Base64
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Apartments Table (within buildings)
CREATE TABLE apartments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
    door_number VARCHAR(20) NOT NULL,
    floor INTEGER NOT NULL,
    bedroom_count INTEGER NOT NULL,
    bathroom_count INTEGER NOT NULL,
    area DECIMAL(10,2) NOT NULL,
    rent_amount DECIMAL(10,2) NOT NULL,
    security_deposit DECIMAL(10,2) NOT NULL,
    is_occupied BOOLEAN DEFAULT FALSE,
    -- Specifications as JSONB
    furnished BOOLEAN DEFAULT FALSE,
    parking BOOLEAN DEFAULT FALSE,
    balcony BOOLEAN DEFAULT FALSE,
    air_conditioning BOOLEAN DEFAULT FALSE,
    power_backup BOOLEAN DEFAULT FALSE,
    water_supply VARCHAR(20) DEFAULT 'limited',
    internet_ready BOOLEAN DEFAULT FALSE,
    additional_features TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Flats Table (standalone units)
CREATE TABLE flats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    door_number VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    description TEXT,
    bedroom_count INTEGER NOT NULL,
    bathroom_count INTEGER NOT NULL,
    area DECIMAL(10,2) NOT NULL,
    floor INTEGER NOT NULL,
    total_floors INTEGER NOT NULL,
    rent_amount DECIMAL(10,2) NOT NULL,
    security_deposit DECIMAL(10,2) NOT NULL,
    is_occupied BOOLEAN DEFAULT FALSE,
    -- Specifications
    furnished BOOLEAN DEFAULT FALSE,
    parking BOOLEAN DEFAULT FALSE,
    balcony BOOLEAN DEFAULT FALSE,
    air_conditioning BOOLEAN DEFAULT FALSE,
    power_backup BOOLEAN DEFAULT FALSE,
    water_supply VARCHAR(20) DEFAULT 'limited',
    internet_ready BOOLEAN DEFAULT FALSE,
    society_name VARCHAR(255),
    maintenance_charges DECIMAL(10,2),
    additional_features TEXT[],
    images TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lands Table
CREATE TABLE lands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    description TEXT,
    survey_number VARCHAR(50),
    area DECIMAL(15,2) NOT NULL,
    area_unit VARCHAR(10) NOT NULL DEFAULT 'sqft',
    zoning VARCHAR(20) NOT NULL DEFAULT 'residential',
    soil_type VARCHAR(100),
    water_source VARCHAR(100),
    road_access BOOLEAN DEFAULT TRUE,
    electricity_connection BOOLEAN DEFAULT TRUE,
    is_leased BOOLEAN DEFAULT FALSE,
    -- Lease terms as JSONB
    lease_type VARCHAR(20),
    rent_amount DECIMAL(10,2),
    rent_frequency VARCHAR(20),
    lease_security_deposit DECIMAL(10,2),
    lease_duration INTEGER,
    renewal_terms TEXT,
    restrictions TEXT[],
    images TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tenants Table
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Personal Info
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    date_of_birth DATE,
    occupation VARCHAR(100),
    employer VARCHAR(255),
    monthly_income DECIMAL(10,2),
    marital_status VARCHAR(20),
    family_size INTEGER DEFAULT 1,
    nationality VARCHAR(50) DEFAULT 'Indian',
    religion VARCHAR(50),
    -- Contact Info
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    -- Emergency Contact
    emergency_contact_name VARCHAR(255),
    emergency_contact_relationship VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_email VARCHAR(255),
    emergency_contact_address TEXT,
    -- Identification
    aadhar_number VARCHAR(12),
    pan_number VARCHAR(10),
    driving_license VARCHAR(20),
    passport VARCHAR(20),
    voter_id_number VARCHAR(20),
    -- Rental Agreement
    agreement_number VARCHAR(50),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    rent_amount DECIMAL(10,2) NOT NULL,
    security_deposit DECIMAL(10,2) NOT NULL,
    maintenance_charges DECIMAL(10,2),
    rent_due_date INTEGER NOT NULL, -- Day of month
    payment_method VARCHAR(20) DEFAULT 'bank_transfer',
    late_fee_amount DECIMAL(10,2),
    notice_period INTEGER DEFAULT 30,
    renewal_terms TEXT,
    special_conditions TEXT[],
    -- Property Assignment (direct linking)
    property_id UUID, -- References buildings, flats, or lands
    property_type VARCHAR(20), -- 'apartment', 'flat', 'land'
    building_id UUID, -- For apartments, references buildings table
    -- Status
    move_in_date DATE NOT NULL,
    move_out_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tenant References Table
CREATE TABLE tenant_references (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    relationship VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    address TEXT,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Property Tenant Assignments (polymorphic relationship)
CREATE TABLE property_tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    property_type VARCHAR(20) NOT NULL, -- 'building', 'flat', 'land'
    property_id UUID NOT NULL, -- References buildings, flats, or lands
    unit_id UUID, -- For apartments within buildings
    assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
    unassigned_date DATE,
    is_current BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rent Payments Table
CREATE TABLE rent_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    property_type VARCHAR(20) NOT NULL,
    property_id UUID NOT NULL,
    unit_id UUID, -- For apartments
    amount DECIMAL(10,2) NOT NULL,
    due_date DATE NOT NULL,
    paid_date DATE,
    status VARCHAR(20) DEFAULT 'pending',
    payment_method VARCHAR(20),
    transaction_id VARCHAR(100),
    receipt_number VARCHAR(50),
    notes TEXT,
    late_fee DECIMAL(10,2) DEFAULT 0,
    discount DECIMAL(10,2) DEFAULT 0,
    actual_amount_paid DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insurance Policies Table
CREATE TABLE insurance_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_number VARCHAR(100) NOT NULL UNIQUE,
    type VARCHAR(20) NOT NULL,
    provider VARCHAR(255) NOT NULL,
    family_member_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
    premium_amount DECIMAL(10,2) NOT NULL,
    coverage_amount DECIMAL(15,2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    renewal_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Premium Payments Table
CREATE TABLE premium_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id UUID REFERENCES insurance_policies(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    paid_date DATE NOT NULL,
    due_date DATE NOT NULL,
    payment_method VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents Table
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    file_data TEXT, -- Base64 or file URL
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    family_member_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
    property_type VARCHAR(20), -- For property documents
    property_id UUID, -- References buildings, flats, or lands
    insurance_policy_id UUID REFERENCES insurance_policies(id) ON DELETE CASCADE,
    expiry_date DATE,
    issued_date DATE,
    issuer VARCHAR(255),
    document_number VARCHAR(100),
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Maintenance Records Table
CREATE TABLE maintenance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_type VARCHAR(20) NOT NULL,
    property_id UUID NOT NULL,
    unit_id UUID, -- For apartments
    description TEXT NOT NULL,
    cost DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    contractor VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_apartments_building_id ON apartments(building_id);
CREATE INDEX idx_tenant_references_tenant_id ON tenant_references(tenant_id);
CREATE INDEX idx_property_tenants_tenant_id ON property_tenants(tenant_id);
CREATE INDEX idx_property_tenants_property ON property_tenants(property_type, property_id);
CREATE INDEX idx_rent_payments_tenant_id ON rent_payments(tenant_id);
CREATE INDEX idx_rent_payments_due_date ON rent_payments(due_date);
CREATE INDEX idx_documents_family_member_id ON documents(family_member_id);
CREATE INDEX idx_documents_property ON documents(property_type, property_id);
CREATE INDEX idx_insurance_policies_family_member_id ON insurance_policies(family_member_id);
CREATE INDEX idx_premium_payments_policy_id ON premium_payments(policy_id);

-- Enable Row Level Security (RLS)
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE apartments ENABLE ROW LEVEL SECURITY;
ALTER TABLE flats ENABLE ROW LEVEL SECURITY;
ALTER TABLE lands ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE rent_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE premium_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;

-- Create policies (basic - you can customize based on your auth needs)
CREATE POLICY "Enable all operations for authenticated users" ON family_members
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users" ON buildings
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users" ON apartments
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users" ON flats
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users" ON lands
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users" ON tenants
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users" ON tenant_references
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users" ON property_tenants
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users" ON rent_payments
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users" ON insurance_policies
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users" ON premium_payments
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users" ON documents
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users" ON maintenance_records
    FOR ALL USING (auth.role() = 'authenticated');