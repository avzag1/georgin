import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    localPatterns: [
      {
        pathname: '/**', 
      },
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's3.twcstorage.ru', // Вариант 1 (Основной)
        port: '',
        pathname: '/**', 
      },
      {
        protocol: 'https',
        hostname: 'twcstorage.ru',    // Вариант 2 (Резервный страховочный)
        port: '',
        pathname: '/**', 
      },
    ],
  },
  output: 'standalone', 
};

export default nextConfig;
