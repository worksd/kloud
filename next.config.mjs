/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
    ],
    localPatterns: [
      {
        pathname: '/study/**',
      },
    ]
  }
};

export default nextConfig;
