/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // For react-d3-tree or libraries requiring 'canvas'
  webpack: (config) => {
    config.externals = [...(config.externals || []), { canvas: 'canvas' }];
    return config;
  },

  // Disable ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Microsoft Teams compatibility: allow iframe embedding
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL',
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://*.teams.microsoft.com https://teams.microsoft.com;",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
