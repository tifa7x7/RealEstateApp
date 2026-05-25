'use client';

import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { Toast, type ToastVariant } from '@/components/ui/Toast';

export interface ToastOptions {
  variant?: ToastVariant;
  duration?: number;
}

interface ToastEntry extends Required<ToastOptions> {
  id: number;
  message: string;
}

interface ToastContextValue {
  show: (message: string, options?: ToastOptions) => void;
  success: (message: string, options?: ToastOptions) => void;
  error: (message: string, options?: ToastOptions) => void;
  warning: (message: string, options?: ToastOptions) => void;
  info: (message: string, options?: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION = 2000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (message: string, options?: ToastOptions) => {
      const id =
        typeof performance !== 'undefined' ? performance.now() : Date.now();
      const entry: ToastEntry = {
        id,
        message,
        variant: options?.variant ?? 'info',
        duration: options?.duration ?? DEFAULT_DURATION,
      };
      setToasts((current) => [...current, entry]);
    },
    [],
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      show,
      success: (m, o) => show(m, { ...o, variant: 'success' }),
      error: (m, o) => show(m, { ...o, variant: 'error' }),
      warning: (m, o) => show(m, { ...o, variant: 'warning' }),
      info: (m, o) => show(m, { ...o, variant: 'info' }),
    }),
    [show],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none">
        {toasts.map((t, i) => (
          <div
            key={t.id}
            className="pointer-events-auto"
            style={{
              position: 'fixed',
              bottom: `${16 + i * 64}px`,
              right: '16px',
              zIndex: 300,
            }}
          >
            <Toast
              message={t.message}
              variant={t.variant}
              duration={t.duration}
              onClose={() => dismiss(t.id)}
              className="static"
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}
