/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',   // ✅ Forces Netlify to build full SSR, not static export
  reactStrictMode: true,
};

export default nextConfig;
