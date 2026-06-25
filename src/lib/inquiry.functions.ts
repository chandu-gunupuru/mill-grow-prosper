import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  company: z.string().trim().max(120).optional().default(""),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(5).max(30),
  product: z.string().trim().max(120),
  qty: z.string().trim().max(80).optional().default(""),
  message: z.string().trim().max(2000).optional().default(""),
});

const TO_EMAIL = "gunupuruchandu29@gmail.com";
const GMAIL_SEND_TIMEOUT_MS = 12000;
const GMAIL_MAX_ATTEMPTS = 3;
const GMAIL_RETRY_BASE_MS = 600;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function sendGmailWithRetry(
  body: string,
  headers: Record<string, string>,
): Promise<void> {
  let lastErr: unknown = null;
  for (let attempt = 1; attempt <= GMAIL_MAX_ATTEMPTS; attempt++) {
    const t = createTimeoutSignal(GMAIL_SEND_TIMEOUT_MS);
    try {
      const res = await fetch(
        "https://connector-gateway.lovable.dev/google_mail/gmail/v1/users/me/messages/send",
        { method: "POST", headers, body, signal: t.signal },
      );
      if (res.ok) return;
      const text = await res.text().catch(() => "");
      const retriable = res.status === 408 || res.status === 425 || res.status === 429 || res.status >= 500;
      console.error("Gmail send failed", { attempt, status: res.status, text, retriable });
      if (!retriable) throw new Error("Failed to send inquiry email.");
      lastErr = new Error(`Gmail HTTP ${res.status}`);
    } catch (err) {
      const name = (err as Error)?.name;
      const isAbort = name === "AbortError";
      const isNetwork = name === "TypeError" || name === "FetchError";
      if (!isAbort && !isNetwork && attempt > 1) {
        // Non-retriable error thrown above
        throw err;
      }
      console.error("Gmail send attempt error", { attempt, name, message: (err as Error)?.message });
      lastErr = err;
    } finally {
      t.clear();
    }
    if (attempt < GMAIL_MAX_ATTEMPTS) {
      const backoff = GMAIL_RETRY_BASE_MS * 2 ** (attempt - 1) + Math.floor(Math.random() * 200);
      await sleep(backoff);
    }
  }
  const msg = (lastErr as Error)?.name === "AbortError"
    ? "Email sending is taking too long. Please try again or use WhatsApp."
    : "We couldn't send your message right now. Please try again or use WhatsApp.";
  throw new Error(msg);
}

function encodeRfc2822Base64Url(raw: string) {
  const b64 =
    typeof Buffer !== "undefined"
      ? Buffer.from(raw, "utf-8").toString("base64")
      : btoa(unescape(encodeURIComponent(raw)));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function esc(s: string) {
  return s.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]!));
}

function createTimeoutSignal(ms: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  return {
    signal: controller.signal,
    clear: () => clearTimeout(timeout),
  };
}

// In-memory dedupe + per-email cooldown. Caveat: serverless workers are
// stateless across instances, so this is best-effort — it reliably stops
// the common case (rapid duplicate clicks hitting the same warm worker)
// without adding infra. A signed-in user repeating from another region
// would not be blocked here; the client-side cooldown covers that.
const DEDUPE_WINDOW_MS = 30_000;
const COOLDOWN_MS = 20_000;
const recentSubmissions = new Map<string, number>(); // hash -> ts
const lastByEmail = new Map<string, number>(); // email -> ts

function pruneExpired(map: Map<string, number>, ttl: number, now: number) {
  if (map.size < 200) return;
  for (const [k, t] of map) if (now - t > ttl) map.delete(k);
}

async function hashPayload(parts: string[]): Promise<string> {
  const data = new TextEncoder().encode(parts.join("|"));
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export const sendQuoteInquiry = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    const now = Date.now();
    const emailKey = data.email.trim().toLowerCase();

    const lastEmailAt = lastByEmail.get(emailKey);
    if (lastEmailAt && now - lastEmailAt < COOLDOWN_MS) {
      // Same email submitting again very quickly — accept silently so the
      // UI never shows a scary "please wait" error. The client already
      // enforces its own visible cooldown after a successful send.
      return { ok: true as const, throttled: true as const };
    }

    const dedupeHash = await hashPayload([
      emailKey,
      data.phone.trim(),
      data.product.trim(),
      (data.message || "").trim(),
    ]);
    const lastDup = recentSubmissions.get(dedupeHash);
    if (lastDup && now - lastDup < DEDUPE_WINDOW_MS) {
      // Same content already accepted moments ago — treat as success, do not resend.
      return { ok: true as const, deduped: true as const };
    }
    // Reserve the slot up front so concurrent duplicates collapse to one send.
    recentSubmissions.set(dedupeHash, now);
    lastByEmail.set(emailKey, now);
    pruneExpired(recentSubmissions, DEDUPE_WINDOW_MS, now);
    pruneExpired(lastByEmail, COOLDOWN_MS, now);

    const lovableKey = process.env.LOVABLE_API_KEY;
    const gmailKey = process.env.GOOGLE_MAIL_API_KEY;
    if (!lovableKey || !gmailKey) {
      throw new Error("Email service is not configured.");
    }

    const isHelp = data.product.startsWith("Help Center");
    const topic = isHelp ? data.product.replace(/^Help Center\s*—\s*/, "") : data.product;
    const subject = isHelp
      ? `Help Center Doubt — ${topic} (${data.name})`
      : `New Quote Request — ${data.product} (${data.name})`;
    const heading = isHelp ? "New Help Center Doubt" : "New Wholesale Quote Inquiry";
    const intro = isHelp
      ? "A customer submitted a doubt from the Help Center on the Gayathri Rice Mill website."
      : "You received a new inquiry from the Gayathri Rice Mill website.";

    const rows = isHelp
      ? `
        <tr><td><b>Name</b></td><td>${esc(data.name)}</td></tr>
        <tr><td><b>Email</b></td><td>${esc(data.email)}</td></tr>
        <tr><td><b>Phone</b></td><td>${esc(data.phone)}</td></tr>
        <tr><td><b>Topic</b></td><td>${esc(topic)}</td></tr>
        <tr><td valign="top"><b>Doubt / Message</b></td><td>${esc(data.message || "—").replace(/\n/g, "<br/>")}</td></tr>
        <tr><td><b>Submitted</b></td><td>${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</td></tr>
      `
      : `
        <tr><td><b>Name</b></td><td>${esc(data.name)}</td></tr>
        <tr><td><b>Company</b></td><td>${esc(data.company || "—")}</td></tr>
        <tr><td><b>Email</b></td><td>${esc(data.email)}</td></tr>
        <tr><td><b>Phone</b></td><td>${esc(data.phone)}</td></tr>
        <tr><td><b>Product</b></td><td>${esc(data.product)}</td></tr>
        <tr><td><b>Quantity</b></td><td>${esc(data.qty || "—")}</td></tr>
        <tr><td valign="top"><b>Message</b></td><td>${esc(data.message || "—").replace(/\n/g, "<br/>")}</td></tr>
      `;

    const html = `
      <h2>${heading}</h2>
      <p>${intro}</p>
      <table cellpadding="6" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">
        ${rows}
      </table>
    `.trim();

    const mime = [
      `To: ${TO_EMAIL}`,
      `Reply-To: ${data.name} <${data.email}>`,
      `Subject: ${subject}`,
      `MIME-Version: 1.0`,
      `Content-Type: text/html; charset="UTF-8"`,
      ``,
      html,
    ].join("\r\n");

    const raw = encodeRfc2822Base64Url(mime);

    const gmailSend = sendGmailWithRetry(JSON.stringify({ raw }), {
      "Content-Type": "application/json",
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": gmailKey,
    });

    // For Help Center: kick off the customer confirmation enqueue in parallel.
    // It's best-effort — never block the submit button on it.
    const confirmation =
      isHelp
        ? (async () => {
            try {
              const { sendHelpCenterConfirmation } = await import(
                "@/lib/email/send-help-center-confirmation.server"
              );
              await sendHelpCenterConfirmation({
                name: data.name,
                email: data.email,
                topic,
                message: data.message,
              });
            } catch (confirmErr) {
              console.error("Failed to enqueue help center confirmation email", confirmErr);
            }
          })()
        : Promise.resolve();

    // Await the primary Gmail send so we can surface failures to the user,
    // but race the confirmation against a short timeout so a slow queue
    // never holds the submit button.
    try {
      await gmailSend;
    } catch (err) {
      // Release the reservation so the user can retry immediately.
      recentSubmissions.delete(dedupeHash);
      lastByEmail.delete(emailKey);
      throw err;
    }
    await Promise.race([
      confirmation,
      new Promise<void>((resolve) => setTimeout(resolve, 600)),
    ]);

    return { ok: true as const };
  });
