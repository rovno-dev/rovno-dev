import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // NOTE: `experimental.viewTransition` was removed from NextConfig in
  // Next.js 16.3. It was an inert flag - nothing in the runtime ever
  // read it. `ViewTransition` ships in the bundled React canary and
  // every <Link> navigation already runs inside React.startTransition,
  // so view transitions work with no configuration. The
  // `::view-transition-old/new(root)` CSS in globals.css still applies.
};

export default nextConfig;
