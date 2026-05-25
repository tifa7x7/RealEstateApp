'use client';

import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  ConfidenceBadge,
  projectDataConfidenceToTier,
} from '@/components/ui/ConfidenceBadge';
import { Sheet } from '@/components/ui/Sheet';
import { useCompare } from '@/hooks/useCompare';
import { useLocale, useTranslations } from '@/hooks/useTranslations';
import { CLASS_COLORS, STATUS_COLORS } from '@/lib/constants';
import { fmt } from '@/lib/formatters';
import type { Project } from '@/lib/types';

export interface CompareDrawerProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Side-by-side project comparison surface. Reads the same `compareIds` slice
 * that `ProjectHero`'s Compare button writes to.
 *
 * Renders as a Sheet (bottom on mobile, right-side drawer on desktop).
 * Includes a per-project remove + a global clear. When the user hits
 * Calculate on any project, the comparison closes and the calculator opens
 * prefilled.
 *
 * Empty state is unreachable because `CompareLauncher` only mounts this when
 * `compareIds.length > 0`, but we still render a friendly fallback for
 * safety.
 */
export function CompareDrawer({ open, onClose }: CompareDrawerProps) {
  const t = useTranslations();
  const { locale } = useLocale();
  const { projects, clear, remove } = useCompare();

  const title = `${t.compare.title} (${projects.length})`;

  return (
    <Sheet open={open} onClose={onClose} title={title} side="auto">
      {projects.length === 0 ? (
        <p className="text-[13px] text-[var(--text-dim)] py-6 text-center">
          {locale === 'ru'
            ? 'Пока нечего сравнивать. Откройте проект и нажмите «Добавить к сравнению».'
            : 'Nothing to compare yet. Open a project and tap “Add to comparison”.'}
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-[var(--text-muted)]">
              {locale === 'ru'
                ? 'Сравнение по ключевым параметрам'
                : 'Comparison of key parameters'}
            </span>
            <button
              type="button"
              onClick={() => {
                clear();
                onClose();
              }}
              className="text-[12px] text-[var(--text-dim)] hover:text-[var(--danger)] focus-visible:outline-none focus-visible:underline"
            >
              {t.compare.clear}
            </button>
          </div>

          <div className="overflow-x-auto -mx-4 px-4">
            <table
              className="w-full text-[13px]"
              style={{ borderCollapse: 'separate', borderSpacing: 0 }}
            >
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="text-left py-2 pr-3 text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)] whitespace-nowrap"
                  >
                    {locale === 'ru' ? 'Параметр' : 'Field'}
                  </th>
                  {projects.map((p) => (
                    <th
                      key={p.id}
                      scope="col"
                      className="text-left py-2 px-3 min-w-[180px] align-top"
                    >
                      <ProjectHeaderCell project={p} onRemove={() => remove(p.id)} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <Row label={locale === 'ru' ? 'Цена/м²' : 'Price/m²'}>
                  {projects.map((p) => {
                    const isBest =
                      p.pricePerSqm ===
                      Math.min(...projects.map((q) => q.pricePerSqm));
                    return (
                      <Cell key={p.id} emphasis={isBest}>
                        {fmt.priceSqm(p.pricePerSqm, locale)}
                      </Cell>
                    );
                  })}
                </Row>
                <Row label={locale === 'ru' ? 'Минимальная цена' : 'Min price'}>
                  {projects.map((p) => {
                    const isBest =
                      p.minPrice ===
                      Math.min(...projects.map((q) => q.minPrice));
                    return (
                      <Cell key={p.id} emphasis={isBest}>
                        {fmt.price(p.minPrice, locale)}
                      </Cell>
                    );
                  })}
                </Row>
                <Row label={locale === 'ru' ? 'До моря' : 'To sea'}>
                  {projects.map((p) => {
                    const isBest =
                      p.distSea ===
                      Math.min(...projects.map((q) => q.distSea));
                    return (
                      <Cell key={p.id} emphasis={isBest}>
                        {fmt.dist(p.distSea, locale)}
                      </Cell>
                    );
                  })}
                </Row>
                <Row label={locale === 'ru' ? 'Город' : 'City'}>
                  {projects.map((p) => (
                    <Cell key={p.id}>{p.city}</Cell>
                  ))}
                </Row>
                <Row label={locale === 'ru' ? 'Статус' : 'Status'}>
                  {projects.map((p) => (
                    <Cell key={p.id}>
                      <Badge color={STATUS_COLORS[p.status]} size="sm">
                        {p.status}
                      </Badge>
                    </Cell>
                  ))}
                </Row>
                <Row label={locale === 'ru' ? 'Класс' : 'Class'}>
                  {projects.map((p) => (
                    <Cell key={p.id}>
                      <Badge color={CLASS_COLORS[p.classType]} size="sm">
                        {p.classType}
                      </Badge>
                    </Cell>
                  ))}
                </Row>
                <Row label={locale === 'ru' ? 'Сдача' : 'Completion'}>
                  {projects.map((p) => (
                    <Cell key={p.id}>{p.completion}</Cell>
                  ))}
                </Row>
                <Row label={locale === 'ru' ? 'Этажей' : 'Floors'}>
                  {projects.map((p) => (
                    <Cell key={p.id}>{p.floors}</Cell>
                  ))}
                </Row>
                <Row label={locale === 'ru' ? 'Корпусов' : 'Buildings'}>
                  {projects.map((p) => (
                    <Cell key={p.id}>{p.buildings}</Cell>
                  ))}
                </Row>
                <Row
                  label={
                    locale === 'ru' ? 'Кол-во удобств' : t.compare.amenityCount
                  }
                >
                  {projects.map((p) => (
                    <Cell key={p.id}>{p.amenities.length}</Cell>
                  ))}
                </Row>
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-[var(--border)]">
            <Button variant="ghost" size="sm" onClick={onClose}>
              {t.compare.close}
            </Button>
          </div>
        </div>
      )}
    </Sheet>
  );
}

function ProjectHeaderCell({
  project: p,
  onRemove,
}: {
  project: Project;
  onRemove: () => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/projects/${p.id}`}
          className="font-semibold text-[13px] leading-tight hover:text-[var(--accent)] focus-visible:outline-none focus-visible:underline"
        >
          {p.name}
        </Link>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Убрать ${p.name} из сравнения`}
          className="shrink-0 p-1 rounded text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--bg-elevated)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
        >
          <Trash2 size={13} aria-hidden="true" />
        </button>
      </div>
      <div className="text-[11px] text-[var(--text-dim)] line-clamp-1">
        {p.developer}
      </div>
      <ConfidenceBadge
        tier={projectDataConfidenceToTier(p.dataConfidence)}
        compact
      />
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <tr className="border-t border-[var(--border)]">
      <td className="py-2 pr-3 text-[var(--text-muted)] whitespace-nowrap align-top">
        {label}
      </td>
      {children}
    </tr>
  );
}

function Cell({
  children,
  emphasis = false,
}: {
  children: React.ReactNode;
  emphasis?: boolean;
}) {
  return (
    <td
      className={`py-2 px-3 align-top tabular-nums whitespace-nowrap ${
        emphasis
          ? 'font-semibold text-[var(--accent)]'
          : 'text-[var(--text)]'
      }`}
    >
      {children}
    </td>
  );
}
