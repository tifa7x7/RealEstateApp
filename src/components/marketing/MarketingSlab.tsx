import { type ReactNode } from 'react';

export type SlabLayout = 'image-left' | 'image-right' | 'image-below' | 'text-only' | 'centered';
export type SlabBackground = 'default' | 'tinted' | 'gradient';

export interface MarketingSlabProps {
  /** Small label above the headline (uppercase tracking-wider). */
  eyebrow?: string;
  /** Main slab headline (Playfair serif). */
  headline?: string;
  /** Subhead paragraph under the headline. */
  subhead?: string;
  /** Image/screenshot/illustration column. */
  image?: ReactNode;
  /** Bullet list under subhead. */
  bullets?: readonly string[];
  /** Action row under bullets / subhead. */
  actions?: ReactNode;
  /** Default 'text-only' when no image is passed; auto-promotes to image-right when image given. */
  layout?: SlabLayout;
  /** Background variant. */
  background?: SlabBackground;
  /** Extra slot below the headline block (e.g., a 3-card grid). */
  children?: ReactNode;
  /** Override container padding (default `py-16 md:py-20`). */
  paddingClassName?: string;
}

const BACKGROUND_CLASSES: Record<SlabBackground, string> = {
  default: '',
  tinted: 'bg-[var(--bg-card)]',
  gradient:
    'bg-[linear-gradient(180deg,var(--bg)_0%,color-mix(in_srgb,var(--accent)_5%,var(--bg))_100%)]',
};

/**
 * Phase 19 — generic block wrapper for every marketing surface. Every slab
 * on every marketing page goes through this; consistency comes from one
 * place. Layout variants:
 *
 *   image-left / image-right  — two-column with image
 *   image-below                — text first, image full-width below
 *   text-only                  — single centered column, no image
 *   centered                   — narrow centered text + actions (hero, CTA pair)
 */
export function MarketingSlab({
  eyebrow,
  headline,
  subhead,
  image,
  bullets,
  actions,
  layout,
  background = 'default',
  children,
  paddingClassName = 'py-16 md:py-20',
}: MarketingSlabProps) {
  const resolvedLayout: SlabLayout = layout ?? (image ? 'image-right' : 'centered');
  const hasTwoColumn = resolvedLayout === 'image-left' || resolvedLayout === 'image-right';

  const textBlock = (
    <div className="flex flex-col gap-4 max-w-xl">
      {eyebrow && (
        <span className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[var(--accent)]">
          {eyebrow}
        </span>
      )}
      {headline && (
        <h2
          className="text-[28px] md:text-[36px] leading-tight font-semibold"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          {headline}
        </h2>
      )}
      {subhead && (
        <p className="text-[15px] md:text-[16px] text-[var(--text-dim)] leading-relaxed">
          {subhead}
        </p>
      )}
      {bullets && bullets.length > 0 && (
        <ul className="flex flex-col gap-2 mt-2">
          {bullets.map((b) => (
            <li
              key={b}
              className="flex items-start gap-2 text-[14px] text-[var(--text)]"
            >
              <span
                className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: 'var(--accent)' }}
                aria-hidden="true"
              />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}
      {actions && <div className="flex flex-wrap gap-3 mt-3">{actions}</div>}
    </div>
  );

  return (
    <section className={`${paddingClassName} ${BACKGROUND_CLASSES[background]}`.trim()}>
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        {resolvedLayout === 'centered' && (
          <div className="flex flex-col items-center text-center gap-4 max-w-2xl mx-auto">
            {eyebrow && (
              <span className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[var(--accent)]">
                {eyebrow}
              </span>
            )}
            {headline && (
              <h2
                className="text-[32px] md:text-[44px] leading-tight font-semibold"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {headline}
              </h2>
            )}
            {subhead && (
              <p className="text-[15px] md:text-[17px] text-[var(--text-dim)] leading-relaxed">
                {subhead}
              </p>
            )}
            {actions && (
              <div className="flex flex-wrap gap-3 mt-3 justify-center">{actions}</div>
            )}
            {image && <div className="w-full mt-6">{image}</div>}
          </div>
        )}

        {resolvedLayout === 'text-only' && (
          <div className="max-w-3xl mx-auto">{textBlock}</div>
        )}

        {resolvedLayout === 'image-below' && (
          <div className="flex flex-col gap-8">
            <div className="max-w-3xl">{textBlock}</div>
            {image && <div className="w-full">{image}</div>}
          </div>
        )}

        {hasTwoColumn && (
          <div
            className={
              'grid gap-8 md:gap-12 items-center ' +
              'grid-cols-1 md:grid-cols-2 ' +
              (resolvedLayout === 'image-left' ? '[&>div:first-child]:md:order-2' : '')
            }
          >
            {textBlock}
            {image && <div className="w-full">{image}</div>}
          </div>
        )}

        {children && <div className="mt-12">{children}</div>}
      </div>
    </section>
  );
}
