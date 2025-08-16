-- Add property linking columns to tenants table
-- These columns are needed to link tenants to their properties (apartments, flats, lands)

-- Add property_id column (references the property the tenant is renting)
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS property_id UUID;

-- Add property_type column (specifies if it's apartment, flat, or land)
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS property_type VARCHAR(20);

-- Add building_id column (references the building for apartments)
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS building_id UUID;

-- Add comments for documentation
COMMENT ON COLUMN tenants.property_id IS 'ID of the property (apartment, flat, or land) the tenant is renting';
COMMENT ON COLUMN tenants.property_type IS 'Type of property: apartment, flat, or land';
COMMENT ON COLUMN tenants.building_id IS 'ID of the building (for apartments only)';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tenants_property_id ON tenants(property_id);
CREATE INDEX IF NOT EXISTS idx_tenants_property_type ON tenants(property_type);
CREATE INDEX IF NOT EXISTS idx_tenants_building_id ON tenants(building_id);

-- Create composite index for efficient tenant lookup by property
CREATE INDEX IF NOT EXISTS idx_tenants_property_lookup ON tenants(property_id, property_type, is_active);

-- Verify the columns were added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'tenants' 
AND column_name IN ('property_id', 'property_type', 'building_id')
ORDER BY column_name;