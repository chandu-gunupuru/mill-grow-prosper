import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const SHOPIFY_API_VERSION = "2025-07";
const SHOP_DOMAIN = "golden-grain-gateway-3b1vm.myshopify.com";

export interface AdminOrder {
  id: number;
  name: string;
  createdAt: string;
  customerName: string;
  email: string | null;
  phone: string | null;
  total: string;
  currency: string;
  financialStatus: string | null;
  fulfillmentStatus: string | null;
  lineItems: Array<{ title: string; quantity: number; price: string }>;
}

/** Returns whether the signed-in user is an admin. */
export const checkIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (error) {
      console.error("checkIsAdmin failed", error);
      return { isAdmin: false };
    }
    return { isAdmin: !!data };
  });

/**
 * Bootstrap: lets the very first signed-in user claim admin.
 * The RPC raises if any admin already exists.
 */
export const claimFirstAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { error } = await context.supabase.rpc("claim_first_admin");
    if (error) {
      throw new Error(error.message || "Could not claim admin role.");
    }
    return { ok: true as const };
  });

/** Admin-only: fetch recent Shopify orders via Shopify Admin API. */
export const listShopifyOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    // Authorize
    const { data: adminRow, error: roleErr } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (roleErr || !adminRow) {
      throw new Error("Forbidden: admin role required.");
    }

    const token = process.env.SHOPIFY_ACCESS_TOKEN;
    if (!token) {
      throw new Error("Shopify admin token is not configured.");
    }

    const url =
      `https://${SHOP_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/orders.json` +
      `?status=any&limit=50&fields=id,name,created_at,email,phone,total_price,currency,financial_status,fulfillment_status,customer,line_items`;

    const res = await fetch(url, {
      headers: {
        "X-Shopify-Access-Token": token,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("Shopify Admin API error", res.status, body);
      throw new Error(
        res.status === 401 || res.status === 403
          ? "Shopify access token is invalid or missing permissions to read orders."
          : `Shopify Admin API error (${res.status}).`,
      );
    }

    const json = (await res.json()) as { orders?: Array<Record<string, unknown>> };
    const orders: AdminOrder[] = (json.orders ?? []).map((o) => {
      const customer = (o.customer ?? null) as
        | { first_name?: string; last_name?: string; email?: string }
        | null;
      const items = (o.line_items ?? []) as Array<{
        title: string;
        quantity: number;
        price: string;
      }>;
      return {
        id: Number(o.id),
        name: String(o.name ?? ""),
        createdAt: String(o.created_at ?? ""),
        customerName: customer
          ? `${customer.first_name ?? ""} ${customer.last_name ?? ""}`.trim() || "—"
          : "—",
        email: (o.email as string | null) ?? customer?.email ?? null,
        phone: (o.phone as string | null) ?? null,
        total: String(o.total_price ?? "0"),
        currency: String(o.currency ?? "INR"),
        financialStatus: (o.financial_status as string | null) ?? null,
        fulfillmentStatus: (o.fulfillment_status as string | null) ?? null,
        lineItems: items.map((li) => ({
          title: li.title,
          quantity: li.quantity,
          price: li.price,
        })),
      };
    });

    return { orders };
  });
