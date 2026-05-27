import { Suspense } from 'react';
import { FilterPanel } from '@/components/product/projects/FilterPanel';
import { HomeHero } from '@/components/product/projects/HomeHero';
import { MarketSnapshot } from '@/components/product/projects/MarketSnapshot';
import { MobileFilterButton } from '@/components/product/projects/MobileFilterButton';
import { MobileSort } from '@/components/product/projects/MobileSort';
import { ProjectListings } from '@/components/product/projects/ProjectListings';
import {
  FilterPanelSkeleton,
  ProjectListingsSkeleton,
} from '@/components/ui/Skeletons';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Поиск',
  path: '/search',
});

/**
 * Phase 19 — product search surface. Holds the search-first hero +
 * filters + project listings UX that previously lived at `/`. Moved
 * here because CLAUDE.md's surface model forbids product listings on
 * marketing pages, and `/` is now the calculator-as-hero marketing
 * homepage.
 *
 * The Header's search form and "Поиск" tab both push to `/search`.
 */
export default function SearchPage() {
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
