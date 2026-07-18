import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://*.firebaseapp.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://lh3.googleusercontent.com https://lh3.google.com; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://*.google.com; frame-src 'self' https://*.firebaseapp.com;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
