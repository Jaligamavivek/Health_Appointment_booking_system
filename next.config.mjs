/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // Skip TypeScript checking during build for faster deployment
    ignoreBuildErrors: process.env.SKIP_ENV_VALIDATION === "1",
  },
};

export default nextConfig;
