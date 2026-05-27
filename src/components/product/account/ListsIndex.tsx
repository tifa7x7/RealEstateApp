'use client';

import { useState } from 'react';
import { ListChecks, Plus } from 'lucide-react';
import { CreateListDialog } from '@/components/product/account/CreateListDialog';
import { FeaturedListsRail } from '@/components/product/account/FeaturedListsRail';
import { ListCard } from '@/components/product/account/ListCard';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { UpgradePrompt } from '@/components/ui/UpgradePrompt';
import { useFavorites } from '@/hooks/useFavorites';
import { useLists } from '@/hooks/useLists';
import { useTranslations } from '@/hooks/useTranslations';

/**
 * Phase 17 — main /account/lists view. Three sections:
 *   - Mine (owned lists)
 *   - Following (lists this user follows)
 *   - Featured (curated seed content, right rail on lg+)
 *
 * "+ Create list" tier-gates: Free users get UpgradePrompt; Pro users
 * get CreateListDialog.
 */
export function ListsIndex() {
  const t = useTranslations();
  const { ownedLists, followedLists, isPro } = useLists();
  const { favoriteProjects, favoriteUnits } = useFavorites();
  const [createOpen, setCreateOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  // Default-list item count comes from the existing favorites slice (since
  // the default list IS the favorites bucket). Other lists' counts aren't
  // cached yet — Session 3 caches them. For now non-default lists show no
  // count.
  const defaultListCount = favoriteProjects.length + favoriteUnits.length;
  const itemCountForList = (listId: string) => {
    const list = ownedLists.find((l) => l.id === listId);
    return list?.isDefault ? defaultListCount : undefined;
  };

  const handleCreate = () => {
    if (isPro) setCreateOpen(true);
    else setUpgradeOpen(true);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
      <div className="flex flex-col gap-6 min-w-0">
        <header className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-[20px] font-semibold mb-1">{t.lists.indexTitle}</h1>
            <p className="text-[12px] text-[var(--text-dim)] max-w-xl leading-relaxed">
              {t.lists.indexHint}
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={handleCreate}>
            <Plus size={14} aria-hidden="true" />
            {t.lists.createButton}
          </Button>
        </header>

        <section className="flex flex-col gap-3">
          <h2 className="text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">
            {t.lists.sectionMine}
          </h2>
          {ownedLists.length === 0 ? (
            <EmptyState icon={ListChecks} title={t.lists.emptyMine} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {ownedLists.map((list) => (
                <ListCard key={list.id} list={list} itemCount={itemCountForList(list.id)} />
              ))}
            </div>
          )}
        </section>

        {followedLists.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">
              {t.lists.sectionFollowing}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {followedLists.map((list) => (
                <ListCard key={list.id} list={list} />
              ))}
            </div>
          </section>
        )}
      </div>

      <FeaturedListsRail />

      <CreateListDialog open={createOpen} onClose={() => setCreateOpen(false)} />
      <UpgradePrompt
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        description={t.lists.multiListProOnly}
      />
    </div>
  );
}
