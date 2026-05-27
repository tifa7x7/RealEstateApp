'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Check,
  Globe,
  Heart,
  ListChecks,
  Link2,
  Lock,
  Pencil,
  Trash2,
  X,
} from 'lucide-react';
import { useToast } from '@/components/providers/ToastProvider';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { UnitCard } from '@/components/projects/UnitCard';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { PROJECTS } from '@/data/projects';
import { useAuth } from '@/hooks/useAuth';
import { useLists } from '@/hooks/useLists';
import { useTranslations } from '@/hooks/useTranslations';
import { fetchListItems, type ListVisibility } from '@/lib/api/lists';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { Project, Unit } from '@/lib/types';

export interface SingleListViewProps {
  listId: string;
}

const VISIBILITY_OPTIONS: ReadonlyArray<{
  value: ListVisibility;
  labelKey: 'visibilityPrivate' | 'visibilityUnlisted' | 'visibilityPublic';
  icon: typeof Lock;
}> = [
  { value: 'private', labelKey: 'visibilityPrivate', icon: Lock },
  { value: 'unlisted', labelKey: 'visibilityUnlisted', icon: Link2 },
  { value: 'public', labelKey: 'visibilityPublic', icon: Globe },
];

/**
 * Phase 17 — single-list view at /account/lists/[id]. Header with rename
 * inline-edit + visibility switch + delete. Body = project/unit grid built
 * from list_items joined against the React Query projects cache.
 *
 * Item count for the default list is also reflected in the existing
 * favorites/favUnits store slices, so toggling the heart on a ProjectCard
 * here propagates correctly to the index page count.
 */
export function SingleListView({ listId }: SingleListViewProps) {
  const t = useTranslations();
  const router = useRouter();
  const { lists, renameList, setListVisibility, deleteList } = useLists();
  const toast = useToast();
  const { supabaseEnabled, user } = useAuth();

  const list = lists.find((l) => l.id === listId);
  const isOwner = list?.relationship === 'owner';

  const { data: items = [] } = useQuery({
    queryKey: ['list-items', listId],
    queryFn: async () => {
      const client = getSupabaseBrowserClient();
      if (!client || !supabaseEnabled || !user) return [];
      return fetchListItems(client, listId);
    },
    enabled: !!list && supabaseEnabled && !!user,
  });

  const { data: allProjects = PROJECTS } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => PROJECTS as Project[],
    initialData: PROJECTS as Project[],
    enabled: false,
  });

  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState('');

  if (!list) {
    return (
      <div className="flex flex-col items-center gap-3 py-12">
        <EmptyState icon={ListChecks} title="Список не найден" />
        <Link href="/account/lists" className="text-[13px] text-[var(--accent)] hover:underline">
          ← {t.lists.detailBack}
        </Link>
      </div>
    );
  }

  const displayName = list.isDefault ? t.lists.defaultListName : list.name;

  const projects: Project[] = [];
  const units: { project: Project; unit: Unit }[] = [];
  for (const item of items) {
    const project = allProjects.find((p) => p.id === item.projectId);
    if (!project) continue;
    if (item.unitId === null) {
      projects.push(project);
    } else {
      const unit = project.units.find((u) => u.id === item.unitId);
      if (unit) units.push({ project, unit });
    }
  }

  const handleRenameStart = () => {
    setDraftName(list.name);
    setEditing(true);
  };

  const handleRenameSubmit = async () => {
    const trimmed = draftName.trim();
    if (!trimmed || trimmed === list.name) {
      setEditing(false);
      return;
    }
    await renameList(listId, trimmed);
    setEditing(false);
    toast.success(t.lists.saveSuccess);
  };

  const handleVisibilityChange = async (next: ListVisibility) => {
    if (next === list.visibility) return;
    await setListVisibility(listId, next);
    toast.success(t.lists.saveSuccess);
  };

  const handleDelete = async () => {
    if (!isOwner || list.isDefault) return;
    if (!window.confirm(t.lists.detailDeleteConfirm)) return;
    await deleteList(listId);
    router.push('/account/lists');
  };

  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/account/lists"
        className="inline-flex items-center gap-1.5 text-[12px] text-[var(--text-dim)] hover:text-[var(--accent)] focus-visible:outline-none focus-visible:underline w-fit"
      >
        <ArrowLeft size={14} aria-hidden="true" />
        {t.lists.detailBack}
      </Link>

      <header className="flex flex-col gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {editing ? (
            <>
              <Input
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void handleRenameSubmit();
                  if (e.key === 'Escape') setEditing(false);
                }}
                maxLength={80}
                autoFocus
                className="text-[20px] font-semibold"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => void handleRenameSubmit()}
                aria-label={t.lists.save}
              >
                <Check size={16} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditing(false)}
                aria-label={t.lists.cancel}
              >
                <X size={16} />
              </Button>
            </>
          ) : (
            <>
              <h1
                className="text-[22px] font-semibold leading-tight"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {displayName}
              </h1>
              {list.isDefault && (
                <span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)] bg-[var(--bg-elevated)] px-1.5 py-0.5 rounded">
                  {t.lists.defaultBadge}
                </span>
              )}
              {isOwner && !list.isDefault && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRenameStart}
                  aria-label={t.lists.detailRenameTooltip}
                  title={t.lists.detailRenameTooltip}
                >
                  <Pencil size={14} />
                </Button>
              )}
              {isOwner && !list.isDefault && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void handleDelete()}
                  aria-label={t.lists.detailDeleteTooltip}
                  title={t.lists.detailDeleteTooltip}
                >
                  <Trash2 size={14} />
                </Button>
              )}
            </>
          )}
        </div>

        {isOwner && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">
              {t.lists.visibilityLabel}
            </span>
            {VISIBILITY_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const selected = list.visibility === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => void handleVisibilityChange(opt.value)}
                  aria-pressed={selected}
                  className={
                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-medium border transition-colors ' +
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ' +
                    (selected
                      ? 'border-[var(--accent)] bg-[var(--accent-surface)] text-[var(--accent)]'
                      : 'border-[var(--border)] text-[var(--text-dim)] hover:border-[var(--accent)]/40')
                  }
                >
                  <Icon size={12} aria-hidden="true" />
                  {t.lists[opt.labelKey]}
                </button>
              );
            })}
          </div>
        )}
      </header>

      {projects.length === 0 && units.length === 0 ? (
        <EmptyState icon={Heart} title={t.lists.detailEmpty} />
      ) : (
        <>
          {projects.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">
                ЖК · {projects.length}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {projects.map((p) => (
                  <ProjectCard key={p.id} project={p} />
                ))}
              </div>
            </section>
          )}

          {units.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">
                {t.project.apartments} · {units.length}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {units.map(({ project, unit }) => (
                  <UnitCard
                    key={`${project.id}__${unit.id}`}
                    unit={unit}
                    projectId={project.id}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
