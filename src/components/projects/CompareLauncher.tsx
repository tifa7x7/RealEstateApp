'use client';

import { useState } from 'react';
import { Scale } from 'lucide-react';
import { useCompare } from '@/hooks/useCompare';
import { useTranslations } from '@/hooks/useTranslations';
import { CompareDrawer } from './CompareDrawer';

/**
 * Floating bottom-right launcher visible from any page when the user has at
 * least one project in the comparison. Opens `CompareDrawer`.
 *
 * Placement coexists with `MobileResultPill` on `/calculator` (which is
 * `lg:hidden` and pinned higher up). On the calculator page the two pills
 * appear simultaneously — both are useful; the launcher is below the result
 * pill in stacking order via different `bottom` offsets.
 */
export function CompareLauncher() {
  const t = useTranslations();
  const { ids } = useCompare();
  const [open, setOpen] = useState(false);

  if (ids.length === 0) return null;

  // 16px from edge on desktop; 20px above MobileNav (~56px) + safe-area inset.
  const bottomOffset = 'calc(80px + env(safe-area-inset-bottom))';

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`${t.compare.title} (${ids.length})`}
        aria-live="polite"
        className="no-print fixed left-4 lg:left-auto lg:right-4 z-[150] inline-flex items-center gap-2 px-4 py-3 rounded-full shadow-xl bg-[var(--bg-card)] text-[var(--text)] border border-[var(--accent)] hover:bg-[var(--bg-elevated)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] text-[13px] font-medium"
        style={{ bottom: bottomOffset }}
      >
        <Scale size={15} className="text-[var(--accent)]" aria-hidden="true" />
        {t.compare.title}
        <span
          className="ml-1 inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-full text-[11px] font-semibold tabular-nums"
          style={{
            background: 'color-mix(in srgb, var(--accent) 18%, transparent)',
            color: 'var(--accent)',
          }}
        >
          {ids.length}
        </span>
      </button>
      <CompareDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
