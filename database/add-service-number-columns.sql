-- Add service_number column to apartments and flats tables
-- This migration adds the service_number field for utility service tracking

-- Add service_number column to apartments table
ALTER TABLE apartments ADD COLUMN IF NOT EXISTS service_number VARCHAR(50);

-- Add service_number column to flats table  
ALTER TABLE flats ADD COLUMN IF NOT EXISTS service_number VARCHAR(50);

-- Add comments for documentation
COMMENT ON COLUMN apartments.service_number IS 'Service number for utilities (electricity, water, etc.)';
COMMENT ON COLUMN flats.service_number IS 'Service number for utilities (electricity, water, etc.)';
