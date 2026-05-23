'use client';

import { Card } from '@/components/ui/Card';
import { useLocale, useTranslations } from '@/hooks/useTranslations';
import { MARKET_DATA } from '@/lib/constants';
import { fmt } from '@/lib/formatters';
import type { CalcObject, CalcResults } from '@/lib/types';
import { MortgageBreakdown } from './MortgageBreakdown';

export interface CalcResultsSummaryProps {
  object: CalcObject;
  results: CalcResults;
}

function formatPct(n: number): string {
  if (!Number.isFinite(n)) return '—';
  return `${n.toFixed(1)}%`;
}

function formatYears(n: number): string {
  if (!Number.isFinite(n)) return '—';
  return `${n.toFixed(1)} лет`;
}

export function CalcResultsSummary({ object, results }: CalcResultsSummaryProps) {
  const t = useTranslations();
  const { locale } = useLocale();

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)] mb-1">
          {t.calc.totalCost}
        </div>
        <div
          className="text-[26px] font-semibold tabular-nums leading-tight"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          {fmt.price(results.totalCost, locale)}
        </div>
        <div className="text-[12px] text-[var(--text-dim)] tabular-nums mt-1">
          {fmt.priceSqm(Math.round(results.priceSqm), locale)} / {t.common.sqm}
        </div>
      </Card>

      {object.useMatkapital && (
        <Card>
          <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)] mb-2">
            {t.calc.totalSupport}
          </div>
          <div className="text-[18px] font-semibold tabular-nums">
            {fmt.price(results.totalSupport, locale)}
          </div>
        </Card>
      )}

      {object.useMortgage && (
        <Card>
          <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)] mb-3">
            {t.calc.mortgageSection}
          </div>
          <MortgageBreakdown mortgage={results.mortgage} />
        </Card>
      )}

      {object.useRental && (
        <Card>
          <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)] mb-3">
            {t.calc.rentalSection}
          </div>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-[13px]">
            <Row label={t.calc.grossIncome} value={fmt.price(results.grossAnnual, locale)} />
            <Row label={t.calc.effectiveIncome} value={fmt.price(results.effAnnual, locale)} />
            <Row label={t.calc.totalExpenses} value={fmt.price(results.totalExpenses, locale)} />
            <Row label={t.calc.noi} value={fmt.price(results.noi, locale)} />
            <Row
              label={t.calc.monthlyCashflow}
              value={`${fmt.price(results.monthlyCashflow, locale)} / мес`}
              emphasis={results.monthlyCashflow > 0}
            />
            <Row label={t.calc.grossYield} value={formatPct(results.grossYield)} />
            <Row label={t.calc.netYield} value={formatPct(results.netYield)} />
            <Row
              label={t.calc.cashOnCash}
              value={formatPct(results.cashOnCash)}
              emphasis={results.cashOnCash > 0}
            />
            {object.useMortgage && (
              <Row label={t.calc.dscr} value={results.dscr.toFixed(2)} />
            )}
          </dl>
        </Card>
      )}

      {object.useExit && (
        <Card>
          <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)] mb-3">
            {t.calc.exitSection}
          </div>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-[13px]">
            <Row label={t.calc.projectedSale} value={fmt.price(results.projectedSale, locale)} />
            <Row label={t.calc.netProceeds} value={fmt.price(results.netProceeds, locale)} />
            {object.useRental && (
              <Row
                label={t.calc.totalRental}
                value={fmt.price(results.totalRentalIncome, locale)}
              />
            )}
            <Row
              label={t.calc.totalProfit}
              value={fmt.price(results.totalProfit, locale)}
              emphasis={results.totalProfit > 0}
            />
            <Row
              label={t.calc.totalROI}
              value={formatPct(results.totalROI)}
              emphasis={results.totalROI > 0}
            />
            <Row label={t.calc.annualROI} value={formatPct(results.annualROI)} />
            <Row
              label={t.calc.depositCompare.replace('{r}', String(MARKET_DATA.depositRate))}
              value={fmt.price(results.depositComparison, locale)}
            />
            <Row label={t.calc.paybackYears} value={formatYears(results.paybackYears)} />
          </dl>
        </Card>
      )}

      <Card>
        <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)] mb-3">
          {t.calc.metricsSection}
        </div>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-[13px]">
          <Row label={t.calc.ownInvested} value={fmt.price(results.ownInvested, locale)} />
          {object.useMortgage && (
            <Row label={t.calc.effectiveLoan} value={fmt.price(results.effectiveLoan, locale)} />
          )}
          {object.useMortgage && object.useRental && (
            <Row
              label={t.calc.breakEvenRent}
              value={`${fmt.price(results.breakEvenRent, locale)} / мес`}
            />
          )}
        </dl>
      </Card>
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
      <dt className="text-[var(--text-muted)] truncate">{label}</dt>
      <dd
        className={`tabular-nums text-right whitespace-nowrap ${emphasis ? 'font-semibold text-[var(--accent)]' : 'font-medium'}`}
      >
        {value}
      </dd>
    </div>
  );
}
