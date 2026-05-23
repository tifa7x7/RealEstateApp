import type { ReactNode } from 'react';
import { AccountGate } from '@/components/account/AccountGate';

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <div className="px-4 py-6 md:px-6 md:py-8 max-w-5xl mx-auto">
      <AccountGate>{children}</AccountGate>
    </div>
  );
}
