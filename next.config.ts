import type { NextConfig } from "next";

const securityHeaders = [
  // Prevent MIME-type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Block framing (clickjacking)
  { key: "X-Frame-Options", value: "DENY" },
  // Limit referrer to same origin
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disable unnecessary browser features
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // CSP: restrict where the browser can load resources and send data.
  // unsafe-inline is required for Next.js App Router hydration scripts and
  // Tailwind/framer-motion inline styles until nonce-based CSP is wired up.
  // connect-src limits which hosts JS can fetch/XHR to — the key guard
  // against prompt-injection exfiltration to attacker-controlled servers.
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      // Supabase REST + realtime WebSocket
      `connect-src 'self' https://*.supabase.co wss://*.supabase.co`,
      "frame-ancestors 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  experimental: {
    // Suppress middleware deprecation warning for now
    // Will migrate to proxy in future update
  },
  async headers() {
    return [
      {
        // Apply to all routes
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
