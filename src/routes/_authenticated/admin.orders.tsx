import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ColorThemeSwitcher } from "@/components/ColorThemeSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Loader2,
  ShieldAlert,
  RefreshCw,
  ExternalLink,
  ArrowLeft,
  CheckCircle2,
  Package,
} from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import {
  checkIsAdmin,
  claimFirstAdmin,
  listShopifyOrders,
} from "@/lib/admin.functions";

const SHOPIFY_ADMIN_ORDER_URL =
  "https://admin.shopify.com/store/golden-grain-gateway-3b1vm/orders";

export const Route = createFileRoute("/_authenticated/admin/orders")({
  head: () => ({
    meta: [{ title: "Admin · Orders — Gayathri Rice Mill" }],
  }),
  component: AdminOrdersPage,
});

function AdminOrdersPage() {
  const checkAdminFn = useServerFn(checkIsAdmin);
  const listOrdersFn = useServerFn(listShopifyOrders);
  const claimFn = useServerFn(claimFirstAdmin);

  const adminQuery = useQuery({
    queryKey: ["is-admin"],
    queryFn: () => checkAdminFn(),
  });

  const isAdmin = adminQuery.data?.isAdmin === true;

  const ordersQuery = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => listOrdersFn(),
    enabled: isAdmin,
    staleTime: 30_000,
  });

  const claimMutation = useMutation({
    mutationFn: () => claimFn(),
    onSuccess: (res) => {
      if (res.ok) {
        toast.success("You're now an admin.");
        adminQuery.refetch();
      } else {
        toast.error(res.message);
      }
    },
    onError: (err: Error) => toast.error(err.message),
  });


  return (
    <div className="min-h-screen bg-background">
      <Toaster richColors position="top-center" />

      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="grid h-9 w-9 place-items-center rounded-md hover:bg-secondary"
              aria-label="Back to site"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">
                Admin
              </div>
              <h1 className="font-display text-xl font-bold text-primary">
                Orders & Payments
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                onClick={() => ordersQuery.refetch()}
                disabled={ordersQuery.isFetching}
                className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium hover:border-primary disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-4 w-4 ${ordersQuery.isFetching ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            )}
            <ColorThemeSwitcher />
<ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {adminQuery.isLoading ? (
          <CenterLoader label="Checking access…" />
        ) : !isAdmin ? (
          <NotAdmin
            onClaim={() => claimMutation.mutate()}
            claiming={claimMutation.isPending}
          />
        ) : ordersQuery.isLoading ? (
          <CenterLoader label="Loading orders from Shopify…" />
        ) : ordersQuery.isError ? (
          <ErrorBlock
            message={(ordersQuery.error as Error)?.message ?? "Failed to load orders."}
            onRetry={() => ordersQuery.refetch()}
          />
        ) : (ordersQuery.data?.orders ?? []).length === 0 ? (
          <EmptyState />
        ) : (
          <OrdersTable orders={ordersQuery.data!.orders} />
        )}
      </main>
    </div>
  );
}

function CenterLoader({ label }: { label: string }) {
  return (
    <div className="grid place-items-center py-24 text-muted-foreground">
      <Loader2 className="mb-3 h-6 w-6 animate-spin" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

function NotAdmin({ onClaim, claiming }: { onClaim: () => void; claiming: boolean }) {
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-border bg-card p-8 text-center shadow-premium">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-destructive/10 text-destructive">
        <ShieldAlert className="h-6 w-6" />
      </div>
      <h2 className="mt-4 text-xl font-bold text-primary">Admin access required</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Your account isn't an admin yet. If you're the first person setting this up,
        you can claim the admin role once. After that, only existing admins can grant
        the role.
      </p>
      <button
        onClick={onClaim}
        disabled={claiming}
        className="mt-6 inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
      >
        {claiming ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
        Claim first admin role
      </button>
    </div>
  );
}

function ErrorBlock({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-6">
      <h2 className="font-semibold text-destructive">Could not load orders</h2>
      <p className="mt-1 text-sm text-destructive/80">{message}</p>
      <button
        onClick={onRetry}
        className="mt-4 inline-flex items-center gap-2 rounded-md border border-destructive/40 bg-background px-4 py-2 text-sm font-medium hover:bg-destructive/10"
      >
        <RefreshCw className="h-4 w-4" /> Try again
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-border bg-card p-10 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-secondary">
        <Package className="h-6 w-6 text-muted-foreground" />
      </div>
      <h2 className="mt-4 font-bold text-primary">No orders yet</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Orders placed through Shopify checkout will appear here.
      </p>
    </div>
  );
}

function statusPill(status: string | null, kind: "payment" | "fulfillment") {
  if (!status) return "bg-secondary text-muted-foreground";
  const s = status.toLowerCase();
  if (kind === "payment") {
    if (s === "paid") return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300";
    if (s === "pending" || s === "authorized")
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300";
    if (s === "refunded" || s === "voided")
      return "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300";
    return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";
  }
  if (s === "fulfilled")
    return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300";
  if (s === "partial")
    return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300";
  return "bg-secondary text-muted-foreground";
}

function OrdersTable({
  orders,
}: {
  orders: Awaited<ReturnType<typeof listShopifyOrders>>["orders"];
}) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const toggle = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const fmtMoney = (amount: string, currency: string) => {
    const n = parseFloat(amount);
    const symbol = currency === "INR" ? "₹" : currency + " ";
    return `${symbol}${n.toFixed(2)}`;
  };
  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="hidden grid-cols-12 gap-3 border-b border-border bg-secondary/50 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground md:grid">
        <div className="col-span-2">Order</div>
        <div className="col-span-3">Customer</div>
        <div className="col-span-2">Date</div>
        <div className="col-span-2">Payment</div>
        <div className="col-span-2">Fulfillment</div>
        <div className="col-span-1 text-right">Total</div>
      </div>
      <ul className="divide-y divide-border">
        {orders.map((o) => {
          const isOpen = expanded.has(o.id);
          return (
            <li key={o.id} className="px-4 py-3">
              <button
                onClick={() => toggle(o.id)}
                className="grid w-full grid-cols-2 gap-3 text-left md:grid-cols-12 md:items-center"
              >
                <div className="md:col-span-2">
                  <div className="font-semibold text-primary">{o.name}</div>
                  <div className="text-xs text-muted-foreground md:hidden">
                    {fmtDate(o.createdAt)}
                  </div>
                </div>
                <div className="md:col-span-3">
                  <div className="font-medium">{o.customerName}</div>
                  {o.email && (
                    <div className="truncate text-xs text-muted-foreground">{o.email}</div>
                  )}
                </div>
                <div className="hidden text-sm text-muted-foreground md:col-span-2 md:block">
                  {fmtDate(o.createdAt)}
                </div>
                <div className="md:col-span-2">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusPill(o.financialStatus, "payment")}`}
                  >
                    {o.financialStatus ?? "—"}
                  </span>
                </div>
                <div className="md:col-span-2">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusPill(o.fulfillmentStatus, "fulfillment")}`}
                  >
                    {o.fulfillmentStatus ?? "unfulfilled"}
                  </span>
                </div>
                <div className="text-right font-bold text-primary md:col-span-1">
                  {fmtMoney(o.total, o.currency)}
                </div>
              </button>

              {isOpen && (
                <div className="mt-3 rounded-md bg-secondary/40 p-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Line items
                  </h4>
                  <ul className="mt-2 space-y-1 text-sm">
                    {o.lineItems.map((li, idx) => (
                      <li key={idx} className="flex justify-between gap-3">
                        <span>
                          {li.quantity}× {li.title}
                        </span>
                        <span className="text-muted-foreground">
                          {fmtMoney(li.price, o.currency)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    {o.phone && <span>📞 {o.phone}</span>}
                  </div>
                  <a
                    href={`${SHOPIFY_ADMIN_ORDER_URL}/${o.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-gold"
                  >
                    Manage in Shopify <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
