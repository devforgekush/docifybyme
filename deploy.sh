#!/bin/bash

# DocifyByMe Netlify Deployment Script

echo "🚀 Starting DocifyByMe deployment to Netlify..."

# Check if environment variables are set
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo "❌ Error: NEXT_PUBLIC_SUPABASE_URL environment variable is not set"
    exit 1
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo "❌ Error: NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable is not set"
    exit 1
fi

if [ -z "$GITHUB_CLIENT_ID" ]; then
    echo "❌ Error: GITHUB_CLIENT_ID environment variable is not set"
    exit 1
fi

echo "✅ Environment variables check passed"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build the project
echo "🔨 Building the project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo "🎉 Ready for Netlify deployment!"
else
    echo "❌ Build failed!"
    exit 1
fi
