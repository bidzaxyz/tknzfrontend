/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // ✅ replaces `next export`
  images: {
    unoptimized: true, // ✅ allows static image usage
  },
  reactStrictMode: true,
};

export default nextConfig;
