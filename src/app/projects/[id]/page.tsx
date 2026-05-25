import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { Image as ImageIcon, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { ProjectAmenities } from '@/components/projects/ProjectAmenities';
import { ProjectHero } from '@/components/projects/ProjectHero';
import { ProjectStats } from '@/components/projects/ProjectStats';
import { ProjectTabs } from '@/components/projects/ProjectTabs';
import { UnitListings } from '@/components/projects/UnitListings';
import { ru as t } from '@/i18n/ru';
import { fetchProject } from '@/lib/api/projects';
import { buildMetadata } from '@/lib/seo';
import { getSupabaseStaticClient } from '@/lib/supabase/server';

interface PageProps {
  params: Promise<{ id: string }>;
}

// ISR — 10-minute revalidation. Project data rarely changes faster than
// that, and ISR keeps the highest-traffic detail pages cached at the edge
// while still picking up Supabase mutations. Phase 14 replaces the previous
// `force-dynamic` (which was a Phase-8 Windows-worker workaround and is
// independent of the runtime caching decision).
export const revalidate = 600;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const client = getSupabaseStaticClient();
  const project = await fetchProject(client, Number(id));
  if (!project) return buildMetadata({ title: 'Проект не найден', path: `/projects/${id}` });
  return buildMetadata({
    title: `${project.name} — ${project.city} · ${project.developer}`,
    description: project.description ?? `${project.classType} жилой комплекс в ${project.city}.`,
    path: `/projects/${project.id}`,
    ogType: 'article',
  });
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params;
  const client = getSupabaseStaticClient();
  const project = await fetchProject(client, Number(id));
  if (!project) notFound();

  return (
    <div className="px-4 py-6 md:px-6 md:py-8 max-w-6xl mx-auto flex flex-col gap-6">
      <ProjectHero project={project} />

      <Suspense fallback={null}>
        <ProjectTabs
          about={
            <div className="flex flex-col gap-6">
              <ProjectStats project={project} />
              {project.description && (
                <Card>
                  <h2 className="text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)] mb-2">
                    {t.project.description}
                  </h2>
                  <p className="text-[14px] leading-relaxed text-[var(--text)]">
                    {project.description}
                  </p>
                </Card>
              )}
              <ProjectAmenities amenities={project.amenities} />
            </div>
          }
          apartments={<UnitListings units={project.units} projectId={project.id} />}
          gallery={
            <Card>
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <ImageIcon
                  size={44}
                  aria-hidden="true"
                  className="text-[var(--text-muted)] mb-3"
                />
                <h2 className="text-[15px] font-semibold mb-1">{t.project.gallery}</h2>
                <p className="text-[13px] text-[var(--text-dim)]">
                  {t.project.aiDesign}
                </p>
              </div>
            </Card>
          }
          location={
            <Card>
              <div className="flex flex-col items-start gap-3">
                <div className="inline-flex items-center gap-2 text-[14px]">
                  <MapPin size={16} aria-hidden="true" className="text-[var(--accent)]" />
                  <span className="font-medium">{project.city}</span>
                  <span className="text-[var(--text-dim)]">·</span>
                  <span className="text-[var(--text-dim)]">{project.district}</span>
                </div>
                <div className="text-[12px] text-[var(--text-muted)] tabular-nums">
                  {project.lat.toFixed(4)}, {project.lng.toFixed(4)}
                </div>
                <div className="w-full h-64 rounded-md border border-dashed border-[var(--border)] bg-[var(--bg-elevated)] flex items-center justify-center text-[12px] text-[var(--text-muted)]">
                  {t.filters.comingSoon}
                </div>
              </div>
            </Card>
          }
        />
      </Suspense>
    </div>
  );
}
