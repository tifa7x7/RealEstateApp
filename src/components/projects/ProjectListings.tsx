'use client';

import { Search } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { useFilters } from '@/hooks/useFilters';
import { useProjects } from '@/hooks/useProjects';
import { useTranslations } from '@/hooks/useTranslations';
import { ProjectCard } from './ProjectCard';
import { ProjectTable } from './ProjectTable';

export function ProjectListings() {
  const t = useTranslations();
  const { projects } = useProjects();
  const { reset } = useFilters();

  if (projects.length === 0) {
    return (
      <EmptyState
        icon={Search}
        title={t.common.noResults}
        action={{
          label: t.common.resetFilters,
          onClick: reset,
          variant: 'secondary',
        }}
      />
    );
  }

  return (
    <>
      <div className="md:hidden grid gap-3">
        {projects.map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}
      </div>
      <div className="hidden md:block">
        <ProjectTable projects={projects} />
      </div>
    </>
  );
}
