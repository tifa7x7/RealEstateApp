'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Briefcase,
  Heart,
  ListChecks,
  type LucideIcon,
  Save,
  Settings,
} from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';

interface TabConfig {
  href: string;
  label: string;
  icon: LucideIcon;
}

export function AccountTabs() {
  const t = useTranslations();
  const pathname = usePathname();

  const tabs: TabConfig[] = [
    { href: '/account/favorites', label: t.auth.favorites, icon: Heart },
    { href: '/account/lists', label: t.lists.tabLabel, icon: ListChecks },
    { href: '/account/saved', label: t.calc.title.split(' ')[0] ?? 'Расчёты', icon: Save },
    { href: '/account/portfolio', label: t.auth.myPortfolio, icon: Briefcase },
    { href: '/account/settings', label: t.auth.settings, icon: Settings },
  ];

  const isActive = (href: string): boolean => {
    if (href === '/account/favorites') {
      return pathname === '/account' || pathname.startsWith('/account/favorites');
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <nav
      aria-label={t.auth.myAccount}
      className="flex gap-1 border-b border-[var(--border)] overflow-x-auto"
    >
      {tabs.map(({ href, label, icon: Icon }) => {
        const active = isActive(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={
              'inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium border-b-2 whitespace-nowrap ' +
              'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-inset ' +
              (active
                ? 'text-[var(--accent)] border-[var(--accent)]'
                : 'text-[var(--text-dim)] border-transparent hover:text-[var(--text)]')
            }
          >
            <Icon size={14} aria-hidden="true" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
