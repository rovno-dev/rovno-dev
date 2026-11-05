import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    // Enables the browser's native View Transitions API on every route
    // change Next.js performs (Link clicks and router.push). The old
    // page and the new page are captured as pseudo-elements and
    // crossfaded by the browser - the outgoing content never
    // disappears, which is what makes navigation read as seamless
    // rather than "instant blank -> fade in".
    viewTransition: true,
  },
};

export default nextConfig;
