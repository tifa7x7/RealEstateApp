'use client';

import { useMemo } from 'react';
import { useLocale, useTranslations } from '@/hooks/useTranslations';
import { FINISHING_GRADES, type FinishingGradeId } from '@/lib/constants';
import { fmt } from '@/lib/formatters';

export interface FinishingGradeSelectorProps {
  /** Apartment area in m². Drives `area × pricePerSqm` math. */
  area: number;
  /** Current renovation ₽ value (raw, not per-m²). */
  value: number;
  /** Called with the new total renovation ₽ when a grade is selected. */
  onChange: (value: number) => void;
  className?: string;
}

/**
 * Replaces the freeform `renovation` ruble input with a tier selector. Picking
 * a grade fills `renovation` as `area × pricePerSqm`. Users keep full control:
 * they can pick a different grade or override the underlying number via the
 * raw `CalcInput` that we leave alongside.
 *
 * Inspired by CompetitorReview B1 — Solgt.no's "home standard accounts for
 * 30–50% of value" is the resale-market analog. For new builds, finishing
 * grade is the right anchor.
 */
export function FinishingGradeSelector({
  area,
  value,
  onChange,
  className = '',
}: FinishingGradeSelectorProps) {
  const t = useTranslations();
  const { locale } = useLocale();

  // Identify the closest matching grade so the user gets a visible selection
  // state even when they typed a custom number. Match if total is within
  // ±10% of `area × pricePerSqm`.
  const selectedId = useMemo<FinishingGradeId | null>(() => {
    if (area <= 0) return null;
    for (const grade of FINISHING_GRADES) {
      const expected = grade.pricePerSqm * area;
      if (grade.id === 'none' && value === 0) return 'none';
      if (expected === 0) continue;
      const delta = Math.abs(value - expected) / expected;
      if (delta < 0.1) return grade.id;
    }
    return null;
  }, [area, value]);

  return (
    <div className={`flex flex-col gap-2 ${className}`.trim()}>
      <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">
        {locale === 'ru' ? 'Уровень отделки' : 'Finishing grade'}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {FINISHING_GRADES.map((grade) => {
          const active = selectedId === grade.id;
          const total = grade.pricePerSqm * Math.max(0, area);
          const label = locale === 'ru' ? grade.labelRu : grade.labelEn;
          const hint = locale === 'ru' ? grade.hintRu : grade.hintEn;
          const style = active
            ? {
                background:
                  'color-mix(in srgb, var(--accent) 12%, transparent)',
                border:
                  '1px solid color-mix(in srgb, var(--accent) 35%, transparent)',
              }
            : {
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
              };
          return (
            <button
              key={grade.id}
              type="button"
              onClick={() => onChange(Math.round(total))}
              aria-pressed={active}
              title={hint}
              className="flex flex-col items-start gap-1 p-3 rounded-lg text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
              style={style}
            >
              <span
                className={
                  'text-[13px] font-medium ' +
                  (active ? 'text-[var(--accent)]' : 'text-[var(--text)]')
                }
              >
                {label}
              </span>
              <span className="text-[11px] text-[var(--text-muted)] tabular-nums">
                {total > 0 ? fmt.price(total, locale) : '—'}
              </span>
            </button>
          );
        })}
      </div>
      {/* Suppress empty-state translation warning */}
      <span className="sr-only">{t.calc.renovation}</span>
    </div>
  );
}
