import { Sun, Moon } from "lucide-react";
import type { KeyboardEvent } from "react";
import { useTheme } from "@/hooks/useTheme";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { theme, mounted, toggleTheme } = useTheme();

  // iOS-style sliding switch. Track holds both icons; thumb slides across.
  const trackClasses =
    "relative inline-flex h-7 w-14 shrink-0 cursor-pointer items-center rounded-full " +
    "border border-border bg-card transition-colors duration-300 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Toggle color theme"
        aria-busy="true"
        disabled
        className={`${trackClasses} ${className}`}
      >
        <span className="sr-only">Loading theme toggle</span>
      </button>
    );
  }

  const isDark = theme === "dark";
  const label = isDark ? "Switch to light mode" : "Switch to dark mode";

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (
      e.key === "ArrowLeft" ||
      e.key === "ArrowRight" ||
      e.key === "ArrowUp" ||
      e.key === "ArrowDown"
    ) {
      e.preventDefault();
      toggleTheme();
    }
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={label}
      title={label}
      onClick={toggleTheme}
      onKeyDown={handleKeyDown}
      className={`${trackClasses} ${isDark ? "bg-primary/90" : "bg-muted"} ${className}`}
    >
      {/* Track icons (visible behind the thumb) */}
      <Sun
        className={`absolute left-1.5 h-3.5 w-3.5 transition-opacity duration-200 ${
          isDark ? "opacity-40 text-primary-foreground" : "opacity-90 text-foreground"
        }`}
        aria-hidden="true"
        focusable="false"
      />
      <Moon
        className={`absolute right-1.5 h-3.5 w-3.5 transition-opacity duration-200 ${
          isDark ? "opacity-90 text-primary-foreground" : "opacity-40 text-foreground"
        }`}
        aria-hidden="true"
        focusable="false"
      />

      {/* Sliding thumb */}
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow ring-1 ring-border transition-transform duration-300 ease-out ${
          isDark ? "translate-x-8" : "translate-x-1"
        }`}
      />

      <span className="sr-only">
        {isDark ? "Dark mode enabled" : "Light mode enabled"}
      </span>
    </button>
  );
}
