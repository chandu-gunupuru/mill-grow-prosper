import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Loader2, Save, Building2, Phone, Bell, CheckCircle2, AlertCircle } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [{ title: "Settings — Gayathri Rice Mill" }],
  }),
  component: SettingsPage,
});

type Settings = {
  company_name: string;
  company_address: string;
  company_phone: string;
  company_email: string;
  contact_phone: string;
  contact_email: string;
  notify_email: boolean;
  notify_sms: boolean;
  notify_marketing: boolean;
};

const EMPTY: Settings = {
  company_name: "",
  company_address: "",
  company_phone: "",
  company_email: "",
  contact_phone: "",
  contact_email: "",
  notify_email: true,
  notify_sms: false,
  notify_marketing: false,
};

function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const [settings, setSettings] = useState<Settings>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) {
        setStatus({ type: "error", msg: error.message });
      } else if (data) {
        setSettings({
          company_name: data.company_name ?? "",
          company_address: data.company_address ?? "",
          company_phone: data.company_phone ?? "",
          company_email: data.company_email ?? "",
          contact_phone: data.contact_phone ?? "",
          contact_email: data.contact_email ?? "",
          notify_email: data.notify_email ?? true,
          notify_sms: data.notify_sms ?? false,
          notify_marketing: data.notify_marketing ?? false,
        });
      }
      setLoading(false);
    })();
  }, [user]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setStatus(null);
    const { error } = await supabase
      .from("user_settings")
      .upsert({ user_id: user.id, ...settings }, { onConflict: "user_id" });
    setSaving(false);
    if (error) {
      setStatus({ type: "error", msg: error.message });
      toast.error("Failed to save settings");
    } else {
      setStatus({ type: "success", msg: "Settings saved successfully." });
      toast.success("Settings saved");
    }
  }

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((s) => ({ ...s, [key]: value }));
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster richColors position="top-center" />
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-6 py-4">
          <Link
            to="/"
            className="grid h-9 w-9 place-items-center rounded-md hover:bg-secondary"
            aria-label="Back to site"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="font-display text-xl font-bold text-primary">Settings</h1>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8">
        {status && (
          <div
            role="status"
            className={`mb-6 flex items-start gap-2 rounded-lg border p-3 text-sm ${
              status.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                : "border-red-200 bg-red-50 text-red-900"
            }`}
          >
            {status.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            )}
            <span>{status.msg}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <Section icon={<Building2 className="h-5 w-5" />} title="Company Profile">
            <Field label="Company Name">
              <input
                type="text"
                value={settings.company_name}
                onChange={(e) => update("company_name", e.target.value)}
                maxLength={120}
                className={inputCls}
              />
            </Field>
            <Field label="Company Address">
              <textarea
                value={settings.company_address}
                onChange={(e) => update("company_address", e.target.value)}
                maxLength={500}
                rows={3}
                className={inputCls}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Company Phone">
                <input
                  type="tel"
                  value={settings.company_phone}
                  onChange={(e) => update("company_phone", e.target.value)}
                  maxLength={30}
                  className={inputCls}
                />
              </Field>
              <Field label="Company Email">
                <input
                  type="email"
                  value={settings.company_email}
                  onChange={(e) => update("company_email", e.target.value)}
                  maxLength={255}
                  className={inputCls}
                />
              </Field>
            </div>
          </Section>

          <Section icon={<Phone className="h-5 w-5" />} title="Contact Details">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Contact Phone">
                <input
                  type="tel"
                  value={settings.contact_phone}
                  onChange={(e) => update("contact_phone", e.target.value)}
                  maxLength={30}
                  className={inputCls}
                />
              </Field>
              <Field label="Contact Email">
                <input
                  type="email"
                  value={settings.contact_email}
                  onChange={(e) => update("contact_email", e.target.value)}
                  maxLength={255}
                  className={inputCls}
                />
              </Field>
            </div>
          </Section>

          <Section icon={<Bell className="h-5 w-5" />} title="Notification Preferences">
            <Toggle
              label="Email notifications"
              description="Order updates, inquiries, and account activity."
              checked={settings.notify_email}
              onChange={(v) => update("notify_email", v)}
            />
            <Toggle
              label="SMS notifications"
              description="Important alerts sent to your phone."
              checked={settings.notify_sms}
              onChange={(v) => update("notify_sms", v)}
            />
            <Toggle
              label="Marketing emails"
              description="Product news, offers, and announcements."
              checked={settings.notify_marketing}
              onChange={(v) => update("notify_marketing", v)}
            />
          </Section>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

const inputCls =
  "w-full rounded-md border border-input bg-card px-3 py-2 text-sm shadow-sm transition focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-premium">
      <div className="mb-4 flex items-center gap-2">
        <div className="grid h-9 w-9 place-items-center rounded-md bg-secondary text-primary">{icon}</div>
        <h2 className="font-display text-lg font-semibold text-primary">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function Toggle({
  label, description, checked, onChange,
}: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-lg border border-border p-3 hover:bg-secondary/30">
      <div>
        <div className="text-sm font-medium text-primary">{label}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition ${
          checked ? "bg-primary" : "bg-muted"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </label>
  );
}
