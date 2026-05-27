export interface StatStripItem {
  /** Big numeral / short value (e.g. "200+", "5 000", "От 4 млн"). */
  value: string;
  /** Tiny caps caption below. */
  caption: string;
}

export interface StatStripProps {
  items: readonly StatStripItem[];
}

/**
 * Phase 19 — big-numeral row used on the marketing homepage. Solgt's
 * pattern: large display numerals in the accent / premium color, tiny
 * uppercase caption beneath. 3-4 cells per strip.
 *
 * Layout: horizontal at md+, stacked at <md so each numeral stays large.
 */
export function StatStrip({ items }: StatStripProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-4xl mx-auto">
      {items.map((s) => (
        <div key={s.caption} className="flex flex-col items-center text-center gap-1.5">
          <span
            className="text-[32px] md:text-[44px] leading-none font-semibold tabular-nums"
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              color: 'var(--premium)',
            }}
          >
            {s.value}
          </span>
          <span className="text-[10px] md:text-[11px] uppercase tracking-[0.18em] font-semibold text-[var(--text-muted)]">
            {s.caption}
          </span>
        </div>
      ))}
    </div>
  );
}
