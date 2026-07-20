import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
