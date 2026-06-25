import { useEffect, useRef, useState } from "react";
import { MessageSquare, X, Send, Phone, Mail, MessageCircle } from "lucide-react";
import { HELP_FAQS } from "@/components/HelpFAQ";

type Msg = { role: "bot" | "user"; text: string; quick?: { label: string; value: string }[] };

type Props = {
  phone: string;
  email: string;
  waLink: string;
  telLink: string;
  mailLink: string;
};

const INITIAL_QUICK = [
  ...HELP_FAQS.slice(0, 5).map((f) => ({ label: f.q, value: `faq:${f.q}` })),
  { label: "Talk to a human", value: "human" },
];

export function LiveChatWidget({ phone, email, waLink, telLink, mailLink }: Props) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "bot",
      text: "Hi! I'm the Gayathri support bot. Pick a question below or type your own — I'll connect you with the team when needed.",
      quick: INITIAL_QUICK,
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  function answerFor(text: string): Msg {
    const t = text.toLowerCase();
    const hit = HELP_FAQS.find(
      (f) => f.q.toLowerCase() === t || t.includes(f.q.toLowerCase().split(" ")[0]),
    );
    if (hit) {
      return {
        role: "bot",
        text: hit.a,
        quick: [
          { label: "That helps, thanks!", value: "thanks" },
          { label: "Still need help", value: "human" },
        ],
      };
    }
    const keywordHit = HELP_FAQS.find((f) =>
      t.split(/\s+/).some((w) => w.length > 3 && f.q.toLowerCase().includes(w)),
    );
    if (keywordHit) {
      return {
        role: "bot",
        text: keywordHit.a,
        quick: [
          { label: "Helpful", value: "thanks" },
          { label: "Talk to a human", value: "human" },
        ],
      };
    }
    return {
      role: "bot",
      text: "I couldn't find a quick answer. The fastest way is to reach our team directly:",
      quick: [
        { label: "WhatsApp us", value: "wa" },
        { label: `Call ${phone}`, value: "call" },
        { label: "Email us", value: "mail" },
        { label: "Open the form", value: "form" },
      ],
    };
  }

  function pushUser(text: string) {
    setMessages((m) => [...m, { role: "user", text }]);
  }
  function pushBot(msg: Msg) {
    setTimeout(() => setMessages((m) => [...m, msg]), 250);
  }

  function handleQuick(value: string, label: string) {
    if (value.startsWith("faq:")) {
      const q = value.slice(4);
      pushUser(q);
      pushBot(answerFor(q));
      return;
    }
    if (value === "thanks") {
      pushUser(label);
      pushBot({
        role: "bot",
        text: "Glad I could help! Anything else?",
        quick: INITIAL_QUICK,
      });
      return;
    }
    if (value === "human") {
      pushUser(label);
      pushBot({
        role: "bot",
        text: "No problem — choose how you'd like to reach our team:",
        quick: [
          { label: "WhatsApp", value: "wa" },
          { label: "Call", value: "call" },
          { label: "Email", value: "mail" },
          { label: "Use the form", value: "form" },
        ],
      });
      return;
    }
    if (value === "wa") {
      const a = document.createElement("a");
      a.href = waLink;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      a.remove();
      pushUser(label);
      pushBot({ role: "bot", text: "Opening WhatsApp…" });
      return;
    }
    if (value === "call") {
      window.location.href = telLink;
      pushUser(label);
      return;
    }
    if (value === "mail") {
      window.location.href = mailLink;
      pushUser(label);
      return;
    }
    if (value === "form") {
      setOpen(false);
      document
        .getElementById("help-form")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput("");
    pushUser(text);
    pushBot(answerFor(text));
  }

  return (
    <>
      {/* Floating launcher */}
      <button
        type="button"
        aria-label={open ? "Close live chat" : "Open live chat"}
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg ring-1 ring-primary/30 transition hover:scale-105 sm:bottom-6 sm:right-6"
      >
        {open ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-3 z-40 flex h-[min(560px,80vh)] w-[min(380px,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl sm:right-6">
          <header className="flex items-center justify-between gap-3 border-b border-border bg-gradient-to-br from-primary/10 to-card px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground">
                <MessageSquare className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-primary">Live support</div>
                <div className="text-[11px] text-muted-foreground">
                  Typically replies in a few minutes
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="grid h-8 w-8 place-items-center rounded-md hover:bg-secondary"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-background/50 px-3 py-4">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed shadow-sm ${
                    m.role === "user"
                      ? "rounded-br-sm bg-primary text-primary-foreground"
                      : "rounded-bl-sm border border-border bg-card text-foreground"
                  }`}
                >
                  {m.text}
                  {m.quick && m.quick.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {m.quick.map((q) => (
                        <button
                          key={q.value + q.label}
                          type="button"
                          onClick={() => handleQuick(q.value, q.label)}
                          className="rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium text-primary hover:border-primary hover:bg-primary/5"
                        >
                          {q.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-border bg-card px-3 pb-2 pt-2">
            <div className="mb-2 flex items-center justify-around gap-1">
              <a
                href={telLink}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-[11px] font-medium text-muted-foreground hover:bg-secondary hover:text-primary"
              >
                <Phone className="h-3.5 w-3.5" /> Call
              </a>
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-[11px] font-medium text-muted-foreground hover:bg-secondary hover:text-primary"
              >
                <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
              </a>
              <a
                href={mailLink}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-[11px] font-medium text-muted-foreground hover:bg-secondary hover:text-primary"
              >
                <Mail className="h-3.5 w-3.5" /> Email
              </a>
            </div>
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your question…"
                className="flex-1 rounded-full border border-border bg-background px-3.5 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="submit"
                aria-label="Send"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground hover:opacity-90"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
            <p className="mt-1 text-center text-[10px] text-muted-foreground">
              Bot answers common questions • Reach a human anytime above
            </p>
          </div>
        </div>
      )}
    </>
  );
}
