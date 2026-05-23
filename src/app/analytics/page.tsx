import { Suspense } from 'react';
import { AmenityImpactChart } from '@/components/analytics/AmenityImpactChart';
import { ClassDistributionChart } from '@/components/analytics/ClassDistributionChart';
import { DevPortfolioChart } from '@/components/analytics/DevPortfolioChart';
import { PriceHeatmap } from '@/components/analytics/PriceHeatmap';
import { ValueQuadrantChart } from '@/components/analytics/ValueQuadrantChart';
import { ChartSkeleton } from '@/components/ui/Skeletons';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Аналитика рынка',
  description:
    'Анализ цен по классам, городам и удобствам. Портфели застройщиков. Квадрант ценности.',
  path: '/analytics',
});

export default function AnalyticsPage() {
  return (
    <div className="px-4 py-6 md:px-6 md:py-8 max-w-7xl mx-auto flex flex-col gap-4">
      <h1
        className="text-[22px] md:text-[28px] font-semibold"
        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
      >
        Аналитика рынка
      </h1>

      <Suspense fallback={<ChartSkeleton />}>
        <ValueQuadrantChart />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Suspense fallback={<ChartSkeleton />}>
          <ClassDistributionChart />
        </Suspense>
        <Suspense fallback={<ChartSkeleton />}>
          <DevPortfolioChart />
        </Suspense>
      </div>

      <Suspense fallback={<ChartSkeleton />}>
        <PriceHeatmap />
      </Suspense>

      <Suspense fallback={<ChartSkeleton />}>
        <AmenityImpactChart />
      </Suspense>
    </div>
  );
}
