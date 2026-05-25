'use client';

import { type ReactNode, useId } from 'react';
import { Info } from 'lucide-react';
import { Tooltip } from '@/components/ui/Tooltip';

export interface CalcInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  tooltip?: ReactNode;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  inputId?: string;
  className?: string;
}

export function CalcInput({
  label,
  value,
  onChange,
  tooltip,
  suffix,
  min,
  max,
  step,
  disabled = false,
  inputId,
  className = '',
}: CalcInputProps) {
  const autoId = useId();
  const id = inputId ?? autoId;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`.trim()}>
      <label
        htmlFor={id}
        className="text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)] flex items-center gap-1.5"
      >
        <span>{label}</span>
        {tooltip && (
          <Tooltip content={tooltip}>
            <button
              type="button"
              aria-label="Подсказка"
              className="text-[var(--text-muted)] hover:text-[var(--text-dim)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded"
            >
              <Info size={13} aria-hidden="true" />
            </button>
          </Tooltip>
        )}
      </label>
      <div className="relative">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          value={Number.isFinite(value) ? value : 0}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          onChange={(e) => {
            const n = Number(e.target.value);
            onChange(Number.isFinite(n) ? n : 0);
          }}
          className={`w-full px-3 py-2 rounded-lg text-[13px] tabular-nums outline-none transition-colors bg-[var(--bg-elevated)] text-[var(--text)] focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:opacity-50 ${
            suffix ? 'pr-10' : ''
          }`}
          style={{ border: '1px solid var(--border)' }}
        />
        {suffix && (
          <span
            aria-hidden="true"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-[var(--text-muted)] pointer-events-none"
          >
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}
