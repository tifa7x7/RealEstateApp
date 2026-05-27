/**
 * Phase 19 — calculator-as-hero asset for the marketing homepage.
 *
 * Pure inline SVG mockup of the calculator results panel — not a real
 * screenshot. Uses our brand tokens via CSS variables so it themes
 * correctly under marketing-forced-light and (eventually) dark previews
 * in product surfaces. Zero asset pipeline; ~6 KB inlined.
 *
 * Numbers are illustrative (₽7.69M apartment, 6% family mortgage,
 * Cap Rate 8.4%, payback 11 yr) — they tell a story without claiming
 * to reflect any real listing.
 *
 * Replace with a real Playwright-rendered screenshot when one becomes
 * available; the component contract (no props, fixed aspect) lets the
 * swap be one-file.
 */
export function CalculatorHeroIllustration() {
  return (
    <div
      className="relative rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-2xl overflow-hidden"
      style={{
        // Subtle glow behind the card so it feels like a screenshot, not
        // a flat illustration. The glow uses the accent color at low alpha
        // for theme consistency.
        boxShadow:
          '0 10px 40px -10px color-mix(in srgb, var(--accent) 30%, transparent), 0 4px 8px rgba(0,0,0,0.04)',
      }}
    >
      {/* Window-chrome bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[var(--border)] bg-[var(--bg-elevated)]">
        <div className="flex gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: 'color-mix(in srgb, var(--danger) 60%, transparent)' }}
          />
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: 'color-mix(in srgb, var(--warning) 60%, transparent)' }}
          />
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: 'color-mix(in srgb, var(--accent) 60%, transparent)' }}
          />
        </div>
        <span className="text-[11px] text-[var(--text-muted)] font-mono ml-2">
          калькулятор · ЖК «Ривьера Парк» · кв. 1-4-03
        </span>
      </div>

      {/* Result rows */}
      <div className="p-5 md:p-6 flex flex-col gap-5">
        {/* Hero metric: monthly payment */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-[0.18em] font-semibold text-[var(--text-muted)]">
            Платёж в месяц
          </span>
          <div className="flex items-baseline gap-2">
            <span
              className="text-[36px] md:text-[44px] leading-none font-semibold tabular-nums"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              42 180
            </span>
            <span className="text-[14px] text-[var(--text-dim)]">₽/мес</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[var(--text-dim)] mt-1">
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded"
              style={{
                background: 'color-mix(in srgb, var(--accent) 12%, transparent)',
                color: 'var(--accent)',
              }}
            >
              6% до 6 млн ₽
            </span>
            <span>+</span>
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded"
              style={{
                background: 'color-mix(in srgb, var(--warning) 12%, transparent)',
                color: 'var(--warning)',
              }}
            >
              21% на остаток
            </span>
          </div>
        </div>

        {/* Metric grid */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[var(--border)]">
          <Metric label="Cap Rate" value="8.4%" tone="accent" />
          <Metric label="Cash-on-Cash" value="14.2%" tone="accent" />
          <Metric label="Окупаемость" value="11 лет" tone="default" />
        </div>

        {/* Tiny bar chart: 10-year cashflow */}
        <div className="pt-4 border-t border-[var(--border)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-[0.18em] font-semibold text-[var(--text-muted)]">
              10-летний прогноз
            </span>
            <span className="text-[10px] text-[var(--text-dim)] tabular-nums">+ 2.4 млн ₽</span>
          </div>
          <div className="flex items-end gap-1 h-12">
            {[18, 22, 28, 34, 42, 48, 55, 64, 72, 80].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t"
                style={{
                  height: `${h}%`,
                  background: `color-mix(in srgb, var(--accent) ${30 + h / 2}%, transparent)`,
                }}
                aria-hidden="true"
              />
            ))}
          </div>
          <div className="flex justify-between mt-1 text-[9px] text-[var(--text-muted)] tabular-nums">
            <span>2026</span>
            <span>2031</span>
            <span>2036</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'accent' | 'default';
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-[0.14em] font-semibold text-[var(--text-muted)]">
        {label}
      </span>
      <span
        className="text-[18px] md:text-[20px] font-semibold tabular-nums"
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          color: tone === 'accent' ? 'var(--accent)' : 'var(--text)',
        }}
      >
        {value}
      </span>
    </div>
  );
}
