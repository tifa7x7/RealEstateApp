'use client';

import dynamic from 'next/dynamic';
import { Card } from '@/components/ui/Card';
import { ProGate } from '@/components/ui/ProGate';
import { ChartSkeleton } from '@/components/ui/Skeletons';
import { useCalculator } from '@/hooks/useCalculator';

// Lazy-load the actual chart so Recharts doesn't ship in the initial
// `/calculator` bundle. Users without rental/exit toggles or without Pro
// never download the chart code. The `ForecastChart` module is the only
// thing in CashflowForecast's tree that pulls in Recharts.
const ForecastChart = dynamic(
  () => import('./ForecastChart').then((m) => m.ForecastChart),
  { ssr: false, loading: () => <ChartSkeleton /> },
);

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
