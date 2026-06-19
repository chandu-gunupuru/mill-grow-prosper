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
  | { ok: false; reason: "missing_url" | "popup_blocked" };

export interface OpenCheckoutOptions {
  forceSameTab?: boolean;
  // Injected for tests
  win?: Window;
}

function tryOpenNewTab(url: string, w: Window): boolean {
  // Standard window.open
  const popup = w.open(url, "_blank", "noopener,noreferrer");
  if (popup && !popup.closed) return true;

  // Fallback: programmatic anchor click (often bypasses popup blockers in iframes)
  try {
    const doc = w.document;
    if (!doc || !doc.body) return false;
    const a = doc.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.style.position = "fixed";
    a.style.top = "0";
    a.style.left = "0";
    a.style.opacity = "0";
    a.style.pointerEvents = "none";
    doc.body.appendChild(a);
    a.click();
    doc.body.removeChild(a);
    return true;
  } catch {
    return false;
  }
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
    // If inside an iframe, try to navigate the top window so we break out of the frame.
    try {
      const top = w.top;
      if (top && top !== w) {
        top.location.href = url;
        return { ok: true, mode: "same_tab" };
      }
    } catch {
      // Cross-origin iframe — can't navigate top. Fall through to new-tab.
    }
    w.location.href = url;
    return { ok: true, mode: "same_tab" };
  }

  if (tryOpenNewTab(url, w)) {
    return { ok: true, mode: "new_tab" };
  }

  return { ok: false, reason: "popup_blocked" };
}
