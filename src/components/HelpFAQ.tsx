import { useMemo, useState } from "react";
import { ChevronDown, Search, HelpCircle } from "lucide-react";

export type FAQ = { q: string; a: string };

export const HELP_FAQS: FAQ[] = [
  {
    q: "How long does delivery take?",
    a: "Local orders are typically delivered in 1–3 business days. Outside the region, expect 3–7 business days depending on courier availability.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept UPI, all major cards, net banking, and cash on delivery for eligible pincodes. Wholesale orders can be paid via bank transfer.",
  },
  {
    q: "Can I get a refund or replacement?",
    a: "Yes — if your rice arrives damaged or you received a wrong item, contact us within 48 hours of delivery with a photo and we'll arrange a free replacement or refund.",
  },
  {
    q: "Do you supply in bulk / wholesale?",
    a: "Absolutely. We supply restaurants, retailers and institutions. Choose 'Wholesale enquiry' in the form below or WhatsApp us with your monthly quantity for the best price.",
  },
  {
    q: "How should I store rice for best freshness?",
    a: "Store in a cool, dry place in an airtight container. For longer storage, refrigerate small portions. Properly stored rice stays fresh for 4–6 months.",
  },
  {
    q: "Are your products organic / pesticide-free?",
    a: "We partner with trusted farmers and follow strict quality checks. Specific organic variants are clearly labelled on the product page.",
  },
  {
    q: "How do I track my order?",
    a: "Once your order ships you'll receive a tracking link via SMS and email. You can also reply to our WhatsApp number with your order ID for an instant update.",
  },
];

export function HelpFAQ() {
  const [query, setQuery] = useState("");
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return HELP_FAQS;
    return HELP_FAQS.filter(
      (f) => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <section className="mx-auto max-w-5xl px-6 pt-8">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-primary sm:text-xl">
                Frequently asked questions
              </h2>
              <p className="text-sm text-muted-foreground">
                Quick answers to the most common questions.
              </p>
            </div>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search questions…"
              className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <ul className="mt-5 divide-y divide-border overflow-hidden rounded-xl border border-border">
          {filtered.length === 0 ? (
            <li className="p-5 text-sm text-muted-foreground">
              No matches. Try the form below — we'll reply within 24 hours.
            </li>
          ) : (
            filtered.map((f, i) => {
              const open = openIdx === i;
              return (
                <li key={f.q} className="bg-background">
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => setOpenIdx(open ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left text-sm font-medium text-primary hover:bg-secondary/50 sm:px-5"
                  >
                    <span>{f.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                        open ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {open && (
                    <div className="px-4 pb-4 pt-0 text-sm leading-relaxed text-muted-foreground sm:px-5">
                      {f.a}
                    </div>
                  )}
                </li>
              );
            })
          )}
        </ul>
      </div>
    </section>
  );
}
