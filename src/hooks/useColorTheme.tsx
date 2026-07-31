import { useEffect, useState } from "react";

export type ColorTheme = "harvest" | "ocean" | "saffron";

export const COLOR_THEMES: { id: ColorTheme; label: string; swatch: string }[] = [
  { id: "harvest", label: "Harvest Green", swatch: "oklch(0.42 0.11 145)" },
  { id: "ocean", label: "Ocean Blue", swatch: "oklch(0.50 0.13 245)" },
  { id: "saffron", label: "Saffron Red", swatch: "oklch(0.52 0.17 30)" },
];

const STORAGE_KEY = "color-theme";
const DEFAULT: ColorTheme = "harvest";

function isColorTheme(v: unknown): v is ColorTheme {
  return v === "harvest" || v === "ocean" || v === "saffron";
}

function readStored(): ColorTheme {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isColorTheme(stored) ? stored : DEFAULT;
  } catch {
    return DEFAULT;
  }
}

function apply(theme: ColorTheme) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-color-theme", theme);
}

// Shared store so every switcher instance stays in sync.
let current: ColorTheme | null = null;
const listeners = new Set<(t: ColorTheme) => void>();

function get(): ColorTheme {
  if (current === null) current = readStored();
  return current;
}

export function useColorTheme() {
  const [colorTheme, setLocal] = useState<ColorTheme>(get);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const initial = get();
    setLocal(initial);
    apply(initial);
    setMounted(true);
    listeners.add(setLocal);
    return () => {
      listeners.delete(setLocal);
    };
  }, []);

  const setColorTheme = (next: ColorTheme) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore storage errors (private mode)
    }
    current = next;
    apply(next);
    listeners.forEach((l) => l(next));
  };

  return { colorTheme, mounted, setColorTheme };
}
