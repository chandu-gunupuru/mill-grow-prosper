import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  Loader2,
  Lock,
  Shield,
  ShoppingBag,
  Smartphone,
  Landmark,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import {
  getOpenInSameTab,
  setOpenInSameTab,
  openShopifyCheckout,
} from "@/lib/checkout";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  ssr: false,
  component: CheckoutPage,
});

const PENDING_KEY = "checkout-pending-at";

interface PaymentMethod {
  id: string;
  label: string;
  sub: string;
  Icon: React.ComponentType<{ className?: string }>;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  { id: "upi", label: "UPI", sub: "Any UPI app", Icon: Smartphone },
  { id: "gpay", label: "Google Pay", sub: "Instant UPI", Icon: Smartphone },
  { id: "phonepe", label: "PhonePe", sub: "Instant UPI", Icon: Smartphone },
  { id: "paytm", label: "Paytm", sub: "Wallet & UPI", Icon: Smartphone },
  { id: "card", label: "Credit / Debit Card", sub: "Visa, Mastercard, RuPay", Icon: CreditCard },
  { id: "netbanking", label: "Net Banking", sub: "All major banks", Icon: Landmark },
];

function CheckoutPage() {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const isLoading = useCartStore((s) => s.isLoading);
  const isSyncing = useCartStore((s) => s.isSyncing);
  const getCheckoutUrl = useCartStore((s) => s.getCheckoutUrl);
  const syncCart = useCartStore((s) => s.syncCart);
  const setCheckoutError = useCartStore((s) => s.setCheckoutError);
  const checkoutError = useCartStore((s) => s.checkoutError);

  const [selectedMethod, setSelectedMethod] = useState<string>("upi");
  const [sameTab, setSameTab] = useState(false);
  const [paying, setPaying] = useState(false);
  const [pending, setPending] = useState(false);
  const [blockedUrl, setBlockedUrl] = useState<string | null>(null);
  const pollRef = useRef<number | null>(null);

  useEffect(() => {
    setSameTab(getOpenInSameTab());
    // Re-sync cart upon entry
    syncCart();
  }, [syncCart]);

  const subtotal = useMemo(
    () => items.reduce((n, i) => n + i.quantity * parseFloat(i.price.amount), 0),
    [items],
  );
  const currency = items[0]?.price.currencyCode || "INR";
  const fmt = (n: number) =>
    currency === "INR" ? `₹${n.toFixed(2)}` : `${currency} ${n.toFixed(2)}`;
  const totalQty = items.reduce((n, i) => n + i.quantity, 0);

  // Polling: while pending, watch for cart to clear (post-checkout sync clears it)
  useEffect(() => {
    if (!pending) return;
    pollRef.current = window.setInterval(() => {
      syncCart();
    }, 3500);
    const onFocus = () => syncCart();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [pending, syncCart]);

  // When cart empties while pending → assume success
  useEffect(() => {
    if (!pending) return;
    if (items.length === 0) {
      navigate({ to: "/checkout/success" });
    }
  }, [items.length, pending, navigate]);

  function handlePayNow() {
    setCheckoutError(null);
    setBlockedUrl(null);
    const url = getCheckoutUrl();
    if (!url) {
      toast.error("Your checkout link expired. Please re-open the cart.");
      return;
    }
    setPaying(true);
    try {
      localStorage.setItem(PENDING_KEY, new Date().toISOString());
    } catch {/* noop */}

    const result = openShopifyCheckout(url);
    if (!result.ok) {
      if (result.reason === "popup_blocked") {
        setBlockedUrl(url);
        toast.error("Your browser blocked the checkout window.");
      } else {
        toast.error("Could not open checkout. Please try again.");
      }
      setPaying(false);
      return;
    }
    setPending(true);
    setPaying(false);
  }

  function toggleSameTab(v: boolean) {
    setSameTab(v);
    setOpenInSameTab(v);
  }

  // Empty cart guard
  if (items.length === 0 && !pending) {
    return (
      <div className="min-h-screen bg-cream text-foreground">
        <Toaster richColors position="top-right" />
        <header className="bg-card border-b border-border">
          <div className="max-w-3xl mx-auto px-5 py-4 flex items-center gap-3">
            <Link to="/" className="w-9 h-9 grid place-items-center rounded-md hover:bg-secondary">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-lg font-bold">Checkout</h1>
          </div>
        </header>
        <main className="max-w-3xl mx-auto px-5 py-16">
          <div className="bg-card border border-border rounded-xl p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-secondary grid place-items-center mx-auto mb-4">
              <ShoppingBag className="w-7 h-7 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">
              Add some rice to your cart to start checkout.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-gradient-gold text-primary py-2.5 px-5 rounded-md font-semibold shadow-gold hover:scale-[1.01] transition"
            >
              Continue Shopping
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream text-foreground">
      <Toaster richColors position="top-right" />
      <header className="bg-card border-b border-border sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center gap-3">
          <Link to="/" className="w-9 h-9 grid place-items-center rounded-md hover:bg-secondary">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-bold">Secure Checkout</h1>
          <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
            <Lock className="w-3.5 h-3.5" />
            SSL Encrypted
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 py-8 grid lg:grid-cols-[1fr_380px] gap-8">
        {/* Left: methods + steps */}
        <section className="space-y-6">
          {/* Pending state */}
          <AnimatePresence>
            {pending && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-primary/5 border border-primary/30 rounded-xl p-5 flex items-start gap-4"
              >
                <Loader2 className="w-6 h-6 animate-spin text-primary mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-primary">Waiting for payment confirmation…</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Complete the payment in the Shopify checkout window. We'll redirect you to your
                    receipt automatically once it's confirmed.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <button
                      onClick={() => syncCart()}
                      className="inline-flex items-center gap-2 border border-border bg-card px-3 py-2 rounded-md text-sm font-medium hover:bg-secondary"
                    >
                      <RotateCcw className="w-4 h-4" /> Refresh status
                    </button>
                    <Link
                      to="/checkout/success"
                      className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-3 py-2 rounded-md text-sm font-medium hover:opacity-90"
                    >
                      I've completed payment
                    </Link>
                    <Link
                      to="/checkout/failed"
                      search={{ reason: null }}

                      className="inline-flex items-center gap-2 border border-destructive/40 text-destructive px-3 py-2 rounded-md text-sm font-medium hover:bg-destructive/5"
                    >
                      Payment failed
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Payment methods */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-1">
              <CreditCard className="w-5 h-5 text-primary" />
              <h2 className="font-bold">Payment Method</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              All methods are processed securely by Shopify Payments.
            </p>
            <div className="grid sm:grid-cols-2 gap-2.5">
              {PAYMENT_METHODS.map((m) => {
                const active = selectedMethod === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMethod(m.id)}
                    className={[
                      "flex items-center gap-3 text-left rounded-lg border px-4 py-3 transition",
                      active
                        ? "border-primary bg-primary/5 ring-1 ring-primary/40"
                        : "border-border bg-background hover:border-primary/40",
                    ].join(" ")}
                  >
                    <div
                      className={[
                        "w-9 h-9 rounded-md grid place-items-center shrink-0",
                        active ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground",
                      ].join(" ")}
                    >
                      <m.Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm leading-tight">{m.label}</p>
                      <p className="text-xs text-muted-foreground leading-tight">{m.sub}</p>
                    </div>
                    {active && <CheckCircle2 className="w-4 h-4 text-primary" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Shipping notice */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="font-bold mb-1">Shipping Address</h2>
            <p className="text-sm text-muted-foreground">
              You'll enter your shipping address in the next secure step. We deliver across India in
              3–7 business days.
            </p>
          </div>

          {/* Trust */}
          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className="bg-card border border-border rounded-lg p-3">
              <Shield className="w-5 h-5 mx-auto text-primary mb-1" />
              <p className="font-medium">PCI-DSS</p>
              <p className="text-muted-foreground">Secure</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-3">
              <Lock className="w-5 h-5 mx-auto text-primary mb-1" />
              <p className="font-medium">256-bit SSL</p>
              <p className="text-muted-foreground">Encrypted</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-3">
              <CheckCircle2 className="w-5 h-5 mx-auto text-primary mb-1" />
              <p className="font-medium">Verified</p>
              <p className="text-muted-foreground">Shopify</p>
            </div>
          </div>
        </section>

        {/* Right: summary */}
        <aside className="lg:sticky lg:top-24 self-start space-y-4">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-5 border-b border-border">
              <h2 className="font-bold">Order Summary</h2>
              <p className="text-xs text-muted-foreground">
                {totalQty} item{totalQty === 1 ? "" : "s"}
              </p>
            </div>
            <ul className="max-h-72 overflow-y-auto divide-y divide-border">
              {items.map((item) => {
                const title = item.product?.node?.title ?? "Item";
                const image =
                  item.product?.node?.images?.edges?.[0]?.node?.url ?? null;
                return (
                <li key={item.variantId} className="p-4 flex gap-3">
                  {image ? (
                    <img
                      src={image}
                      alt={title}
                      className="w-14 h-14 rounded-md object-cover border border-border"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-md bg-secondary" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm leading-tight truncate">{title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Qty {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold whitespace-nowrap">
                    {fmt(item.quantity * parseFloat(item.price.amount))}
                  </p>
                </li>
                );
              })}
            </ul>
            <div className="p-5 space-y-2 text-sm border-t border-border">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{fmt(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span>Calculated next</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-2 border-t border-border">
                <span>Total</span>
                <span className="text-primary">{fmt(subtotal)}</span>
              </div>
            </div>
          </div>

          {checkoutError && (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-lg p-3 flex gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{checkoutError}</span>
            </div>
          )}

          {blockedUrl ? (
            <a
              href={blockedUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setPending(true)}
              className="w-full inline-flex items-center justify-center gap-2 bg-gradient-gold text-primary py-3 rounded-md font-bold shadow-gold hover:scale-[1.01] transition"
            >
              <ExternalLink className="w-4 h-4" /> Click to Open Checkout
            </a>
          ) : (
            <button
              onClick={handlePayNow}
              disabled={paying || isLoading || isSyncing || pending}
              className="w-full inline-flex items-center justify-center gap-2 bg-gradient-gold text-primary py-3.5 rounded-md font-bold text-base shadow-gold hover:scale-[1.01] transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {paying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Opening secure checkout…
                </>
              ) : pending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Waiting for payment…
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" /> Pay Now · {fmt(subtotal)}
                </>
              )}
            </button>
          )}

          <label className="flex items-start gap-2 text-xs text-muted-foreground select-none cursor-pointer">
            <input
              type="checkbox"
              checked={sameTab}
              onChange={(e) => toggleSameTab(e.target.checked)}
              className="w-4 h-4 mt-0.5 accent-primary rounded"
            />
            <span>Open checkout in the same tab (use this if your browser blocks popups)</span>
          </label>

          <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
            By placing your order you agree to our terms. Payments are processed by Shopify with
            bank-grade security.
          </p>
        </aside>
      </main>
    </div>
  );
}
