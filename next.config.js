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
  // Remove standalone output for better Amplify compatibility
  // output: 'standalone',
  // Ensure proper image optimization for Amplify
  images: {
    unoptimized: true,
  },
  // Add trailingSlash for better static hosting
  trailingSlash: true,
  // Expose environment variables to the browser
  env: {
    AMPLIFY_AWS_REGION: process.env.AMPLIFY_AWS_REGION,
    AMPLIFY_AWS_ACCESS_KEY_ID: process.env.AMPLIFY_AWS_ACCESS_KEY_ID,
    AMPLIFY_AWS_SECRET_ACCESS_KEY: process.env.AMPLIFY_AWS_SECRET_ACCESS_KEY,
  },
}

module.exports = nextConfig