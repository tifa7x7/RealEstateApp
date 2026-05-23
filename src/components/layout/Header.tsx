'use client';

import { type FormEvent, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  BarChart3,
  Calculator,
  type LucideIcon,
  Map as MapIcon,
  Moon,
  Search,
  Settings,
  Sun,
  User,
} from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';
import { LocaleToggle } from './LocaleToggle';
import { useTheme } from './ThemeProvider';

interface TabConfig {
  href: string;
  label: string;
  icon: LucideIcon;
}

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SearchFormShell({
  defaultValue = '',
  onSubmit,
  placeholder,
}: {
  defaultValue?: string;
  onSubmit?: (e: FormEvent<HTMLFormElement>) => void;
  placeholder: string;
}) {
  return (
    <form onSubmit={onSubmit} className="flex-1 max-w-xl">
      <div className="relative">
        <Search
          size={15}
          aria-hidden="true"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
        />
        <input
          type="search"
          name="q"
          defaultValue={defaultValue}
          placeholder={placeholder}
          aria-label={placeholder}
          className="w-full pl-9 pr-3 py-2 rounded-lg text-[13px] outline-none bg-[var(--bg-elevated)] text-[var(--text)] placeholder:text-[var(--text-muted)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          style={{ border: '1px solid var(--border)' }}
        />
      </div>
    </form>
  );
}

function SearchFormDynamic({ placeholder }: { placeholder: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const q = (data.get('q') ?? '').toString().trim();
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    router.push(params.toString() ? `/?${params.toString()}` : '/');
  };

  return (
    <SearchFormShell
      defaultValue={searchParams.get('q') ?? ''}
      onSubmit={handleSearch}
      placeholder={placeholder}
    />
  );
}

export function Header() {
  const t = useTranslations();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const tabs: readonly TabConfig[] = [
    { href: '/', label: t.tabs.table, icon: Search },
    { href: '/analytics', label: t.tabs.analytics, icon: BarChart3 },
    { href: '/map', label: t.tabs.map, icon: MapIcon },
    { href: '/calculator', label: t.tabs.calculator, icon: Calculator },
  ];

  return (
    <header className="sticky top-0 z-[100] border-b border-[var(--border)] bg-[var(--bg)]">
      <div className="flex items-center gap-3 px-4 py-3 md:px-6 md:py-3.5">
        <Link
          href="/"
          className="flex items-center font-semibold text-[16px] md:text-[18px] shrink-0"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          <span className="text-[var(--accent)]">Crimea</span>
          <span>DevTracker</span>
        </Link>

        <Suspense fallback={<SearchFormShell placeholder={t.filters.search} />}>
          <SearchFormDynamic placeholder={t.filters.search} />
        </Suspense>

        <div className="flex items-center gap-1 shrink-0">
          <LocaleToggle />
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
            className="p-2 rounded-lg text-[var(--text-dim)] hover:bg-[var(--bg-elevated)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          >
            {theme === 'dark' ? (
              <Sun size={16} aria-hidden="true" />
            ) : (
              <Moon size={16} aria-hidden="true" />
            )}
          </button>
          <Link
            href="/settings"
            aria-label={t.auth.settings}
            className="hidden sm:inline-flex p-2 rounded-lg text-[var(--text-dim)] hover:bg-[var(--bg-elevated)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          >
            <Settings size={16} aria-hidden="true" />
          </Link>
          <Link
            href="/account"
            aria-label={t.auth.myAccount}
            className="p-2 rounded-lg text-[var(--text-dim)] hover:bg-[var(--bg-elevated)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          >
            <User size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>

      <nav
        aria-label="Основная навигация"
        className="hidden md:flex items-center gap-1 px-6 pb-1 -mt-1"
      >
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={
                'inline-flex items-center gap-2 px-3 py-2 rounded-md text-[13px] font-medium ' +
                'transition-colors focus-visible:outline-none focus-visible:ring-2 ' +
                'focus-visible:ring-[var(--accent)] ' +
                (active
                  ? 'text-[var(--accent)] bg-[var(--accent-surface)]'
                  : 'text-[var(--text-dim)] hover:text-[var(--text)] hover:bg-[var(--bg-elevated)]')
              }
            >
              <Icon size={15} aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
