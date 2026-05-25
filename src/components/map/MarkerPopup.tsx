'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Calculator } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import {
  ConfidenceBadge,
  projectDataConfidenceToTier,
} from '@/components/ui/ConfidenceBadge';
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

  // Cheapest available unit acts as the calculator default for the project.
  // Same handoff contract as Phase 2's UnitActions: /calculator?project=N&unit=ID.
  const calcUnit = useMemo(() => {
    const available = p.units.filter((u) => u.status === 'в продаже');
    if (available.length === 0) return null;
    return available.reduce((a, b) => (a.price < b.price ? a : b));
  }, [p.units]);

  return (
    <div className="text-[13px] min-w-[220px]">
      <Link
        href={`/projects/${p.id}`}
        className="font-semibold hover:text-[var(--accent)] block mb-1 text-[var(--text)]"
      >
        {p.name}
      </Link>
      <div className="text-[12px] text-[var(--text-dim)] mb-2">{p.developer}</div>
      <div className="flex flex-wrap items-center gap-1 mb-2">
        <Badge color={STATUS_COLORS[p.status]} size="sm">
          {p.status}
        </Badge>
        <Badge color={CLASS_COLORS[p.classType]} size="sm">
          {p.classType}
        </Badge>
        <ConfidenceBadge tier={projectDataConfidenceToTier(p.dataConfidence)} compact />
      </div>
      <div className="text-[12px] tabular-nums text-[var(--text-dim)]">
        {fmt.priceSqm(p.pricePerSqm, locale)} · {fmt.dist(p.distSea, locale)}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <Link
          href={`/projects/${p.id}`}
          className="text-[12px] font-medium text-[var(--accent)] hover:underline"
        >
          {t.table.details} →
        </Link>
        {calcUnit && (
          <Link
            href={`/calculator?project=${p.id}&unit=${encodeURIComponent(calcUnit.id)}`}
            className="inline-flex items-center gap-1 text-[12px] font-medium text-[var(--secondary)] hover:underline"
          >
            <Calculator size={12} aria-hidden="true" />
            {t.detail.calculate}
          </Link>
        )}
      </div>
    </div>
  );
}
