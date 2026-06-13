import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // 'standalone' produces a minimal self-hosted server build (used for our Docker image).
  // Gated on BUILD_STANDALONE=1 (set only in the Docker/CI build) so Netlify deploy
  // previews keep their default output and are unaffected.
  ...(process.env.BUILD_STANDALONE === '1' ? { output: 'standalone' as const } : {}),
}

export default nextConfig
