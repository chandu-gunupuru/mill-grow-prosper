import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Leaf, ArrowLeft, Mail, Phone, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
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
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [smsStatus, setSmsStatus] = useState<"idle" | "sending" | "sent" | "delayed" | "failed">("idle");
  const [smsStatusMessage, setSmsStatusMessage] = useState<string>("");
  const [resendIn, setResendIn] = useState(0);
  const [sendAttempts, setSendAttempts] = useState(0);
  const [verifyAttempts, setVerifyAttempts] = useState(0);
  const [lastSentAt, setLastSentAt] = useState<number | null>(null);

  const MAX_SENDS = 4;
  const MAX_VERIFY = 5;
  // Exponential-ish backoff per resend attempt (seconds): 1st send -> 30s, 2nd -> 60s, 3rd -> 120s, 4th -> 180s
  const cooldownFor = (attemptCount: number) => [30, 60, 120, 180][Math.min(attemptCount - 1, 3)] ?? 180;

  useEffect(() => {
    if (user) navigate({ to: "/" });
  }, [user, navigate]);

  // Tick the cooldown every second; flip to "delayed" only once the cooldown expires
  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setInterval(() => {
      setResendIn((s) => {
        if (s <= 1) {
          clearInterval(t);
          setSmsStatus((cur) => (cur === "sent" ? "delayed" : cur));
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [resendIn]);




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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setForgotSent(true);
      toast.success("Reset link sent! Check your email.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send reset link");
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
  const classifyPhoneError = (raw: string, stage: "send" | "verify") => {
    const m = raw.toLowerCase();
    // delivery / provider failures from the SMS gateway
    const providerCodes = ["30003", "30004", "30005", "30006", "30007", "30008", "21610", "21614"];
    const providerHit = providerCodes.some((c) => m.includes(c));
    if (
      providerHit ||
      m.includes("undelivered") ||
      m.includes("delivery failed") ||
      m.includes("failed to deliver") ||
      m.includes("carrier") ||
      m.includes("landline") ||
      m.includes("unreachable")
    ) {
      return { kind: "delivery_failed" as const, message: "Your carrier rejected the SMS (number unreachable, landline, or blocked). Please try a different number or use email." };
    }
    if (m.includes("sms") || m.includes("provider") || m.includes("not enabled") || m.includes("unsupported") || m.includes("twilio") || m.includes("messagebird")) {
      return { kind: "provider_down" as const, message: "Our SMS provider is unavailable right now. Please use email to sign in." };
    }
    if (m.includes("invalid") && m.includes("phone")) {
      return { kind: "invalid_phone" as const, message: "That phone number looks invalid. Include the country code, e.g. +911234567890." };
    }
    if (m.includes("rate") || m.includes("too many")) {
      return { kind: "rate_limited" as const, message: "Too many attempts. Please wait a minute before trying again." };
    }
    if (stage === "verify" && (m.includes("token") || m.includes("expired") || m.includes("otp"))) {
      return { kind: "bad_code" as const, message: "That code is incorrect or has expired. Request a new one or use email." };
    }
    return { kind: "unknown" as const, message: stage === "send" ? "Couldn't send the OTP. Please try again or use email." : "Couldn't verify the code. Please try again or use email." };
  };

  const switchToEmail = () => {
    setMethod("email");
    setOtpSent(false);
    setOtp("");
    setSmsStatus("idle");
    setSmsStatusMessage("");
    setSendAttempts(0);
    setVerifyAttempts(0);
    setResendIn(0);
    toast.message("Switched to email sign-in", { description: "Enter your email and password to continue." });
  };

  const sendOtp = async (isResend: boolean) => {
    if (!/^\+[1-9]\d{6,14}$/.test(phone.trim())) {
      toast.error("Enter your phone in international format, e.g. +911234567890");
      return;
    }
    if (isResend && resendIn > 0) {
      toast.error(`Please wait ${resendIn}s before requesting another code.`);
      return;
    }
    if (sendAttempts >= MAX_SENDS) {
      toast.error("Resend limit reached", {
        description: "Please use email to sign in instead.",
        action: { label: "Use email", onClick: switchToEmail },
      });
      return;
    }
    setBusy(true);
    setSmsStatus("sending");
    setSmsStatusMessage(isResend ? "Requesting a new code from the SMS provider…" : "Asking the SMS provider to send your code…");
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phone.trim(),
        options: mode === "signup" ? { data: { full_name: fullName } } : undefined,
      });
      if (error) throw error;
      const nextAttempt = sendAttempts + 1;
      setSendAttempts(nextAttempt);
      setVerifyAttempts(0);
      setOtp("");
      setOtpSent(true);
      setLastSentAt(Date.now());
      const cooldown = cooldownFor(nextAttempt);
      setResendIn(cooldown);
      setSmsStatus("sent");
      setSmsStatusMessage(
        isResend
          ? `New code sent to ${phone.trim()} (attempt ${nextAttempt} of ${MAX_SENDS}).`
          : `Code sent to ${phone.trim()}. It usually arrives in under 30 seconds.`,
      );
      toast.success(isResend ? "New code sent" : "OTP sent", {
        description: `You can request another in ${cooldown}s.`,
      });
    } catch (err) {
      const info = classifyPhoneError(err instanceof Error ? err.message : "", "send");
      setSmsStatus("failed");
      setSmsStatusMessage(info.message);
      toast.error(info.message, {
        action: { label: "Use email", onClick: switchToEmail },
      });
    } finally {
      setBusy(false);
    }
  };

  const verifyOtpCode = async () => {
    if (verifyAttempts >= MAX_VERIFY) {
      toast.error("Too many verification attempts", {
        description: "Request a new code or use email to sign in.",
        action: { label: "Use email", onClick: switchToEmail },
      });
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: phone.trim(),
        token: otp.trim(),
        type: "sms",
      });
      if (error) throw error;
      toast.success("Welcome!");
      navigate({ to: "/" });
    } catch (err) {
      const next = verifyAttempts + 1;
      setVerifyAttempts(next);
      const info = classifyPhoneError(err instanceof Error ? err.message : "", "verify");
      const remaining = Math.max(0, MAX_VERIFY - next);
      const desc = remaining > 0
        ? `${remaining} attempt${remaining === 1 ? "" : "s"} left before you'll need a new code.`
        : "No attempts left. Request a new code or use email.";
      toast.error(info.message, {
        description: desc,
        action: info.kind === "bad_code" ? undefined : { label: "Use email", onClick: switchToEmail },
      });
    } finally {
      setBusy(false);
    }
  };

  const handlePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpSent) await verifyOtpCode();
    else await sendOtp(false);
  };

  const handleChangeNumber = () => {
    setOtpSent(false);
    setOtp("");
    setSmsStatus("idle");
    setSmsStatusMessage("");
    setSendAttempts(0);
    setVerifyAttempts(0);
    setResendIn(0);
    setLastSentAt(null);
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
          {mode === "signin" ? "Sign in" : mode === "signup" ? "Create your account" : "Reset your password"}
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          {mode === "signin" ? "Welcome back. Sign in to continue." : mode === "signup" ? "Join to place wholesale orders." : "Enter your email and we'll send you a reset link."}
        </p>

        {mode !== "forgot" && (
          <>
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
          </>
        )}

        {mode === "forgot" ? (
          <form onSubmit={handleForgotPassword} className="space-y-3">
            {forgotSent ? (
              <div className="text-center space-y-3 py-4">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <p className="text-sm text-muted-foreground">
                  If an account exists for <span className="font-medium text-foreground">{forgotEmail}</span>, we've sent a password reset link.
                </p>
                <button
                  type="button"
                  onClick={() => { setMode("signin"); setForgotSent(false); setForgotEmail(""); }}
                  className="text-primary font-medium hover:underline text-sm"
                >
                  Back to sign in
                </button>
              </div>
            ) : (
              <>
                <input
                  type="email"
                  required
                  placeholder="Email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-md bg-secondary border border-border focus:border-primary outline-none text-sm"
                />
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full inline-flex items-center justify-center gap-2 bg-sky-400 text-white py-2.5 rounded-md text-sm font-semibold hover:bg-sky-500 transition disabled:opacity-50"
                >
                  {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                  Send reset link
                </button>
              </>
            )}
          </form>
        ) : method === "email" ? (
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
            {mode === "signin" && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setMode("forgot")}
                  className="text-xs text-primary font-medium hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}
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
            {otpSent && smsStatus !== "idle" && (
              <div
                role="status"
                aria-live="polite"
                className={`flex items-start gap-2 text-xs rounded-md px-3 py-2 border ${
                  smsStatus === "failed"
                    ? "bg-destructive/10 border-destructive/30 text-destructive"
                    : smsStatus === "delayed"
                    ? "bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/40 dark:border-amber-900/40 dark:text-amber-200"
                    : smsStatus === "sent"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-900/40 dark:text-emerald-200"
                    : "bg-secondary border-border text-muted-foreground"
                }`}
              >
                {smsStatus === "sending" && <Loader2 className="w-3.5 h-3.5 mt-0.5 animate-spin shrink-0" />}
                {smsStatus === "sent" && <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" />}
                {smsStatus === "delayed" && <Clock className="w-3.5 h-3.5 mt-0.5 shrink-0" />}
                {smsStatus === "failed" && <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />}
                <div className="flex-1">
                  <p className="font-medium">
                    {smsStatus === "sending" && "Sending…"}
                    {smsStatus === "sent" && `SMS dispatched${resendIn > 0 ? ` · arriving in ~${resendIn}s` : ""}`}
                    {smsStatus === "delayed" && "Still no SMS?"}
                    {smsStatus === "failed" && "SMS delivery failed"}
                  </p>
                  {smsStatusMessage && <p className="opacity-90 mt-0.5">{smsStatusMessage}</p>}
                  {(smsStatus === "delayed" || smsStatus === "failed") && (
                    <button
                      type="button"
                      onClick={switchToEmail}
                      className="mt-1 font-semibold underline underline-offset-2"
                    >
                      Sign in with email instead →
                    </button>
                  )}
                </div>
              </div>
            )}
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
                  {resendIn > 0
                    ? `You can request a new code in ${resendIn}s${sendAttempts >= MAX_SENDS ? " — resend limit reached" : ""}.`
                    : sendAttempts >= MAX_SENDS
                    ? "Resend limit reached. Please use email instead."
                    : `Didn't get the code? You have ${MAX_SENDS - sendAttempts} resend${MAX_SENDS - sendAttempts === 1 ? "" : "s"} left.`}
                </p>
                {verifyAttempts > 0 && (
                  <p className="text-xs text-muted-foreground text-center">
                    Verification attempts: {verifyAttempts} / {MAX_VERIFY}
                  </p>
                )}
                <div className="flex items-center justify-center gap-3 text-xs">
                  <button
                    type="button"
                    disabled={busy || resendIn > 0 || sendAttempts >= MAX_SENDS}
                    onClick={() => sendOtp(true)}
                    className="text-primary font-medium hover:underline disabled:opacity-40 disabled:no-underline"
                  >
                    {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
                  </button>
                  <span className="text-border">•</span>
                  <button
                    type="button"
                    onClick={handleChangeNumber}
                    className="text-muted-foreground hover:text-primary"
                  >
                    Change number
                  </button>
                  <span className="text-border">•</span>
                  <button
                    type="button"
                    onClick={switchToEmail}
                    className="text-primary font-medium hover:underline"
                  >
                    Use email
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
