/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        // Remove the /api prefix when forwarding to the backend
        source: "/api/:path*",
        destination: "https://gender-healthcare.org/:path*",
      },
    ];
  },

  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          {
            key: "Access-Control-Allow-Origin",
            value: "http://localhost:3000",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,DELETE,PATCH,POST,PUT,OPTIONS",
          },
          { key: "Access-Control-Allow-Headers", value: "*" },
        ],
      },
    ];
  },

  images: {
    domains: [
      "d3fdwgxfvcmuj8.cloudfront.net",
      "d4vjsyqlv6u6j.cloudfront.net",
      "gender-healthcare.org",
      // thêm các domain khác nếu cần
    ],
  },
};

module.exports = nextConfig;
