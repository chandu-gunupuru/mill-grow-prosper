import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { theme, mounted, toggleTheme } = useTheme();

  // Avoid hydration mismatch by rendering a placeholder until mounted.
  if (!mounted) {
    return (
      <button
        aria-label="Toggle theme"
        className={`relative w-10 h-10 rounded-md border border-border bg-card grid place-items-center ${className}`}
        disabled
      >
        <span className="h-5 w-5" />
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
      title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
      className={`relative w-10 h-10 rounded-md border border-border bg-card grid place-items-center hover:border-primary hover:text-primary transition ${className}`}
    >
      {theme === "light" ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </button>
  );
}
