import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Enable experimental features for better development experience
  experimental: {
    // Enable server actions
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },

  // Image optimization settings
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },

  // Headers for security
  async headers() {
    // Prefer explicit app environment over NODE_ENV for security toggles
    const isProd = process.env.APP_ENV === 'production'

    const securityHeaders = [
      ...(isProd
        ? [{ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' }]
        : []),
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    ]

    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },

  // Redirects for better UX
  async redirects() {
    return [
      {
        source: '/me/notebook',
        destination: '/me',
        permanent: false,
      },
    ]
  },
}

export default nextConfig
