import type { MetadataRoute } from 'next';
import { SITE_DESCRIPTION, SITE_NAME } from '@/lib/seo';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: 'CrimeaDev',
    description: SITE_DESCRIPTION,
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0a0a0a',
    theme_color: '#00d4aa',
    lang: 'ru',
    categories: ['business', 'finance', 'productivity'],
    icons: [
      // Real PNG icons should land in /public when design has them. The
      // manifest stays valid without icon entries; a single SVG favicon is
      // already served from /icon (Next file convention) when present.
    ],
  };
}
