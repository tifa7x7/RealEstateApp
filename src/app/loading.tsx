import {
  FilterPanelSkeleton,
  KPISkeleton,
  ProjectListingsSkeleton,
} from '@/components/ui/Skeletons';

export default function HomeLoading() {
  return (
    <div className="px-4 py-6 md:px-6 md:py-8">
      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="hidden lg:block lg:w-72 shrink-0">
          <div className="sticky top-[120px] rounded-lg border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden">
            <FilterPanelSkeleton />
          </div>
        </aside>
        <section className="flex-1 flex flex-col gap-6 min-w-0">
          <KPISkeleton />
          <ProjectListingsSkeleton />
        </section>
      </div>
    </div>
  );
}
