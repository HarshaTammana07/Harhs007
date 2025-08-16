const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addTenantColumns() {
  try {
    console.log('🔧 Adding property linking columns to tenants table...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, '../database/add-tenant-property-linking-columns.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error('❌ Error adding columns:', error);
      
      // Try alternative approach - execute each statement separately
      console.log('🔄 Trying alternative approach...');
      
      const statements = [
        'ALTER TABLE tenants ADD COLUMN IF NOT EXISTS property_id UUID;',
        'ALTER TABLE tenants ADD COLUMN IF NOT EXISTS property_type VARCHAR(20);',
        'ALTER TABLE tenants ADD COLUMN IF NOT EXISTS building_id UUID;'
      ];
      
      for (const statement of statements) {
        console.log(`Executing: ${statement}`);
        const { error: stmtError } = await supabase.rpc('exec_sql', { sql_query: statement });
        if (stmtError) {
          console.error(`Error with statement: ${statement}`, stmtError);
        } else {
          console.log('✅ Statement executed successfully');
        }
      }
    } else {
      console.log('✅ Columns added successfully');
    }
    
    // Verify columns exist
    console.log('🔍 Verifying columns...');
    const { data: columns, error: verifyError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'tenants')
      .in('column_name', ['property_id', 'property_type', 'building_id']);
    
    if (verifyError) {
      console.error('❌ Error verifying columns:', verifyError);
    } else {
      console.log('📋 Tenant table columns:');
      columns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
addTenantColumns();