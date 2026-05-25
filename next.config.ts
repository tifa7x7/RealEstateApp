import type { NextConfig } from 'next';

// Limit build worker spawning ONLY on Windows. Windows worker pools struggle
// with the heavier build footprint introduced by @supabase/* +
// @tanstack/react-query and emit `spawn UNKNOWN` (libuv UV_UNKNOWN, errno
// -4094) when many static pages are generated in parallel. Forcing a single
// worker has no runtime impact and produces a stable build on Windows.
//
// On Linux / macOS (CI, deploy targets) we want full parallelism; gating
// avoids kneecapping CI build times.
const cpusOverride = process.platform === 'win32' ? 1 : undefined;

const nextConfig: NextConfig = {
  experimental: cpusOverride !== undefined ? { cpus: cpusOverride } : undefined,
};

export default nextConfig;
