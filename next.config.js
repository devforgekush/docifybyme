/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization configuration
  images: {
    formats: ['image/webp', 'image/avif'],
    // Use remotePatterns instead of deprecated domains
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'github.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      }
    ]
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()'
          }
        ]
      },
      // Specific headers for static assets
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ]
  },

  // Webpack configuration for Three.js and other optimizations
  webpack: (config, { dev, isServer }) => {
    // Three.js optimization - only add if loaders are available
    try {
      config.module.rules.push({
        test: /\.(glsl|vs|fs|vert|frag)$/,
        use: ['raw-loader']
      })
    } catch (error) {
      console.warn('GLSL loader not available, skipping shader file support')
    }

    // Handle canvas and WebGL in SSR
    if (isServer) {
      config.externals = config.externals || []
      config.externals.push({
        canvas: 'canvas',
        'three': 'three'
      })
    }

    // Bundle analyzer for production builds - only if package is installed
    if (!dev && !isServer && process.env.ANALYZE === 'true') {
      try {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
        config.plugins = config.plugins || []
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
            reportFilename: './analyze/client.html'
          })
        )
      } catch (error) {
        console.warn('webpack-bundle-analyzer not installed, skipping bundle analysis')
      }
    }

    return config
  },

  // Production optimizations
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Remove problematic i18n config that can cause build issues
  // Add back only if you need internationalization
  
  // Remove standalone output mode as it's not needed for Netlify
  // output: 'standalone',

  // Environment variables to expose to the client
  env: {
    CUSTOM_BUILD_TIME: new Date().toISOString(),
  },

  // Optimize for Netlify deployment
  trailingSlash: false,
}

module.exports = nextConfig
