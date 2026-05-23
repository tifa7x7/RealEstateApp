'use client';

import { type ReactNode, useId, useState } from 'react';
import { Info } from 'lucide-react';

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
  const tipId = `${id}-tip`;
  const [showTip, setShowTip] = useState(false);

  return (
    <div className={`flex flex-col gap-1.5 ${className}`.trim()}>
      <label
        htmlFor={id}
        className="text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)] flex items-center gap-1.5"
      >
        <span>{label}</span>
        {tooltip && (
          <span
            className="relative inline-flex"
            onMouseEnter={() => setShowTip(true)}
            onMouseLeave={() => setShowTip(false)}
            onFocus={() => setShowTip(true)}
            onBlur={() => setShowTip(false)}
          >
            <button
              type="button"
              aria-describedby={showTip ? tipId : undefined}
              aria-label="Подсказка"
              className="text-[var(--text-muted)] hover:text-[var(--text-dim)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded"
            >
              <Info size={13} aria-hidden="true" />
            </button>
            {showTip && (
              <div
                role="tooltip"
                id={tipId}
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-3 py-2 rounded text-[12px] leading-snug z-50 shadow-xl bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text)]"
                style={{ maxWidth: 260, whiteSpace: 'normal' }}
              >
                {tooltip}
              </div>
            )}
          </span>
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
