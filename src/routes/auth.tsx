import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Leaf, ArrowLeft, Mail, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — Gayathri Modern Rice Mill" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: "/" });
  }, [user, navigate]);

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        toast.success("Account created! Check your email to confirm.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        navigate({ to: "/" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error(result.error.message || "Google sign-in failed");
      setBusy(false);
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/" });
  };
  const friendlyPhoneError = (raw: string, stage: "send" | "verify") => {
    const m = raw.toLowerCase();
    if (m.includes("invalid") && m.includes("phone")) return "That phone number looks invalid. Include the country code, e.g. +911234567890.";
    if (m.includes("rate") || m.includes("too many")) return "Too many attempts. Please wait a minute before trying again.";
    if (m.includes("sms") || m.includes("provider") || m.includes("not enabled") || m.includes("unsupported")) return "SMS sign-in isn't available right now. Please use email instead.";
    if (stage === "verify" && (m.includes("token") || m.includes("expired") || m.includes("otp"))) return "That code is incorrect or has expired. Request a new one or use email.";
    return stage === "send" ? "Couldn't send the OTP. Please try again or use email." : "Couldn't verify the code. Please try again or use email.";
  };

  const switchToEmail = () => {
    setMethod("email");
    setOtpSent(false);
    setOtp("");
    toast.message("Switched to email sign-in", { description: "Enter your email and password to continue." });
  };

  const handlePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpSent && !/^\+[1-9]\d{6,14}$/.test(phone.trim())) {
      toast.error("Enter your phone in international format, e.g. +911234567890");
      return;
    }
    setBusy(true);
    try {
      if (!otpSent) {
        const { error } = await supabase.auth.signInWithOtp({
          phone: phone.trim(),
          options: mode === "signup" ? { data: { full_name: fullName } } : undefined,
        });
        if (error) throw error;
        setOtpSent(true);
        toast.success("OTP sent", { description: "Check your messages. It can take up to a minute." });
      } else {
        const { error } = await supabase.auth.verifyOtp({ phone: phone.trim(), token: otp.trim(), type: "sms" });
        if (error) throw error;
        toast.success("Welcome!");
        navigate({ to: "/" });
      }
    } catch (err) {
      const stage: "send" | "verify" = otpSent ? "verify" : "send";
      const msg = friendlyPhoneError(err instanceof Error ? err.message : "", stage);
      toast.error(msg, {
        action: { label: "Use email", onClick: switchToEmail },
      });
    } finally {
      setBusy(false);
    }
  };




  return (
    <div className="min-h-screen grid place-items-center bg-background px-6 py-12">
      <div className="w-full max-w-md bg-card border border-border rounded-xl p-8 shadow-lg">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <Link to="/" className="flex items-center justify-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-md bg-gradient-gold grid place-items-center">
            <Leaf className="w-5 h-5 text-primary" />
          </div>
          <span className="font-display font-bold text-primary">Gayathri</span>
        </Link>
        <h1 className="text-2xl font-display font-bold mb-1">
          {mode === "signin" ? "Sign in" : "Create your account"}
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          {mode === "signin" ? "Welcome back. Sign in to continue." : "Join to place wholesale orders."}
        </p>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={busy}
          className="w-full inline-flex items-center justify-center gap-2 border border-border bg-background hover:bg-secondary text-foreground py-2.5 rounded-md text-sm font-medium transition disabled:opacity-50"
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.99.66-2.25 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.11A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.11V7.05H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.95l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-3 my-5">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">OR</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3 p-1 bg-secondary rounded-md">
          <button
            type="button"
            onClick={() => { setMethod("email"); setOtpSent(false); }}
            className={`inline-flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded transition ${method === "email" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}
          >
            <Mail className="w-3.5 h-3.5" /> Email
          </button>
          <button
            type="button"
            onClick={() => { setMethod("phone"); }}
            className={`inline-flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded transition ${method === "phone" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}
          >
            <Phone className="w-3.5 h-3.5" /> Phone
          </button>
        </div>

        {method === "email" ? (
          <form onSubmit={handleEmail} className="space-y-3">
            {mode === "signup" && (
              <input
                type="text"
                placeholder="Full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-md bg-secondary border border-border focus:border-primary outline-none text-sm"
              />
            )}
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-md bg-secondary border border-border focus:border-primary outline-none text-sm"
            />
            <input
              type="password"
              required
              minLength={6}
              placeholder="Password (min 6 chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-md bg-secondary border border-border focus:border-primary outline-none text-sm"
            />
            <button
              type="submit"
              disabled={busy}
              className="w-full inline-flex items-center justify-center gap-2 bg-sky-400 text-white py-2.5 rounded-md text-sm font-semibold hover:bg-sky-500 transition disabled:opacity-50"
            >
              {busy && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>
        ) : (
          <form onSubmit={handlePhone} className="space-y-3">
            {mode === "signup" && !otpSent && (
              <input
                type="text"
                placeholder="Full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-md bg-secondary border border-border focus:border-primary outline-none text-sm"
              />
            )}
            <input
              type="tel"
              required
              placeholder="Phone (e.g. +911234567890)"
              value={phone}
              disabled={otpSent}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2.5 rounded-md bg-secondary border border-border focus:border-primary outline-none text-sm disabled:opacity-60"
            />
            {otpSent && (
              <input
                type="text"
                required
                inputMode="numeric"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-2.5 rounded-md bg-secondary border border-border focus:border-primary outline-none text-sm tracking-widest"
              />
            )}
            <button
              type="submit"
              disabled={busy}
              className="w-full inline-flex items-center justify-center gap-2 bg-sky-400 text-white py-2.5 rounded-md text-sm font-semibold hover:bg-sky-500 transition disabled:opacity-50"
            >
              {busy && <Loader2 className="w-4 h-4 animate-spin" />}
              {otpSent ? "Verify OTP" : "Send OTP"}
            </button>
            {otpSent && (
              <div className="space-y-1.5 pt-1">
                <p className="text-xs text-muted-foreground text-center">
                  Didn't get the code? It can take up to a minute.
                </p>
                <div className="flex items-center justify-center gap-3 text-xs">
                  <button
                    type="button"
                    onClick={() => { setOtpSent(false); setOtp(""); }}
                    className="text-muted-foreground hover:text-primary"
                  >
                    Change number / resend
                  </button>
                  <span className="text-border">•</span>
                  <button
                    type="button"
                    onClick={switchToEmail}
                    className="text-primary font-medium hover:underline"
                  >
                    Use email instead
                  </button>
                </div>
              </div>
            )}
          </form>
        )}

        <p className="text-sm text-center text-muted-foreground mt-5">
          {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="text-primary font-medium hover:underline"
          >
            {mode === "signin" ? "Create an account" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
