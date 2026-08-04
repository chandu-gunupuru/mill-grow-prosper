import { Check, Palette, Sun, Moon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { COLOR_THEMES, useColorTheme } from "@/hooks/useColorTheme";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/hooks/useTheme";

/**
 * Floating "Website Color" button. Sits directly above the glowing chat
 * button on the right edge and stays fixed while scrolling. Its popup holds
 * both the color palettes and the light/dark mode switch.
 */
export function FloatingThemeButton() {
  const { colorTheme, mounted, setColorTheme } = useColorTheme();
  const { t } = useTranslation();
  const { theme, mounted: themeMounted, toggleTheme } = useTheme();
  const isDark = themeMounted && theme === "dark";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={t("theme.websiteColor")}
          title={t("theme.websiteColor")}
          className="fixed bottom-24 right-6 z-50 grid h-12 w-12 place-items-center rounded-full bg-card text-foreground shadow-2xl ring-1 ring-border transition hover:scale-110 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-14 sm:w-14"
        >
          <Palette className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="top" sideOffset={12} className="w-52">
        <DropdownMenuLabel>{t("theme.websiteColor")}</DropdownMenuLabel>
        {COLOR_THEMES.map((t, i) => {
          const active = mounted && colorTheme === t.id;
          return (
            <DropdownMenuItem
              key={t.id}
              onSelect={() => setColorTheme(t.id)}
              className="cursor-pointer gap-2"
            >
              <span
                className="h-3.5 w-3.5 shrink-0 rounded-full border border-border"
                style={{ background: t.swatch }}
                aria-hidden="true"
              />
              <span className="flex-1 truncate">
                Theme {i + 1} · {t.label}
              </span>
              {active && <Check className="h-4 w-4 text-primary" aria-hidden="true" />}
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuLabel>{t("theme.appearance")}</DropdownMenuLabel>
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            toggleTheme();
          }}
          className="cursor-pointer gap-2"
        >
          {isDark ? (
            <Sun className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          ) : (
            <Moon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          )}
          <span className="flex-1 truncate">{isDark ? t("theme.light") : t("theme.dark")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
