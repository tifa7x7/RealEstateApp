import { type InputHTMLAttributes, forwardRef, useId } from 'react';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  hint?: string;
  error?: string;
  wrapperClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, className = '', wrapperClassName = '', id, ...props }, ref) => {
    const autoId = useId();
    const inputId = id ?? autoId;
    const hintId = `${inputId}-hint`;
    const errorId = `${inputId}-error`;
    const describedBy = error ? errorId : hint ? hintId : undefined;

    return (
      <div className={`flex flex-col gap-1.5 ${wrapperClassName}`.trim()}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)]"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`w-full px-3 py-2 rounded-lg text-[13px] outline-none transition-colors ` +
            `bg-[var(--bg-elevated)] text-[var(--text)] ` +
            `placeholder:text-[var(--text-muted)] ` +
            `focus-visible:ring-2 focus-visible:ring-[var(--accent)] ` +
            `disabled:opacity-50 disabled:cursor-not-allowed ${className}`.trim()}
          style={{
            border: `1px solid ${error ? 'var(--danger)' : 'var(--border)'}`,
          }}
          {...props}
        />
        {error && (
          <span id={errorId} className="text-[11px] text-[var(--danger)]">
            {error}
          </span>
        )}
        {!error && hint && (
          <span id={hintId} className="text-[11px] text-[var(--text-dim)]">
            {hint}
          </span>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
