'use client';

import { useMemo, useState } from 'react';
import { ArrowLeft, Search } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { PROJECTS } from '@/data/projects';
import { useCalculator } from '@/hooks/useCalculator';
import { useLocale } from '@/hooks/useTranslations';
import { UNIT_STATUS_COLORS } from '@/lib/constants';
import { fmt } from '@/lib/formatters';

export interface CatalogPickerProps {
  open: boolean;
  onClose: () => void;
}

export function CatalogPicker({ open, onClose }: CatalogPickerProps) {
  const { locale } = useLocale();
  const { prefillFromUnit } = useCalculator();
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    if (!s) return PROJECTS;
    return PROJECTS.filter(
      (p) =>
        p.name.toLowerCase().includes(s) ||
        p.developer.toLowerCase().includes(s) ||
        p.city.toLowerCase().includes(s),
    );
  }, [search]);

  const selectedProject =
    selectedProjectId !== null
      ? (PROJECTS.find((p) => p.id === selectedProjectId) ?? null)
      : null;

  const handleClose = () => {
    setSelectedProjectId(null);
    setSearch('');
    onClose();
  };

  const handlePickUnit = (unitId: string) => {
    if (selectedProjectId === null) return;
    prefillFromUnit(selectedProjectId, unitId);
    handleClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Заполнить из каталога" size="lg">
      {selectedProject === null ? (
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search
              size={15}
              aria-hidden="true"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по ЖК, застройщику, городу…"
              aria-label="Поиск ЖК"
              className="w-full pl-9 pr-3 py-2 rounded-lg text-[13px] outline-none bg-[var(--bg-elevated)] text-[var(--text)] placeholder:text-[var(--text-muted)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
              style={{ border: '1px solid var(--border)' }}
            />
          </div>

          <ul className="flex flex-col gap-1.5 max-h-[55vh] overflow-y-auto">
            {filtered.map((p) => {
              const available = p.units.filter((u) => u.status === 'в продаже').length;
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedProjectId(p.id)}
                    className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-left text-[13px] bg-[var(--bg-elevated)] hover:border-[var(--accent)]/40 border border-[var(--border)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                  >
                    <div className="min-w-0">
                      <div className="font-medium truncate">{p.name}</div>
                      <div className="text-[11px] text-[var(--text-dim)] truncate">
                        {p.developer} · {p.city}
                      </div>
                    </div>
                    <div className="text-[11px] text-[var(--text-dim)] tabular-nums shrink-0">
                      {available} {available === 1 ? 'квартира' : 'квартир'}
                    </div>
                  </button>
                </li>
              );
            })}
            {filtered.length === 0 && (
              <li className="text-[13px] text-[var(--text-dim)] text-center py-6">
                Ничего не найдено
              </li>
            )}
          </ul>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => setSelectedProjectId(null)}
            className="inline-flex items-center gap-1.5 text-[12px] text-[var(--text-dim)] hover:text-[var(--accent)] focus-visible:outline-none focus-visible:underline w-fit"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            К выбору ЖК
          </button>
          <div className="text-[13px] font-medium">{selectedProject.name}</div>

          <ul className="flex flex-col gap-1.5 max-h-[55vh] overflow-y-auto">
            {selectedProject.units.map((u) => {
              const roomLabel = u.rooms === 0 ? 'Студия' : `${u.rooms}К`;
              const disabled = u.status === 'продано';
              return (
                <li key={u.id}>
                  <button
                    type="button"
                    onClick={() => !disabled && handlePickUnit(u.id)}
                    disabled={disabled}
                    className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-left text-[13px] bg-[var(--bg-elevated)] border border-[var(--border)] hover:border-[var(--accent)]/40 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                  >
                    <div className="min-w-0">
                      <div className="font-medium tabular-nums">
                        {u.id} · {roomLabel} · {u.area} м²
                      </div>
                      <div className="text-[11px] text-[var(--text-dim)]">
                        {u.building} · этаж {u.floor}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[12px] font-semibold tabular-nums whitespace-nowrap">
                        {fmt.price(u.price, locale)}
                      </span>
                      <Badge color={UNIT_STATUS_COLORS[u.status]} size="sm">
                        {u.status}
                      </Badge>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </Modal>
  );
}
