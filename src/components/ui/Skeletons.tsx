/**
 * Composite skeleton components for loading states. Built on top of the
 * primitive `<Skeleton>` for full-route and section-level placeholders.
 */
import { Card } from './Card';
import { Skeleton } from './Skeleton';

export function CardSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <Card>
      <div className="flex flex-col gap-3">
        <Skeleton height="1.25rem" width="60%" />
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} height="0.875rem" width={`${60 + ((i * 13) % 35)}%`} />
        ))}
      </div>
    </Card>
  );
}

export function KPISkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <div className="flex flex-col gap-2">
            <Skeleton height="0.75rem" width="50%" />
            <Skeleton height="1.5rem" width="70%" />
          </div>
        </Card>
      ))}
    </div>
  );
}

export function ProjectListingsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <Skeleton height="1.25rem" width="80px" rounded="full" />
              <Skeleton height="1.25rem" width="64px" rounded="full" />
            </div>
            <Skeleton height="1.25rem" width="80%" />
            <Skeleton height="0.875rem" width="55%" />
            <div className="flex justify-between mt-2">
              <Skeleton height="0.875rem" width="35%" />
              <Skeleton height="0.875rem" width="25%" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export function FilterPanelSkeleton() {
  return (
    <div className="p-4 flex flex-col gap-4">
      <Skeleton height="1rem" width="40%" />
      <Skeleton height="2.25rem" width="100%" />
      <Skeleton height="1rem" width="50%" />
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} height="1.5rem" width="72px" rounded="full" />
        ))}
      </div>
      <Skeleton height="1rem" width="60%" />
      <Skeleton height="2rem" width="100%" />
    </div>
  );
}

export function ChartSkeleton({ height = 280 }: { height?: number }) {
  return (
    <Card>
      <div className="flex flex-col gap-3">
        <Skeleton height="1rem" width="40%" />
        <Skeleton height={height} width="100%" />
      </div>
    </Card>
  );
}

export function MapSkeleton() {
  return <Skeleton height="70vh" width="100%" rounded="lg" />;
}

export function CalcSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1 flex flex-col gap-4">
        <Skeleton height="2.25rem" width="60%" />
        <CardSkeleton rows={6} />
        <CardSkeleton rows={4} />
      </div>
      <aside className="lg:w-80 shrink-0">
        <CardSkeleton rows={5} />
      </aside>
    </div>
  );
}

export function ProjectDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton height="0.875rem" width="40%" />
        <Skeleton height="2.25rem" width="70%" />
        <div className="flex gap-2 mt-2">
          <Skeleton height="1.5rem" width="80px" rounded="full" />
          <Skeleton height="1.5rem" width="80px" rounded="full" />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <Skeleton height="0.75rem" width="60%" />
            <div className="h-2" />
            <Skeleton height="1.5rem" width="80%" />
          </Card>
        ))}
      </div>
      <CardSkeleton rows={5} />
    </div>
  );
}
