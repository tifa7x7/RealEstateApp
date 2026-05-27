'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { ChartSkeleton } from '@/components/ui/Skeletons';
import { InViewport } from '@/components/ui/InViewport';

// Charts lazy-load on viewport entry. Drops First Load JS by ~60–80 kB on
// `/analytics` — users who only see the top chart never pay the Recharts
// cost of the others. Each chart's bundle ships in its own client chunk via
// `next/dynamic({ ssr: false })`. Must be inside a client component per
// Next 15 (Server Components can't host `ssr: false`).
const ValueQuadrantChart = dynamic(
  () =>
    import('./ValueQuadrantChart').then((m) => m.ValueQuadrantChart),
  { ssr: false, loading: () => <ChartSkeleton /> },
);
const ClassDistributionChart = dynamic(
  () =>
    import('./ClassDistributionChart').then((m) => m.ClassDistributionChart),
  { ssr: false, loading: () => <ChartSkeleton /> },
);
const DevPortfolioChart = dynamic(
  () => import('./DevPortfolioChart').then((m) => m.DevPortfolioChart),
  { ssr: false, loading: () => <ChartSkeleton /> },
);
const PriceHeatmap = dynamic(
  () => import('./PriceHeatmap').then((m) => m.PriceHeatmap),
  { ssr: false, loading: () => <ChartSkeleton /> },
);
const AmenityImpactChart = dynamic(
  () => import('./AmenityImpactChart').then((m) => m.AmenityImpactChart),
  { ssr: false, loading: () => <ChartSkeleton /> },
);

export function AnalyticsContent() {
  return (
    <>
      {/* Top chart renders eagerly (it's above the fold). */}
      <Suspense fallback={<ChartSkeleton />}>
        <ValueQuadrantChart />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <InViewport fallback={<ChartSkeleton />}>
          <Suspense fallback={<ChartSkeleton />}>
            <ClassDistributionChart />
          </Suspense>
        </InViewport>
        <InViewport fallback={<ChartSkeleton />}>
          <Suspense fallback={<ChartSkeleton />}>
            <DevPortfolioChart />
          </Suspense>
        </InViewport>
      </div>

      <InViewport fallback={<ChartSkeleton />}>
        <Suspense fallback={<ChartSkeleton />}>
          <PriceHeatmap />
        </Suspense>
      </InViewport>

      <InViewport fallback={<ChartSkeleton />}>
        <Suspense fallback={<ChartSkeleton />}>
          <AmenityImpactChart />
        </Suspense>
      </InViewport>
    </>
  );
}
