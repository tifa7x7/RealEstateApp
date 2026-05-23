import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Limit build worker spawning. Windows worker pools struggle with the heavier
  // build footprint introduced by @supabase/* + @tanstack/react-query and emit
  // `spawn UNKNOWN` (libuv UV_UNKNOWN, errno -4094) when many static pages are
  // generated in parallel. Forcing a single worker has no runtime impact and
  // produces a stable build on Windows.
  experimental: {
    cpus: 1,
  },
};

export default nextConfig;
