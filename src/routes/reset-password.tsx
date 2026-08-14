import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "@tanstack/react-router";
import { ColorThemeSwitcher } from "@/components/ColorThemeSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [
    { title: "Reset password — Gayathri Modern Rice Mill" },
    { name: "description", content: "Securely reset your Gayathri Modern Rice Mill account password." },
    { property: "og:title", content: "Reset password — Gayathri Modern Rice Mill" },
    { property: "og:description", content: "Securely reset your account password." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [validHash, setValidHash] = useState(false);

  useEffect(() => {
    // Check if this page was loaded with a recovery hash from the email link
    const checkHash = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        // No session with recovery type — user may have navigated directly
        // Let them try anyway; updateUser will fail if the token is invalid
        return;
      }
      setValidHash(true);
    };
    checkHash();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
      toast.success("Password updated successfully!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-background px-6 py-12 pt-24 md:pt-28">
      <header className="fixed top-0 inset-x-0 z-50 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 h-16">
          <Link to="/" className="flex items-center gap-2">
            <Logo size={36} showText={true} />
          </Link>
          <ColorThemeSwitcher />
<ThemeToggle />
        </div>
      </header>
      <div className="w-full max-w-md bg-card border border-border rounded-xl p-8 shadow-lg">
        <Link to="/auth" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <Link to="/" className="flex items-center justify-center gap-2 mb-6">
          <Logo size={40} showText={true} />
        </Link>

        {done ? (
          <div className="text-center space-y-4 py-4">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h2 className="text-xl font-display font-bold">Password updated</h2>
            <p className="text-sm text-muted-foreground">
              Your password has been reset successfully. You can now sign in with your new password.
            </p>
            <button
              type="button"
              onClick={() => navigate({ to: "/auth" })}
              className="w-full inline-flex items-center justify-center gap-2 bg-sky-400 text-white py-2.5 rounded-md text-sm font-semibold hover:bg-sky-500 transition"
            >
              Go to sign in
            </button>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-display font-bold mb-1">Set new password</h1>
            <p className="text-sm text-muted-foreground mb-6">
              Enter a new password for your account.
            </p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="password"
                required
                minLength={6}
                placeholder="New password (min 6 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-md bg-secondary border border-border focus:border-primary outline-none text-sm"
              />
              <input
                type="password"
                required
                minLength={6}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-md bg-secondary border border-border focus:border-primary outline-none text-sm"
              />
              <button
                type="submit"
                disabled={busy}
                className="w-full inline-flex items-center justify-center gap-2 bg-sky-400 text-white py-2.5 rounded-md text-sm font-semibold hover:bg-sky-500 transition disabled:opacity-50"
              >
                {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                Update password
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
