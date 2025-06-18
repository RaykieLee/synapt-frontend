import type { NextConfig } from "next";

// // 在模块加载时立即打印环境变量信息（这会在启动时显示）
// console.log('=== Next.js 配置加载 ===');
// console.log('NEXT_PUBLIC_BACKEND_URL:', process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000');
// console.log('NEXT_PUBLIC_VIDEO_HOST:', process.env.NEXT_PUBLIC_VIDEO_HOST || '127.0.0.1');
// console.log('NEXT_PUBLIC_VIDEO_PORT:', process.env.NEXT_PUBLIC_VIDEO_PORT || '8080');
// console.log('========================');

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
    // 在构建时获取环境变量
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    console.log('构建时 Rewrites - NEXT_PUBLIC_BACKEND_URL:', backendUrl);
    
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
