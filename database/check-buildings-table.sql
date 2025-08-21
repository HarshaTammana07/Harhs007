-- Check if buildings table exists and its structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'buildings' 
ORDER BY ordinal_position;

-- Check RLS policies on buildings table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'buildings';

-- Check if RLS is enabled on buildings table
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    forcerowsecurity
FROM pg_tables 
WHERE tablename = 'buildings';

-- Test basic insert (this should be run as the service role)
-- INSERT INTO buildings (name, building_code, address, total_floors, total_apartments) 
-- VALUES ('Test Building', 'TEST001', 'Test Address', 1, 1);