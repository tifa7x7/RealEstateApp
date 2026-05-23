import { Skeleton } from '@/components/ui/Skeleton';
import { ChartSkeleton } from '@/components/ui/Skeletons';

export default function AnalyticsLoading() {
  return (
    <div className="px-4 py-6 md:px-6 md:py-8 max-w-7xl mx-auto flex flex-col gap-4">
      <Skeleton height="2.25rem" width="40%" />
      <ChartSkeleton height={320} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
      <ChartSkeleton />
      <ChartSkeleton />
    </div>
  );
}
