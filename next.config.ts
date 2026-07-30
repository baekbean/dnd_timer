import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A stray package-lock.json under the user's home directory (from an
  // out-of-project `npm install` at some point) otherwise makes Turbopack's
  // root auto-detection walk up past this project — corrupting absolute
  // paths computed elsewhere (e.g. reshaped's postcss plugin config) and
  // triggering the "detected multiple lockfiles" warning. `next build`/`next
  // dev` are always invoked with cwd at the project root, so this is safe
  // (import.meta.url isn't, since Next compiles this config to CJS).
  turbopack: {
    root: process.cwd(),
  },
  // Dev-only: lets phones on the local network load dev-server assets (HMR,
  // hydration bundles) when visiting via the machine's LAN IP. No effect in prod.
  allowedDevOrigins: ["192.168.18.107"],
  async redirects() {
    return [
      {
        source: "/timer",
        destination: "/",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/array/:path*",
        destination: "https://us-assets.i.posthog.com/array/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
    ];
  },
  // Required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Prevent other sites from framing/embedding this app (e.g. clone sites)
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
