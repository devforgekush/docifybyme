# Netlify Deployment Guide for DocifyByMe

This guide will walk you through deploying your DocifyByMe application to Netlify.

## 🚀 Quick Deployment Steps

### 1. Prerequisites

Before deploying, make sure you have:
- A GitHub repository with your DocifyByMe code
- A Netlify account (free at [netlify.com](https://netlify.com))
- A Supabase project set up
- GitHub OAuth App configured
- AI API keys (Gemini and Mistral.ai)

### 2. Push to GitHub Repository

```bash
# Initialize git repository (if not already done)
git init
git add .
git commit -m "Initial commit: DocifyByMe GitHub Documentation Generator"

# Add your GitHub repository as remote
git remote add origin https://github.com/yourusername/docifybyme.git
git branch -M main
git push -u origin main
```

### 3. Deploy to Netlify

#### Option A: Automatic Deployment (Recommended)

1. **Connect to Netlify:**
   - Go to [netlify.com](https://netlify.com) and sign in
   - Click "New site from Git"
   - Choose "GitHub" and authorize Netlify
   - Select your `docifybyme` repository

2. **Configure Build Settings:**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Node version: `18`

3. **Set Environment Variables:**
   Go to Site Settings > Environment Variables and add:

   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # NextAuth Configuration
   NEXTAUTH_URL=https://your-site.netlify.app
   NEXTAUTH_SECRET=your_nextauth_secret_key

   # GitHub OAuth
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret

   # AI APIs
   GOOGLE_GEMINI_API_KEY=your_gemini_api_key
   MISTRAL_API_KEY=your_mistral_api_key

   # App Configuration
   NEXT_PUBLIC_APP_URL=https://your-site.netlify.app
   ```

4. **Deploy:**
   - Click "Deploy site"
   - Netlify will automatically build and deploy your site

#### Option B: Manual Deployment with Netlify CLI

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify:**
   ```bash
   netlify login
   ```

3. **Initialize Netlify site:**
   ```bash
   netlify init
   ```

4. **Deploy:**
   ```bash
   netlify deploy --prod
   ```

### 4. Post-Deployment Configuration

#### Update GitHub OAuth App

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Edit your OAuth App
3. Update the Authorization callback URL to:
   ```
   https://your-site.netlify.app/api/auth/callback/github
   ```

#### Update Supabase RLS Policies

If needed, update your Supabase RLS policies to include your new domain:

```sql
-- Example: Update auth policy if domain restrictions exist
-- This is usually not needed for the current setup
```

#### Configure Custom Domain (Optional)

1. In Netlify dashboard, go to Site Settings > Domain management
2. Add your custom domain
3. Update environment variables with your custom domain URL
4. Update GitHub OAuth callback URL with custom domain

### 5. Verify Deployment

1. **Check the site loads:** Visit your Netlify URL
2. **Test 3D login page:** Verify Three.js components render correctly
3. **Test GitHub OAuth:** Try logging in with GitHub
4. **Test API endpoints:** Check that all API routes work
5. **Test documentation generation:** Try generating docs for a repository

### 6. Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://abc123.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJ0eXAiOiJKV1Q...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | `eyJ0eXAiOiJKV1Q...` |
| `NEXTAUTH_URL` | Your app's URL | `https://your-site.netlify.app` |
| `NEXTAUTH_SECRET` | Random secret string | `your-secret-key` |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID | `Iv1.abc123def456` |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret | `abc123def456...` |
| `GOOGLE_GEMINI_API_KEY` | Google Gemini API key | `AIza...` |
| `MISTRAL_API_KEY` | Mistral.ai API key | `abc123...` |
| `NEXT_PUBLIC_APP_URL` | Your app's URL (public) | `https://your-site.netlify.app` |

### 7. Troubleshooting Common Issues

#### Build Fails
- Check Node.js version (should be 18+)
- Verify all environment variables are set
- Check for TypeScript errors

#### 3D Elements Don't Load
- Ensure Three.js assets are properly bundled
- Check browser console for WebGL errors
- Verify React Three Fiber compatibility

#### API Routes Don't Work
- Ensure Netlify Functions are enabled
- Check environment variables are set correctly
- Verify Supabase connection

#### GitHub OAuth Fails
- Verify callback URL matches exactly
- Check GitHub OAuth App settings
- Ensure NEXTAUTH_URL matches your site URL

### 8. Performance Optimization

For better performance on Netlify:

1. **Enable Edge Functions** (if available)
2. **Configure caching headers** (already included in netlify.toml)
3. **Use Netlify Image Optimization** for better image loading
4. **Enable Brotli compression**

### 9. Monitoring and Analytics

Consider adding:
- **Netlify Analytics** for site metrics
- **Sentry** for error tracking
- **LogRocket** for user session recording
- **Plausible** or **Vercel Analytics** for privacy-friendly analytics

### 10. Security Considerations

- Ensure all sensitive environment variables are server-side only
- Enable HTTPS (automatic with Netlify)
- Configure proper CORS headers
- Regularly update dependencies

## 🎉 Success!

Your DocifyByMe application should now be live on Netlify! 

Visit your site and test all features:
- 3D login experience
- GitHub authentication  
- Repository dashboard
- Documentation generation

## 📞 Support

If you encounter any issues:
1. Check the Netlify deploy logs
2. Review the browser console for client-side errors
3. Verify all environment variables are correct
4. Test your API endpoints individually

Happy documenting! 🚀
