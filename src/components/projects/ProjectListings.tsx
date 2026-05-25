'use client';

import { Fragment } from 'react';
import { Search } from 'lucide-react';
import { AdSlot } from '@/components/ui/AdSlot';
import { EmptyState } from '@/components/ui/EmptyState';
import { useFilters } from '@/hooks/useFilters';
import { useProjects } from '@/hooks/useProjects';
import { useTranslations } from '@/hooks/useTranslations';
import { ProjectCard } from './ProjectCard';
import { ProjectTable } from './ProjectTable';

const AD_INTERVAL = 8; // insert an inline ad every N project cards on mobile

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
        {projects.map((p, i) => (
          <Fragment key={p.id}>
            <ProjectCard project={p} />
            {(i + 1) % AD_INTERVAL === 0 && i < projects.length - 1 && (
              <AdSlot location="listings-inline" />
            )}
          </Fragment>
        ))}
      </div>
      <div className="hidden md:block">
        <ProjectTable projects={projects} />
      </div>
    </>
  );
}
