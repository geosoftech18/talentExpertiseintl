/** @type {import('next').NextConfig} */
const nextConfig = {
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
