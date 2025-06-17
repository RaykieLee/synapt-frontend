import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: 'export',
  // images: {
  //   unoptimized: true,
  // },
  /* config options here */
  async redirects() {
    return [
      {
        source: '/',
        destination: '/ai-experience',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    // 在运行时获取环境变量
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    console.log('Rewrites - NEXT_PUBLIC_BACKEND_URL:', backendUrl);
    
    return [
      // 统一处理所有API请求
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`
      }
    ]
  },
  
  // 确保环境变量在客户端可用
  env: {
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
};

export default nextConfig;
