/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
 
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'flagcdn.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
      {
        protocol: 'https',
        hostname: '*.wikimedia.org',
      },
    ],
  },
  // Turbopack config (Next.js 16+)
  turbopack: {},
  // Webpack config (for production builds)
  webpack: (config) => {
    // Suppress warnings for optional dependencies
    config.ignoreWarnings = [
      { module: /@sendgrid\/mail/ },
      { module: /nodemailer/ },
    ]
    
    return config
  },
}

export default nextConfig
