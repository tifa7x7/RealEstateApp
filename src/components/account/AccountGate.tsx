'use client';

import { type ReactNode } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { useHydration } from '@/hooks/useHydration';
import { useAppStore } from '@/store/app-store';
import { AccountTabs } from './AccountTabs';
import { AuthForm } from './AuthForm';

export interface AccountGateProps {
  children: ReactNode;
}

export function AccountGate({ children }: AccountGateProps) {
  const hydrated = useHydration();
  const loggedIn = useAppStore((s) => s.loggedIn);

  if (!hydrated) {
    return (
      <div className="flex flex-col gap-3" aria-busy="true">
        <Skeleton height={32} width="40%" />
        <Skeleton height={140} />
      </div>
    );
  }

  if (!loggedIn) {
    return (
      <div className="max-w-md mx-auto">
        <AuthForm />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <AccountTabs />
      {children}
    </div>
  );
}
