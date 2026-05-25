import { Suspense } from 'react';
import { FilterPanel } from '@/components/projects/FilterPanel';
import { HomeHero } from '@/components/projects/HomeHero';
import { MarketSnapshot } from '@/components/projects/MarketSnapshot';
import { MobileFilterButton } from '@/components/projects/MobileFilterButton';
import { MobileSort } from '@/components/projects/MobileSort';
import { ProjectListings } from '@/components/projects/ProjectListings';
import {
  FilterPanelSkeleton,
  ProjectListingsSkeleton,
} from '@/components/ui/Skeletons';

export default function HomePage() {
  return (
    <div className="px-4 py-4 md:px-6 md:py-6">
      <Suspense fallback={null}>
        <HomeHero />
      </Suspense>

      <div className="flex flex-col lg:flex-row gap-6 mt-2">
        <aside className="hidden lg:block lg:w-72 shrink-0">
          <div className="sticky top-[120px] rounded-lg border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden">
            <Suspense fallback={<FilterPanelSkeleton />}>
              <FilterPanel />
            </Suspense>
          </div>
        </aside>

        <section className="flex-1 flex flex-col gap-5 min-w-0">
          <Suspense fallback={null}>
            <MarketSnapshot />
          </Suspense>

          <div className="flex items-center justify-between gap-3">
            <Suspense fallback={null}>
              <MobileFilterButton />
            </Suspense>
            <Suspense fallback={null}>
              <MobileSort />
            </Suspense>
          </div>

          <Suspense fallback={<ProjectListingsSkeleton />}>
            <ProjectListings />
          </Suspense>
        </section>
      </div>
    </div>
  );
}
