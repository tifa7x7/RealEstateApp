import { notFound } from 'next/navigation';
import { fetchProject } from '@/lib/api/projects';
import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  renderOgImage,
} from '@/lib/og-image';
import { getSupabaseStaticClient } from '@/lib/supabase/server';

export const runtime = 'edge';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = 'Проект новостройки';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Image({ params }: PageProps) {
  const { id } = await params;
  const client = getSupabaseStaticClient();
  const project = await fetchProject(client, Number(id));
  if (!project) notFound();

  return renderOgImage({
    eyebrow: `${project.city} · ${project.classType}`,
    title: project.name,
    subtitle: project.description ?? `${project.developer} · ${project.completion}`,
  });
}
