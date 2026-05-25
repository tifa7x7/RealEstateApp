'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { KPIDashboard } from './KPIDashboard';
import { useTranslations } from '@/hooks/useTranslations';

/**
 * Collapsible wrapper around `KPIDashboard`. The market snapshot is no longer
 * the homepage hero — it lives below the search-first hero and starts
 * collapsed on mobile (where vertical space is precious) and expanded on
 * desktop (where it doesn't push listings off-screen).
 */
export function MarketSnapshot() {
  const t = useTranslations();
  const [open, setOpen] = useState(false);

  return (
    <section className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="inline-flex items-center gap-2 self-start text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)] hover:text-[var(--text-dim)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded"
      >
        <span>{t.hero.marketSnapshot}</span>
        <ChevronDown
          size={14}
          aria-hidden="true"
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
          style={{ transitionDuration: '150ms', transitionTimingFunction: 'cubic-bezier(0.25, 0.1, 0.25, 1)' }}
        />
      </button>
      {open && <KPIDashboard />}
    </section>
  );
}
