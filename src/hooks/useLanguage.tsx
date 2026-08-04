import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import i18n, { readStoredLanguage, STORAGE_KEY, SUPPORTED_LANGUAGES } from "@/i18n";

export const LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "te", label: "Telugu", native: "తెలుగు" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];

function isSupported(v: unknown): v is LanguageCode {
  return SUPPORTED_LANGUAGES.includes(v as LanguageCode);
}

type Ctx = {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => Promise<void>;
};

const LanguageContext = createContext<Ctx | null>(null);

function applyLanguage(lang: LanguageCode) {
  if (typeof document !== "undefined") {
    document.documentElement.lang = lang;
    document.documentElement.setAttribute("data-lang", lang);
  }
  if (i18n.language !== lang) void i18n.changeLanguage(lang);
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Always start at "en" so SSR markup matches the first client render.
  const [language, setLanguageState] = useState<LanguageCode>("en");
  useTranslation(); // re-render this subtree when i18next switches language

  useEffect(() => {
    const initial = readStoredLanguage();
    setLanguageState(initial);
    applyLanguage(initial);

    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user?.id;
      if (!uid) return;
      const { data } = await supabase
        .from("user_settings")
        .select("language")
        .eq("user_id", uid)
        .maybeSingle();
      const remote = data?.language;
      if (isSupported(remote) && remote !== initial) {
        setLanguageState(remote);
        applyLanguage(remote);
        localStorage.setItem(STORAGE_KEY, remote);
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const uid = session?.user?.id;
      if (!uid) return;
      const { data } = await supabase
        .from("user_settings")
        .select("language")
        .eq("user_id", uid)
        .maybeSingle();
      const remote = data?.language;
      if (isSupported(remote)) {
        setLanguageState(remote);
        applyLanguage(remote);
        localStorage.setItem(STORAGE_KEY, remote);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const setLanguage = useCallback(async (lang: LanguageCode) => {
    setLanguageState(lang);
    applyLanguage(lang);
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, lang);
    const { data: sess } = await supabase.auth.getSession();
    const uid = sess.session?.user?.id;
    if (uid) {
      await supabase
        .from("user_settings")
        .upsert({ user_id: uid, language: lang }, { onConflict: "user_id" });
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
