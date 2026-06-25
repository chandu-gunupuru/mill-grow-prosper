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

export const sendQuoteInquiry = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
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

    const gmailSend = fetch(
      "https://connector-gateway.lovable.dev/google_mail/gmail/v1/users/me/messages/send",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${lovableKey}`,
          "X-Connection-Api-Key": gmailKey,
        },
        body: JSON.stringify({ raw }),
      },
    ).then(async (res) => {
      if (!res.ok) {
        const text = await res.text();
        console.error("Gmail send failed", res.status, text);
        throw new Error("Failed to send inquiry email.");
      }
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
    await gmailSend;
    await Promise.race([
      confirmation,
      new Promise<void>((resolve) => setTimeout(resolve, 600)),
    ]);

    return { ok: true as const };
  });
