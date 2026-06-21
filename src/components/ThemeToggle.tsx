import { Sun, Moon } from "lucide-react";
import type { KeyboardEvent } from "react";
import { useTheme } from "@/hooks/useTheme";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { theme, mounted, toggleTheme } = useTheme();

  const baseClasses =
    "relative w-10 h-10 rounded-md border border-border bg-card grid place-items-center " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

  // Avoid hydration mismatch by rendering a placeholder until mounted.
  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Toggle color theme"
        aria-busy="true"
        disabled
        className={`${baseClasses} ${className}`}
      >
        <span className="h-5 w-5" aria-hidden="true" />
      </button>
    );
  }

  const isDark = theme === "dark";
  const label = isDark ? "Switch to light mode" : "Switch to dark mode";

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    // Buttons already activate on Enter/Space; this also supports
    // assistive tech that sends arrow keys for switch-style controls.
    if (e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "ArrowUp" || e.key === "ArrowDown") {
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
      className={`${baseClasses} hover:border-primary hover:text-primary transition ${className}`}
    >
      {isDark ? (
        <Moon className="w-5 h-5" aria-hidden="true" focusable="false" />
      ) : (
        <Sun className="w-5 h-5" aria-hidden="true" focusable="false" />
      )}
      <span className="sr-only">{isDark ? "Dark mode enabled" : "Light mode enabled"}</span>
    </button>
  );
}
