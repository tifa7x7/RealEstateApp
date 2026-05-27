'use client';

import { useLocale, useTranslations } from '@/hooks/useTranslations';
import { fmt } from '@/lib/formatters';
import type { MortgageResult } from '@/lib/types';

export interface MortgageBreakdownProps {
  mortgage: MortgageResult;
  /** Subsidized rate, %. Comes from `CalcObject.familyRate`. */
  familyRate: number;
  /** Market rate applied above the subsidized cap, %. */
  marketRate: number;
  /** Subsidized cap in ₽. Comes from `CalcObject.subsidyLimit`. */
  subsidyLimit: number;
}

/**
 * Renders the split-mortgage story up front (Phase 11 — competitive moat
 * surface). The Russian subsidized programs cap the subsidized portion at a
 * limit; anything above is at market rate. Most prototypes bury that nuance
 * in raw numbers; we lead with it.
 */
export function MortgageBreakdown({
  mortgage,
  familyRate,
  marketRate,
  subsidyLimit,
}: MortgageBreakdownProps) {
  const t = useTranslations();
  const { locale } = useLocale();

  const hasMarketPart = mortgage.marketPart > 0;

  return (
    <div className="flex flex-col gap-3">
      <SplitRateBanner
        familyRate={familyRate}
        marketRate={marketRate}
        subsidyLimit={subsidyLimit}
        hasMarketPart={hasMarketPart}
      />
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-[13px]">
        <Row label={t.calc.dpAmount} value={fmt.price(mortgage.downPaymentAmount, locale)} />
        <Row label={t.calc.loanAmount} value={fmt.price(mortgage.loanAmount, locale)} />
        <Row label={t.calc.subsidizedPart} value={fmt.price(mortgage.subsidizedPart, locale)} />
        {hasMarketPart && (
          <Row label={t.calc.marketPart} value={fmt.price(mortgage.marketPart, locale)} />
        )}
        <Row
          label={t.calc.subsidizedPayment}
          value={`${fmt.price(mortgage.monthlySubsidized, locale)} / мес`}
        />
        {hasMarketPart && (
          <Row
            label={t.calc.marketPayment}
            value={`${fmt.price(mortgage.monthlyMarket, locale)} / мес`}
          />
        )}
        <Row
          label={t.calc.monthlyPayment}
          value={`${fmt.price(mortgage.totalMonthly, locale)} / мес`}
          emphasis
        />
        <Row label={t.calc.yearlyPayment} value={fmt.price(mortgage.yearlyPayment, locale)} />
      </dl>
    </div>
  );
}

function SplitRateBanner({
  familyRate,
  marketRate,
  subsidyLimit,
  hasMarketPart,
}: {
  familyRate: number;
  marketRate: number;
  subsidyLimit: number;
  hasMarketPart: boolean;
}) {
  const { locale } = useLocale();
  const limitLabel = fmt.price(subsidyLimit, locale);
  const hint =
    locale === 'ru'
      ? hasMarketPart
        ? 'Льготная ставка действует до лимита; на остаток — рыночная.'
        : 'Сумма кредита укладывается в лимит льготной программы.'
      : hasMarketPart
        ? 'Subsidized rate applies up to the cap; anything above is at market.'
        : 'Loan fits inside the subsidized cap.';

  return (
    <div
      className="rounded-lg p-3 flex flex-col gap-2"
      style={{
        background: 'color-mix(in srgb, var(--accent) 6%, transparent)',
        border: '1px solid color-mix(in srgb, var(--accent) 20%, transparent)',
      }}
    >
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[13px] tabular-nums">
        <span className="font-semibold text-[var(--accent)]">
          {familyRate}%
        </span>
        <span className="text-[var(--text-dim)]">до {limitLabel}</span>
        {hasMarketPart && (
          <>
            <span className="text-[var(--text-muted)]">·</span>
            <span className="font-semibold text-[var(--warning)]">
              {marketRate}%
            </span>
            <span className="text-[var(--text-dim)]">
              {locale === 'ru' ? 'на остаток' : 'on the rest'}
            </span>
          </>
        )}
      </div>
      <p className="text-[11px] text-[var(--text-muted)] leading-snug">{hint}</p>
    </div>
  );
}

function Row({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-[var(--text-muted)]">{label}</dt>
      <dd
        className={`tabular-nums text-right ${emphasis ? 'font-semibold text-[var(--accent)]' : 'font-medium'}`}
      >
        {value}
      </dd>
    </div>
  );
}
