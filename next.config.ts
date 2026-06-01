import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  env: {
    DATABASE_URL: 'postgresql://postgres:password@localhost:5432/mydb?schema=public',
  },
  output: 'standalone',

  images: {
    localPatterns: [
      {
        pathname: '/uploads/**',
        // search: '', // /uploads/avatar.jpg - работает, /uploads/avatar.jpg?test=1234 - не работает
      },
    ],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '188.225.33.34',
        port: '',
        pathname: '/uploads/**',
      },
    ],
    // Это для генерации через Sharp для компонента next/image
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
}

export default nextConfig