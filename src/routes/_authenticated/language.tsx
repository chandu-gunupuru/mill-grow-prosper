import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { AccountLayout } from "@/components/AccountLayout";
import { Card } from "@/components/ui/card";
import { LANGUAGES, useLanguage, type LanguageCode } from "@/hooks/useLanguage";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/_authenticated/language")({
  head: () => ({ meta: [{ title: "Language — Gayathri Rice Mill" }] }),
  component: LanguagePage,
});

function LanguagePage() {
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();

  return (
    <AccountLayout
      title={t("language.title")}
      description={t("language.description")}
    >
      <Card className="p-4 border-border/60">
        <div className="grid gap-2 sm:grid-cols-2">
          {LANGUAGES.map((l) => {
            const active = l.code === language;
            return (
              <button
                key={l.code}
                type="button"
                onClick={async () => {
                  await setLanguage(l.code as LanguageCode);
                  toast.success(`${t("language.changed")} — ${l.native}`);
                }}
                aria-pressed={active}
                className={`flex items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition ${
                  active
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border hover:bg-secondary/40"
                }`}
              >
                <span>
                  <span className="block font-medium">{l.native}</span>
                  <span className="block text-xs text-muted-foreground">{l.label}</span>
                </span>
                {active && <CheckCircle2 className="h-4 w-4 text-primary" />}
              </button>
            );
          })}
        </div>
      </Card>
    </AccountLayout>
  );
}
