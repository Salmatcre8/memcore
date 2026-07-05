/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["cognee"],
  },
};

module.exports = nextConfig;
