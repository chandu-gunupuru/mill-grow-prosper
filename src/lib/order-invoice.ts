// Client-side PDF invoice generator. Kept tiny on purpose.
import jsPDF from "jspdf";
import type { MyOrder } from "./orders";
import { formatCurrency, formatDate, paymentLabel, paymentStatusLabel } from "./orders";

export function downloadOrderInvoice(order: MyOrder): void {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  let y = margin;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Gayathri Modern Rice Mill", margin, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  y += 16;
  doc.text("Tax Invoice", margin, y);

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(`Order ${order.name}`, pageWidth - margin, margin, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Placed: ${formatDate(order.createdAt)}`, pageWidth - margin, margin + 14, { align: "right" });

  y += 30;
  doc.setDrawColor(200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 18;

  doc.setFont("helvetica", "bold");
  doc.text("Bill to", margin, y);
  doc.setFont("helvetica", "normal");
  const a = order.billingAddress ?? order.shippingAddress;
  const lines = [
    a?.name,
    a?.address1,
    a?.address2,
    [a?.city, a?.province, a?.zip].filter(Boolean).join(", "),
    a?.country,
    a?.phone,
  ].filter(Boolean) as string[];
  y += 14;
  for (const line of lines) {
    doc.text(line, margin, y);
    y += 12;
  }

  y += 10;
  doc.setFont("helvetica", "bold");
  doc.text("Item", margin, y);
  doc.text("Qty", pageWidth - margin - 180, y, { align: "right" });
  doc.text("Unit", pageWidth - margin - 100, y, { align: "right" });
  doc.text("Total", pageWidth - margin, y, { align: "right" });
  doc.setFont("helvetica", "normal");
  y += 6;
  doc.line(margin, y, pageWidth - margin, y);
  y += 12;

  for (const li of order.lineItems) {
    if (y > 740) {
      doc.addPage();
      y = margin;
    }
    const title = li.variantTitle ? `${li.title} — ${li.variantTitle}` : li.title;
    const wrapped = doc.splitTextToSize(title, pageWidth - margin * 2 - 200) as string[];
    doc.text(wrapped, margin, y);
    doc.text(String(li.quantity), pageWidth - margin - 180, y, { align: "right" });
    doc.text(formatCurrency(li.unitPrice, order.currency), pageWidth - margin - 100, y, { align: "right" });
    doc.text(formatCurrency(li.totalPrice, order.currency), pageWidth - margin, y, { align: "right" });
    y += wrapped.length * 12 + 4;
  }

  y += 8;
  doc.line(margin, y, pageWidth - margin, y);
  y += 16;

  const row = (label: string, value: string, bold = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.text(label, pageWidth - margin - 120, y, { align: "right" });
    doc.text(value, pageWidth - margin, y, { align: "right" });
    y += 14;
  };
  row("Subtotal", formatCurrency(order.subtotal, order.currency));
  if (parseFloat(order.totalShipping) > 0)
    row("Shipping", formatCurrency(order.totalShipping, order.currency));
  for (const t of order.taxLines) {
    row(`${t.title}${t.rate ? ` (${(t.rate * 100).toFixed(2)}%)` : ""}`, formatCurrency(t.price, order.currency));
  }
  row("Total", formatCurrency(order.total, order.currency), true);

  y += 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Payment: ${paymentLabel(order)} — ${paymentStatusLabel(order)}`, margin, y);

  doc.save(`invoice-${order.name.replace(/[^a-z0-9-]/gi, "")}.pdf`);
}
