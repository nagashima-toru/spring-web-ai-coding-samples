// eslint-disable-next-line @typescript-eslint/no-require-imports
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: false,
});
// eslint-disable-next-line @typescript-eslint/no-require-imports
const createNextIntlPlugin = require('next-intl/plugin');
const withNextIntl = createNextIntlPlugin('./src/core/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // API proxy for development
  async rewrites() {
    // Disable rewrites if NEXT_PUBLIC_API_URL is set (use client-side requests instead)
    if (process.env.NEXT_PUBLIC_API_URL) {
      return [];
    }

    const apiUrl = process.env.API_REWRITE_URL || 'http://localhost:8080/api/:path*';
    return [
      {
        source: '/api/:path*',
        destination: apiUrl,
      },
    ];
  },
};

module.exports = withNextIntl(withBundleAnalyzer(nextConfig));
