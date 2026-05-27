'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';

type Cadence = 'monthly' | 'yearly';

interface TierConfig {
  key: 'free' | 'pro-monthly' | 'pro-yearly';
  tierLabel: string;
  audience: string;
  pricePerMonth: number;
  cta: string;
  ctaHref: string;
  features: readonly string[];
  recommended?: boolean;
}

/**
 * Phase 19 — 3-column pricing table with a Monthly/Yearly toggle pill.
 *
 * Tier model per CLAUDE.md: Free / Pro Monthly / Pro Yearly (−20%).
 * Pro Monthly and Pro Yearly share the same feature set; only the
 * billing cadence differs. `usePaywall` exposes `tier: 'free' | 'pro'`
 * only — Monthly vs Yearly is invisible to feature gates.
 *
 * Yearly billing is shown as the discounted monthly equivalent so the
 * comparison stays apples-to-apples.
 */
export function PricingTable() {
  const t = useTranslations();
  const [cadence, setCadence] = useState<Cadence>('yearly');

  const proMonthlyPrice = 1490;
  const proYearlyPrice = Math.round(proMonthlyPrice * 0.8); // −20%
  const fmt = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 });

  const tiers: readonly TierConfig[] = [
    {
      key: 'free',
      tierLabel: t.marketing.pricingFreeTier,
      audience: t.marketing.pricingFreeAudience,
      pricePerMonth: 0,
      cta: t.marketing.pricingFreeCta,
      ctaHref: '/account',
      features: [
        t.marketing.pricingFreeFeature1,
        t.marketing.pricingFreeFeature2,
        t.marketing.pricingFreeFeature3,
        t.marketing.pricingFreeFeature4,
      ],
    },
    cadence === 'monthly'
      ? {
          key: 'pro-monthly',
          tierLabel: t.marketing.pricingProMonthlyTier,
          audience: t.marketing.pricingProAudience,
          pricePerMonth: proMonthlyPrice,
          cta: t.marketing.pricingProCta,
          ctaHref: '/account',
          features: [
            t.marketing.pricingProFeature1,
            t.marketing.pricingProFeature2,
            t.marketing.pricingProFeature3,
            t.marketing.pricingProFeature4,
            t.marketing.pricingProFeature5,
            t.marketing.pricingProFeature6,
            t.marketing.pricingProFeature7,
            t.marketing.pricingProFeature8,
          ],
        }
      : {
          key: 'pro-yearly',
          tierLabel: t.marketing.pricingProYearlyTier,
          audience: t.marketing.pricingProAudience,
          pricePerMonth: proYearlyPrice,
          cta: t.marketing.pricingProCta,
          ctaHref: '/account',
          recommended: true,
          features: [
            t.marketing.pricingProFeature1,
            t.marketing.pricingProFeature2,
            t.marketing.pricingProFeature3,
            t.marketing.pricingProFeature4,
            t.marketing.pricingProFeature5,
            t.marketing.pricingProFeature6,
            t.marketing.pricingProFeature7,
            t.marketing.pricingProFeature8,
          ],
        },
  ];

  return (
    <div className="flex flex-col items-center gap-8">
      <div
        role="tablist"
        aria-label="Billing cadence"
        className="inline-flex p-1 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)]"
      >
        {(['monthly', 'yearly'] as const).map((value) => {
          const active = cadence === value;
          return (
            <button
              key={value}
              role="tab"
              aria-selected={active}
              onClick={() => setCadence(value)}
              className={
                'px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors ' +
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ' +
                (active
                  ? 'bg-[var(--bg-card)] text-[var(--text)] shadow-sm'
                  : 'text-[var(--text-dim)]')
              }
            >
              {value === 'monthly' ? t.marketing.pricingMonthly : t.marketing.pricingYearly}
            </button>
          );
        })}
      </div>
      {cadence === 'yearly' && (
        <p className="text-[12px] text-[var(--accent)] -mt-4">
          {t.marketing.pricingYearlySavings}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
        {tiers.map((tier) => {
          const isPro = tier.key !== 'free';
          return (
            <div
              key={tier.key}
              className={
                'relative flex flex-col rounded-2xl border p-6 md:p-7 ' +
                (tier.recommended
                  ? 'border-[var(--accent)] bg-[var(--accent-surface)]'
                  : 'border-[var(--border)] bg-[var(--bg-card)]')
              }
            >
              {tier.recommended && (
                <span
                  className="absolute -top-3 left-6 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] uppercase tracking-wider font-semibold"
                  style={{
                    background: 'var(--accent)',
                    color: 'white',
                  }}
                >
                  <Sparkles size={11} aria-hidden="true" />
                  {t.marketing.pricingRecommended}
                </span>
              )}

              <div className="flex items-baseline gap-2 mb-2">
                <h3 className="text-[18px] font-semibold">{tier.tierLabel}</h3>
                {isPro && (
                  <span
                    className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded"
                    style={{
                      background: 'color-mix(in srgb, var(--premium) 18%, transparent)',
                      color: 'var(--premium)',
                    }}
                  >
                    Pro
                  </span>
                )}
              </div>
              <p className="text-[12px] text-[var(--text-dim)] mb-5">{tier.audience}</p>

              <div className="flex items-baseline gap-1 mb-6">
                <span
                  className="text-[40px] md:text-[48px] font-semibold tabular-nums"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  {tier.pricePerMonth === 0 ? '0' : fmt.format(tier.pricePerMonth)}
                </span>
                <span className="text-[14px] text-[var(--text-dim)]">
                  ₽{t.marketing.pricingPerMonth}
                </span>
              </div>

              <ul className="flex flex-col gap-2.5 mb-7 flex-1">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-[13px]">
                    <Check
                      size={15}
                      aria-hidden="true"
                      className="text-[var(--accent)] shrink-0 mt-0.5"
                    />
                    <span className="text-[var(--text)]">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={tier.ctaHref}
                className={
                  'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-medium transition-colors ' +
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ' +
                  (tier.recommended
                    ? 'bg-[var(--accent)] text-white hover:opacity-90'
                    : 'border border-[var(--border)] text-[var(--text)] hover:border-[var(--accent)] hover:text-[var(--accent)]')
                }
              >
                <span>{tier.cta}</span>
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
