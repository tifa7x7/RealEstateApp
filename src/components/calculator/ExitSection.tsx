'use client';

import { useTranslations } from '@/hooks/useTranslations';
import type { CalcObject } from '@/lib/types';
import { CalcInput } from './CalcInput';

export interface ExitSectionProps {
  object: CalcObject;
  setField: <K extends keyof CalcObject>(field: K, value: CalcObject[K]) => void;
}

export function ExitSection({ object, setField }: ExitSectionProps) {
  const t = useTranslations();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <CalcInput
        label={t.calc.appreciation}
        value={object.appreciation}
        onChange={(v) => setField('appreciation', v)}
        suffix="%"
        min={-20}
        max={30}
        step={0.5}
        tooltip="Среднегодовой рост рыночной цены недвижимости."
      />
      <CalcInput
        label={t.calc.holdingYears}
        value={object.holdingYears}
        onChange={(v) => setField('holdingYears', v)}
        suffix={t.common.years}
        min={1}
        max={30}
        step={1}
        tooltip="Период владения до продажи. 5+ лет — нулевой НДФЛ при продаже."
      />
      <CalcInput
        label={t.calc.sellingCosts}
        value={object.sellingCosts}
        onChange={(v) => setField('sellingCosts', v)}
        suffix="%"
        min={0}
        max={20}
        step={0.5}
        tooltip="Расходы на риелтора, оформление, рекламу при продаже."
      />
      <CalcInput
        label={t.calc.saleTax}
        value={object.saleTax}
        onChange={(v) => setField('saleTax', v)}
        suffix="%"
        min={0}
        max={50}
        step={1}
        tooltip="НДФЛ при владении менее 5 лет. Вычет 1 млн ₽."
        disabled={object.holdingYears >= 5}
      />
      <CalcInput
        label={t.calc.expenseGrowth}
        value={object.expenseGrowth}
        onChange={(v) => setField('expenseGrowth', v)}
        suffix="%"
        min={0}
        max={30}
        step={0.5}
        tooltip="Среднегодовой рост коммунальных и других расходов."
      />
    </div>
  );
}
