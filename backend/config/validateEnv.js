// Simple environment variable validation for production/runtime safety.
// Fails fast if required secrets are missing. Extend as needed.

const REQUIRED_PROD_VARS = [
  'MONGO_URI',
  'JWT_SECRET',
  'FRONTEND_URL'
];

function validateEnv() {
  const missing = [];
  const isProd = (process.env.NODE_ENV === 'production');

  if (isProd) {
    for (const key of REQUIRED_PROD_VARS) {
      if (!process.env[key] || String(process.env[key]).trim() === '') {
        missing.push(key);
      }
    }
  }

  if (missing.length) {
    const message = `Missing required environment variables: ${missing.join(', ')}`;
    // Log redacted (do not print actual values) and throw to stop process early.
    console.error(message);
    throw new Error(message);
  }

  return true;
}

module.exports = { validateEnv };
