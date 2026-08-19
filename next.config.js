/** @type {import('next').NextConfig} */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig = {
  reactStrictMode: false,
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
};

module.exports = nextConfig;
