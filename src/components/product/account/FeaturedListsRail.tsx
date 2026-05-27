'use client';

import { Card } from '@/components/ui/Card';
import { FEATURED_LISTS } from '@/content/featured-lists';
import { usePaywall } from '@/hooks/usePaywall';
import { useTranslations } from '@/hooks/useTranslations';

/**
 * Phase 17 — right-rail / sidebar of editorially-curated lists. Seed
 * content lives in `src/content/featured-lists.ts`; tapping a Pro-locked
 * card surfaces a `🔒 Pro` chip but doesn't open a paywall modal — the
 * upgrade flow lives on the surrounding /account/lists header.
 */
export function FeaturedListsRail() {
  const t = useTranslations();
  const { isPro } = usePaywall('multi-list');

  return (
    <aside className="flex flex-col gap-3">
      <h2 className="text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">
        {t.lists.sectionFeatured}
      </h2>
      <div className="flex flex-col gap-2">
        {FEATURED_LISTS.map((list) => {
          const Icon = list.icon;
          const locked = list.proOnly && !isPro;
          return (
            <Card
              key={list.id}
              padded
              className={
                'flex items-start gap-3 ' +
                (locked ? 'opacity-75' : 'hover:border-[var(--accent)]/40 transition-colors')
              }
            >
              <div
                className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0"
                style={{
                  background: 'color-mix(in srgb, var(--accent) 12%, transparent)',
                }}
              >
                <Icon size={16} className="text-[var(--accent)]" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[13px] font-semibold truncate">
                    {list.name}
                  </span>
                  {list.proOnly && (
                    <span
                      className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded"
                      style={{
                        background:
                          'color-mix(in srgb, var(--premium) 18%, transparent)',
                        color: 'var(--premium)',
                      }}
                    >
                      {t.lists.proOnly}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[var(--text-dim)] leading-snug">
                  {list.description}
                </p>
              </div>
            </Card>
          );
        })}
      </div>
    </aside>
  );
}
