import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bell, Loader2, Save } from "lucide-react";
import { AccountLayout } from "@/components/AccountLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Gayathri Rice Mill" }] }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState({ email: true, sms: false, marketing: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("user_settings")
        .select("notify_email, notify_sms, notify_marketing")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        setPrefs({
          email: data.notify_email ?? true,
          sms: data.notify_sms ?? false,
          marketing: data.notify_marketing ?? false,
        });
      }
      setLoading(false);
    })();
  }, [user]);

  async function save() {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("user_settings").upsert(
      {
        user_id: user.id,
        notify_email: prefs.email,
        notify_sms: prefs.sms,
        notify_marketing: prefs.marketing,
      },
      { onConflict: "user_id" },
    );
    setSaving(false);
    if (error) toast.error("Could not save preferences");
    else toast.success("Notification preferences saved");
  }

  const items: Array<{ key: keyof typeof prefs; label: string; desc: string }> = [
    { key: "email", label: "Email notifications", desc: "Order updates, inquiries, and account activity." },
    { key: "sms", label: "SMS notifications", desc: "Important alerts sent to your phone." },
    { key: "marketing", label: "Marketing emails", desc: "Product news, offers, and announcements." },
  ];

  return (
    <AccountLayout
      title="Notifications"
      description="Choose how we contact you about your account and orders."
    >
      {loading ? (
        <Card className="p-8 border-border/60 grid place-items-center">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </Card>
      ) : (
        <Card className="p-2 border-border/60 divide-y divide-border/60">
          {items.map((it) => (
            <label
              key={it.key}
              className="flex items-start justify-between gap-4 p-4 cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <Bell className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm font-medium">{it.label}</div>
                  <div className="text-xs text-muted-foreground">{it.desc}</div>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={prefs[it.key]}
                onClick={() => setPrefs((p) => ({ ...p, [it.key]: !p[it.key] }))}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
                  prefs[it.key] ? "bg-primary" : "bg-muted"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                    prefs[it.key] ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </label>
          ))}
        </Card>
      )}
      <div className="flex justify-end mt-4">
        <Button onClick={save} disabled={saving || loading}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span className="ml-2">Save preferences</span>
        </Button>
      </div>
    </AccountLayout>
  );
}
