'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { useLocale, useTranslations } from '@/hooks/useTranslations';
import { CLASS_COLORS, STATUS_COLORS } from '@/lib/constants';
import { fmt } from '@/lib/formatters';
import type { Project } from '@/lib/types';

export interface MarkerPopupProps {
  project: Project;
}

export function MarkerPopup({ project: p }: MarkerPopupProps) {
  const t = useTranslations();
  const { locale } = useLocale();

  return (
    <div className="text-[13px] min-w-[220px]">
      <Link
        href={`/projects/${p.id}`}
        className="font-semibold hover:text-[var(--accent)] block mb-1 text-[var(--text)]"
      >
        {p.name}
      </Link>
      <div className="text-[12px] text-[var(--text-dim)] mb-2">{p.developer}</div>
      <div className="flex flex-wrap gap-1 mb-2">
        <Badge color={STATUS_COLORS[p.status]} size="sm">
          {p.status}
        </Badge>
        <Badge color={CLASS_COLORS[p.classType]} size="sm">
          {p.classType}
        </Badge>
      </div>
      <div className="text-[12px] tabular-nums text-[var(--text-dim)]">
        {fmt.priceSqm(p.pricePerSqm, locale)} · {fmt.dist(p.distSea, locale)}
      </div>
      <Link
        href={`/projects/${p.id}`}
        className="inline-block mt-2 text-[12px] font-medium text-[var(--accent)] hover:underline"
      >
        {t.table.details} →
      </Link>
    </div>
  );
}
