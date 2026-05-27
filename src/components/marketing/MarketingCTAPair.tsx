import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export interface MarketingCTAPairProps {
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  /** Default centered; pass 'start' for left-aligned within parent flex. */
  align?: 'start' | 'center';
}

/**
 * Phase 19 — paired CTA row mounted at the bottom of every marketing
 * surface. Per CLAUDE.md: "never single, never dead-end."
 *
 * Primary = "Зарегистрироваться бесплатно →" (push to signup).
 * Secondary = "Посмотреть тарифы →" (push to /pricing).
 *
 * The defaults are deliberate; pages should rarely override them.
 */
export function MarketingCTAPair({
  primaryHref = '/account',
  primaryLabel = 'Зарегистрироваться бесплатно',
  secondaryHref = '/pricing',
  secondaryLabel = 'Посмотреть тарифы',
  align = 'center',
}: MarketingCTAPairProps) {
  const alignClass = align === 'center' ? 'justify-center' : '';
  return (
    <div className={`flex flex-wrap gap-3 ${alignClass}`.trim()}>
      <Link
        href={primaryHref}
        className={
          'inline-flex items-center gap-2 px-5 py-3 rounded-lg text-[14px] md:text-[15px] font-medium ' +
          'bg-[var(--accent)] text-white hover:opacity-90 transition-opacity ' +
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ' +
          'focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]'
        }
      >
        <span>{primaryLabel}</span>
        <ArrowRight size={16} aria-hidden="true" />
      </Link>
      <Link
        href={secondaryHref}
        className={
          'inline-flex items-center gap-2 px-5 py-3 rounded-lg text-[14px] md:text-[15px] font-medium ' +
          'border border-[var(--border)] text-[var(--text)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors ' +
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]'
        }
      >
        <span>{secondaryLabel}</span>
        <ArrowRight size={16} aria-hidden="true" />
      </Link>
    </div>
  );
}
