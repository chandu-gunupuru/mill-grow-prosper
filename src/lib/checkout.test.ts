import { describe, it, expect, vi, beforeEach } from "vitest";
import { openShopifyCheckout, getOpenInSameTab, setOpenInSameTab } from "./checkout";

function makeWindow(opts: { popupBlocked?: boolean } = {}) {
  const location = { href: "" } as Location;
  const open = vi.fn(() => (opts.popupBlocked ? null : ({ closed: false } as Window)));
  return { location, open } as unknown as Window;
}

describe("openShopifyCheckout", () => {
  beforeEach(() => {
    if (typeof window !== "undefined") window.localStorage.clear();
  });

  it("returns missing_url when url is null/empty", () => {
    expect(openShopifyCheckout(null, { win: makeWindow() })).toEqual({
      ok: false,
      reason: "missing_url",
    });
    expect(openShopifyCheckout("", { win: makeWindow() })).toEqual({
      ok: false,
      reason: "missing_url",
    });
  });

  it("desktop: opens checkout in a new tab via window.open", () => {
    const win = makeWindow();
    const url = "https://shop.example.com/checkout/abc";
    const result = openShopifyCheckout(url, { win });
    expect(result).toEqual({ ok: true, mode: "new_tab" });
    expect(win.open).toHaveBeenCalledWith(url, "_blank");
    expect(win.location.href).toBe("");
  });

  it("mobile / strict popup blocker: falls back to same-tab navigation", () => {
    const win = makeWindow({ popupBlocked: true });
    const url = "https://shop.example.com/checkout/xyz";
    const result = openShopifyCheckout(url, { win });
    expect(result).toEqual({ ok: true, mode: "same_tab" });
    expect(win.open).toHaveBeenCalledWith(url, "_blank");
    expect(win.location.href).toBe(url);
  });

  it("respects the forceSameTab setting (skips window.open entirely)", () => {
    const win = makeWindow();
    const url = "https://shop.example.com/checkout/123";
    const result = openShopifyCheckout(url, { win, forceSameTab: true });
    expect(result).toEqual({ ok: true, mode: "same_tab" });
    expect(win.open).not.toHaveBeenCalled();
    expect(win.location.href).toBe(url);
  });

  it("reads the same-tab preference from localStorage when not explicitly passed", () => {
    setOpenInSameTab(true);
    expect(getOpenInSameTab()).toBe(true);
    const win = makeWindow();
    const url = "https://shop.example.com/checkout/pref";
    const result = openShopifyCheckout(url, { win });
    expect(result).toEqual({ ok: true, mode: "same_tab" });
    expect(win.open).not.toHaveBeenCalled();
    expect(win.location.href).toBe(url);
  });
});
