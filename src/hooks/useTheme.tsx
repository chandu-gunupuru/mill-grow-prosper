import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "theme";

function hasStoredTheme(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "light" || stored === "dark";
  } catch {
    return false;
  }
}

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored === "light" || stored === "dark") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } catch {
    return "light";
  }
}

function applyThemeClass(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
}

const THEME_TRANSITION_CLASS = "theme-transition";
const THEME_TRANSITION_DURATION = 400;

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

let transitionTimer: ReturnType<typeof setTimeout> | null = null;

function withFallbackTransition(swap: () => void) {
  if (typeof document === "undefined") {
    swap();
    return;
  }
  if (prefersReducedMotion()) {
    swap();
    return;
  }
  document.documentElement.classList.add(THEME_TRANSITION_CLASS);
  swap();
  if (transitionTimer) clearTimeout(transitionTimer);
  transitionTimer = setTimeout(() => {
    document.documentElement.classList.remove(THEME_TRANSITION_CLASS);
  }, THEME_TRANSITION_DURATION);
}

type DocumentWithVT = Document & {
  startViewTransition?: (cb: () => void) => { finished: Promise<void> };
};

function runThemeSwap(swap: () => void) {
  if (typeof document === "undefined") {
    swap();
    return;
  }
  const doc = document as DocumentWithVT;
  if (doc.startViewTransition && !prefersReducedMotion()) {
    doc.startViewTransition(swap);
    return;
  }
  withFallbackTransition(swap);
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    applyThemeClass(theme);
    setMounted(true);
  }, [theme]);

  // Follow system preference until the user makes an explicit choice.
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      if (hasStoredTheme()) return;
      setThemeState(e.matches ? "dark" : "light");
    };
    mql.addEventListener?.("change", handleChange);
    return () => mql.removeEventListener?.("change", handleChange);
  }, []);

  const setTheme = (next: Theme) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore storage errors (e.g. private mode)
    }
    runThemeSwap(() => setThemeState(next));
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };


  const setLight = () => setTheme("light");
  const setDark = () => setTheme("dark");

  return { theme, mounted, toggleTheme, setLight, setDark };
}
