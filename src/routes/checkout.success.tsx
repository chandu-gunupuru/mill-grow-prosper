import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  CheckCircle2,
  Download,
  Home,
  Loader2,
  Package,
  Receipt,
  Truck,
  Clock,
  Mail,
  CreditCard,
} from "lucide-react";
import { listMyShopifyOrders } from "@/lib/orders.functions";
import {
  formatCurrency,
  formatDate,
  paymentLabel,
  estimatedDelivery,
} from "@/lib/orders";
import type { MyOrder } from "@/lib/orders";
import { downloadOrderInvoice } from "@/lib/order-invoice";
import { useAuth } from "@/hooks/useAuth";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/checkout/success")({
  ssr: false,
  component: CheckoutSuccessPage,
});

const PENDING_KEY = "checkout-pending-at";

function CheckoutSuccessPage() {
  const { user } = useAuth();
  const fetchOrders = useServerFn(listMyShopifyOrders);

  const [pendingAt] = useState<Date | null>(() => {
    try {
      const v = localStorage.getItem(PENDING_KEY);
      return v ? new Date(v) : null;
    } catch {
      return null;
    }
  });

  const [attempt, setAttempt] = useState(0);

  const ordersQuery = useQuery({
    queryKey: ["my-shopify-orders", "checkout-success", attempt],
    queryFn: () => fetchOrders(),
    enabled: !!user,
    refetchOnWindowFocus: false,
  });

  const order: MyOrder | null = useMemo(() => {
    if (!ordersQuery.data || !ordersQuery.data.orders) return null;
    const list = ordersQuery.data.orders;
    if (list.length === 0) return null;
    // Pick newest order created after pendingAt (minus 5 min slack); fall back to newest
    const cutoff = pendingAt ? pendingAt.getTime() - 5 * 60 * 1000 : 0;
    const sorted = [...list].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    const fresh = sorted.find((o) => new Date(o.createdAt).getTime() >= cutoff);
    return fresh ?? sorted[0] ?? null;
  }, [ordersQuery.data, pendingAt]);

  // Poll a few times if no fresh order yet (Shopify may take a few seconds)
  useEffect(() => {
    if (!user) return;
    if (!pendingAt) return;
    if (order && new Date(order.createdAt).getTime() >= pendingAt.getTime() - 5 * 60 * 1000) return;
    if (attempt >= 6) return;
    const t = window.setTimeout(() => setAttempt((a) => a + 1), 4000);
    return () => window.clearTimeout(t);
  }, [user, pendingAt, order, attempt]);

  // Clear the pending marker once we land here
  useEffect(() => {
    try {
      localStorage.removeItem(PENDING_KEY);
    } catch {/* noop */}
  }, []);

  const isFresh =
    order && pendingAt
      ? new Date(order.createdAt).getTime() >= pendingAt.getTime() - 5 * 60 * 1000
      : !!order;

  return (
    <div className="min-h-screen bg-cream text-foreground">
      <Toaster richColors position="top-right" />
      <main className="max-w-3xl mx-auto px-5 py-10">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
          className="bg-gradient-gold text-primary rounded-2xl p-8 text-center shadow-gold"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 240, damping: 14 }}
            className="w-20 h-20 rounded-full bg-white/30 grid place-items-center mx-auto mb-4 backdrop-blur"
          >
            <CheckCircle2 className="w-12 h-12" strokeWidth={2.5} />
          </motion.div>
          <h1 className="text-3xl font-extrabold tracking-tight">Payment Successful</h1>
          <p className="opacity-80 mt-2">Thank you for your purchase!</p>
        </motion.div>

        {/* Order details */}
        <div className="mt-6 bg-card border border-border rounded-xl p-6 space-y-5">
          {!user ? (
            <div className="text-center py-4">
              <p className="font-semibold">Sign in to view your order details</p>
              <p className="text-sm text-muted-foreground mt-1">
                Your order was placed via Shopify. Sign in to see the full receipt.
              </p>
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 mt-4 bg-primary text-primary-foreground px-4 py-2 rounded-md font-semibold hover:opacity-90"
              >
                Sign In
              </Link>
            </div>
          ) : ordersQuery.isLoading || (!order && attempt < 6) ? (
            <div className="flex items-center justify-center gap-3 py-6 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading your order details…</span>
            </div>
          ) : !order ? (
            <div className="text-center py-4">
              <p className="font-semibold">Your order is being confirmed</p>
              <p className="text-sm text-muted-foreground mt-1">
                It usually takes a few seconds. You can also check your inbox for the Shopify
                confirmation email.
              </p>
              <Link
                to="/orders"
                className="inline-flex items-center gap-2 mt-4 bg-primary text-primary-foreground px-4 py-2 rounded-md font-semibold hover:opacity-90"
              >
                <Package className="w-4 h-4" /> View My Orders
              </Link>
            </div>
          ) : (
            <>
              {!isFresh && (
                <div className="text-xs bg-secondary text-muted-foreground rounded-md px-3 py-2">
                  Showing your most recent order. If your new order isn't here yet, refresh in a
                  moment.
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <Field icon={<Receipt className="w-4 h-4" />} label="Order ID" value={order.name} />
                <Field
                  icon={<Clock className="w-4 h-4" />}
                  label="Date & Time"
                  value={formatDate(order.createdAt, {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                />
                <Field
                  icon={<CreditCard className="w-4 h-4" />}
                  label="Payment Method"
                  value={paymentLabel(order)}
                />
                <Field
                  icon={<Receipt className="w-4 h-4" />}
                  label="Transaction Ref"
                  value={`#${order.id}`}
                />
                <Field
                  icon={<Truck className="w-4 h-4" />}
                  label="Estimated Delivery"
                  value={formatDate(estimatedDelivery(order))}
                />
                <Field
                  icon={<CheckCircle2 className="w-4 h-4" />}
                  label="Amount Paid"
                  value={formatCurrency(order.total, order.currency)}
                  highlight
                />
              </div>

              <div className="border-t border-border pt-4">
                <p className="text-sm font-semibold mb-2">Items</p>
                <ul className="divide-y divide-border">
                  {order.lineItems.map((li) => (
                    <li key={li.id} className="py-2 flex gap-3 items-center">
                      {li.imageUrl ? (
                        <img
                          src={li.imageUrl}
                          alt={li.title}
                          className="w-12 h-12 object-cover rounded border border-border"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-secondary rounded" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{li.title}</p>
                        <p className="text-xs text-muted-foreground">Qty {li.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold">
                        {formatCurrency(li.totalPrice, order.currency)}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="text-xs text-muted-foreground flex items-center gap-2 pt-2 border-t border-border">
                <Mail className="w-3.5 h-3.5" />
                A confirmation email has been sent to your registered email.
              </div>

              <div className="grid sm:grid-cols-3 gap-2 pt-2">
                <button
                  onClick={() => downloadOrderInvoice(order)}
                  className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-3 py-2.5 rounded-md font-semibold hover:opacity-90"
                >
                  <Download className="w-4 h-4" /> Download Invoice
                </button>
                <Link
                  to="/orders"
                  className="inline-flex items-center justify-center gap-2 border border-border bg-background px-3 py-2.5 rounded-md font-semibold hover:bg-secondary"
                >
                  <Package className="w-4 h-4" /> View My Orders
                </Link>
                <Link
                  to="/"
                  className="inline-flex items-center justify-center gap-2 border border-border bg-background px-3 py-2.5 rounded-md font-semibold hover:bg-secondary"
                >
                  <Home className="w-4 h-4" /> Continue Shopping
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function Field({
  icon,
  label,
  value,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="bg-secondary/50 rounded-lg px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className={highlight ? "font-bold text-primary mt-1" : "font-semibold mt-0.5"}>
        {value}
      </p>
    </div>
  );
}
