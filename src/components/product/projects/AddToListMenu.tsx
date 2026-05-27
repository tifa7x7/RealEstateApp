'use client';

import {
  type MouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useQuery } from '@tanstack/react-query';
import { Check, ChevronDown, Globe, ListPlus, Lock, Plus, Sparkles } from 'lucide-react';
import { CreateListDialog } from '@/components/product/account/CreateListDialog';
import { useToast } from '@/components/providers/ToastProvider';
import { UpgradePrompt } from '@/components/ui/UpgradePrompt';
import { useLists } from '@/hooks/useLists';
import { useTranslations } from '@/hooks/useTranslations';
import { fetchListItems } from '@/lib/api/lists';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

export interface AddToListMenuProps {
  projectId: number;
  /** Pass null for project-level add; pass a unit id for unit-level. */
  unitId?: string | null;
  /** Optional className for the trigger button. */
  className?: string;
}

/**
 * Phase 17 — dropdown that shows the user's lists with check-box state for
 * the current item. Click toggles membership. Pro-only "Create new list"
 * row at the bottom opens CreateListDialog (or UpgradePrompt for Free).
 *
 * Mounted next to the existing heart toggle on ProjectCard / UnitCard /
 * ProjectHero. The heart continues to toggle the default `Избранное` list
 * (one-click muscle memory); this menu is the "I want to put it somewhere
 * else" affordance.
 */
export function AddToListMenu({
  projectId,
  unitId = null,
  className = '',
}: AddToListMenuProps) {
  const t = useTranslations();
  const { ownedLists, addToList, removeFromList, isPro } = useLists();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Per-list membership query — only runs when the menu is open to avoid
  // wasting Supabase calls when nobody's looking. React Query caches per
  // list id so reopening the menu is instant.
  const { data: membershipByListId = {} } = useQuery({
    queryKey: ['list-membership', projectId, unitId, ownedLists.map((l) => l.id).sort().join(',')],
    queryFn: async (): Promise<Record<string, boolean>> => {
      const client = getSupabaseBrowserClient();
      if (!client || ownedLists.length === 0) return {};
      const entries = await Promise.all(
        ownedLists.map(async (l) => {
          const items = await fetchListItems(client, l.id);
          const inList = items.some(
            (i) => i.projectId === projectId && i.unitId === unitId,
          );
          return [l.id, inList] as const;
        }),
      );
      return Object.fromEntries(entries);
    },
    enabled: open && ownedLists.length > 0,
    staleTime: 30_000,
  });

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: globalThis.MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const handleToggleMembership = useCallback(
    async (listId: string, currentlyIn: boolean) => {
      if (currentlyIn) {
        await removeFromList(listId, projectId, unitId);
      } else {
        await addToList(listId, { projectId, unitId });
      }
      toast.success(t.lists.saveSuccess);
    },
    [addToList, removeFromList, projectId, unitId, t, toast],
  );

  const handleCreateNew = () => {
    setOpen(false);
    if (isPro) setCreateOpen(true);
    else setUpgradeOpen(true);
  };

  return (
    <div ref={rootRef} className={`relative ${className}`.trim()}>
      <button
        type="button"
        onClick={(e: MouseEvent<HTMLButtonElement>) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={t.lists.addToList}
        title={t.lists.addToList}
        className={
          'inline-flex items-center gap-1 p-1.5 rounded-lg bg-[var(--bg-card)]/80 backdrop-blur ' +
          'hover:bg-[var(--bg-card)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]'
        }
      >
        <ListPlus size={14} className="text-[var(--text-dim)]" aria-hidden="true" />
        <ChevronDown size={12} className="text-[var(--text-dim)]" aria-hidden="true" />
      </button>

      {open && (
        <div
          role="menu"
          aria-label={t.lists.addToListMenuTitle}
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 top-full mt-1 z-20 min-w-[220px] max-w-[280px] rounded-lg border border-[var(--border)] bg-[var(--bg-card)] shadow-lg p-1.5"
        >
          <div className="px-2 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">
            {t.lists.addToListMenuTitle}
          </div>
          <ul className="flex flex-col gap-0.5 max-h-[260px] overflow-y-auto">
            {ownedLists.map((list) => {
              const inList = membershipByListId[list.id] ?? false;
              const displayName = list.isDefault ? t.lists.defaultListName : list.name;
              const VisIcon = list.visibility === 'public' ? Globe : Lock;
              return (
                <li key={list.id}>
                  <button
                    type="button"
                    role="menuitemcheckbox"
                    aria-checked={inList}
                    onClick={() => void handleToggleMembership(list.id, inList)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-[13px] text-left hover:bg-[var(--bg-elevated)] focus-visible:outline-none focus-visible:bg-[var(--bg-elevated)]"
                  >
                    <span
                      className={
                        'flex items-center justify-center w-4 h-4 rounded border ' +
                        (inList
                          ? 'border-[var(--accent)] bg-[var(--accent)]'
                          : 'border-[var(--border)]')
                      }
                      aria-hidden="true"
                    >
                      {inList && <Check size={10} className="text-white" />}
                    </span>
                    <span className="flex-1 truncate">{displayName}</span>
                    <VisIcon
                      size={12}
                      className="text-[var(--text-muted)]"
                      aria-hidden="true"
                    />
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="border-t border-[var(--border)] mt-1 pt-1">
            <button
              type="button"
              role="menuitem"
              onClick={handleCreateNew}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-[13px] text-left hover:bg-[var(--bg-elevated)] focus-visible:outline-none focus-visible:bg-[var(--bg-elevated)]"
            >
              <Plus size={14} className="text-[var(--accent)]" aria-hidden="true" />
              <span className="flex-1">{t.lists.addToListCreateNew}</span>
              {!isPro && (
                <Sparkles
                  size={12}
                  className="text-[var(--premium)]"
                  aria-hidden="true"
                />
              )}
            </button>
            {!isPro && (
              <p className="px-2 py-1 text-[11px] text-[var(--text-dim)] leading-snug">
                {t.lists.addToListProHint}
              </p>
            )}
          </div>
        </div>
      )}

      <CreateListDialog open={createOpen} onClose={() => setCreateOpen(false)} />
      <UpgradePrompt
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        description={t.lists.multiListProOnly}
      />
    </div>
  );
}
