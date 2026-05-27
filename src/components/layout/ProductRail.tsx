'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Calculator,
  ListChecks,
  type LucideIcon,
  Map as MapIcon,
  Search,
  Settings,
  User,
} from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';

interface RailItem {
  href: string;
  labelKey: string;
  label: string;
  icon: LucideIcon;
}

/**
 * Phase 18 — narrow icon-only left rail variant for `<ProductShell
 * chrome='rail'>`. Modeled on Solgt's product nav: vertical strip of
 * single-purpose icons, label visible on hover/focus only.
 *
 * Not used by default. Activates when the product surface count grows
 * past 6-7 (CLAUDE.md surface model). Until then `ProductShell` ships
 * the horizontal `Header` variant.
 */
export function ProductRail() {
  const t = useTranslations();
  const pathname = usePathname();

  const items: readonly RailItem[] = [
    { href: '/', labelKey: 'tabs.search', label: t.tabs.search, icon: Search },
    { href: '/map', labelKey: 'tabs.map', label: t.tabs.map, icon: MapIcon },
    {
      href: '/analytics',
      labelKey: 'tabs.analytics',
      label: t.tabs.analytics,
      icon: BarChart3,
    },
    {
      href: '/calculator',
      labelKey: 'tabs.calculator',
      label: t.tabs.calculator,
      icon: Calculator,
    },
    {
      href: '/account/lists',
      labelKey: 'lists.tabLabel',
      label: t.lists.tabLabel,
      icon: ListChecks,
    },
    {
      href: '/account',
      labelKey: 'auth.myAccount',
      label: t.auth.myAccount,
      icon: User,
    },
  ];

  const isActive = (href: string): boolean => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <aside
      aria-label={t.auth.myAccount}
      className="no-print hidden lg:flex flex-col w-14 shrink-0 border-r border-[var(--border)] bg-[var(--bg)] py-3 gap-1"
    >
      <Link
        href="/"
        aria-label="RealEstateApp"
        className="flex items-center justify-center h-10 mb-2 font-semibold text-[18px]"
        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
      >
        <span className="text-[var(--accent)]">R</span>
      </Link>

      <nav className="flex flex-col gap-1 flex-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              aria-label={label}
              title={label}
              className={
                'group relative flex items-center justify-center h-10 mx-2 rounded-md transition-colors ' +
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ' +
                (active
                  ? 'text-[var(--accent)] bg-[var(--accent-surface)]'
                  : 'text-[var(--text-dim)] hover:text-[var(--text)] hover:bg-[var(--bg-elevated)]')
              }
            >
              <Icon size={18} aria-hidden="true" />
              <span
                className="absolute left-full ml-2 px-2 py-1 rounded bg-[var(--bg-elevated)] text-[12px] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity"
                role="tooltip"
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      <Link
        href="/account/settings"
        aria-label={t.auth.settings}
        title={t.auth.settings}
        className={
          'flex items-center justify-center h-10 mx-2 rounded-md transition-colors ' +
          'text-[var(--text-dim)] hover:text-[var(--text)] hover:bg-[var(--bg-elevated)] ' +
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]'
        }
      >
        <Settings size={18} aria-hidden="true" />
      </Link>
    </aside>
  );
}
