/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '8mb', // cho phép upload ảnh/sheet vừa phải trong Server Actions
    },
  },
};

module.exports = nextConfig;
