'use client';

import { useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { useAppStore } from '@/store/app-store';

export interface AuthState {
  /** True when Supabase env vars are configured; otherwise the app uses the stub. */
  supabaseEnabled: boolean;
  /** Current Supabase user, or `null` when signed out / using the stub. */
  user: User | null;
  session: Session | null;
  /** True until the initial getSession() call resolves. */
  loading: boolean;
}

export interface AuthActions {
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  signUp: (
    name: string,
    email: string,
    password: string,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  signOut: () => Promise<void>;
}

export type UseAuthResult = AuthState & AuthActions;

export function useAuth(): UseAuthResult {
  const supabaseEnabled = isSupabaseConfigured();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(supabaseEnabled);
  const storeLogin = useAppStore((s) => s.login);
  const storeLogout = useAppStore((s) => s.logout);

  useEffect(() => {
    if (!supabaseEnabled) return;
    const client = getSupabaseBrowserClient();
    if (!client) return;

    let cancelled = false;

    client.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setSession(data.session);
      setLoading(false);
      if (data.session) {
        storeLogin(
          (data.session.user.user_metadata?.name as string | undefined) ?? '',
          data.session.user.email ?? '',
        );
      }
    });

    const { data: sub } = client.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      if (next) {
        storeLogin(
          (next.user.user_metadata?.name as string | undefined) ?? '',
          next.user.email ?? '',
        );
      } else {
        storeLogout();
      }
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [supabaseEnabled, storeLogin, storeLogout]);

  const signIn: AuthActions['signIn'] = async (email, password) => {
    if (!supabaseEnabled) {
      // Stub mode: name unknown at sign-in; the form uses signUp for the name.
      storeLogin(email.split('@')[0] ?? '', email);
      return { ok: true };
    }
    const client = getSupabaseBrowserClient();
    if (!client) return { ok: false, error: 'Supabase client unavailable' };
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  };

  const signUp: AuthActions['signUp'] = async (name, email, password) => {
    if (!supabaseEnabled) {
      storeLogin(name, email);
      return { ok: true };
    }
    const client = getSupabaseBrowserClient();
    if (!client) return { ok: false, error: 'Supabase client unavailable' };
    const { error } = await client.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  };

  const signOut: AuthActions['signOut'] = async () => {
    if (supabaseEnabled) {
      const client = getSupabaseBrowserClient();
      if (client) await client.auth.signOut();
    }
    storeLogout();
  };

  return {
    supabaseEnabled,
    user: session?.user ?? null,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };
}
