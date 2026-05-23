'use client';

import { useLocale, useTranslations } from '@/hooks/useTranslations';
import { fmt } from '@/lib/formatters';
import type { MortgageResult } from '@/lib/types';

export interface MortgageBreakdownProps {
  mortgage: MortgageResult;
}

export function MortgageBreakdown({ mortgage }: MortgageBreakdownProps) {
  const t = useTranslations();
  const { locale } = useLocale();

  const hasMarketPart = mortgage.marketPart > 0;

  return (
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
