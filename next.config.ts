import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" }
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
  async headers() {
    const headers = process.env.NODE_ENV === "production"
      ? [...securityHeaders, { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" }]
      : securityHeaders;
    return [{ source: "/:path*", headers }];
  }
};

export default nextConfig;
