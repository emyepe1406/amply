/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Disable ESLint during production builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript errors during production builds
    ignoreBuildErrors: true,
  },
  // Use the new serverExternalPackages instead of deprecated serverComponentsExternalPackages
  serverExternalPackages: ['aws-sdk'],
  // Disable static optimization for better Amplify compatibility
  output: 'standalone',
  // Ensure proper image optimization for Amplify
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig