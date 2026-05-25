/* eslint-disable react/no-unknown-property */
import { ImageResponse } from 'next/og';
import { SITE_NAME } from './seo';

/**
 * Shared OG image generator. Per-route `opengraph-image.tsx` files call
 * `renderOgImage({...})` to produce a 1200×630 social card. Visual identity
 * follows `brand_identity/colors.md` (dark theme tokens hardcoded — OG
 * images render before any client-side theme resolution).
 *
 * Fonts are not embedded (skipped for build simplicity); the `next/og`
 * renderer falls back to Vercel's bundled fonts which produce clean Latin
 * + Cyrillic rendering for our titles.
 */
export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = 'image/png';

export interface OgImageInput {
  /** Top eyebrow label, e.g. "Калькулятор" or city name on project pages. */
  eyebrow?: string;
  /** Hero title — Playfair-ish serif via system fallback. */
  title: string;
  /** One-line subtitle / summary. */
  subtitle?: string;
}

// Brand palette — dark theme. Hex literals here are intentional: OG images
// are rendered with no DOM / CSS variable resolution available.
const BG = '#0b0e14';
const SURFACE = '#131722';
const TEXT = '#e7eaef';
const TEXT_DIM = '#8893a7';
const ACCENT = '#00d4aa';

export function renderOgImage({ eyebrow, title, subtitle }: OgImageInput) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          background: `linear-gradient(135deg, ${BG} 0%, ${SURFACE} 100%)`,
          color: TEXT,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 9,
              background: ACCENT,
            }}
          />
          <span style={{ fontSize: 22, fontWeight: 600 }}>
            <span style={{ color: ACCENT }}>Real</span>EstateApp
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {eyebrow && (
            <span
              style={{
                fontSize: 22,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: TEXT_DIM,
                fontWeight: 600,
              }}
            >
              {eyebrow}
            </span>
          )}
          <span
            style={{
              fontSize: title.length > 60 ? 56 : 68,
              lineHeight: 1.1,
              fontFamily: 'serif',
              fontWeight: 600,
              maxWidth: 1000,
            }}
          >
            {title}
          </span>
          {subtitle && (
            <span
              style={{
                fontSize: 26,
                lineHeight: 1.4,
                color: TEXT_DIM,
                maxWidth: 920,
              }}
            >
              {subtitle}
            </span>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 18,
            color: TEXT_DIM,
          }}
        >
          <span>{SITE_NAME}</span>
          <span>Новостройки Крыма · Аналитика · Калькулятор</span>
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
