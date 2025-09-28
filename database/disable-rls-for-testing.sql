-- Disable RLS temporarily for testing
-- Run this in your Supabase SQL Editor

-- Check current RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('buildings', 'apartments', 'flats', 'lands', 'tenants');

-- Disable RLS on all property tables
ALTER TABLE buildings DISABLE ROW LEVEL SECURITY;
ALTER TABLE apartments DISABLE ROW LEVEL SECURITY;
ALTER TABLE flats DISABLE ROW LEVEL SECURITY;
ALTER TABLE lands DISABLE ROW LEVEL SECURITY;
ALTER TABLE tenants DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('buildings', 'apartments', 'flats', 'lands', 'tenants');

-- Test basic operations
SELECT COUNT(*) as building_count FROM buildings;
SELECT COUNT(*) as apartment_count FROM apartments;
SELECT COUNT(*) as flat_count FROM flats;
SELECT COUNT(*) as land_count FROM lands;
SELECT COUNT(*) as tenant_count FROM tenants;