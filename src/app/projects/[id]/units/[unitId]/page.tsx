import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Layout as LayoutIcon } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { UnitActions } from '@/components/projects/UnitActions';
import { ru as t } from '@/i18n/ru';
import { fetchProject } from '@/lib/api/projects';
import { UNIT_STATUS_COLORS } from '@/lib/constants';
import { fmt } from '@/lib/formatters';
import { buildMetadata } from '@/lib/seo';
import { getSupabaseStaticClient } from '@/lib/supabase/server';

interface PageProps {
  params: Promise<{ id: string; unitId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id, unitId } = await params;
  const decodedUnitId = decodeURIComponent(unitId);
  const client = getSupabaseStaticClient();
  const project = await fetchProject(client, Number(id));
  const unit = project?.units.find((u) => u.id === decodedUnitId);
  if (!project || !unit) {
    return buildMetadata({
      title: 'Квартира не найдена',
      path: `/projects/${id}/units/${unitId}`,
    });
  }
  const rooms = unit.rooms === 0 ? 'Студия' : `${unit.rooms}-комн.`;
  return buildMetadata({
    title: `${rooms} ${unit.area} м² · ${project.name} — ${unit.id}`,
    description: `${rooms} квартира ${unit.area} м² в ${project.name} (${project.city}). Цена ${fmt.price(unit.price, 'ru')}.`,
    path: `/projects/${project.id}/units/${encodeURIComponent(unit.id)}`,
    ogType: 'article',
  });
}

interface SpecRow {
  label: string;
  value: string;
}

export default async function UnitDetailPage({ params }: PageProps) {
  const { id, unitId } = await params;
  const decodedUnitId = decodeURIComponent(unitId);
  const client = getSupabaseStaticClient();
  const project = await fetchProject(client, Number(id));
  const unit = project?.units.find((u) => u.id === decodedUnitId);
  if (!project || !unit) notFound();

  const roomsLabel = unit.rooms === 0 ? 'Студия' : `${unit.rooms}К`;
  const pricePerSqm = Math.round(unit.price / unit.area);

  const specs: SpecRow[] = [
    { label: t.project.aptId, value: unit.id },
    { label: t.project.building, value: unit.building },
    { label: t.project.floor, value: `${unit.floor} / ${project.floors}` },
    { label: t.project.rooms, value: roomsLabel },
    { label: t.project.area, value: `${unit.area} ${t.common.sqm}` },
    { label: t.project.pricePerSqm, value: fmt.priceSqm(pricePerSqm, 'ru') },
  ];

  return (
    <div className="px-4 py-6 md:px-6 md:py-8 max-w-4xl mx-auto flex flex-col gap-6">
      <Link
        href={`/projects/${project.id}?tab=apartments`}
        className="inline-flex items-center gap-1.5 text-[12px] text-[var(--text-dim)] hover:text-[var(--accent)] focus-visible:outline-none focus-visible:underline w-fit"
      >
        <ArrowLeft size={14} aria-hidden="true" />
        {project.name}
      </Link>

      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="min-w-0">
          <h1
            className="text-[22px] md:text-[28px] font-semibold leading-tight mb-1 tabular-nums"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {unit.id}
          </h1>
          <div className="text-[13px] text-[var(--text-dim)]">
            {roomsLabel} · {unit.area} {t.common.sqm} · {unit.building}
          </div>
          <div className="mt-3">
            <Badge color={UNIT_STATUS_COLORS[unit.status]} size="md">
              {unit.status}
            </Badge>
          </div>
        </div>

        <Card padded className="md:min-w-[220px]">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)] mb-1">
            {t.project.totalPrice}
          </div>
          <div
            className="text-[24px] font-semibold tabular-nums"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {fmt.price(unit.price, 'ru')}
          </div>
          <div className="text-[12px] text-[var(--text-dim)] tabular-nums">
            {fmt.priceSqm(pricePerSqm, 'ru')} / {t.common.sqm}
          </div>
        </Card>
      </div>

      <UnitActions projectId={project.id} unitId={unit.id} />

      <Card>
        <h2 className="text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)] mb-3">
          {t.project.keyInfo}
        </h2>
        <dl className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3 text-[13px]">
          {specs.map((s) => (
            <div key={s.label} className="flex justify-between gap-3">
              <dt className="text-[var(--text-muted)]">{s.label}</dt>
              <dd className="font-medium tabular-nums text-right">{s.value}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <Card>
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <LayoutIcon
            size={44}
            aria-hidden="true"
            className="text-[var(--text-muted)] mb-3"
          />
          <h2 className="text-[15px] font-semibold mb-1">{t.project.floorPlan}</h2>
          <p className="text-[13px] text-[var(--text-dim)]">{t.filters.comingSoon}</p>
        </div>
      </Card>
    </div>
  );
}
