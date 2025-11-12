/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    strictNullChecks: true,
  },
  eslint: {
    dirs: ['src', 'tests'],
  },

  // API route configuration
  async headers() {
    return [
      {
        // CORS headers for API routes
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, MCP-Session-Id' },
        ],
      },
    ];
  },

  // Rewrites for convenience
  async rewrites() {
    return [
      {
        source: '/mcp',
        destination: '/api/mcp',
      },
      {
        source: '/oauth/token',
        destination: '/api/oauth/token',
      },
    ];
  },
};

module.exports = nextConfig;
