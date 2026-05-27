'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { CalcWizard } from './CalcWizard';
import { CalcWizardSteps } from './CalcWizardSteps';
import { useHydration } from '@/hooks/useHydration';
import { useTranslations } from '@/hooks/useTranslations';
import { useAppStore } from '@/store/app-store';

/**
 * Calculator page shell that decides between the 3-step wizard (new users)
 * and the full expert form (returning users). The choice is driven by
 * `userPrefs.calcWizardSeen`, persisted in Zustand.
 *
 * A user can:
 *   - Complete the wizard → `calcWizardSeen = true` → next visit lands in
 *     expert mode.
 *   - "Open all parameters" mid-wizard → same effect, immediate switch.
 *   - From expert mode, click "Быстрый расчёт" / "Quick estimate" to
 *     re-enter the wizard. (Sets `calcWizardSeen = false` only for the
 *     current session via local state — the persisted preference flips
 *     when they finish/dismiss.)
 */
export function CalcExperience() {
  const hydrated = useHydration();
  const t = useTranslations();
  const calcWizardSeen = useAppStore((s) => s.calcWizardSeen);
  const [forceWizard, setForceWizard] = useState(false);

  if (!hydrated) {
    return (
      <div className="flex flex-col gap-3" aria-busy="true">
        <Skeleton height={32} width="50%" />
        <Skeleton height={120} />
      </div>
    );
  }

  const showWizard = forceWizard || !calcWizardSeen;

  if (showWizard) {
    return <CalcWizardSteps onFinish={() => setForceWizard(false)} />;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setForceWizard(true)}
          className="inline-flex items-center gap-1.5 text-[12px] text-[var(--text-dim)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:underline"
          aria-label={t.wizard.wizardMode}
        >
          <Sparkles size={13} aria-hidden="true" />
          {t.wizard.wizardMode}
        </button>
      </div>
      <CalcWizard />
    </div>
  );
}
