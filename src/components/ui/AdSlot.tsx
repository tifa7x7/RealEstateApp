'use client';

import { type ReactNode } from 'react';
import { usePaywall } from '@/hooks/usePaywall';

export type AdLocation =
  | 'listings-inline'
  | 'filter-top'
  | 'project-bottom'
  | 'blog-inline';

export interface AdSlotProps {
  location: AdLocation;
  /** Optional house-style fallback rendered when no real ad provider is configured. */
  fallback?: ReactNode;
  className?: string;
}

/**
 * Ad inventory placeholder. Renders nothing in production until a real ad
 * provider is wired up (the `NEXT_PUBLIC_AD_PROVIDER` env var below is the
 * intended hook). Pro users always get an empty slot — "no ads" is part of
 * the Pro benefit set advertised in `UpgradePrompt`.
 *
 * Approved placements (per CLAUDE.md / AppReview §4):
 *   - `listings-inline`   — every 8 cards in the homepage card grid.
 *   - `filter-top`        — above the filter sidebar on `lg+`.
 *   - `project-bottom`    — bottom of project detail page (not Apartments tab).
 *   - `blog-inline`       — inside blog articles between sections.
 *
 * Never allowed (will render nothing regardless of provider):
 *   - Calculator result panel
 *   - Analytics chart cards
 *   - Account pages
 *   - Project-detail Apartments tab
 *
 * In dev, the slot renders a dashed outline showing its location so we can
 * verify placement during design review. Production builds skip the outline.
 */
const ALLOWED_LOCATIONS: ReadonlySet<AdLocation> = new Set<AdLocation>([
  'listings-inline',
  'filter-top',
  'project-bottom',
  'blog-inline',
]);

export function AdSlot({ location, fallback, className = '' }: AdSlotProps) {
  const { isPro } = usePaywall('exports'); // any feature key works for isPro lookup
  const provider = process.env.NEXT_PUBLIC_AD_PROVIDER ?? '';
  const isDev = process.env.NODE_ENV !== 'production';

  if (isPro) return null;
  if (!ALLOWED_LOCATIONS.has(location)) return null;

  if (provider) {
    // Real provider wired (post-launch deliverable). The actual ad script
    // mounts here — left as a TODO so this primitive ships before the
    // contract with an ad network exists.
    return (
      <aside
        aria-label="Реклама"
        data-ad-location={location}
        className={`text-center text-[11px] text-[var(--text-muted)] ${className}`.trim()}
      >
        {/* TODO: integrate ad provider script — see scripts/check-perf-budgets.mjs for budget impact. */}
      </aside>
    );
  }

  if (fallback) {
    return (
      <aside
        aria-label="Промо"
        data-ad-location={location}
        className={className}
      >
        {fallback}
      </aside>
    );
  }

  if (isDev) {
    return (
      <aside
        aria-label="Ad slot (no provider)"
        data-ad-location={location}
        className={`text-center text-[10px] uppercase tracking-wider py-3 rounded border border-dashed border-[var(--text-muted)] text-[var(--text-muted)] ${className}`.trim()}
      >
        ad · {location}
      </aside>
    );
  }

  return null;
}
