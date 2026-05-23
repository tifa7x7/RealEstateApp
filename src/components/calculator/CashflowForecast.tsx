'use client';

import { useMemo } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
  type TooltipContentProps,
  XAxis,
  YAxis,
} from 'recharts';
import { Card } from '@/components/ui/Card';
import { ProGate } from '@/components/ui/ProGate';
import { useCalculator } from '@/hooks/useCalculator';
import { useLocale, useTranslations } from '@/hooks/useTranslations';
import { generateCashflowForecast } from '@/lib/calculator';
import { fmt } from '@/lib/formatters';
import type { CashflowForecastYear } from '@/lib/types';

const CHART_GRID = '#1f2937';
const CHART_TICK = '#8893a7';

const SERIES = [
  { key: 'cashflow', label: 'Денежный поток', color: '#00d4aa' },
  { key: 'cumulativeCashflow', label: 'Накопленный поток', color: '#3b82f6' },
  { key: 'propertyValue', label: 'Стоимость объекта', color: '#f59e0b' },
  { key: 'equity', label: 'Капитал', color: '#a855f7' },
] as const;

function ForecastChart() {
  const t = useTranslations();
  const { locale } = useLocale();
  const { object, results } = useCalculator();

  const data = useMemo<CashflowForecastYear[]>(
    () =>
      generateCashflowForecast(
        {
          monthlyRent: object.monthlyRent,
          vacancy: object.vacancy,
          rentGrowth: object.rentGrowth,
          totalExpenses: results.totalExpenses,
          mortgagePayment: results.mortgage.totalMonthly,
          propertyValue: object.price,
          appreciation: object.appreciation,
          loanAmount: results.mortgage.loanAmount,
          expenseGrowth: object.expenseGrowth,
        },
        10,
      ),
    [object, results],
  );

  const renderTooltip = (props: TooltipContentProps) => {
    const { active, payload, label } = props;
    if (!active || !payload || payload.length === 0) return null;
    const row = payload[0]?.payload as CashflowForecastYear | undefined;
    if (!row) return null;
    return (
      <div className="px-3 py-2 rounded-lg text-[12px] shadow-lg bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text)]">
        <div className="font-semibold mb-1">Год {label}</div>
        <div className="flex flex-col gap-0.5 tabular-nums">
          <div className="text-[var(--text-muted)]">
            Поток: {fmt.price(row.cashflow, locale)}
          </div>
          <div className="text-[var(--text-muted)]">
            Накопленный: {fmt.price(row.cumulativeCashflow, locale)}
          </div>
          <div className="text-[var(--text-muted)]">
            Стоимость: {fmt.price(row.propertyValue, locale)}
          </div>
          <div className="text-[var(--text-muted)]">
            Капитал: {fmt.price(row.equity, locale)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <h2 className="text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)] mb-3">
        {t.calc.forecast}
      </h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 11, fill: CHART_TICK }}
              tickFormatter={(v: number) => `Y${v}`}
            />
            <YAxis
              tick={{ fontSize: 11, fill: CHART_TICK }}
              tickFormatter={(v: number) => {
                const abs = Math.abs(v);
                if (abs >= 1e6) return `${(v / 1e6).toFixed(1)}M`;
                if (abs >= 1e3) return `${Math.round(v / 1e3)}k`;
                return String(v);
              }}
              width={50}
            />
            <RTooltip content={renderTooltip} />
            <Legend
              wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
              iconType="circle"
            />
            {SERIES.map((s) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={s.color}
                strokeWidth={2}
                dot={{ r: 2.5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export function CashflowForecast() {
  const { object } = useCalculator();
  const hasRentOrExit = object.useRental || object.useExit;

  if (!hasRentOrExit) {
    return (
      <Card>
        <h2 className="text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)] mb-2">
          Прогноз на 10 лет
        </h2>
        <p className="text-[13px] text-[var(--text-dim)]">
          Включите «Арендный доход» или «Стратегия выхода», чтобы увидеть прогноз.
        </p>
      </Card>
    );
  }

  return (
    <ProGate
      feature="forecast"
      title="Прогноз на 10 лет"
      description="Прогноз денежного потока, накопленной прибыли, стоимости и капитала на 10 лет — в Pro."
    >
      <ForecastChart />
    </ProGate>
  );
}
