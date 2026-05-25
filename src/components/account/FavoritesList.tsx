'use client';

import { Heart } from 'lucide-react';
import { AlertOnboardingNudge } from '@/components/account/AlertOnboardingNudge';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { UnitCard } from '@/components/projects/UnitCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { useFavorites } from '@/hooks/useFavorites';
import { useTranslations } from '@/hooks/useTranslations';

function SectionLabel({ children, count }: { children: string; count: number }) {
  return (
    <h2 className="text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)] inline-flex items-center gap-1.5">
      {children}
      <span className="px-1.5 py-0.5 rounded text-[10px] bg-[var(--bg-elevated)] text-[var(--text-dim)] tabular-nums">
        {count}
      </span>
    </h2>
  );
}

export function FavoritesList() {
  const t = useTranslations();
  const { favoriteProjects, favoriteUnits } = useFavorites();

  if (favoriteProjects.length === 0 && favoriteUnits.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title={t.auth.noFavorites}
        description={t.auth.addFromCatalog}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <AlertOnboardingNudge />

      {favoriteProjects.length > 0 && (
        <section className="flex flex-col gap-3">
          <SectionLabel count={favoriteProjects.length}>ЖК</SectionLabel>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {favoriteProjects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </section>
      )}

      {favoriteUnits.length > 0 && (
        <section className="flex flex-col gap-3">
          <SectionLabel count={favoriteUnits.length}>Квартиры</SectionLabel>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {favoriteUnits.map(({ project, unit }) => (
              <UnitCard
                key={`${project.id}__${unit.id}`}
                unit={unit}
                projectId={project.id}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
