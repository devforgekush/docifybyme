#!/usr/bin/env node

/**
 * Secret Generator for DocifyByMe Production Deployment
 * Run with: node generate-secrets.js
 */

const crypto = require('crypto');

console.log('🔐 DocifyByMe Production Secrets Generator\n');

// Generate NextAuth Secret
const nextAuthSecret = crypto.randomBytes(32).toString('base64');
console.log('NEXTAUTH_SECRET (copy this to your environment variables):');
console.log(`NEXTAUTH_SECRET=${nextAuthSecret}\n`);

// Generate a session secret for additional security
const sessionSecret = crypto.randomBytes(16).toString('hex');
console.log('Additional Session Secret (optional):');
console.log(`SESSION_SECRET=${sessionSecret}\n`);

// Generate database encryption key (for sensitive data)
const dbEncryptionKey = crypto.randomBytes(32).toString('hex');
console.log('Database Encryption Key (for sensitive data storage):');
console.log(`DB_ENCRYPTION_KEY=${dbEncryptionKey}\n`);

console.log('🚨 IMPORTANT SECURITY NOTES:');
console.log('1. Keep these secrets secure and never commit them to version control');
console.log('2. Store them in Netlify environment variables only');
console.log('3. Use different secrets for development and production');
console.log('4. Rotate these secrets periodically for enhanced security');
console.log('5. The NEXTAUTH_SECRET is required for authentication to work\n');

console.log('📋 DEPLOYMENT CHECKLIST:');
console.log('□ Copy NEXTAUTH_SECRET to Netlify environment variables');
console.log('□ Set up Supabase database with provided schema');
console.log('□ Configure GitHub OAuth app with production callback URL');
console.log('□ Add all required API keys to Netlify environment');
console.log('□ Test deployment with npm run build');
console.log('□ Verify all features work in production\n');

console.log('✅ Secrets generated successfully!');
console.log('Next: Copy these to your Netlify environment variables and deploy!');
