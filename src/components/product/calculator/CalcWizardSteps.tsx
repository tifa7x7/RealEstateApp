'use client';

import { type ReactNode, useState } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { CalcInput } from './CalcInput';
import { FinishingGradeSelector } from './FinishingGradeSelector';
import { useCalculator } from '@/hooks/useCalculator';
import { useTranslations } from '@/hooks/useTranslations';
import { useAppStore } from '@/store/app-store';

interface CalcWizardStepsProps {
  /** Called when the user completes step 3 or asks to switch to expert mode. */
  onFinish: () => void;
}

/**
 * 3-step first-time calculator flow. Drives the same `useCalculator` store
 * as the expert form, so a user's wizard answers are immediately reflected in
 * the result panel; no math is re-implemented.
 *
 * Steps:
 *   1. Price + property basics (8 inputs max per CLAUDE.md rule)
 *   2. Mortgage Y/N — if Y, expand down-payment + term + program rates
 *   3. Rental Y/N — if Y, expand monthly rent + vacancy
 *
 * After step 3 the wizard sets `userPrefs.calcWizardSeen = true` so the user
 * lands directly in the expert form on subsequent visits, and calls
 * `onFinish()` so the parent can swap in the full form / result panel.
 */
export function CalcWizardSteps({ onFinish }: CalcWizardStepsProps) {
  const t = useTranslations();
  const { object, setField } = useCalculator();
  const setCalcWizardSeen = useAppStore((s) => s.setCalcWizardSeen);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const completeWizard = () => {
    setCalcWizardSeen(true);
    onFinish();
  };

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-2">
        <h1
          className="text-[22px] md:text-[26px] font-semibold leading-tight"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          {t.wizard.intro}
        </h1>
        <p className="text-[14px] text-[var(--text-dim)] leading-relaxed max-w-2xl">
          {t.wizard.introBody}
        </p>
      </header>

      <StepIndicator step={step} />

      <Card>
        {step === 1 && (
          <StepContainer
            title={t.wizard.step1Title}
            hint={t.wizard.step1Hint}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={t.calc.district}
                value={object.district}
                onChange={(e) => setField('district', e.target.value)}
                wrapperClassName="sm:col-span-2"
                placeholder="Ялта · Симферополь · …"
              />
              <Input
                label={t.calc.aptType}
                value={object.aptType}
                onChange={(e) => setField('aptType', e.target.value)}
                placeholder="1К · 2К · Студия"
              />
              <CalcInput
                label={t.calc.area}
                value={object.area}
                onChange={(v) => setField('area', v)}
                suffix="м²"
                min={1}
                step={1}
              />
              <CalcInput
                label={t.calc.price}
                value={object.price}
                onChange={(v) => setField('price', v)}
                suffix="₽"
                min={0}
                step={100000}
                className="sm:col-span-2"
              />
              <div className="sm:col-span-2">
                <FinishingGradeSelector
                  area={object.area}
                  value={object.renovation}
                  onChange={(v) => setField('renovation', v)}
                />
              </div>
            </div>
          </StepContainer>
        )}

        {step === 2 && (
          <StepContainer
            title={t.wizard.step2Title}
            hint={t.wizard.step2Hint}
          >
            <BinaryChoice
              value={object.useMortgage}
              onChange={(v) => setField('useMortgage', v)}
              yesLabel={t.wizard.step2YesLabel}
              noLabel={t.wizard.step2NoLabel}
            />
            {object.useMortgage && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
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
              </div>
            )}
          </StepContainer>
        )}

        {step === 3 && (
          <StepContainer
            title={t.wizard.step3Title}
            hint={t.wizard.step3Hint}
          >
            <BinaryChoice
              value={object.useRental}
              onChange={(v) => setField('useRental', v)}
              yesLabel={t.wizard.step3YesLabel}
              noLabel={t.wizard.step3NoLabel}
            />
            {object.useRental && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
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
                />
              </div>
            )}
            <p className="text-[12px] text-[var(--text-muted)] mt-4 leading-snug">
              {t.wizard.finishHint}
            </p>
          </StepContainer>
        )}
      </Card>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <button
          type="button"
          onClick={completeWizard}
          className="inline-flex items-center gap-1.5 text-[12px] text-[var(--text-dim)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:underline"
        >
          <Sparkles size={13} aria-hidden="true" />
          {t.wizard.skipToExpert}
        </button>

        <div className="flex items-center gap-2">
          {step > 1 && (
            <Button
              variant="ghost"
              size="md"
              onClick={() => setStep((s) => (s === 3 ? 2 : 1))}
            >
              <ChevronLeft size={14} aria-hidden="true" />
              {t.wizard.back}
            </Button>
          )}
          {step < 3 ? (
            <Button
              variant="primary"
              size="md"
              onClick={() => setStep((s) => (s === 1 ? 2 : 3))}
            >
              {t.wizard.next}
              <ChevronRight size={14} aria-hidden="true" />
            </Button>
          ) : (
            <Button variant="primary" size="md" onClick={completeWizard}>
              {t.wizard.finish}
              <ChevronRight size={14} aria-hidden="true" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function StepIndicator({ step }: { step: 1 | 2 | 3 }) {
  const t = useTranslations();
  return (
    <div className="flex items-center gap-2 text-[12px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">
      <span>
        {t.wizard.stepLabel} {step} {t.wizard.of} 3
      </span>
      <div className="flex items-center gap-1.5" aria-hidden="true">
        {[1, 2, 3].map((n) => (
          <span
            key={n}
            className="w-6 h-1 rounded-full transition-colors"
            style={{
              background:
                n === step
                  ? 'var(--accent)'
                  : n < step
                    ? 'color-mix(in srgb, var(--accent) 35%, transparent)'
                    : 'var(--border)',
            }}
          />
        ))}
      </div>
    </div>
  );
}

function StepContainer({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-[18px] font-semibold leading-tight">{title}</h2>
      <p className="text-[13px] text-[var(--text-dim)] leading-relaxed">{hint}</p>
      <div className="pt-2">{children}</div>
    </div>
  );
}

function BinaryChoice({
  value,
  onChange,
  yesLabel,
  noLabel,
}: {
  value: boolean;
  onChange: (next: boolean) => void;
  yesLabel: string;
  noLabel: string;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      <ChoiceButton active={value === true} onClick={() => onChange(true)}>
        {yesLabel}
      </ChoiceButton>
      <ChoiceButton active={value === false} onClick={() => onChange(false)}>
        {noLabel}
      </ChoiceButton>
    </div>
  );
}

function ChoiceButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  const style = active
    ? {
        background: 'color-mix(in srgb, var(--accent) 12%, transparent)',
        border: '1px solid color-mix(in srgb, var(--accent) 35%, transparent)',
      }
    : {
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
      };
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="px-4 py-3 rounded-lg text-[14px] font-medium text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
      style={{
        ...style,
        color: active ? 'var(--accent)' : 'var(--text)',
      }}
    >
      {children}
    </button>
  );
}
