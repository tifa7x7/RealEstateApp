'use client';

import { Suspense, useState } from 'react';
import dynamic from 'next/dynamic';
import { DistrictPanel } from './DistrictPanel';
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
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <Suspense fallback={null}>
        <MapFilters />
      </Suspense>
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 min-w-0">
          <Suspense fallback={null}>
            <ProjectMap onSelectDistrict={setSelectedDistrict} />
          </Suspense>
        </div>
        {selectedDistrict && (
          <div className="lg:w-80 xl:w-96 shrink-0">
            <Suspense fallback={null}>
              <DistrictPanel
                district={selectedDistrict}
                onClose={() => setSelectedDistrict(null)}
              />
            </Suspense>
          </div>
        )}
      </div>
    </div>
  );
}
