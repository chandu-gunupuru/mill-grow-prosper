import { describe, it, expect, vi, beforeEach } from "vitest";
import { openShopifyCheckout, getOpenInSameTab, setOpenInSameTab } from "./checkout";

function makeWindow(opts: { popupBlocked?: boolean; noDocument?: boolean } = {}) {
  const location = { href: "" } as Location;
  const open = vi.fn(() => (opts.popupBlocked ? null : ({ closed: false } as Window)));

  const body = { appendChild: vi.fn(), removeChild: vi.fn() } as unknown as HTMLBodyElement;
  const document = opts.noDocument
    ? undefined
    : ({
        body,
        createElement: vi.fn(() => ({ click: vi.fn() } as unknown as HTMLAnchorElement)),
      } as unknown as Document);

  return { location, open, document, body } as unknown as Window;
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
    expect(win.open).toHaveBeenCalledWith(url, "_blank", "noopener,noreferrer");
    expect(win.location.href).toBe("");
  });

  it("popup blocked: falls back to anchor-click and returns new_tab when it succeeds", () => {
    const win = makeWindow({ popupBlocked: true });
    const url = "https://shop.example.com/checkout/xyz";
    const result = openShopifyCheckout(url, { win });
    expect(result).toEqual({ ok: true, mode: "new_tab" });
    expect(win.open).toHaveBeenCalledWith(url, "_blank", "noopener,noreferrer");
    expect(win.location.href).toBe("");
  });

  it("strict popup blocker (no document): returns popup_blocked", () => {
    const win = makeWindow({ popupBlocked: true, noDocument: true });
    const url = "https://shop.example.com/checkout/xyz";
    const result = openShopifyCheckout(url, { win });
    expect(result).toEqual({ ok: false, reason: "popup_blocked" });
    expect(win.open).toHaveBeenCalledWith(url, "_blank", "noopener,noreferrer");
    expect(win.location.href).toBe("");
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
