#!/usr/bin/env node

/**
 * Quick Supabase Connection Check
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables manually
function loadEnvFile() {
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    envContent.split('\n').forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#')) {
        const equalIndex = line.indexOf('=');
        if (equalIndex > 0) {
          const key = line.substring(0, equalIndex).trim();
          const value = line.substring(equalIndex + 1).trim();
          process.env[key] = value;
        }
      }
    });
    console.log('✅ Loaded .env.local file');
  } catch (err) {
    console.log('❌ Could not load .env.local file:', err.message);
  }
}

loadEnvFile();

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  header: (msg) => console.log(`\n${colors.bold}${colors.blue}${msg}${colors.reset}\n`)
};

async function checkSupabase() {
  log.header('🔍 Supabase Connection Check');

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    log.error('NEXT_PUBLIC_SUPABASE_URL is not set in .env.local');
    return false;
  }
  if (!supabaseKey) {
    log.error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set in .env.local');
    return false;
  }

  log.success('Environment variables found');
  log.info(`URL: ${supabaseUrl}`);
  log.info(`Key: ${supabaseKey.substring(0, 20)}...`);

  // Initialize client
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Test connection
    log.info('Testing connection to family_members table...');
    const { data, error } = await supabase
      .from('family_members')
      .select('count');

    if (error) {
      log.error(`Connection failed: ${error.message}`);
      
      if (error.code === '42P01') {
        log.warning('Table "family_members" does not exist!');
        log.info('This means you need to run the database schema.');
        console.log('\n' + colors.yellow + '📋 To fix this:' + colors.reset);
        console.log('1. Go to your Supabase dashboard: https://supabase.com/dashboard');
        console.log('2. Select your project');
        console.log('3. Go to SQL Editor');
        console.log('4. Create a new query');
        console.log('5. Copy the entire content from database/supabase-schema.sql');
        console.log('6. Paste and run the SQL');
        console.log('7. Run this script again to verify');
      } else if (error.code === '401') {
        log.error('Authentication failed - check your API key');
      } else {
        log.error(`Unknown error: ${error.code} - ${error.message}`);
      }
      
      return false;
    }

    log.success('Connection successful!');
    log.info(`Query result: ${JSON.stringify(data)}`);

    // Test a simple insert/delete to verify permissions
    log.info('Testing write permissions...');
    const testData = {
      full_name: 'Test User',
      nickname: 'Test',
      relationship: 'Other'
    };

    const { data: insertData, error: insertError } = await supabase
      .from('family_members')
      .insert(testData)
      .select()
      .single();

    if (insertError) {
      log.error(`Write test failed: ${insertError.message}`);
      if (insertError.code === '42501') {
        log.warning('Permission denied - check Row Level Security policies');
      }
      return false;
    }

    log.success('Write test successful!');

    // Clean up test data
    if (insertData) {
      await supabase
        .from('family_members')
        .delete()
        .eq('id', insertData.id);
      log.info('Test data cleaned up');
    }

    log.header('🎉 All tests passed!');
    console.log('Your Supabase connection is working correctly.');
    console.log('You can now use the Family Management system.');
    
    return true;

  } catch (err) {
    log.error(`Unexpected error: ${err.message}`);
    return false;
  }
}

checkSupabase()
  .then((success) => {
    if (!success) {
      console.log('\n' + colors.red + '❌ Supabase check failed' + colors.reset);
      console.log('Please fix the issues above and try again.');
    }
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Script error:', error);
    process.exit(1);
  });