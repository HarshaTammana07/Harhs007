-- Fix RLS Policies for Development (Anonymous Access)
-- This allows anonymous users to access the tables for development purposes
-- In production, you should implement proper authentication

-- Drop existing policies
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON family_members;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON buildings;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON apartments;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON flats;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON lands;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON tenants;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON tenant_references;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON property_tenants;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON rent_payments;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON insurance_policies;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON premium_payments;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON documents;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON maintenance_records;

-- Create new policies that allow anonymous access for development
CREATE POLICY "Allow anonymous access for development" ON family_members
    FOR ALL USING (true);

CREATE POLICY "Allow anonymous access for development" ON buildings
    FOR ALL USING (true);

CREATE POLICY "Allow anonymous access for development" ON apartments
    FOR ALL USING (true);

CREATE POLICY "Allow anonymous access for development" ON flats
    FOR ALL USING (true);

CREATE POLICY "Allow anonymous access for development" ON lands
    FOR ALL USING (true);

CREATE POLICY "Allow anonymous access for development" ON tenants
    FOR ALL USING (true);

CREATE POLICY "Allow anonymous access for development" ON tenant_references
    FOR ALL USING (true);

CREATE POLICY "Allow anonymous access for development" ON property_tenants
    FOR ALL USING (true);

CREATE POLICY "Allow anonymous access for development" ON rent_payments
    FOR ALL USING (true);

CREATE POLICY "Allow anonymous access for development" ON insurance_policies
    FOR ALL USING (true);

CREATE POLICY "Allow anonymous access for development" ON premium_payments
    FOR ALL USING (true);

CREATE POLICY "Allow anonymous access for development" ON documents
    FOR ALL USING (true);

CREATE POLICY "Allow anonymous access for development" ON maintenance_records
    FOR ALL USING (true);

-- Verify policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;