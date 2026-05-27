import Link from 'next/link';
import { Search } from 'lucide-react';
import { ru as t } from '@/i18n/ru';

export default function UnitNotFound() {
  return (
    <div className="px-4 py-16 flex flex-col items-center justify-center text-center">
      <Search
        size={44}
        aria-hidden="true"
        className="text-[var(--text-muted)] mb-3"
      />
      <h1 className="text-[18px] font-semibold mb-1">Квартира не найдена</h1>
      <p className="text-[13px] text-[var(--text-dim)] mb-5 max-w-md">
        Возможно, квартира была снята с продажи или ID указан неверно.
      </p>
      <Link
        href="/"
        className="inline-flex items-center justify-center gap-2 rounded-lg font-medium px-4 py-2 text-[13px] bg-transparent text-[var(--secondary)] border border-[var(--secondary)] hover:bg-[var(--secondary)]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
      >
        {t.project.backToList}
      </Link>
    </div>
  );
}
