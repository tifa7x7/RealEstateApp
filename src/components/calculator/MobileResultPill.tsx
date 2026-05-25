'use client';

import { useState } from 'react';
import { Calculator } from 'lucide-react';
import { Sheet } from '@/components/ui/Sheet';
import { CalcResultsSummary } from './CalcResultsSummary';
import { useCalculator } from '@/hooks/useCalculator';
import { useLocale, useTranslations } from '@/hooks/useTranslations';
import { fmt } from '@/lib/formatters';

/**
 * Floating bottom-right pill (`<lg` only) showing the calculator's headline
 * metric. Tapping opens the full result panel in a bottom Sheet. Solves the
 * mobile UX problem where the desktop sticky result panel becomes
 * end-of-scroll-content on mobile.
 *
 * The pill stays visible while the user fills the form; the bottom-anchored
 * MobileNav reserves enough space below it.
 */
export function MobileResultPill() {
  const t = useTranslations();
  const { locale } = useLocale();
  const { object, results } = useCalculator();
  const [open, setOpen] = useState(false);

  // Account for the MobileNav fixed at the bottom of the viewport (~56px tall)
  // plus the iOS safe-area inset.
  const bottomOffset = 'calc(80px + env(safe-area-inset-bottom))';

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t.calc.totalCost}
        className="no-print lg:hidden fixed right-4 z-[150] inline-flex items-center gap-2 px-4 py-3 rounded-full shadow-xl bg-[var(--accent)] text-white text-[13px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
        style={{ bottom: bottomOffset }}
      >
        <Calculator size={16} aria-hidden="true" />
        <span className="tabular-nums">{fmt.price(results.totalCost, locale)}</span>
      </button>
      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title={t.calc.totalCost}
        side="bottom"
      >
        <CalcResultsSummary object={object} results={results} />
      </Sheet>
    </>
  );
}
