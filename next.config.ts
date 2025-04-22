import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    return [
      // 统一处理所有API请求
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`
      }
    ]
  }
};

export default nextConfig;
