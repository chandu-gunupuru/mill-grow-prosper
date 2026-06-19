import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, User, Mail, Shield } from "lucide-react";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [{ title: "Settings — Gayathri Rice Mill" }],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
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
        <div className="space-y-6">
          <section className="rounded-2xl border border-border bg-card p-6 shadow-premium">
            <h2 className="font-display text-lg font-semibold text-primary">Account</h2>
            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-secondary">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-sm font-medium text-primary">
                    {user?.user_metadata?.full_name || user?.user_metadata?.name || "User"}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Mail className="h-3 w-3" /> {user?.email}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6 shadow-premium">
            <h2 className="font-display text-lg font-semibold text-primary">Security</h2>
            <div className="mt-4">
              <Link
                to="/reset-password"
                className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium hover:border-primary transition"
              >
                <Shield className="h-4 w-4" /> Reset password
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
