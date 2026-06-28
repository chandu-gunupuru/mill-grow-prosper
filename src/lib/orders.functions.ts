// Customer-scoped Shopify order server functions.
// All reads are authenticated and constrained to the signed-in user's email
// to prevent cross-customer order disclosure (IDOR).

import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { MyOrder, MyOrderAddress, MyOrderFulfillment } from "./orders";

const SHOPIFY_API_VERSION = "2025-07";
const SHOP_DOMAIN = "golden-grain-gateway-3b1vm.myshopify.com";

const ORDER_FIELDS = [
  "id",
  "name",
  "created_at",
  "cancelled_at",
  "email",
  "phone",
  "currency",
  "total_price",
  "subtotal_price",
  "total_tax",
  "total_shipping_price_set",
  "financial_status",
  "fulfillment_status",
  "payment_gateway_names",
  "note",
  "tax_lines",
  "shipping_address",
  "billing_address",
  "customer",
  "line_items",
  "fulfillments",
].join(",");

interface ShopifyAddressRaw {
  name?: string;
  phone?: string;
  address1?: string;
  address2?: string;
  city?: string;
  province?: string;
  zip?: string;
  country?: string;
}

function mapAddress(a: ShopifyAddressRaw | null | undefined): MyOrderAddress | null {
  if (!a) return null;
  return {
    name: a.name ?? null,
    phone: a.phone ?? null,
    address1: a.address1 ?? null,
    address2: a.address2 ?? null,
    city: a.city ?? null,
    province: a.province ?? null,
    zip: a.zip ?? null,
    country: a.country ?? null,
  };
}

interface ShopifyFulfillmentRaw {
  status?: string;
  shipment_status?: string;
  tracking_company?: string;
  tracking_number?: string;
  tracking_url?: string;
  estimated_delivery_at?: string;
}

function mapFulfillment(fs: ShopifyFulfillmentRaw[] | undefined): MyOrderFulfillment | null {
  if (!fs || fs.length === 0) return null;
  // Use most recent fulfillment for tracking
  const f = fs[fs.length - 1];
  return {
    status: f.status ?? null,
    shipmentStatus: f.shipment_status ?? null,
    trackingCompany: f.tracking_company ?? null,
    trackingNumber: f.tracking_number ?? null,
    trackingUrl: f.tracking_url ?? null,
    estimatedDeliveryAt: f.estimated_delivery_at ?? null,
  };
}

interface ShopifyOrderRaw {
  id: number;
  name?: string;
  created_at?: string;
  cancelled_at?: string | null;
  email?: string;
  currency?: string;
  total_price?: string;
  subtotal_price?: string;
  total_tax?: string;
  total_shipping_price_set?: { shop_money?: { amount?: string } };
  financial_status?: string | null;
  fulfillment_status?: string | null;
  payment_gateway_names?: string[];
  note?: string | null;
  tax_lines?: Array<{ title?: string; rate?: number; price?: string }>;
  shipping_address?: ShopifyAddressRaw | null;
  billing_address?: ShopifyAddressRaw | null;
  line_items?: Array<{
    id?: number;
    title?: string;
    variant_title?: string | null;
    quantity?: number;
    price?: string;
    product_id?: number | null;
    variant_id?: number | null;
  }>;
  fulfillments?: ShopifyFulfillmentRaw[];
}

function mapOrder(o: ShopifyOrderRaw, imagesByProductId: Map<number, string>): MyOrder {
  const items = o.line_items ?? [];
  const subtotal = o.subtotal_price ?? "0";
  const total = o.total_price ?? "0";
  const totalTax = o.total_tax ?? "0";
  const totalShipping = o.total_shipping_price_set?.shop_money?.amount ?? "0";

  return {
    id: Number(o.id),
    name: String(o.name ?? `#${o.id}`),
    createdAt: String(o.created_at ?? ""),
    cancelledAt: o.cancelled_at ?? null,
    financialStatus: o.financial_status ?? null,
    fulfillmentStatus: o.fulfillment_status ?? null,
    paymentGateways: Array.isArray(o.payment_gateway_names) ? o.payment_gateway_names : [],
    currency: String(o.currency ?? "INR"),
    subtotal: String(subtotal),
    totalTax: String(totalTax),
    totalShipping: String(totalShipping),
    total: String(total),
    note: o.note ?? null,
    taxLines: (o.tax_lines ?? []).map((t) => ({
      title: String(t.title ?? "Tax"),
      rate: Number(t.rate ?? 0),
      price: String(t.price ?? "0"),
    })),
    shippingAddress: mapAddress(o.shipping_address),
    billingAddress: mapAddress(o.billing_address),
    fulfillment: mapFulfillment(o.fulfillments),
    lineItems: items.map((li) => {
      const qty = Number(li.quantity ?? 1);
      const unit = parseFloat(String(li.price ?? "0"));
      return {
        id: Number(li.id ?? 0),
        title: String(li.title ?? "Item"),
        variantTitle: li.variant_title ?? null,
        quantity: qty,
        unitPrice: String(li.price ?? "0"),
        totalPrice: (qty * (Number.isFinite(unit) ? unit : 0)).toFixed(2),
        imageUrl: li.product_id ? imagesByProductId.get(li.product_id) ?? null : null,
        productId: li.product_id ?? null,
        variantId: li.variant_id ?? null,
      };
    }),
  };
}

async function shopifyAdmin(path: string): Promise<Response> {
  const token = process.env.SHOPIFY_ACCESS_TOKEN;
  if (!token) throw new Error("Shopify is not configured.");
  return fetch(`https://${SHOP_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}${path}`, {
    headers: {
      "X-Shopify-Access-Token": token,
      "Content-Type": "application/json",
    },
  });
}

/** Best-effort: fetch one image per product for thumbnails. Failures are ignored. */
async function fetchProductImages(productIds: number[]): Promise<Map<number, string>> {
  const out = new Map<number, string>();
  const ids = Array.from(new Set(productIds.filter(Boolean))).slice(0, 50);
  if (ids.length === 0) return out;
  try {
    const res = await shopifyAdmin(
      `/products.json?ids=${ids.join(",")}&fields=id,image`,
    );
    if (!res.ok) return out;
    const json = (await res.json()) as {
      products?: Array<{ id: number; image?: { src?: string } | null }>;
    };
    for (const p of json.products ?? []) {
      if (p.image?.src) out.set(Number(p.id), p.image.src);
    }
  } catch (err) {
    console.warn("fetchProductImages failed", err);
  }
  return out;
}

export const listMyShopifyOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const email = (context.claims?.email as string | undefined)?.trim().toLowerCase();
    if (!email) {
      return {
        orders: [] as MyOrder[],
        unauthenticatedEmail: true,
        unavailable: false as boolean,
        message: null as string | null,
      };
    }

    try {
      const res = await shopifyAdmin(
        `/orders.json?status=any&limit=50&email=${encodeURIComponent(email)}&fields=${ORDER_FIELDS}`,
      );

      if (!res.ok) {
        const body = await res.text();
        console.error("listMyShopifyOrders failed", res.status, body);
        return {
          orders: [] as MyOrder[],
          unauthenticatedEmail: false,
          unavailable: true,
          message:
            res.status === 401 || res.status === 403
              ? "Order history isn't available right now. Please try again later."
              : `Order service error (${res.status}).`,
        };
      }

      const json = (await res.json()) as { orders?: ShopifyOrderRaw[] };
      const raw = json.orders ?? [];
      const productIds = raw
        .flatMap((o) => o.line_items ?? [])
        .map((li) => li.product_id)
        .filter((id): id is number => typeof id === "number");
      const imagesByProductId = await fetchProductImages(productIds);

      const orders = raw.map((o) => mapOrder(o, imagesByProductId));
      return {
        orders,
        unauthenticatedEmail: false,
        unavailable: false,
        message: null,
      };
    } catch (err) {
      console.error("listMyShopifyOrders error", err);
      return {
        orders: [] as MyOrder[],
        unauthenticatedEmail: false,
        unavailable: true,
        message: "Could not load orders right now. Please try again later.",
      };
    }
  });

export const cancelMyShopifyOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { orderId: number }) => {
    if (!data || typeof data.orderId !== "number") throw new Error("orderId required");
    return data;
  })
  .handler(async ({ data, context }) => {
    const email = (context.claims?.email as string | undefined)?.trim().toLowerCase();
    if (!email) throw new Error("Sign in required.");

    // Re-verify ownership before cancelling to prevent IDOR.
    const lookupRes = await shopifyAdmin(
      `/orders/${data.orderId}.json?fields=id,email,fulfillment_status,cancelled_at`,
    );
    if (!lookupRes.ok) {
      throw new Error("Order not found.");
    }
    const lookup = (await lookupRes.json()) as {
      order?: {
        email?: string;
        fulfillment_status?: string | null;
        cancelled_at?: string | null;
      };
    };
    const order = lookup.order;
    if (!order || (order.email ?? "").toLowerCase() !== email) {
      throw new Error("You can't cancel this order.");
    }
    if (order.cancelled_at) {
      return { ok: true as const, alreadyCancelled: true };
    }
    if (order.fulfillment_status && order.fulfillment_status !== "unfulfilled") {
      throw new Error("This order has already shipped and can't be cancelled.");
    }

    const token = process.env.SHOPIFY_ACCESS_TOKEN!;
    const cancelRes = await fetch(
      `https://${SHOP_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/orders/${data.orderId}/cancel.json`,
      {
        method: "POST",
        headers: {
          "X-Shopify-Access-Token": token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: "customer" }),
      },
    );
    if (!cancelRes.ok) {
      const body = await cancelRes.text();
      console.error("cancel order failed", cancelRes.status, body);
      throw new Error("Could not cancel this order. Please contact support.");
    }
    return { ok: true as const, alreadyCancelled: false };
  });
