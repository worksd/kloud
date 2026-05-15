/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*',
      },
      {
        protocol: 'http',
        hostname: '*',
      }
    ],
    qualities: [50, 60, 70, 75],
    // optimizer가 디스크 캐시에 보관할 최소 시간 (초). 7일.
    minimumCacheTTL: 60 * 60 * 24 * 7,
  },
  webpack: config => {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },
  // Turbopack 설정 (Next.js 16에서 webpack과 함께 사용 시 필요)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
};

export default nextConfig;
