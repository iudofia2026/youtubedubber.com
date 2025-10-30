#!/usr/bin/env node

const required = ['NEXT_PUBLIC_API_URL', 'NEXT_PUBLIC_APP_URL'];
const missing = required.filter(v => !process.env[v]);

if (missing.length > 0) {
  console.error('ERROR: Missing required env vars:', missing.join(', '));
  process.exit(1);
}

const { NODE_ENV, NEXT_PUBLIC_DEV_MODE, NEXT_PUBLIC_API_URL } = process.env;

if (NODE_ENV === 'production' && NEXT_PUBLIC_DEV_MODE === 'true') {
  console.error('CRITICAL: NEXT_PUBLIC_DEV_MODE=true in production build!');
  process.exit(1);
}

if (NODE_ENV === 'production' && NEXT_PUBLIC_API_URL?.includes('localhost')) {
  console.warn('WARNING: API URL points to localhost in production');
}

console.log('✓ Environment validated');
