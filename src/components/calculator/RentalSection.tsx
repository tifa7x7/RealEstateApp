'use client';

import { useTranslations } from '@/hooks/useTranslations';
import type { CalcObject } from '@/lib/types';
import { CalcInput } from './CalcInput';

export interface RentalSectionProps {
  object: CalcObject;
  setField: <K extends keyof CalcObject>(field: K, value: CalcObject[K]) => void;
}

export function RentalSection({ object, setField }: RentalSectionProps) {
  const t = useTranslations();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <CalcInput
        label={t.calc.monthlyRent}
        value={object.monthlyRent}
        onChange={(v) => setField('monthlyRent', v)}
        suffix="₽"
        min={0}
        step={1000}
      />
      <CalcInput
        label={t.calc.vacancy}
        value={object.vacancy}
        onChange={(v) => setField('vacancy', v)}
        suffix="%"
        min={0}
        max={100}
        step={1}
        tooltip="Доля времени, когда квартира пустует и не приносит дохода."
      />
      <CalcInput
        label={t.calc.rentGrowth}
        value={object.rentGrowth}
        onChange={(v) => setField('rentGrowth', v)}
        suffix="%"
        min={0}
        max={30}
        step={0.5}
      />
      <CalcInput
        label={t.calc.taxRate}
        value={object.taxRate}
        onChange={(v) => setField('taxRate', v)}
        suffix="%"
        min={0}
        max={50}
        step={1}
        tooltip="4% — самозанятый/УСН, 13% — НДФЛ."
      />
      <CalcInput
        label={t.calc.utilities}
        value={object.utilities}
        onChange={(v) => setField('utilities', v)}
        suffix="₽/год"
        min={0}
        step={1000}
      />
      <CalcInput
        label={t.calc.capRepair}
        value={object.capRepair}
        onChange={(v) => setField('capRepair', v)}
        suffix="₽/год"
        min={0}
        step={1000}
      />
      <CalcInput
        label={t.calc.propertyTax}
        value={object.propertyTax}
        onChange={(v) => setField('propertyTax', v)}
        suffix="₽/год"
        min={0}
        step={500}
      />
      <CalcInput
        label={t.calc.insurance}
        value={object.insurance}
        onChange={(v) => setField('insurance', v)}
        suffix="₽/год"
        min={0}
        step={500}
      />
      <CalcInput
        label={t.calc.mgmtPct}
        value={object.mgmtPct}
        onChange={(v) => setField('mgmtPct', v)}
        suffix="%"
        min={0}
        max={50}
        step={1}
        tooltip="Доля от арендной платы на услуги управляющей компании."
      />
      <CalcInput
        label={t.calc.repairReserve}
        value={object.repairReserve}
        onChange={(v) => setField('repairReserve', v)}
        suffix="%"
        min={0}
        max={50}
        step={1}
        tooltip="Резерв на текущий ремонт, как процент от арендной платы."
      />
    </div>
  );
}
