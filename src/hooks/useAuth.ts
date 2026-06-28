import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

// Module-level cache so the first render of any useAuth consumer has
// an immediate value (no extra getSession() round-trip needed).
let cachedSession: Session | null = null;
let prefetchPromise: Promise<Session | null> | null = null;
const listeners = new Set<(s: Session | null) => void>();
let subscribed = false;

function readPersistedSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (!key || !key.startsWith("sb-") || !key.endsWith("-auth-token")) continue;
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      const session: Session | undefined = parsed?.currentSession ?? parsed;
      if (session?.access_token && session?.user) {
        const expiresAt = session.expires_at ?? 0;
        if (!expiresAt || expiresAt * 1000 > Date.now()) return session;
      }
    }
  } catch {
    // ignore parse / storage errors
  }
  return null;
}

function setCached(session: Session | null) {
  cachedSession = session;
  for (const l of listeners) l(session);
}

function ensureSubscribed() {
  if (subscribed || typeof window === "undefined") return;
  subscribed = true;
  supabase.auth.onAuthStateChange((_event, session) => {
    setCached(session ?? null);
  });
}

function prefetch(): Promise<Session | null> {
  if (prefetchPromise) return prefetchPromise;
  prefetchPromise = supabase.auth
    .getSession()
    .then(({ data }) => {
      setCached(data.session ?? null);
      return data.session ?? null;
    })
    .catch(() => null);
  return prefetchPromise;
}

// Warm the cache as soon as this module is imported in the browser.
if (typeof window !== "undefined") {
  cachedSession = readPersistedSession();
  ensureSubscribed();
  prefetch();
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(cachedSession);
  const [loading, setLoading] = useState<boolean>(cachedSession === null && prefetchPromise !== null);

  useEffect(() => {
    let active = true;
    ensureSubscribed();

    const listener = (s: Session | null) => {
      if (!active) return;
      setSession(s);
      setLoading(false);
    };
    listeners.add(listener);

    // If we already have a cached value, render immediately.
    if (cachedSession !== null) {
      setSession(cachedSession);
      setLoading(false);
    } else {
      prefetch().then((s) => {
        if (!active) return;
        setSession(s);
        setLoading(false);
      });
    }

    return () => {
      active = false;
      listeners.delete(listener);
    };
  }, []);

  return { user: (session?.user ?? null) as User | null, session, loading };
}
