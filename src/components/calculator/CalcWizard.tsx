'use client';

import { type ReactNode, useState } from 'react';
import { Printer, RotateCcw, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { UpgradePrompt } from '@/components/ui/UpgradePrompt';
import { useToast } from '@/components/providers/ToastProvider';
import { useCalculator } from '@/hooks/useCalculator';
import { usePaywall } from '@/hooks/usePaywall';
import { useSavedCalcs } from '@/hooks/useSavedCalcs';
import { useTranslations } from '@/hooks/useTranslations';
import { CalcInput } from './CalcInput';
import { CalcResultsSummary } from './CalcResultsSummary';
import { CashflowForecast } from './CashflowForecast';
import { CatalogPicker } from './CatalogPicker';
import { ComparisonTable } from './ComparisonTable';
import { ExitSection } from './ExitSection';
import { FinishingGradeSelector } from './FinishingGradeSelector';
import { MobileResultPill } from './MobileResultPill';
import { ObjectTabs } from './ObjectTabs';
import { Rankings } from './Rankings';
import { RentalSection } from './RentalSection';

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)] mb-4">
      {children}
    </h2>
  );
}

function ToggleSwitch({
  enabled,
  onChange,
  ariaLabel,
}: {
  enabled: boolean;
  onChange: (v: boolean) => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={ariaLabel}
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex w-10 h-5 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] ${
        enabled ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'
      }`}
    >
      <span
        aria-hidden="true"
        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
          enabled ? 'translate-x-5' : ''
        }`}
      />
    </button>
  );
}

function ToggleCard({
  enabled,
  onToggle,
  title,
  hint,
  children,
}: {
  enabled: boolean;
  onToggle: (v: boolean) => void;
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h2 className="text-[14px] font-semibold">{title}</h2>
          {hint && (
            <p className="text-[11px] text-[var(--text-dim)] mt-0.5">{hint}</p>
          )}
        </div>
        <ToggleSwitch enabled={enabled} onChange={onToggle} ariaLabel={title} />
      </div>
      {enabled && <div className="pt-1">{children}</div>}
    </Card>
  );
}

export function CalcWizard() {
  const t = useTranslations();
  const toast = useToast();
  const { object, setField, reset, results, objects } = useCalculator();
  const { canSave, save, saved } = useSavedCalcs();
  const { allowed: canExport } = usePaywall('exports');
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<string | null>(null);

  const handlePrint = () => {
    if (!canExport) {
      setUpgradeReason(
        'Экспорт расчёта в PDF — функция Pro. В Pro вы можете сохранить результаты как PDF, отправить партнёру или приложить к ипотечной заявке.',
      );
      setUpgradeOpen(true);
      return;
    }
    if (typeof window !== 'undefined') window.print();
  };

  const handleSave = async () => {
    const result = await save();
    if (result.ok) {
      toast.success('Сохранено');
      return;
    }
    setUpgradeReason(
      `Free-тариф позволяет хранить 1 расчёт (сейчас: ${saved.length}). Pro снимает лимит.`,
    );
    setUpgradeOpen(true);
  };

  const hasMultiple = objects.length > 1;

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="no-print flex-1 flex flex-col gap-4 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h1
              className="text-[20px] md:text-[24px] font-semibold"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {t.calc.title}
            </h1>
            <div className="no-print flex flex-wrap items-center gap-2">
              <Button variant="secondary" size="sm" onClick={() => setCatalogOpen(true)}>
                {t.calc.fillCatalog}
              </Button>
              <Button variant="primary" size="sm" onClick={handleSave}>
                <Save size={14} aria-hidden="true" />
                Сохранить
                {!canSave && (
                  <span
                    className="ml-1 px-1.5 py-0.5 rounded text-[11px] font-semibold uppercase tabular-nums"
                    style={{
                      background:
                        'color-mix(in srgb, var(--premium) 15%, transparent)',
                      color: 'var(--premium)',
                    }}
                  >
                    Pro
                  </span>
                )}
              </Button>
              <Button variant="ghost" size="sm" onClick={handlePrint}>
                <Printer size={14} aria-hidden="true" />
                PDF
                {!canExport && (
                  <span
                    className="ml-1 px-1.5 py-0.5 rounded text-[11px] font-semibold uppercase tabular-nums"
                    style={{
                      background:
                        'color-mix(in srgb, var(--premium) 15%, transparent)',
                      color: 'var(--premium)',
                    }}
                  >
                    Pro
                  </span>
                )}
              </Button>
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-1.5 text-[12px] text-[var(--text-dim)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:underline"
                aria-label="Сбросить калькулятор"
              >
                <RotateCcw size={13} aria-hidden="true" />
                Сброс
              </button>
            </div>
          </div>

          <ObjectTabs />

          <Card>
            <SectionLabel>{t.calc.objectInfo}</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={t.calc.name}
                value={object.name}
                onChange={(e) => setField('name', e.target.value)}
                wrapperClassName="sm:col-span-2"
              />
              <Input
                label={t.calc.district}
                value={object.district}
                onChange={(e) => setField('district', e.target.value)}
              />
              <Input
                label={t.calc.aptType}
                value={object.aptType}
                onChange={(e) => setField('aptType', e.target.value)}
                placeholder="1К"
              />
              <CalcInput
                label={t.calc.area}
                value={object.area}
                onChange={(v) => setField('area', v)}
                suffix="м²"
                min={1}
                step={1}
              />
              <Input
                label={t.calc.floorInfo}
                value={object.floorInfo}
                onChange={(e) => setField('floorInfo', e.target.value)}
                placeholder="5 / 12"
              />
            </div>
          </Card>

          <Card>
            <SectionLabel>{t.calc.costSection}</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CalcInput
                label={t.calc.price}
                value={object.price}
                onChange={(v) => setField('price', v)}
                suffix="₽"
                min={0}
                step={100000}
              />
              <CalcInput
                label={t.calc.parking}
                value={object.parking}
                onChange={(v) => setField('parking', v)}
                suffix="₽"
                min={0}
                step={50000}
              />
              <CalcInput
                label={t.calc.storage}
                value={object.storage}
                onChange={(v) => setField('storage', v)}
                suffix="₽"
                min={0}
                step={10000}
              />
              <div className="sm:col-span-2 flex flex-col gap-3">
                <FinishingGradeSelector
                  area={object.area}
                  value={object.renovation}
                  onChange={(v) => setField('renovation', v)}
                />
                <CalcInput
                  label={t.calc.renovation}
                  value={object.renovation}
                  onChange={(v) => setField('renovation', v)}
                  suffix="₽"
                  min={0}
                  step={50000}
                  tooltip="Подбирается из уровня отделки выше. Можете задать вручную."
                />
              </div>
              <CalcInput
                label={t.calc.stateDuty}
                value={object.stateDuty}
                onChange={(v) => setField('stateDuty', v)}
                suffix="₽"
                min={0}
                step={500}
              />
              <CalcInput
                label={t.calc.realtor}
                value={object.realtor}
                onChange={(v) => setField('realtor', v)}
                suffix="₽"
                min={0}
                step={10000}
              />
              <CalcInput
                label={t.calc.otherCosts}
                value={object.otherCosts}
                onChange={(v) => setField('otherCosts', v)}
                suffix="₽"
                min={0}
                step={1000}
                className="sm:col-span-2"
              />
            </div>
          </Card>

          <ToggleCard
            enabled={object.useMortgage}
            onToggle={(v) => setField('useMortgage', v)}
            title={t.calc.mortgageSection}
            hint={t.calc.mortgageInfo}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CalcInput
                label={t.calc.downPct}
                value={object.downPct}
                onChange={(v) => setField('downPct', v)}
                suffix="%"
                min={0}
                max={100}
                step={1}
              />
              <CalcInput
                label={t.calc.term}
                value={object.term}
                onChange={(v) => setField('term', v)}
                suffix={t.common.years}
                min={1}
                max={30}
                step={1}
              />
              <CalcInput
                label={t.calc.familyRate}
                value={object.familyRate}
                onChange={(v) => setField('familyRate', v)}
                suffix="%"
                min={0}
                max={30}
                step={0.1}
              />
              <CalcInput
                label={t.calc.subsidyLimit}
                value={object.subsidyLimit}
                onChange={(v) => setField('subsidyLimit', v)}
                suffix="₽"
                min={0}
                step={100000}
              />
              <CalcInput
                label={t.calc.marketRate}
                value={object.marketRate}
                onChange={(v) => setField('marketRate', v)}
                suffix="%"
                min={0}
                max={50}
                step={0.5}
                tooltip="Ставка на сумму свыше лимита семейной ипотеки."
                className="sm:col-span-2"
              />
            </div>
          </ToggleCard>

          <ToggleCard
            enabled={object.useMatkapital}
            onToggle={(v) => setField('useMatkapital', v)}
            title={t.calc.matSection}
            hint={t.calc.matInfo}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CalcInput
                label={t.calc.matkapital}
                value={object.matkapital}
                onChange={(v) => setField('matkapital', v)}
                suffix="₽"
                min={0}
                step={1000}
              />
              <CalcInput
                label={t.calc.subsidy}
                value={object.subsidy450k}
                onChange={(v) => setField('subsidy450k', v)}
                suffix="₽"
                min={0}
                step={1000}
              />
            </div>
          </ToggleCard>

          <ToggleCard
            enabled={object.useRental}
            onToggle={(v) => setField('useRental', v)}
            title={t.calc.rentalSection}
            hint={t.calc.taxInfo}
          >
            <RentalSection object={object} setField={setField} />
          </ToggleCard>

          <ToggleCard
            enabled={object.useExit}
            onToggle={(v) => setField('useExit', v)}
            title={t.calc.exitSection}
            hint={t.calc.saleInfo}
          >
            <ExitSection object={object} setField={setField} />
          </ToggleCard>

          {hasMultiple && <ComparisonTable />}
          {hasMultiple && <Rankings />}
          <CashflowForecast />
        </div>

        <aside className="lg:w-96 shrink-0 print-target">
          <div className="lg:sticky lg:top-[120px]">
            <CalcResultsSummary object={object} results={results} />
          </div>
        </aside>
      </div>

      <MobileResultPill />
      <CatalogPicker open={catalogOpen} onClose={() => setCatalogOpen(false)} />
      <UpgradePrompt
        open={upgradeOpen}
        onClose={() => {
          setUpgradeOpen(false);
          setUpgradeReason(null);
        }}
        description={upgradeReason ?? 'Эта функция доступна в Pro-тарифе.'}
      />
    </>
  );
}
