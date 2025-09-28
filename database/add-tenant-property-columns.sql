-- Add property linking columns to tenants table if they don't exist
-- This allows direct linking of tenants to properties without using the property_tenants table

-- Add property_id column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tenants' AND column_name = 'property_id') THEN
        ALTER TABLE tenants ADD COLUMN property_id UUID;
    END IF;
END $$;

-- Add property_type column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tenants' AND column_name = 'property_type') THEN
        ALTER TABLE tenants ADD COLUMN property_type VARCHAR(20);
    END IF;
END $$;

-- Add building_id column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tenants' AND column_name = 'building_id') THEN
        ALTER TABLE tenants ADD COLUMN building_id UUID;
    END IF;
END $$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tenants_property_id ON tenants(property_id);
CREATE INDEX IF NOT EXISTS idx_tenants_property_type ON tenants(property_type);
CREATE INDEX IF NOT EXISTS idx_tenants_building_id ON tenants(building_id);
CREATE INDEX IF NOT EXISTS idx_tenants_active ON tenants(is_active);

-- Add a composite index for efficient tenant lookup by property
CREATE INDEX IF NOT EXISTS idx_tenants_property_lookup ON tenants(property_id, property_type, is_active);