'use client';

import Link from 'next/link';
import { Globe, Link2, Lock } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useTranslations } from '@/hooks/useTranslations';
import type { List } from '@/lib/api/lists';

export interface ListCardProps {
  list: List;
  /** Item count to show. Resolved by the parent via cached item queries. */
  itemCount?: number;
}

const VISIBILITY_ICON = {
  private: Lock,
  unlisted: Link2,
  public: Globe,
} as const;

/**
 * Phase 17 — single-list card for the /account/lists index. Clickable surface
 * that links into /account/lists/[id]. Default list gets a small badge so
 * the user recognises their long-standing Избранное.
 */
export function ListCard({ list, itemCount }: ListCardProps) {
  const t = useTranslations();
  const Icon = VISIBILITY_ICON[list.visibility];
  const displayName = list.isDefault ? t.lists.defaultListName : list.name;

  return (
    <Link
      href={`/account/lists/${list.id}`}
      className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded-lg"
    >
      <Card interactive className="h-full">
        <div className="flex items-start gap-3">
          <div
            className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0"
            style={{
              background: 'color-mix(in srgb, var(--accent) 12%, transparent)',
            }}
          >
            <Icon size={16} className="text-[var(--accent)]" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <h3 className="text-[14px] font-semibold truncate">{displayName}</h3>
              {list.isDefault && (
                <span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)] bg-[var(--bg-elevated)] px-1.5 py-0.5 rounded">
                  {t.lists.defaultBadge}
                </span>
              )}
            </div>
            <div className="text-[12px] text-[var(--text-dim)] tabular-nums">
              {itemCount !== undefined && (
                <span>
                  {itemCount} {t.lists.itemCount}
                </span>
              )}
              {itemCount !== undefined && ' · '}
              <span>
                {new Date(list.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
