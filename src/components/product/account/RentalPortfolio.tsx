'use client';

import { Briefcase, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { ProGate } from '@/components/ui/ProGate';
import { CalcInput } from '@/components/product/calculator/CalcInput';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useLocale, useTranslations } from '@/hooks/useTranslations';
import { fmt } from '@/lib/formatters';
import type { Locale } from '@/lib/types';

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card>
      <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)] mb-1">
        {label}
      </div>
      <div
        className="text-[20px] font-semibold tabular-nums"
        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
      >
        {value}
      </div>
      {hint && (
        <div className="text-[11px] text-[var(--text-dim)] mt-0.5 tabular-nums">
          {hint}
        </div>
      )}
    </Card>
  );
}

function PortfolioInner() {
  const t = useTranslations();
  const { locale } = useLocale();
  const { properties, totals, add, update, remove } = usePortfolio();

  if (properties.length === 0) {
    return (
      <EmptyState
        icon={Briefcase}
        title={t.auth.portfolioEmpty}
        description={t.auth.portfolioHint}
        action={{ label: 'Добавить объект', onClick: add, variant: 'primary' }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Объектов" value={String(totals.count)} />
        <StatCard
          label="Стоимость"
          value={fmt.price(totals.totalValue, locale)}
          hint={
            totals.totalPurchase > 0
              ? `${totals.appreciation >= 0 ? '+' : ''}${fmt.price(totals.appreciation, locale)} к покупке`
              : undefined
          }
        />
        <StatCard
          label="Аренда / мес"
          value={fmt.price(totals.monthlyRent, locale)}
        />
        <StatCard
          label="NOI / мес"
          value={fmt.price(totals.monthlyNOI, locale)}
          hint={`год: ${fmt.price(totals.monthlyNOI * 12, locale)}`}
        />
      </div>

      <div className="flex flex-col gap-3">
        {properties.map((prop) => (
          <PropertyRow
            key={prop.id}
            property={prop}
            locale={locale}
            onUpdate={(patch) => update(prop.id, patch)}
            onRemove={() => remove(prop.id)}
          />
        ))}
      </div>

      <Button variant="secondary" onClick={add} className="self-start">
        <Plus size={14} aria-hidden="true" />
        Добавить объект
      </Button>
    </div>
  );
}

function PropertyRow({
  property,
  locale,
  onUpdate,
  onRemove,
}: {
  property: {
    id: number | string;
    name?: string;
    type?: string;
    currentValue?: number;
    purchasePrice?: number;
    monthlyRent?: number;
    monthlyExpenses?: number;
  };
  locale: Locale;
  onUpdate: (patch: Record<string, string | number>) => void;
  onRemove: () => void;
}) {
  const noi = (property.monthlyRent ?? 0) - (property.monthlyExpenses ?? 0);

  return (
    <Card>
      <div className="flex items-start justify-between gap-3 mb-3">
        <Input
          label="Название"
          value={property.name ?? ''}
          onChange={(e) => onUpdate({ name: e.target.value })}
          wrapperClassName="flex-1"
          placeholder="Квартира на Кузнечной"
        />
        <button
          type="button"
          onClick={onRemove}
          aria-label="Удалить объект"
          className="mt-6 p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--bg-elevated)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
        >
          <Trash2 size={14} aria-hidden="true" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Тип"
          value={property.type ?? ''}
          onChange={(e) => onUpdate({ type: e.target.value })}
          placeholder="1К"
        />
        <CalcInput
          label="Текущая стоимость"
          value={property.currentValue ?? 0}
          onChange={(v) => onUpdate({ currentValue: v })}
          suffix="₽"
          min={0}
          step={100000}
        />
        <CalcInput
          label="Цена покупки"
          value={property.purchasePrice ?? 0}
          onChange={(v) => onUpdate({ purchasePrice: v })}
          suffix="₽"
          min={0}
          step={100000}
        />
        <CalcInput
          label="Аренда/мес"
          value={property.monthlyRent ?? 0}
          onChange={(v) => onUpdate({ monthlyRent: v })}
          suffix="₽"
          min={0}
          step={1000}
        />
        <CalcInput
          label="Расходы/мес"
          value={property.monthlyExpenses ?? 0}
          onChange={(v) => onUpdate({ monthlyExpenses: v })}
          suffix="₽"
          min={0}
          step={500}
        />
      </div>

      <div className="text-[12px] text-[var(--text-dim)] mt-3 tabular-nums">
        NOI/мес:{' '}
        <span
          className={
            noi > 0
              ? 'font-semibold text-[var(--accent)]'
              : noi < 0
                ? 'font-semibold text-[var(--danger)]'
                : ''
          }
        >
          {fmt.price(noi, locale)}
        </span>
      </div>
    </Card>
  );
}

export function RentalPortfolio() {
  return (
    <ProGate
      feature="portfolio"
      title="Портфель недвижимости"
      description="Отслеживайте свои сдаваемые объекты, доходность и капитализацию — в Pro."
    >
      <PortfolioInner />
    </ProGate>
  );
}
