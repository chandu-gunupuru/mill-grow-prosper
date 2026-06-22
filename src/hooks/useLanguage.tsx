import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export const LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "te", label: "Telugu", native: "తెలుగు" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "ta", label: "Tamil", native: "தமிழ்" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];

const STORAGE_KEY = "site.language";

type Ctx = {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => Promise<void>;
};

const LanguageContext = createContext<Ctx | null>(null);

function applyLangToDocument(lang: LanguageCode) {
  if (typeof document !== "undefined") {
    document.documentElement.lang = lang;
    document.documentElement.setAttribute("data-lang", lang);
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>("en");

  // Initial load: localStorage -> apply, then try to fetch user setting
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = (localStorage.getItem(STORAGE_KEY) as LanguageCode | null) ?? "en";
    const initial = LANGUAGES.some((l) => l.code === stored) ? stored : "en";
    setLanguageState(initial);
    applyLangToDocument(initial);

    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user?.id;
      if (!uid) return;
      const { data } = await supabase
        .from("user_settings")
        .select("language")
        .eq("user_id", uid)
        .maybeSingle();
      const remote = (data?.language as LanguageCode | undefined) ?? null;
      if (remote && LANGUAGES.some((l) => l.code === remote) && remote !== initial) {
        setLanguageState(remote);
        applyLangToDocument(remote);
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
      const remote = data?.language as LanguageCode | undefined;
      if (remote && LANGUAGES.some((l) => l.code === remote)) {
        setLanguageState(remote);
        applyLangToDocument(remote);
        localStorage.setItem(STORAGE_KEY, remote);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const setLanguage = useCallback(async (lang: LanguageCode) => {
    setLanguageState(lang);
    applyLangToDocument(lang);
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
