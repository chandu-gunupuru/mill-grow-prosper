import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  ArrowLeft,
  LifeBuoy,
  Phone,
  Mail,
  MessageCircle,
  Loader2,
  Send,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { sendQuoteInquiry } from "@/lib/inquiry.functions";
import { ThemeToggle } from "@/components/ThemeToggle";
import { HelpFAQ } from "@/components/HelpFAQ";
import { LiveChatWidget } from "@/components/LiveChatWidget";

const WHATSAPP = "+919398553951";
const PHONE = "+91 93985 53951";
const EMAIL = "gunupuruchandu29@gmail.com";

const CATEGORIES = [
  "Order issue",
  "Delivery / shipping",
  "Payment / refund",
  "Product question",
  "Wholesale enquiry",
  "Account / login",
  "Something else",
] as const;

const formSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().min(5, "Enter a valid phone").max(30),
  category: z.string().trim().min(1).max(80),
  message: z.string().trim().min(10, "Please describe your doubt (min 10 chars)").max(2000),
});

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Help Center — Gayathri Rice Mill" },
      {
        name: "description",
        content:
          "Get help with orders, delivery, payments and products. Send us your question or contact our team directly by phone, WhatsApp or email.",
      },
    ],
  }),
  component: HelpCenter,
});

function HelpCenter() {
  const send = useServerFn(sendQuoteInquiry);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    category: CATEGORIES[0] as string,
    message: "",
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const KEY = "help.contactDrawerShown";
    if (sessionStorage.getItem(KEY)) return;
    const t = window.setTimeout(() => {
      setContactOpen(true);
      sessionStorage.setItem(KEY, "1");
    }, 350);
    return () => window.clearTimeout(t);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = formSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form.");
      return;
    }
    setSending(true);
    try {
      await send({
        data: {
          name: parsed.data.name,
          company: "",
          email: parsed.data.email,
          phone: parsed.data.phone,
          product: `Help Center — ${parsed.data.category}`,
          qty: "",
          message: parsed.data.message,
        },
      });
      setSent(true);
      toast.success("Your question was sent. We'll reply shortly.");
      setForm({ name: "", email: "", phone: "", category: CATEGORIES[0], message: "" });
    } catch (err) {
      toast.error((err as Error).message ?? "Could not send. Please try again.");
    } finally {
      setSending(false);
    }
  }

  const greeting = form.name.trim() ? `Hello, I'm ${form.name.trim()}.` : "Hello Gayathri Rice Mill,";
  const topic = form.category || "support";
  const body = form.message.trim()
    ? form.message.trim()
    : `I need help with ${topic.toLowerCase()}.`;
  const waText = `${greeting} ${body}`;
  const waLink = `https://wa.me/${WHATSAPP.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(waText)}`;
  const telLink = `tel:${PHONE.replace(/[^0-9+]/g, "")}`;
  const mailSubject = `Help Center — ${topic}`;
  const mailBody = `${greeting}\n\n${body}\n\n${form.phone ? `Phone: ${form.phone}\n` : ""}${form.email ? `Email: ${form.email}` : ""}`.trim();
  const mailLink = `mailto:${EMAIL}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`;

  return (
    <div className="min-h-screen bg-background">
      <Toaster richColors position="top-center" />
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              to="/"
              aria-label="Back to home"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-md hover:bg-secondary"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">
                Support
              </div>
              <h1 className="truncate font-display text-xl font-bold text-primary">
                Help Center
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setContactOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-xs font-semibold text-primary hover:border-primary hover:bg-primary/5 transition"
            >
              <Phone className="h-4 w-4" /> Contact
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 pt-8">
        <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/5 via-card to-card p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div className="min-w-0">
              <h2 className="font-display text-lg font-bold text-primary sm:text-xl">
                Need help right now?
              </h2>
              <p className="text-sm text-muted-foreground">
                Reach our team instantly — pick the option that works best for you.
              </p>
            </div>
            <span className="text-xs text-muted-foreground">Mon–Sat · 9 AM – 7 PM IST</span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <a
              href={telLink}
              className="group flex items-center gap-3 rounded-xl border border-border bg-background p-4 hover:border-primary hover:shadow-md transition"
            >
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                <Phone className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground">Click to call</div>
                <div className="truncate font-semibold text-primary">{PHONE}</div>
              </div>
            </a>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-xl border border-border bg-background p-4 hover:border-primary hover:shadow-md transition"
            >
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-green-500/10 text-green-600 dark:text-green-400">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground">WhatsApp message</div>
                <div className="truncate font-semibold text-primary">Chat on WhatsApp</div>
              </div>
            </a>
            <a
              href={mailLink}
              className="group flex items-center gap-3 rounded-xl border border-border bg-background p-4 hover:border-primary hover:shadow-md transition"
            >
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                <Mail className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground">Send email</div>
                <div className="truncate font-semibold text-primary">{EMAIL}</div>
              </div>
            </a>
          </div>
        </div>
      </section>

      <HelpFAQ />

      <main className="mx-auto grid max-w-5xl gap-8 px-6 py-10 md:grid-cols-[1.4fr_1fr]">
        {/* Form */}
        <section id="help-form" className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10">
              <LifeBuoy className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-primary">Tell us your doubt</h2>
              <p className="text-sm text-muted-foreground">
                Fill the form and our team will reply within 24 hours.
              </p>
            </div>
          </div>

          {sent ? (
            <div className="mt-6 flex flex-col items-start gap-3 rounded-xl border border-green-500/30 bg-green-500/5 p-5">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-semibold">Message received</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Thanks — we got your question and will reply to {form.email || "your email"} shortly.
              </p>
              <button
                onClick={() => setSent(false)}
                className="mt-1 inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-secondary"
              >
                Send another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Your name" required>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    maxLength={100}
                    required
                    className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </Field>
                <Field label="Email" required>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    maxLength={255}
                    required
                    className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </Field>
                <Field label="Phone" required>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    maxLength={30}
                    required
                    className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </Field>
                <Field label="Topic">
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field label="Describe your doubt" required>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows={5}
                  maxLength={2000}
                  required
                  placeholder="Tell us what happened, include order number if any…"
                  className="w-full resize-y rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </Field>
              <button
                type="submit"
                disabled={sending}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {sending ? "Sending…" : "Send to support"}
              </button>
            </form>
          )}
        </section>

        {/* Contact options */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Or contact us directly
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Your topic{form.message.trim() ? " and message" : ""} will be prefilled.
            </p>
            <div className="mt-4 flex flex-col gap-3">
              <a
                href={telLink}
                className="group flex items-center gap-3 rounded-xl border border-border bg-background p-3 hover:border-primary hover:bg-primary/5 transition"
              >
                <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
                  <Phone className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground">Call us</div>
                  <div className="truncate font-semibold text-primary">{PHONE}</div>
                </div>
              </a>
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 rounded-xl border border-border bg-background p-3 hover:border-primary hover:bg-primary/5 transition"
              >
                <div className="grid h-10 w-10 place-items-center rounded-full bg-green-500/10 text-green-600 dark:text-green-400">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground">WhatsApp message</div>
                  <div className="truncate font-semibold text-primary">Chat with us</div>
                </div>
              </a>
              <a
                href={mailLink}
                className="group flex items-center gap-3 rounded-xl border border-border bg-background p-3 hover:border-primary hover:bg-primary/5 transition"
              >
                <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground">Email</div>
                  <div className="truncate font-semibold text-primary">{EMAIL}</div>
                </div>
              </a>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Support hours
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Monday – Saturday<br />
              9:00 AM – 7:00 PM IST
            </p>
          </div>
        </aside>
      </main>

      <Sheet open={contactOpen} onOpenChange={setContactOpen}>
        <SheetContent
          side="right"
          className="flex h-full w-[90vw] max-w-sm flex-col gap-0 overflow-hidden p-0 sm:w-96"
        >
          <SheetHeader className="shrink-0 border-b border-border px-6 py-4">
            <SheetTitle className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                <LifeBuoy className="h-5 w-5" />
              </div>
              <div className="min-w-0 text-left">
                <div className="truncate text-base font-semibold">How can we help?</div>
                <div className="truncate text-xs text-muted-foreground font-normal">
                  Pick the fastest way to reach us
                </div>
              </div>
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-1 flex-col gap-3 overflow-y-auto overscroll-contain px-4 py-5 pb-[env(safe-area-inset-bottom)]">
            <a
              href={telLink}
              onClick={() => setContactOpen(false)}
              className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 hover:border-primary hover:shadow-md transition"
            >
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                <Phone className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs text-muted-foreground">Click to call</div>
                <div className="truncate font-semibold text-primary">{PHONE}</div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </a>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setContactOpen(false)}
              className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 hover:border-primary hover:shadow-md transition"
            >
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-green-500/10 text-green-600 dark:text-green-400">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs text-muted-foreground">WhatsApp message</div>
                <div className="truncate font-semibold text-primary">Chat on WhatsApp</div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </a>
            <a
              href={mailLink}
              onClick={() => setContactOpen(false)}
              className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 hover:border-primary hover:shadow-md transition"
            >
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                <Mail className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs text-muted-foreground">Send email</div>
                <div className="truncate font-semibold text-primary">{EMAIL}</div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </a>
            <button
              type="button"
              onClick={() => setContactOpen(false)}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-md border border-border bg-background px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary"
            >
              Prefer to write to us? Use the form
            </button>
          </div>
        </SheetContent>
      </Sheet>

      <LiveChatWidget
        phone={PHONE}
        email={EMAIL}
        waLink={waLink}
        telLink={telLink}
        mailLink={mailLink}
      />
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </span>
      {children}
    </label>
  );
}
