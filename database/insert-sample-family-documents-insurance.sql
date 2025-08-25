-- Insert sample documents for family members
-- Note: Replace the family_member_id values with actual IDs from your family_members table

-- Sample documents for family members
INSERT INTO documents (
    title, 
    category, 
    file_name, 
    file_size, 
    mime_type, 
    family_member_id,
    expiry_date,
    issued_date,
    issuer,
    document_number,
    tags
) VALUES 
-- Documents for first family member (replace with actual ID)
(
    'Aadhar Card', 
    'aadhar', 
    'aadhar_harsha.pdf', 
    245760, 
    'application/pdf',
    (SELECT id FROM family_members LIMIT 1),
    NULL,
    '2020-01-15',
    'UIDAI',
    '1234-5678-9012',
    ARRAY['identity', 'government']
),
(
    'PAN Card', 
    'pan', 
    'pan_harsha.pdf', 
    189440, 
    'application/pdf',
    (SELECT id FROM family_members LIMIT 1),
    NULL,
    '2019-03-20',
    'Income Tax Department',
    'ABCDE1234F',
    ARRAY['tax', 'identity']
),
(
    'Driving License', 
    'driving_license', 
    'dl_harsha.pdf', 
    312560, 
    'application/pdf',
    (SELECT id FROM family_members LIMIT 1),
    '2029-06-15',
    '2019-06-15',
    'RTO Karnataka',
    'KA0120190123456',
    ARRAY['license', 'vehicle']
);

-- Sample insurance policies for family members
INSERT INTO insurance_policies (
    policy_number,
    type,
    provider,
    family_member_id,
    premium_amount,
    coverage_amount,
    start_date,
    end_date,
    renewal_date,
    status
) VALUES 
-- Insurance policies for first family member
(
    'LIC123456789',
    'LIC',
    'Life Insurance Corporation of India',
    (SELECT id FROM family_members LIMIT 1),
    25000.00,
    500000.00,
    '2023-01-01',
    '2028-01-01',
    '2025-01-01',
    'active'
),
(
    'HEALTH789012',
    'health',
    'Star Health Insurance',
    (SELECT id FROM family_members LIMIT 1),
    15000.00,
    300000.00,
    '2024-04-01',
    '2025-04-01',
    '2025-04-01',
    'active'
),
(
    'CAR456789',
    'car',
    'HDFC ERGO General Insurance',
    (SELECT id FROM family_members LIMIT 1),
    8500.00,
    200000.00,
    '2024-08-01',
    '2025-08-01',
    '2025-08-01',
    'active'
);

-- Add more sample data for other family members if they exist
-- You can duplicate the above patterns and change the family_member_id

-- Sample documents for second family member (if exists)
INSERT INTO documents (
    title, 
    category, 
    file_name, 
    file_size, 
    mime_type, 
    family_member_id,
    expiry_date,
    issued_date,
    issuer,
    document_number,
    tags
) 
SELECT 
    'Aadhar Card', 
    'aadhar', 
    'aadhar_member2.pdf', 
    245760, 
    'application/pdf',
    fm.id,
    NULL,
    '2020-02-10',
    'UIDAI',
    '9876-5432-1098',
    ARRAY['identity', 'government']
FROM family_members fm 
WHERE fm.id != (SELECT id FROM family_members LIMIT 1)
LIMIT 1;

INSERT INTO documents (
    title, 
    category, 
    file_name, 
    file_size, 
    mime_type, 
    family_member_id,
    expiry_date,
    issued_date,
    issuer,
    document_number,
    tags
) 
SELECT 
    'PAN Card', 
    'pan', 
    'pan_member2.pdf', 
    189440, 
    'application/pdf',
    fm.id,
    NULL,
    '2019-05-25',
    'Income Tax Department',
    'FGHIJ5678K',
    ARRAY['tax', 'identity']
FROM family_members fm 
WHERE fm.id != (SELECT id FROM family_members LIMIT 1)
LIMIT 1;

-- Sample insurance for second family member
INSERT INTO insurance_policies (
    policy_number,
    type,
    provider,
    family_member_id,
    premium_amount,
    coverage_amount,
    start_date,
    end_date,
    renewal_date,
    status
)
SELECT 
    'HEALTH567890',
    'health',
    'Max Bupa Health Insurance',
    fm.id,
    12000.00,
    250000.00,
    '2024-03-01',
    '2025-03-01',
    '2025-03-01',
    'active'
FROM family_members fm 
WHERE fm.id != (SELECT id FROM family_members LIMIT 1)
LIMIT 1;