#!/usr/bin/env node

/**
 * Production Readiness Check for DocifyByMe
 * Run with: node check-production-ready.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 DocifyByMe Production Readiness Check\n');

const checks = [];
let passedChecks = 0;
let totalChecks = 0;

function addCheck(name, condition, message) {
  totalChecks++;
  if (condition) {
    console.log(`✅ ${name}`);
    passedChecks++;
  } else {
    console.log(`❌ ${name} - ${message}`);
  }
  checks.push({ name, passed: condition, message });
}

// Check if essential files exist
addCheck(
  'Package.json exists',
  fs.existsSync('./package.json'),
  'package.json file is missing'
);

addCheck(
  'Next.js config exists',
  fs.existsSync('./next.config.js') || fs.existsSync('./next.config.mjs'),
  'next.config.js file is missing'
);

addCheck(
  'Netlify config exists',
  fs.existsSync('./netlify.toml'),
  'netlify.toml file is missing'
);

addCheck(
  'Environment example exists',
  fs.existsSync('./.env.example'),
  '.env.example file is missing'
);

// Check package.json content
let packageJson = {};
try {
  packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
} catch (e) {
  console.log('❌ Could not read package.json');
}

addCheck(
  'Build script configured',
  packageJson.scripts && packageJson.scripts.build,
  'npm run build script is missing'
);

addCheck(
  'Start script configured',
  packageJson.scripts && packageJson.scripts.start,
  'npm run start script is missing'
);

addCheck(
  'Next.js dependency present',
  packageJson.dependencies && packageJson.dependencies.next,
  'Next.js dependency is missing'
);

addCheck(
  'NextAuth dependency present',
  packageJson.dependencies && packageJson.dependencies['next-auth'],
  'NextAuth dependency is missing'
);

addCheck(
  'Supabase dependency present',
  packageJson.dependencies && packageJson.dependencies['@supabase/supabase-js'],
  'Supabase dependency is missing'
);

addCheck(
  'Three.js dependencies present',
  packageJson.dependencies && packageJson.dependencies['three'] && packageJson.dependencies['@react-three/fiber'],
  'Three.js dependencies are missing'
);

// Check essential component files
addCheck(
  'Login3D component exists',
  fs.existsSync('./src/components/Login3D.tsx') || fs.existsSync('./components/Login3D.tsx'),
  'Login3D component file is missing'
);

addCheck(
  'Dashboard component exists',
  fs.existsSync('./src/components/Dashboard.tsx') || fs.existsSync('./components/Dashboard.tsx'),
  'Dashboard component file is missing'
);

// Check service files
addCheck(
  'Supabase service exists',
  fs.existsSync('./src/lib/supabase.ts') || fs.existsSync('./lib/supabase.ts'),
  'Supabase service file is missing'
);

addCheck(
  'AI service exists',
  fs.existsSync('./src/lib/ai-service.ts') || fs.existsSync('./lib/ai-service.ts'),
  'AI service file is missing'
);

addCheck(
  'GitHub service exists',
  fs.existsSync('./src/lib/github-service.ts') || fs.existsSync('./lib/github-service.ts'),
  'GitHub service file is missing'
);

// Check API routes
const apiPath = './src/app/api';
addCheck(
  'Auth API route exists',
  fs.existsSync(`${apiPath}/auth/[...nextauth]/route.ts`),
  'NextAuth API route is missing'
);

addCheck(
  'Repositories API route exists',
  fs.existsSync(`${apiPath}/repositories/route.ts`),
  'Repositories API route is missing'
);

addCheck(
  'Generate docs API route exists',
  fs.existsSync(`${apiPath}/generate-docs/route.ts`),
  'Generate docs API route is missing'
);

// Check configuration files
let netlifyConfig = '';
try {
  netlifyConfig = fs.readFileSync('./netlify.toml', 'utf8');
} catch (e) {
  // Already checked above
}

addCheck(
  'Netlify build command configured',
  netlifyConfig.includes('npm run build'),
  'Netlify build command not properly configured'
);

addCheck(
  'Netlify Next.js plugin configured',
  netlifyConfig.includes('@netlify/plugin-nextjs'),
  'Netlify Next.js plugin not configured'
);

// Environment variables check
let envExample = '';
try {
  envExample = fs.readFileSync('./.env.example', 'utf8');
} catch (e) {
  // Already checked above
}

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXTAUTH_SECRET',
  'GITHUB_CLIENT_ID',
  'GOOGLE_GEMINI_API_KEY'
];

requiredEnvVars.forEach(envVar => {
  addCheck(
    `${envVar} in .env.example`,
    envExample.includes(envVar),
    `${envVar} is missing from .env.example`
  );
});

console.log('\n' + '='.repeat(50));
console.log(`📊 Results: ${passedChecks}/${totalChecks} checks passed`);

if (passedChecks === totalChecks) {
  console.log('\n🎉 Your project is ready for production deployment!');
  console.log('\n📋 Next steps:');
  console.log('1. Run: node generate-secrets.js');
  console.log('2. Set up Supabase database');
  console.log('3. Configure GitHub OAuth app');
  console.log('4. Set environment variables in Netlify');
  console.log('5. Deploy to Netlify');
} else {
  console.log('\n⚠️  Some issues need to be resolved before deployment.');
  console.log('\n🔧 Failed checks that need attention:');
  checks.filter(check => !check.passed).forEach(check => {
    console.log(`   • ${check.name}: ${check.message}`);
  });
}

console.log('\n📚 For detailed deployment instructions, see:');
console.log('   • DEPLOYMENT_GUIDE.md');
console.log('   • DEPLOYMENT_CHECKLIST.md');

process.exit(passedChecks === totalChecks ? 0 : 1);
