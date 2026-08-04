import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { en, te, hi } from "./resources";

export const SUPPORTED_LANGUAGES = ["en", "te", "hi"] as const;
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const STORAGE_KEY = "site.language";

export function readStoredLanguage(): AppLanguage {
  if (typeof window === "undefined") return "en";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return SUPPORTED_LANGUAGES.includes(stored as AppLanguage) ? (stored as AppLanguage) : "en";
  } catch {
    return "en";
  }
}

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      te: { translation: te },
      hi: { translation: hi },
    },
    // Always init with "en" so SSR and the first client render match; the
    // stored language is applied in an effect after hydration.
    lng: "en",
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });
}

export default i18n;
