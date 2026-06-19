import { supabase } from "@/integrations/supabase/client";

export type ProductClickEvent = "add_to_cart" | "buy_now";

const SESSION_KEY = "lov_session_id";

function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  try {
    let id = window.sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      window.sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return "no-storage";
  }
}

/**
 * Fire-and-forget: record a product button click. Never throws — analytics
 * failures must not block the user's checkout / add-to-cart flow.
 */
export async function logProductClick(
  eventType: ProductClickEvent,
  productId: string,
  variantId: string | null,
): Promise<void> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error } = await supabase.from("product_click_events").insert({
      event_type: eventType,
      product_id: productId,
      variant_id: variantId,
      session_id: getSessionId(),
      user_id: user?.id ?? null,
    });
    if (error) console.warn("analytics insert failed", error.message);
  } catch (e) {
    console.warn("analytics error", e);
  }
}
