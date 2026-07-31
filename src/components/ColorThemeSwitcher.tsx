import { Check, Palette } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { COLOR_THEMES, useColorTheme } from "@/hooks/useColorTheme";

export function ColorThemeSwitcher({ className = "" }: { className?: string }) {
  const { colorTheme, mounted, setColorTheme } = useColorTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Choose color theme"
          title="Choose color theme"
          className={`w-9 h-9 shrink-0 grid place-items-center rounded-md bg-transparent hover:text-primary transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${className}`}
        >
          <Palette className="w-5 h-5" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Color theme</DropdownMenuLabel>
        {COLOR_THEMES.map((t, i) => {
          const active = mounted && colorTheme === t.id;
          return (
            <DropdownMenuItem
              key={t.id}
              onSelect={() => setColorTheme(t.id)}
              className="gap-2 cursor-pointer"
            >
              <span
                className="w-3.5 h-3.5 rounded-full border border-border shrink-0"
                style={{ background: t.swatch }}
                aria-hidden="true"
              />
              <span className="flex-1 truncate">
                Theme {i + 1} · {t.label}
              </span>
              {active && <Check className="w-4 h-4 text-primary" aria-hidden="true" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
