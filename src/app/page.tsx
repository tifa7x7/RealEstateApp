import { Suspense } from 'react';
import { FilterPanel } from '@/components/projects/FilterPanel';
import { KPIDashboard } from '@/components/projects/KPIDashboard';
import { MobileFilterButton } from '@/components/projects/MobileFilterButton';
import { ProjectListings } from '@/components/projects/ProjectListings';
import {
  FilterPanelSkeleton,
  KPISkeleton,
  ProjectListingsSkeleton,
} from '@/components/ui/Skeletons';

export default function HomePage() {
  return (
    <div className="px-4 py-6 md:px-6 md:py-8">
      <h1 className="sr-only">CrimeaDevTracker — новостройки Крыма</h1>
      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="hidden lg:block lg:w-72 shrink-0">
          <div className="sticky top-[120px] rounded-lg border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden">
            <Suspense fallback={<FilterPanelSkeleton />}>
              <FilterPanel />
            </Suspense>
          </div>
        </aside>

        <section className="flex-1 flex flex-col gap-6 min-w-0">
          <Suspense fallback={<KPISkeleton />}>
            <KPIDashboard />
          </Suspense>

          <div className="flex items-center justify-between">
            <Suspense fallback={null}>
              <MobileFilterButton />
            </Suspense>
            <div className="flex-1" />
          </div>

          <Suspense fallback={<ProjectListingsSkeleton />}>
            <ProjectListings />
          </Suspense>
        </section>
      </div>
    </div>
  );
}
