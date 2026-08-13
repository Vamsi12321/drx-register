/** @type {import('next').NextConfig} */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig = {
  reactStrictMode: false,
  basePath: basePath,
  assetPrefix: basePath,
};

module.exports = nextConfig;
