'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { MapFilters } from './MapFilters';

const ProjectMap = dynamic(() => import('./ProjectMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[70vh] min-h-[400px] w-full rounded-lg border border-[var(--border)] bg-[var(--bg-card)] flex items-center justify-center text-[13px] text-[var(--text-dim)]">
      Загрузка карты…
    </div>
  ),
});

export function MapPageClient() {
  return (
    <div className="flex flex-col gap-4">
      <Suspense fallback={null}>
        <MapFilters />
      </Suspense>
      <Suspense fallback={null}>
        <ProjectMap />
      </Suspense>
    </div>
  );
}
