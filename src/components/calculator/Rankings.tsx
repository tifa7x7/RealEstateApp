'use client';

import { useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { useCalculator } from '@/hooks/useCalculator';
import { useLocale, useTranslations } from '@/hooks/useTranslations';
import { fmt } from '@/lib/formatters';
import type { CalcObject, CalcResults, Locale } from '@/lib/types';

interface RankableMetric {
  key: string;
  label: string;
  getValue: (results: CalcResults, object: CalcObject) => number;
  format: (value: number, locale: Locale) => string;
  higherBetter: boolean;
  visible: (object: CalcObject) => boolean;
}

const formatPct = (v: number) => (Number.isFinite(v) ? `${v.toFixed(1)}%` : '—');
const formatPrice = (v: number, locale: Locale) => fmt.price(v, locale);
const formatPriceSqm = (v: number, locale: Locale) =>
  fmt.priceSqm(Math.round(v), locale);

const METRICS: RankableMetric[] = [
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
    key: 'monthlyCashflow',
    label: 'Денежный поток/мес',
    getValue: (r) => r.monthlyCashflow,
    format: formatPrice,
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
    key: 'priceSqm',
    label: 'Цена/м² (дешевле лучше)',
    getValue: (r) => r.priceSqm,
    format: formatPriceSqm,
    higherBetter: false,
    visible: () => true,
  },
  {
    key: 'ownInvested',
    label: 'Своих средств (меньше лучше)',
    getValue: (r) => r.ownInvested,
    format: formatPrice,
    higherBetter: false,
    visible: () => true,
  },
];

interface RankedEntry {
  index: number;
  name: string;
  value: number;
}

export function Rankings() {
  const t = useTranslations();
  const { locale } = useLocale();
  const { objects, allResults } = useCalculator();

  const rankings = useMemo(() => {
    if (objects.length < 2) return [];
    return METRICS.map((metric) => {
      const entries: RankedEntry[] = [];
      for (let i = 0; i < objects.length; i++) {
        const obj = objects[i];
        const results = allResults[i];
        if (!obj || !results || !metric.visible(obj)) continue;
        const value = metric.getValue(results, obj);
        if (!Number.isFinite(value)) continue;
        entries.push({
          index: i,
          name: obj.name.trim() || `Объект ${i + 1}`,
          value,
        });
      }
      entries.sort((a, b) => (metric.higherBetter ? b.value - a.value : a.value - b.value));
      return { metric, entries };
    }).filter(({ entries }) => entries.length >= 2);
  }, [objects, allResults]);

  if (rankings.length === 0) return null;

  return (
    <Card>
      <h2 className="text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)] mb-4">
        {t.calc.rankings}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
        {rankings.map(({ metric, entries }) => (
          <div key={metric.key}>
            <h3 className="text-[12px] font-semibold text-[var(--text-dim)] mb-2">
              {metric.label}
            </h3>
            <ol className="flex flex-col gap-1">
              {entries.map((entry, rank) => (
                <li
                  key={entry.index}
                  className={`flex items-baseline justify-between gap-3 text-[13px] ${
                    rank === 0 ? 'font-semibold' : ''
                  }`}
                >
                  <span className="inline-flex items-center gap-1.5 min-w-0">
                    <span
                      className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-semibold tabular-nums shrink-0 ${
                        rank === 0
                          ? 'bg-[var(--accent-surface)] text-[var(--accent)]'
                          : 'bg-[var(--bg-elevated)] text-[var(--text-muted)]'
                      }`}
                    >
                      {rank + 1}
                    </span>
                    <span className="truncate">{entry.name}</span>
                  </span>
                  <span
                    className={`tabular-nums whitespace-nowrap ${
                      rank === 0 ? 'text-[var(--accent)]' : 'text-[var(--text-dim)]'
                    }`}
                  >
                    {metric.format(entry.value, locale)}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </Card>
  );
}
