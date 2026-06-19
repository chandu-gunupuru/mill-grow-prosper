// Centralized helper for opening the Shopify checkout URL.
// Handles popup-blockers and the "force same tab" user preference.

const SAME_TAB_KEY = "checkout-open-in-same-tab";

export function getOpenInSameTab(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(SAME_TAB_KEY) === "1";
  } catch {
    return false;
  }
}

export function setOpenInSameTab(value: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SAME_TAB_KEY, value ? "1" : "0");
  } catch {
    /* ignore */
  }
}

export type OpenCheckoutResult =
  | { ok: true; mode: "new_tab" | "same_tab" }
  | { ok: false; reason: "missing_url" };

export interface OpenCheckoutOptions {
  forceSameTab?: boolean;
  // Injected for tests
  win?: Window;
}

export function openShopifyCheckout(
  url: string | null | undefined,
  opts: OpenCheckoutOptions = {},
): OpenCheckoutResult {
  if (!url) return { ok: false, reason: "missing_url" };

  const w = opts.win ?? (typeof window !== "undefined" ? window : undefined);
  if (!w) return { ok: false, reason: "missing_url" };

  const forceSameTab = opts.forceSameTab ?? getOpenInSameTab();

  if (forceSameTab) {
    w.location.href = url;
    return { ok: true, mode: "same_tab" };
  }

  const popup = w.open(url, "_blank");
  if (!popup || popup.closed) {
    // Popup blocked → fall back to same-tab navigation
    w.location.href = url;
    return { ok: true, mode: "same_tab" };
  }
  return { ok: true, mode: "new_tab" };
}
