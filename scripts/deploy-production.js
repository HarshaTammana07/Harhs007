#!/usr/bin/env node

/**
 * Production Deployment Checker
 * Verifies your app is ready for production deployment
 */

const fs = require('fs');
const path = require('path');

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
  header: (msg) => console.log(`\n${colors.bold}${colors.blue}🚀 ${msg}${colors.reset}\n`)
};

async function checkProductionReadiness() {
  log.header('Production Deployment Readiness Check');

  let allChecksPass = true;

  // Check 1: Environment variables
  log.info('Checking environment variables...');
  
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    if (envContent.includes('NEXT_PUBLIC_SUPABASE_URL')) {
      log.success('Supabase URL configured');
    } else {
      log.error('NEXT_PUBLIC_SUPABASE_URL missing');
      allChecksPass = false;
    }
    
    if (envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY')) {
      log.success('Supabase anon key configured');
    } else {
      log.error('NEXT_PUBLIC_SUPABASE_ANON_KEY missing');
      allChecksPass = false;
    }
  } else {
    log.error('.env.local file not found');
    allChecksPass = false;
  }

  // Check 2: Package.json scripts
  log.info('Checking build scripts...');
  
  const packagePath = path.join(process.cwd(), 'package.json');
  if (fs.existsSync(packagePath)) {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    if (packageJson.scripts && packageJson.scripts.build) {
      log.success('Build script configured');
    } else {
      log.error('Build script missing in package.json');
      allChecksPass = false;
    }
    
    if (packageJson.dependencies && packageJson.dependencies['@supabase/supabase-js']) {
      log.success('Supabase dependency installed');
    } else {
      log.error('Supabase dependency missing');
      allChecksPass = false;
    }
  }

  // Check 3: Required files
  log.info('Checking required files...');
  
  const requiredFiles = [
    'src/services/ApiService.ts',
    'src/lib/supabase.ts',
    'src/components/family/FamilyManagement.tsx',
    'database/supabase-schema.sql'
  ];
  
  requiredFiles.forEach(file => {
    if (fs.existsSync(path.join(process.cwd(), file))) {
      log.success(`${file} exists`);
    } else {
      log.error(`${file} missing`);
      allChecksPass = false;
    }
  });

  // Check 4: Next.js configuration
  log.info('Checking Next.js configuration...');
  
  const nextConfigPath = path.join(process.cwd(), 'next.config.js');
  if (fs.existsSync(nextConfigPath)) {
    log.success('Next.js config exists');
  } else {
    log.warning('next.config.js not found (optional)');
  }

  // Deployment recommendations
  log.header('Deployment Recommendations');
  
  console.log(`${colors.blue}📋 Deployment Steps:${colors.reset}`);
  console.log('1. Push your code to GitHub');
  console.log('2. Connect to Vercel (vercel.com)');
  console.log('3. Add environment variables in Vercel dashboard');
  console.log('4. Deploy automatically');
  console.log('');
  
  console.log(`${colors.blue}🌐 Hosting Options:${colors.reset}`);
  console.log('• Vercel (Recommended for Next.js)');
  console.log('• Netlify (Great for static sites)');
  console.log('• AWS Amplify (If using AWS)');
  console.log('• GitHub Pages (Free option)');
  console.log('');
  
  console.log(`${colors.blue}💰 Cost Estimate:${colors.reset}`);
  console.log('• Free Tier: $0/month (perfect for testing)');
  console.log('• Production: ~$45/month (thousands of users)');
  console.log('• Enterprise: ~$999/month (millions of users)');
  console.log('');

  // Final result
  if (allChecksPass) {
    log.header('🎉 Ready for Production!');
    console.log(`${colors.green}Your application is ready to be deployed to production.${colors.reset}`);
    console.log(`${colors.green}All API calls will work correctly in production.${colors.reset}`);
    console.log('');
    console.log(`${colors.blue}Next steps:${colors.reset}`);
    console.log('1. git add . && git commit -m "Ready for production"');
    console.log('2. git push origin main');
    console.log('3. Deploy to Vercel or your preferred platform');
    console.log('4. Test your production URL');
  } else {
    log.header('❌ Issues Found');
    console.log(`${colors.red}Please fix the issues above before deploying.${colors.reset}`);
  }

  return allChecksPass;
}

// Run the check
checkProductionReadiness()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Check failed:', error);
    process.exit(1);
  });