// Shared helpers for the customer-facing My Orders page.
// Keeps status derivation, formatting, and the timeline definition in one
// place so card / filters / timeline / summary all stay in sync.

export type MyOrderStatus =
  | "pending"
  | "processing"
  | "packed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export interface MyOrderLineItem {
  id: number;
  title: string;
  variantTitle: string | null;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  imageUrl: string | null;
  productId: number | null;
  variantId: number | null;
}

export interface MyOrderAddress {
  name: string | null;
  phone: string | null;
  address1: string | null;
  address2: string | null;
  city: string | null;
  province: string | null;
  zip: string | null;
  country: string | null;
}

export interface MyOrderFulfillment {
  status: string | null;
  shipmentStatus: string | null;
  trackingCompany: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  estimatedDeliveryAt: string | null;
}

export interface MyOrder {
  id: number;
  name: string; // e.g. #1024
  createdAt: string;
  cancelledAt: string | null;
  financialStatus: string | null;
  fulfillmentStatus: string | null;
  paymentGateways: string[];
  currency: string;
  subtotal: string;
  totalTax: string;
  totalShipping: string;
  total: string;
  note: string | null;
  taxLines: Array<{ title: string; rate: number; price: string }>;
  shippingAddress: MyOrderAddress | null;
  billingAddress: MyOrderAddress | null;
  fulfillment: MyOrderFulfillment | null;
  lineItems: MyOrderLineItem[];
}

export const TIMELINE_STEPS: { key: MyOrderStatus; label: string }[] = [
  { key: "pending", label: "Order Placed" },
  { key: "processing", label: "Confirmed" },
  { key: "packed", label: "Packed" },
  { key: "shipped", label: "Shipped" },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "delivered", label: "Delivered" },
];

/** Single source of truth for an order's display status. */
export function deriveOrderStatus(order: MyOrder): MyOrderStatus {
  if (order.cancelledAt) return "cancelled";
  const shipment = order.fulfillment?.shipmentStatus?.toLowerCase() ?? null;
  const fulfillment = (order.fulfillmentStatus ?? "").toLowerCase();
  const financial = (order.financialStatus ?? "").toLowerCase();

  if (fulfillment === "fulfilled" || shipment === "delivered") return "delivered";
  if (shipment === "out_for_delivery") return "out_for_delivery";
  if (shipment === "in_transit" || shipment === "ready_for_pickup") return "shipped";
  if (fulfillment === "partial") return "shipped";
  if (financial === "paid" || financial === "authorized") return "processing";
  return "pending";
}

export function statusLabel(status: MyOrderStatus): string {
  switch (status) {
    case "pending":
      return "Pending";
    case "processing":
      return "Processing";
    case "packed":
      return "Packed";
    case "shipped":
      return "Shipped";
    case "out_for_delivery":
      return "Out for Delivery";
    case "delivered":
      return "Delivered";
    case "cancelled":
      return "Cancelled";
  }
}

/** Index of the active step (last completed) in TIMELINE_STEPS. */
export function timelineProgress(status: MyOrderStatus): number {
  if (status === "cancelled") return -1;
  const idx = TIMELINE_STEPS.findIndex((s) => s.key === status);
  return idx < 0 ? 0 : idx;
}

export function paymentLabel(order: MyOrder): string {
  if (order.paymentGateways.length === 0) return "—";
  return order.paymentGateways
    .map((g) => g.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()))
    .join(", ");
}

export function paymentStatusLabel(order: MyOrder): string {
  const s = (order.financialStatus ?? "").toLowerCase();
  if (!s) return "Unknown";
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function estimatedDelivery(order: MyOrder): string {
  if (order.fulfillment?.estimatedDeliveryAt) return order.fulfillment.estimatedDeliveryAt;
  // Soft fallback: createdAt + 5 days
  const placed = new Date(order.createdAt);
  if (Number.isNaN(placed.getTime())) return "";
  const eta = new Date(placed.getTime() + 5 * 24 * 60 * 60 * 1000);
  return eta.toISOString();
}

export function formatCurrency(value: string | number, currency: string): string {
  const n = typeof value === "number" ? value : parseFloat(value);
  if (Number.isNaN(n)) return `${currency} —`;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency || "INR",
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `${currency} ${n.toFixed(2)}`;
  }
}

export function formatDate(value: string, opts: Intl.DateTimeFormatOptions = {}): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...opts,
  });
}
