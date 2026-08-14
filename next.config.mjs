/** @type {import('next').NextConfig} */
const nextConfig = {
  // 🔧 Assumption: no custom domain or image optimization needed for this demo
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "prisma"],
  },
};

export default nextConfig;
