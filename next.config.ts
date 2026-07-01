import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3"],

  async headers() {
    // 'unsafe-eval' is only needed by Next.js dev tooling (fast refresh)
    const isDev = process.env.NODE_ENV !== "production";
    const securityHeaders = [
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      // Only sent over HTTPS (Cloudflare Tunnel); browsers ignore it on plain HTTP
      { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
      {
        key: "Content-Security-Policy",
        value: [
          "default-src 'self'",
          `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data:",
          "font-src 'self'",
          "connect-src 'self'",
          "frame-ancestors 'none'",
          "base-uri 'self'",
          "form-action 'self'",
        ].join("; "),
      },
    ];

    return [
      {
        // Security headers on every route
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        // App shell HTML — iOS Safari serves from HTTP cache when offline (SW requires HTTPS on iOS;
        // this header is the HTTP-only fallback). stale-while-revalidate=604800 means: serve the
        // cached page for up to 7 days if the Pi is unreachable, while trying to update in the background.
        source: "/",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, stale-while-revalidate=604800",
          },
        ],
      },
      {
        // Content-hashed bundles — safe to cache forever
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/icons/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400" }],
      },
      {
        // SW must always be fetched fresh so browser picks up updates immediately
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;
