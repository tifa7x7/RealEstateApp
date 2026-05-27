import { Skeleton } from '@/components/ui/Skeleton';
import { MapSkeleton } from '@/components/ui/Skeletons';

export default function MapLoading() {
  return (
    <div className="px-4 py-6 md:px-6 md:py-8 max-w-7xl mx-auto flex flex-col gap-4">
      <Skeleton height="2.25rem" width="40%" />
      <MapSkeleton />
    </div>
  );
}
