'use client';

import { Card } from '@/components/ui/Card';
import { useCalculator } from '@/hooks/useCalculator';
import { useLocale, useTranslations } from '@/hooks/useTranslations';
import { fmt } from '@/lib/formatters';
import type { CalcObject, CalcResults, Locale } from '@/lib/types';

interface MetricDef {
  key: string;
  label: string;
  getValue: (results: CalcResults, object: CalcObject) => number;
  format: (value: number, locale: Locale) => string;
  higherBetter: boolean;
  visible: (object: CalcObject) => boolean;
}

const formatPct = (v: number) => (Number.isFinite(v) ? `${v.toFixed(1)}%` : '—');
const formatPrice = (v: number, locale: Locale) => fmt.price(v, locale);
const formatPriceSqm = (v: number, locale: Locale) => fmt.priceSqm(Math.round(v), locale);

const METRICS: MetricDef[] = [
  {
    key: 'totalCost',
    label: 'Полная стоимость',
    getValue: (r) => r.totalCost,
    format: formatPrice,
    higherBetter: false,
    visible: () => true,
  },
  {
    key: 'priceSqm',
    label: 'Цена/м²',
    getValue: (r) => r.priceSqm,
    format: formatPriceSqm,
    higherBetter: false,
    visible: () => true,
  },
  {
    key: 'ownInvested',
    label: 'Вложено своих',
    getValue: (r) => r.ownInvested,
    format: formatPrice,
    higherBetter: false,
    visible: () => true,
  },
  {
    key: 'monthlyPayment',
    label: 'Платёж/мес',
    getValue: (r) => r.mortgage.totalMonthly,
    format: formatPrice,
    higherBetter: false,
    visible: (o) => o.useMortgage,
  },
  {
    key: 'monthlyCashflow',
    label: 'Денежный поток/мес',
    getValue: (r) => r.monthlyCashflow,
    format: formatPrice,
    higherBetter: true,
    visible: (o) => o.useRental,
  },
  {
    key: 'cashOnCash',
    label: 'Cash-on-Cash',
    getValue: (r) => r.cashOnCash,
    format: formatPct,
    higherBetter: true,
    visible: (o) => o.useRental,
  },
  {
    key: 'capRate',
    label: 'Cap Rate',
    getValue: (r) => r.capRate,
    format: formatPct,
    higherBetter: true,
    visible: (o) => o.useRental,
  },
  {
    key: 'totalROI',
    label: 'Общая ROI',
    getValue: (r) => r.totalROI,
    format: formatPct,
    higherBetter: true,
    visible: (o) => o.useExit,
  },
  {
    key: 'annualROI',
    label: 'Годовая ROI',
    getValue: (r) => r.annualROI,
    format: formatPct,
    higherBetter: true,
    visible: (o) => o.useExit,
  },
];

export function ComparisonTable() {
  const t = useTranslations();
  const { locale } = useLocale();
  const { objects, allResults } = useCalculator();

  if (objects.length < 2) return null;

  return (
    <Card padded={false}>
      <div className="p-4">
        <h2 className="text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">
          {t.compare.title}
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead>
            <tr className="border-y border-[var(--border)] bg-[var(--bg-elevated)]/40">
              <th
                scope="col"
                className="text-left px-4 py-2 text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)]"
              >
                Метрика
              </th>
              {objects.map((obj, i) => (
                <th
                  key={i}
                  scope="col"
                  className="text-right px-3 py-2 text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)] whitespace-nowrap"
                >
                  {obj.name.trim() || `Объект ${i + 1}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {METRICS.map((metric) => {
              const visibleValues = objects
                .map((obj, i) => ({ obj, results: allResults[i], i }))
                .filter(({ obj, results }) => obj && results && metric.visible(obj))
                .map(({ i, obj, results }) => ({ i, value: metric.getValue(results, obj) }));

              if (visibleValues.length === 0) return null;

              const numericValues = visibleValues
                .map((v) => v.value)
                .filter((v) => Number.isFinite(v));
              if (numericValues.length === 0) return null;
              const best = metric.higherBetter
                ? Math.max(...numericValues)
                : Math.min(...numericValues);

              return (
                <tr key={metric.key} className="border-b border-[var(--border)] last:border-b-0">
                  <td className="px-4 py-2.5 text-[var(--text-muted)] whitespace-nowrap">
                    {metric.label}
                  </td>
                  {objects.map((obj, i) => {
                    const results = allResults[i];
                    if (!results || !metric.visible(obj)) {
                      return (
                        <td
                          key={i}
                          className="px-3 py-2.5 text-right text-[var(--text-muted)] tabular-nums"
                        >
                          —
                        </td>
                      );
                    }
                    const value = metric.getValue(results, obj);
                    const isBest =
                      objects.length > 1 &&
                      Number.isFinite(value) &&
                      value === best;
                    return (
                      <td
                        key={i}
                        className={`px-3 py-2.5 text-right tabular-nums whitespace-nowrap ${
                          isBest
                            ? 'font-semibold text-[var(--accent)]'
                            : 'text-[var(--text)]'
                        }`}
                      >
                        {metric.format(value, locale)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
