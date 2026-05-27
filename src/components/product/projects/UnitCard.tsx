'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { useLocale, useTranslations } from '@/hooks/useTranslations';
import { UNIT_STATUS_COLORS } from '@/lib/constants';
import { fmt } from '@/lib/formatters';
import type { Unit } from '@/lib/types';

export interface UnitCardProps {
  unit: Unit;
  projectId: number;
}

export function UnitCard({ unit: u, projectId }: UnitCardProps) {
  const t = useTranslations();
  const { locale } = useLocale();
  const roomsLabel =
    u.rooms === 0 ? (locale === 'en' ? 'Studio' : 'Студия') : `${u.rooms}К`;

  return (
    <Card interactive padded={false}>
      <Link
        href={`/projects/${projectId}/units/${encodeURIComponent(u.id)}`}
        className="block p-4"
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <div className="font-semibold text-[14px] tabular-nums">{u.id}</div>
            <div className="text-[12px] text-[var(--text-dim)]">
              {u.building} · {t.project.floor} {u.floor}
            </div>
          </div>
          <Badge color={UNIT_STATUS_COLORS[u.status]} size="sm">
            {u.status}
          </Badge>
        </div>

        <div className="flex items-end justify-between gap-3">
          <div className="text-[12px] text-[var(--text-dim)]">
            <div>
              {roomsLabel} · {u.area} {t.common.sqm}
            </div>
            <div className="tabular-nums">
              {fmt.priceSqm(Math.round(u.price / u.area), locale)} /{t.common.sqm}
            </div>
          </div>
          <div
            className="text-[18px] font-semibold tabular-nums"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {fmt.price(u.price, locale)}
          </div>
        </div>
      </Link>
    </Card>
  );
}
