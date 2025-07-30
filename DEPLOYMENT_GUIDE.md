# Production Deployment Guide for DocifyByMe

## 🚀 Overview
This guide covers complete production deployment for your GitHub documentation generator with 3D login, dual AI providers, and Supabase backend.

## 📋 Pre-Deployment Checklist

### 1. **Environment Setup Requirements**
- [ ] Node.js 18+ installed
- [ ] Git repository ready
- [ ] Domain name (optional but recommended)
- [ ] SSL certificate (handled by Netlify)

### 2. **Service Accounts & API Keys**
- [ ] Supabase project created
- [ ] GitHub OAuth app configured
- [ ] Google Gemini API key
- [ ] Mistral AI API key
- [ ] Netlify account

---

## 🔧 Database Setup (Supabase)

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Note your project URL and anon key

### Step 2: Database Schema
Run this SQL in Supabase SQL Editor:

```sql
-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  github_id INTEGER UNIQUE NOT NULL,
  username TEXT NOT NULL,
  email TEXT,
  name TEXT,
  avatar_url TEXT,
  access_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Repositories table
CREATE TABLE repositories (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  github_repo_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  description TEXT,
  language TEXT,
  stargazers_count INTEGER DEFAULT 0,
  forks_count INTEGER DEFAULT 0,
  html_url TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE,
  documentation_status TEXT DEFAULT 'pending',
  documentation_content TEXT,
  last_generated TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API usage tracking
CREATE TABLE api_usage (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- 'gemini' or 'mistral'
  endpoint TEXT NOT NULL,
  tokens_used INTEGER,
  cost DECIMAL(10,4),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE repositories ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own data" ON users FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can view own repositories" ON repositories FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own API usage" ON api_usage FOR ALL USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_repositories_user_id ON repositories(user_id);
CREATE INDEX idx_repositories_github_repo_id ON repositories(github_repo_id);
CREATE INDEX idx_api_usage_user_id ON api_usage(user_id);
CREATE INDEX idx_users_github_id ON users(github_id);
```

---

## 🔐 Authentication Setup (GitHub OAuth)

### Step 1: Create GitHub OAuth App
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Click "New OAuth App"
3. Fill in details:
   - **Application name**: DocifyByMe
   - **Homepage URL**: `https://your-domain.netlify.app` (or custom domain)
   - **Authorization callback URL**: `https://your-domain.netlify.app/api/auth/callback/github`
4. Save Client ID and Client Secret

### Step 2: Configure GitHub App Permissions
Ensure your OAuth app has these scopes:
- `read:user` - Read user profile
- `user:email` - Access user email
- `repo` - Access repositories (for documentation generation)

---

## 🤖 AI Service Setup

### Google Gemini API
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create API key
3. Enable Gemini Pro model access

### Mistral AI
1. Go to [Mistral Console](https://console.mistral.ai/)
2. Create account and API key
3. Choose appropriate model (mistral-medium recommended)

---

## 🌐 Netlify Deployment

### Step 1: Connect Repository
1. Push code to GitHub/GitLab/Bitbucket
2. Connect to Netlify
3. Import your repository

### Step 2: Build Settings
```toml
# netlify.toml (already configured in your project)
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

### Step 3: Environment Variables
Set these in Netlify dashboard (Site settings > Environment variables):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# NextAuth
NEXTAUTH_URL=https://your-domain.netlify.app
NEXTAUTH_SECRET=your_nextauth_secret_minimum_32_chars

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# AI APIs
GOOGLE_GEMINI_API_KEY=your_gemini_api_key
MISTRAL_API_KEY=your_mistral_api_key

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.netlify.app
```

---

## 🔒 Security Configuration

### 1. **NextAuth Secret Generation**
```bash
openssl rand -base64 32
```

### 2. **Environment Variable Security**
- ✅ Never commit `.env.local` to git
- ✅ Use Netlify's encrypted environment variables
- ✅ Rotate API keys regularly
- ✅ Set up Supabase RLS policies

### 3. **CORS Configuration**
Update Supabase settings:
- Add your production domain to allowed origins
- Configure API settings for your domain

### 4. **Content Security Policy**
Add to `next.config.js`:
```javascript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://your-project.supabase.co https://api.github.com https://generativelanguage.googleapis.com https://api.mistral.ai;"
          }
        ]
      }
    ]
  }
}
```

---

## ⚡ Performance Optimization

### 1. **Build Optimization**
```json
// package.json - already configured
{
  "scripts": {
    "build": "next build",
    "postbuild": "next-sitemap --config next-sitemap.config.js"
  }
}
```

### 2. **CDN & Caching**
Netlify automatically provides:
- ✅ Global CDN
- ✅ Automatic image optimization
- ✅ Static asset caching
- ✅ Brotli compression

### 3. **Bundle Analysis**
```bash
npm install --save-dev @next/bundle-analyzer
```

---

## 📊 Monitoring & Analytics

### 1. **Error Tracking**
Consider adding:
- Sentry for error tracking
- LogRocket for user session replay

### 2. **Performance Monitoring**
- Netlify Analytics (built-in)
- Google Analytics 4
- Web Vitals monitoring

### 3. **API Rate Limiting**
Implement in your API routes:
```javascript
// Rate limiting for AI API calls
const rateLimit = {
  gemini: 60, // requests per minute
  mistral: 30  // requests per minute
}
```

---

## 🚀 Deployment Steps

### 1. **Pre-Deploy Verification**
```bash
# Build locally first
npm run build

# Check for errors
npm run lint

# Test production build
npm start
```

### 2. **Deploy to Netlify**
```bash
# Method 1: Git-based deployment (recommended)
git push origin main

# Method 2: Netlify CLI
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

### 3. **Post-Deploy Verification**
- [ ] Test 3D login page loads
- [ ] GitHub OAuth works
- [ ] Repository fetching works
- [ ] Documentation generation works
- [ ] Mobile responsiveness
- [ ] SSL certificate active

---

## 🔄 CI/CD Pipeline

### GitHub Actions (Optional)
```yaml
# .github/workflows/deploy.yml
name: Deploy to Netlify
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run lint
```

---

## 🛡️ Security Best Practices

### 1. **API Security**
- Use HTTPS only
- Implement rate limiting
- Validate all inputs
- Use secure headers

### 2. **Database Security**
- Enable RLS on all tables
- Use service role key only for admin operations
- Regular security audits

### 3. **Secret Management**
- Use Netlify's encrypted environment variables
- Rotate secrets regularly
- Monitor for secret leaks in code

---

## 📱 Domain & SSL

### Custom Domain (Optional)
1. Purchase domain from registrar
2. Add to Netlify: Site settings > Domain management
3. Update DNS records
4. SSL certificate auto-provisioned

---

## 🐛 Troubleshooting

### Common Issues:
1. **Build Failures**: Check Node.js version (18+)
2. **OAuth Errors**: Verify callback URLs match exactly
3. **Database Errors**: Check RLS policies and connection strings
4. **3D Loading Issues**: Ensure Three.js assets are properly bundled

### Debug Commands:
```bash
# Check build logs
netlify logs

# Test locally with production env
npm run build && npm start

# Debug environment variables
console.log(process.env.NEXTAUTH_URL)
```

---

## 📈 Scaling Considerations

### When to Scale:
- High AI API usage → Implement caching
- Many concurrent users → Consider serverless functions
- Large documentation files → Add file compression
- Global users → Multi-region deployment

---

Your DocifyByMe project is now production-ready! 🎉

Remember to:
- Monitor API usage costs
- Backup your database regularly
- Keep dependencies updated
- Monitor performance metrics
