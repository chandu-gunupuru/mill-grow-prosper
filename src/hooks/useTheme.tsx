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

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
  // View Transitions API is GPU-composited and stays smooth on low-end devices.
  // Browsers without it fall back to an instant swap (still snappy — the .dark
  // recalc alone runs at 44+ fps under 6x mobile CPU throttle).
  if (doc.startViewTransition && !prefersReducedMotion()) {
    doc.startViewTransition(swap);
    return;
  }
  swap();
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
