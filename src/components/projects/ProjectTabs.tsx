'use client';

import { type ReactNode } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from '@/hooks/useTranslations';

export type ProjectTabId = 'about' | 'apartments' | 'gallery' | 'location';

const TAB_IDS: readonly ProjectTabId[] = ['about', 'apartments', 'gallery', 'location'];

export interface ProjectTabsProps {
  about: ReactNode;
  apartments: ReactNode;
  gallery: ReactNode;
  location: ReactNode;
}

function isTabId(value: string | null): value is ProjectTabId {
  return value !== null && (TAB_IDS as readonly string[]).includes(value);
}

export function ProjectTabs({ about, apartments, gallery, location }: ProjectTabsProps) {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tabParam = searchParams.get('tab');
  const activeTab: ProjectTabId = isTabId(tabParam) ? tabParam : 'about';

  const tabs: { id: ProjectTabId; label: string }[] = [
    { id: 'about', label: t.project.about },
    { id: 'apartments', label: t.project.apartments },
    { id: 'gallery', label: t.project.gallery },
    { id: 'location', label: t.project.location },
  ];

  const panels: Record<ProjectTabId, ReactNode> = { about, apartments, gallery, location };

  const setTab = (id: ProjectTabId) => {
    const params = new URLSearchParams(searchParams.toString());
    if (id === 'about') params.delete('tab');
    else params.set('tab', id);
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  return (
    <div>
      <div
        role="tablist"
        aria-label={t.project.about}
        className="flex gap-1 border-b border-[var(--border)] mb-4 overflow-x-auto"
      >
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={active}
              aria-controls={`panel-${tab.id}`}
              tabIndex={active ? 0 : -1}
              onClick={() => setTab(tab.id)}
              className={
                'px-4 py-2 text-[13px] font-medium border-b-2 transition-colors whitespace-nowrap ' +
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-inset ' +
                (active
                  ? 'text-[var(--accent)] border-[var(--accent)]'
                  : 'text-[var(--text-dim)] border-transparent hover:text-[var(--text)]')
              }
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {TAB_IDS.map((id) => (
        <div
          key={id}
          role="tabpanel"
          id={`panel-${id}`}
          aria-labelledby={`tab-${id}`}
          hidden={activeTab !== id}
        >
          {panels[id]}
        </div>
      ))}
    </div>
  );
}
