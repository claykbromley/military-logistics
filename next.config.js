/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {},
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  // Use src/pages as the pages directory
  experimental: {
    outputFileTracingRoot: undefined,
  },
};

module.exports = nextConfig;
