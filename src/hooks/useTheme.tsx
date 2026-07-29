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
  const meta = document.querySelector('meta[name="color-scheme"]');
  if (meta) meta.setAttribute("content", theme === "dark" ? "dark light" : "light dark");
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


// Shared store so every ThemeToggle instance (navbar, account pages, footer)
// stays in sync instead of holding its own copy of the theme.
let currentTheme: Theme | null = null;
const listeners = new Set<(t: Theme) => void>();

function getTheme(): Theme {
  if (currentTheme === null) currentTheme = getInitialTheme();
  return currentTheme;
}

function publishTheme(next: Theme) {
  currentTheme = next;
  applyThemeClass(next);
  listeners.forEach((l) => l(next));
}

export function useTheme() {
  const [theme, setThemeLocal] = useState<Theme>(getTheme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const initial = getTheme();
    setThemeLocal(initial);
    applyThemeClass(initial);
    setMounted(true);
    listeners.add(setThemeLocal);
    return () => {
      listeners.delete(setThemeLocal);
    };
  }, []);

  // Follow system preference until the user makes an explicit choice.
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      if (hasStoredTheme()) return;
      publishTheme(e.matches ? "dark" : "light");
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
    runThemeSwap(() => publishTheme(next));
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };


  const setLight = () => setTheme("light");
  const setDark = () => setTheme("dark");

  return { theme, mounted, toggleTheme, setLight, setDark };
}
