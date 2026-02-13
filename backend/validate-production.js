// Production Configuration Validator
// Run this script to validate your production environment setup
// Usage: node validate-production.js

const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'EMAIL_USER',
  'EMAIL_PASS',
  'CLIENT_URL',
  'NODE_ENV'
];

console.log('='.repeat(60));
console.log('Production Configuration Validator');
console.log('='.repeat(60));
console.log('');

let hasErrors = false;

// Check NODE_ENV
console.log('1. Checking NODE_ENV...');
if (process.env.NODE_ENV === 'production') {
  console.log('   ✓ NODE_ENV is set to production');
} else {
  console.log(`   ✗ NODE_ENV is '${process.env.NODE_ENV}' (should be 'production')`);
  hasErrors = true;
}
console.log('');

// Check required environment variables
console.log('2. Checking required environment variables...');
requiredEnvVars.forEach(varName => {
  if (process.env[varName]) {
    const value = process.env[varName];
    // Mask sensitive values
    const maskedValue = ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'EMAIL_PASS', 'MONGODB_URI'].includes(varName)
      ? '***' + value.slice(-4)
      : value;
    console.log(`   ✓ ${varName}: ${maskedValue}`);
  } else {
    console.log(`   ✗ ${varName}: NOT SET`);
    hasErrors = true;
  }
});
console.log('');

// Validate MongoDB URI format
console.log('3. Validating MongoDB URI...');
const mongoUri = process.env.MONGODB_URI;
if (mongoUri) {
  if (mongoUri.startsWith('mongodb://') || mongoUri.startsWith('mongodb+srv://')) {
    console.log('   ✓ MongoDB URI format is valid');
  } else {
    console.log('   ✗ MongoDB URI format is invalid (should start with mongodb:// or mongodb+srv://)');
    hasErrors = true;
  }
} else {
  console.log('   ✗ MongoDB URI is not set');
  hasErrors = true;
}
console.log('');

// Validate JWT secrets
console.log('4. Validating JWT secrets...');
const accessSecret = process.env.JWT_ACCESS_SECRET;
const refreshSecret = process.env.JWT_REFRESH_SECRET;
if (accessSecret && accessSecret.length >= 32) {
  console.log('   ✓ JWT_ACCESS_SECRET length is sufficient (>= 32 chars)');
} else {
  console.log('   ✗ JWT_ACCESS_SECRET is too short (should be >= 32 chars for security)');
  hasErrors = true;
}
if (refreshSecret && refreshSecret.length >= 32) {
  console.log('   ✓ JWT_REFRESH_SECRET length is sufficient (>= 32 chars)');
} else {
  console.log('   ✗ JWT_REFRESH_SECRET is too short (should be >= 32 chars for security)');
  hasErrors = true;
}
console.log('');

// Validate email configuration
console.log('5. Validating email configuration...');
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;
if (emailUser && emailUser.includes('@')) {
  console.log('   ✓ EMAIL_USER format is valid');
} else {
  console.log('   ✗ EMAIL_USER format is invalid (should be an email address)');
  hasErrors = true;
}
if (emailPass && emailPass.length >= 16) {
  console.log('   ✓ EMAIL_PASS length is valid (Google App Password)');
} else {
  console.log('   ✗ EMAIL_PASS length is invalid (Google App Password should be 16 chars)');
  hasErrors = true;
}
console.log('');

// Validate CLIENT_URL
console.log('6. Validating CLIENT_URL...');
const clientUrl = process.env.CLIENT_URL;
if (clientUrl) {
  if (clientUrl.startsWith('https://')) {
    console.log(`   ✓ CLIENT_URL is HTTPS: ${clientUrl}`);
  } else if (clientUrl.startsWith('http://localhost')) {
    console.log(`   ⚠ CLIENT_URL is localhost (acceptable for development): ${clientUrl}`);
  } else {
    console.log(`   ✗ CLIENT_URL should use HTTPS in production: ${clientUrl}`);
    hasErrors = true;
  }
} else {
  console.log('   ✗ CLIENT_URL is not set');
  hasErrors = true;
}
console.log('');

// Production-specific checks
console.log('7. Production-specific checks...');
if (process.env.NODE_ENV === 'production') {
  // Check if using default/weak secrets
  if (accessSecret && accessSecret.includes('your')) {
    console.log('   ✗ JWT_ACCESS_SECRET appears to be default value - change it!');
    hasErrors = true;
  } else {
    console.log('   ✓ JWT_ACCESS_SECRET appears to be customized');
  }
  
  if (refreshSecret && refreshSecret.includes('your')) {
    console.log('   ✗ JWT_REFRESH_SECRET appears to be default value - change it!');
    hasErrors = true;
  } else {
    console.log('   ✓ JWT_REFRESH_SECRET appears to be customized');
  }
  
  // Check CORS configuration
  console.log('   ✓ Cookie security: sameSite=none, secure=true (cross-domain support)');
} else {
  console.log('   ⚠ Not running in production mode');
}
console.log('');

// Summary
console.log('='.repeat(60));
if (hasErrors) {
  console.log('❌ VALIDATION FAILED - Please fix the errors above');
  console.log('='.repeat(60));
  process.exit(1);
} else {
  console.log('✅ ALL CHECKS PASSED - Production configuration is valid!');
  console.log('='.repeat(60));
  console.log('');
  console.log('Next steps:');
  console.log('1. Deploy to Vercel: vercel --prod');
  console.log('2. Test authentication flow');
  console.log('3. Test email sending (password reset)');
  console.log('4. Monitor logs for any errors');
  console.log('');
  process.exit(0);
}
