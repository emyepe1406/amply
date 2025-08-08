const fs = require('fs');
const path = require('path');

// Required environment variables for production
const requiredEnvVars = [
  'AWS_REGION',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'DYNAMODB_USERS_TABLE',
  'DYNAMODB_COURSES_TABLE',
  'DYNAMODB_PROGRESS_TABLE',
  'S3_BUCKET_NAME',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'NEXT_PUBLIC_BASE_URL',
  'IPAYMU_VA',
  'IPAYMU_SECRET',
  'IPAYMU_API_KEY',
  'ADMIN_USERNAME',
  'ADMIN_PASSWORD'
];

// Load environment variables
require('dotenv').config({ path: '.env.production' });

function validateEnvironment() {
  console.log('🔍 Validating production environment...');
  
  const errors = [];
  const warnings = [];
  
  // Check if .env.production exists
  const envPath = path.join(process.cwd(), '.env.production');
  if (!fs.existsSync(envPath)) {
    errors.push('❌ .env.production file not found');
    return { errors, warnings };
  }
  
  // Check required environment variables
  requiredEnvVars.forEach(varName => {
    const value = process.env[varName];
    
    if (!value) {
      errors.push(`❌ Missing required environment variable: ${varName}`);
    } else if (value.includes('your_') || value.includes('your-')) {
      warnings.push(`⚠️  Environment variable ${varName} contains placeholder value`);
    }
  });
  
  // Specific validations
  
  // NEXTAUTH_SECRET should be at least 32 characters
  if (process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.length < 32) {
    warnings.push('⚠️  NEXTAUTH_SECRET should be at least 32 characters long');
  }
  
  // URLs should be HTTPS in production
  const urls = ['NEXTAUTH_URL', 'NEXT_PUBLIC_BASE_URL'];
  urls.forEach(urlVar => {
    const url = process.env[urlVar];
    if (url && !url.startsWith('https://')) {
      warnings.push(`⚠️  ${urlVar} should use HTTPS in production`);
    }
  });
  
  // S3 bucket name should be unique
  if (process.env.S3_BUCKET_NAME && process.env.S3_BUCKET_NAME === 'lms-content-prod') {
    warnings.push('⚠️  S3_BUCKET_NAME should be unique (add suffix like -yourname)');
  }
  
  // Admin password should be strong
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminPassword) {
    if (adminPassword.length < 8) {
      warnings.push('⚠️  ADMIN_PASSWORD should be at least 8 characters long');
    }
    if (adminPassword === 'admin' || adminPassword === 'password') {
      errors.push('❌ ADMIN_PASSWORD is too weak');
    }
  }
  
  return { errors, warnings };
}

function generateNextAuthSecret() {
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('hex');
}

function main() {
  console.log('🚀 Production Environment Validator\n');
  
  const { errors, warnings } = validateEnvironment();
  
  // Display results
  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ All environment variables are properly configured!');
    console.log('🎉 Ready for production deployment!');
    return;
  }
  
  if (errors.length > 0) {
    console.log('🚨 ERRORS (must fix before deployment):');
    errors.forEach(error => console.log(`   ${error}`));
    console.log('');
  }
  
  if (warnings.length > 0) {
    console.log('⚠️  WARNINGS (recommended to fix):');
    warnings.forEach(warning => console.log(`   ${warning}`));
    console.log('');
  }
  
  // Helpful suggestions
  console.log('💡 SUGGESTIONS:');
  
  if (errors.some(e => e.includes('NEXTAUTH_SECRET'))) {
    console.log(`   Generate NEXTAUTH_SECRET: ${generateNextAuthSecret()}`);
  }
  
  if (warnings.some(w => w.includes('S3_BUCKET_NAME'))) {
    const uniqueSuffix = Math.random().toString(36).substring(2, 8);
    console.log(`   Unique S3 bucket name: lms-content-prod-${uniqueSuffix}`);
  }
  
  console.log('   📖 See DEPLOYMENT.md for detailed setup instructions');
  console.log('   🔧 Update .env.production with correct values');
  
  if (errors.length > 0) {
    console.log('\n❌ Environment validation failed. Fix errors before deployment.');
    process.exit(1);
  } else {
    console.log('\n✅ Environment validation passed with warnings.');
  }
}

if (require.main === module) {
  main();
}

module.exports = { validateEnvironment, generateNextAuthSecret };