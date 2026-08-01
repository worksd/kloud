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
    qualities: [10, 20, 50, 60, 70, 75],
    // optimizer가 디스크 캐시에 보관할 최소 시간 (초). 7일.
    minimumCacheTTL: 60 * 60 * 24 * 7,
  },
  // 죽은 경로 → 루트. 404 화면 대신 홈으로 보낸다.
  // 나중에 실제 페이지가 생길 수 있으니 308(영구)이 아니라 307(임시) — 브라우저에 영구 캐시되면 되돌리기 어렵다.
  async redirects() {
    return [
      { source: '/ko/offline/hongdae', destination: '/', permanent: false },
    ];
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
