import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: dirname(fileURLToPath(import.meta.url)),
  poweredByHeader: false,
  async headers() {
    return [{ source: '/:path*', headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Content-Security-Policy', value: "base-uri 'self'; object-src 'none'; frame-ancestors 'self'; form-action 'self'" },
    ] }];
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: process.env.REVIEW_PHOTO_HOST ?? 'zzpawzswkmo8mdxz.public.blob.vercel-storage.com', pathname: '/review-photos/**' },
    ],
  },
};

export default nextConfig;
