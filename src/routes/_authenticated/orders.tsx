import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronRight,
  CircleDashed,
  Download,
  FileText,
  Loader2,
  MapPin,
  Package,
  PackageCheck,
  RefreshCw,
  RotateCcw,
  Search,
  ShoppingBag,
  Truck,
  XCircle,
} from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  cancelMyShopifyOrder,
  listMyShopifyOrders,
} from "@/lib/orders.functions";
import {
  TIMELINE_STEPS,
  deriveOrderStatus,
  estimatedDelivery,
  formatCurrency,
  formatDate,
  paymentLabel,
  paymentStatusLabel,
  statusLabel,
  timelineProgress,
  type MyOrder,
  type MyOrderStatus,
} from "@/lib/orders";
import { downloadOrderInvoice } from "@/lib/order-invoice";

export const Route = createFileRoute("/_authenticated/orders")({
  head: () => ({
    meta: [
      { title: "My Orders — Gayathri Modern Rice Mill" },
      {
        name: "description",
        content:
          "Track, manage, and review all your rice orders from Gayathri Modern Rice Mill in one place.",
      },
    ],
  }),
  component: MyOrdersPage,
});

type FilterKey = "all" | "pending" | "processing" | "shipped" | "delivered" | "cancelled";
type SortKey = "newest" | "oldest" | "highest" | "lowest";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

function MyOrdersPage() {
  const listFn = useServerFn(listMyShopifyOrders);
  const cancelFn = useServerFn(cancelMyShopifyOrder);
  const qc = useQueryClient();

  const ordersQuery = useQuery({
    queryKey: ["my-orders"],
    queryFn: () => listFn(),
    staleTime: 30_000,
  });

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [detailsOrder, setDetailsOrder] = useState<MyOrder | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<number | null>(null);

  const orders = ordersQuery.data?.orders ?? [];

  const filtered = useMemo(() => {
    let list = [...orders];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (o) =>
          o.name.toLowerCase().includes(q) ||
          String(o.id).includes(q) ||
          o.lineItems.some((li) => li.title.toLowerCase().includes(q)),
      );
    }
    if (filter !== "all") {
      list = list.filter((o) => {
        const s = deriveOrderStatus(o);
        if (filter === "shipped") return s === "shipped" || s === "out_for_delivery" || s === "packed";
        if (filter === "processing") return s === "processing";
        return s === filter;
      });
    }
    list.sort((a, b) => {
      if (sort === "newest") return +new Date(b.createdAt) - +new Date(a.createdAt);
      if (sort === "oldest") return +new Date(a.createdAt) - +new Date(b.createdAt);
      if (sort === "highest") return parseFloat(b.total) - parseFloat(a.total);
      return parseFloat(a.total) - parseFloat(b.total);
    });
    return list;
  }, [orders, search, filter, sort]);

  const stats = useMemo(() => {
    const s = { total: 0, active: 0, pending: 0, delivered: 0, cancelled: 0, spent: 0 };
    for (const o of orders) {
      s.total += 1;
      const st = deriveOrderStatus(o);
      if (st === "delivered") s.delivered += 1;
      else if (st === "cancelled") s.cancelled += 1;
      else {
        s.active += 1;
        if (st === "pending") s.pending += 1;
      }
      if (st !== "cancelled") s.spent += parseFloat(o.total) || 0;
    }
    return s;
  }, [orders]);

  const currency = orders[0]?.currency ?? "INR";

  const cancelMutation = useMutation({
    mutationFn: (orderId: number) => cancelFn({ data: { orderId } }),
    onSuccess: (res) => {
      if (res.alreadyCancelled) toast.info("Order was already cancelled.");
      else toast.success("Order cancelled.");
      void qc.invalidateQueries({ queryKey: ["my-orders"] });
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : "Could not cancel the order.");
    },
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster richColors closeButton position="top-center" />

      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur bg-background/85 border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition"
          >
            <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Home</span>
          </Link>
          <div className="ml-2 min-w-0">
            <h1 className="text-lg sm:text-2xl font-bold tracking-tight truncate">My Orders</h1>
            <p className="hidden sm:block text-xs text-muted-foreground">
              Track, manage, and review every order in one place.
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => ordersQuery.refetch()}
              aria-label="Refresh orders"
            >
              <RefreshCw className={`w-4 h-4 ${ordersQuery.isFetching ? "animate-spin" : ""}`} />
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Summary */}
        <SummaryCards loading={ordersQuery.isLoading} stats={stats} currency={currency} />

        {/* Filters */}
        <div className="rounded-2xl border border-border bg-card/60 backdrop-blur p-3 sm:p-4 shadow-sm">
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 sm:grid-cols-[minmax(0,1fr)_180px]">
              <div className="relative min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search order ID or product"
                  className="pl-9"
                  aria-label="Search orders"
                />
              </div>
              <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
                <SelectTrigger aria-label="Sort orders">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest first</SelectItem>
                  <SelectItem value="oldest">Oldest first</SelectItem>
                  <SelectItem value="highest">Highest amount</SelectItem>
                  <SelectItem value="lowest">Lowest amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {FILTERS.map((f) => {
                const active = filter === f.key;
                return (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition border ${
                      active
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-background border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
                    }`}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Body */}
        {ordersQuery.isLoading ? (
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <OrderSkeleton key={i} />
            ))}
          </div>
        ) : ordersQuery.isError ? (
          <ErrorState onRetry={() => ordersQuery.refetch()} message={(ordersQuery.error as Error)?.message} />
        ) : orders.length === 0 ? (
          <EmptyState />
        ) : filtered.length === 0 ? (
          <NoMatchState onReset={() => { setSearch(""); setFilter("all"); }} />
        ) : (
          <ul className="space-y-4">
            <AnimatePresence initial={false}>
              {filtered.map((o, idx) => (
                <motion.li
                  key={o.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, delay: Math.min(idx * 0.04, 0.2) }}
                >
                  <OrderCard
                    order={o}
                    onDetails={() => setDetailsOrder(o)}
                    onCancel={() => setConfirmCancelId(o.id)}
                  />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </main>

      <OrderDetailsSheet
        order={detailsOrder}
        onClose={() => setDetailsOrder(null)}
      />

      <AlertDialog
        open={confirmCancelId !== null}
        onOpenChange={(open) => !open && setConfirmCancelId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
            <AlertDialogDescription>
              This will request cancellation with our team. If the order has already shipped it can't be cancelled here — contact support instead.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelMutation.isPending}>Keep order</AlertDialogCancel>
            <AlertDialogAction
              disabled={cancelMutation.isPending}
              onClick={() => {
                if (confirmCancelId != null) {
                  cancelMutation.mutate(confirmCancelId, {
                    onSettled: () => setConfirmCancelId(null),
                  });
                }
              }}
            >
              {cancelMutation.isPending ? "Cancelling…" : "Cancel order"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* -------------------------------- Summary -------------------------------- */

function SummaryCards({
  loading,
  stats,
  currency,
}: {
  loading: boolean;
  stats: { total: number; active: number; pending: number; delivered: number; cancelled: number; spent: number };
  currency: string;
}) {
  const cards = [
    { label: "Total Orders", value: stats.total, icon: ShoppingBag, tone: "primary" },
    { label: "Active", value: stats.active, icon: Truck, tone: "info" },
    { label: "Pending", value: stats.pending, icon: CircleDashed, tone: "warn" },
    { label: "Delivered", value: stats.delivered, icon: PackageCheck, tone: "success" },
    { label: "Cancelled", value: stats.cancelled, icon: XCircle, tone: "muted" },
    {
      label: "Total Spent",
      value: formatCurrency(stats.spent, currency),
      icon: FileText,
      tone: "primary",
      money: true,
    },
  ] as const;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      {cards.map((c, i) => (
        <motion.div
          key={c.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: i * 0.04 }}
          className="rounded-2xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">{c.label}</span>
            <span className="grid place-items-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
              <c.icon className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold tabular-nums">
            {loading ? <Skeleton className="h-7 w-16" /> : c.value}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* -------------------------------- Card ---------------------------------- */

function statusBadgeClasses(status: MyOrderStatus): string {
  switch (status) {
    case "delivered":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30";
    case "cancelled":
      return "bg-destructive/10 text-destructive border-destructive/30";
    case "shipped":
    case "out_for_delivery":
    case "packed":
      return "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30";
    case "processing":
      return "bg-primary/10 text-primary border-primary/30";
    default:
      return "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30";
  }
}

function OrderCard({
  order,
  onDetails,
  onCancel,
}: {
  order: MyOrder;
  onDetails: () => void;
  onCancel: () => void;
}) {
  const status = deriveOrderStatus(order);
  const first = order.lineItems[0];
  const more = order.lineItems.length - 1;
  const fulfillment = order.fulfillment;
  const canCancel =
    status !== "cancelled" &&
    status !== "delivered" &&
    (!order.fulfillmentStatus || order.fulfillmentStatus === "unfulfilled");
  const eta = estimatedDelivery(order);

  return (
    <article className="rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-all overflow-hidden">
      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="font-mono font-semibold text-foreground">{order.name}</span>
          <span className="inline-flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> {formatDate(order.createdAt)}
          </span>
          <span className={`ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold ${statusBadgeClasses(status)}`}>
            <Package className="w-3 h-3" /> {statusLabel(status)}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-[64px_minmax(0,1fr)] sm:grid-cols-[80px_minmax(0,1fr)_auto] gap-3 sm:gap-4 items-start">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-muted overflow-hidden grid place-items-center shrink-0">
            {first?.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={first.imageUrl} alt={first.title} className="w-full h-full object-cover" loading="lazy" />
            ) : (
              <Package className="w-7 h-7 text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-semibold leading-tight line-clamp-2">
              {first?.title ?? "Order"}
            </h2>
            {first?.variantTitle && (
              <p className="text-xs text-muted-foreground mt-0.5">{first.variantTitle}</p>
            )}
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span>
                Qty <span className="text-foreground font-medium">{first?.quantity ?? 1}</span>
              </span>
              <span>
                Unit{" "}
                <span className="text-foreground font-medium">
                  {first ? formatCurrency(first.unitPrice, order.currency) : "—"}
                </span>
              </span>
              {more > 0 && <span>+{more} more item{more > 1 ? "s" : ""}</span>}
            </div>
          </div>
          <div className="col-span-2 sm:col-span-1 sm:text-right">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Total</div>
            <div className="text-lg sm:text-xl font-bold text-foreground">
              {formatCurrency(order.total, order.currency)}
            </div>
            <div className="text-[11px] text-muted-foreground">
              {paymentLabel(order)} · {paymentStatusLabel(order)}
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="mt-5">
          <OrderTimeline status={status} />
          {status !== "cancelled" && eta && (
            <p className="mt-2 text-xs text-muted-foreground">
              {status === "delivered" ? "Delivered on " : "Estimated delivery "}
              <span className="text-foreground font-medium">{formatDate(eta)}</span>
              {fulfillment?.trackingCompany && (
                <> · via <span className="text-foreground font-medium">{fulfillment.trackingCompany}</span></>
              )}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="mt-5 flex flex-wrap gap-2">
          <Button size="sm" variant="default" onClick={onDetails}>
            View details <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </Button>
          {fulfillment?.trackingUrl ? (
            <Button asChild size="sm" variant="outline">
              <a href={fulfillment.trackingUrl} target="_blank" rel="noopener noreferrer">
                <Truck className="w-3.5 h-3.5 mr-1.5" /> Track
              </a>
            </Button>
          ) : (
            <Button size="sm" variant="outline" disabled>
              <Truck className="w-3.5 h-3.5 mr-1.5" /> Track
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={() => downloadOrderInvoice(order)}>
            <Download className="w-3.5 h-3.5 mr-1.5" /> Invoice
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link to="/" hash="products">
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Reorder
            </Link>
          </Button>
          {canCancel && (
            <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={onCancel}>
              <XCircle className="w-3.5 h-3.5 mr-1.5" /> Cancel
            </Button>
          )}
          {status === "delivered" && (
            <Button asChild size="sm" variant="ghost">
              <Link
                to="/help"
                search={{ topic: "Return / Refund", orderId: order.name } as never}
              >
                Return / refund
              </Link>
            </Button>
          )}
          <Button asChild size="sm" variant="ghost" className="ml-auto">
            <Link to="/help">Contact support</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}

/* ------------------------------- Timeline ------------------------------- */

function OrderTimeline({ status }: { status: MyOrderStatus }) {
  if (status === "cancelled") {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
        This order was cancelled.
      </div>
    );
  }
  const active = timelineProgress(status);
  return (
    <ol className="flex items-center gap-1 overflow-x-auto pb-1" aria-label="Order progress">
      {TIMELINE_STEPS.map((s, i) => {
        const done = i <= active;
        const isLast = i === TIMELINE_STEPS.length - 1;
        return (
          <li key={s.key} className="flex items-center gap-1 shrink-0">
            <div className="flex flex-col items-center text-center w-16 sm:w-20">
              <span
                className={`w-6 h-6 grid place-items-center rounded-full border text-[10px] font-semibold transition ${
                  done
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border"
                }`}
              >
                {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
              </span>
              <span className={`mt-1 text-[10px] leading-tight ${done ? "text-foreground" : "text-muted-foreground"}`}>
                {s.label}
              </span>
            </div>
            {!isLast && (
              <span
                className={`h-0.5 w-4 sm:w-6 rounded-full ${i < active ? "bg-primary" : "bg-border"}`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

/* ----------------------------- Details Sheet ---------------------------- */

function OrderDetailsSheet({ order, onClose }: { order: MyOrder | null; onClose: () => void }) {
  return (
    <Sheet open={!!order} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-xl flex flex-col p-0">
        {order && (
          <>
            <SheetHeader className="px-5 py-4 border-b border-border shrink-0">
              <SheetTitle className="font-mono">{order.name}</SheetTitle>
              <SheetDescription>
                Placed {formatDate(order.createdAt)} · {statusLabel(deriveOrderStatus(order))}
              </SheetDescription>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Items
                </h3>
                <ul className="space-y-3">
                  {order.lineItems.map((li) => (
                    <li key={li.id} className="flex gap-3">
                      <div className="w-14 h-14 rounded-lg bg-muted overflow-hidden grid place-items-center shrink-0">
                        {li.imageUrl ? (
                          <img src={li.imageUrl} alt={li.title} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <Package className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium leading-tight">{li.title}</div>
                        {li.variantTitle && (
                          <div className="text-xs text-muted-foreground">{li.variantTitle}</div>
                        )}
                        <div className="text-xs text-muted-foreground mt-0.5">
                          Qty {li.quantity} · {formatCurrency(li.unitPrice, order.currency)} each
                        </div>
                      </div>
                      <div className="text-sm font-semibold tabular-nums">
                        {formatCurrency(li.totalPrice, order.currency)}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="grid sm:grid-cols-2 gap-4">
                {order.shippingAddress && (
                  <AddressBlock title="Shipping address" address={order.shippingAddress} />
                )}
                {order.billingAddress && (
                  <AddressBlock title="Billing address" address={order.billingAddress} />
                )}
              </section>

              {(order.fulfillment?.trackingCompany || order.fulfillment?.trackingNumber) && (
                <section className="rounded-xl border border-border bg-muted/30 p-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                    Delivery
                  </h3>
                  <div className="text-sm">
                    Partner:{" "}
                    <span className="font-medium">{order.fulfillment?.trackingCompany ?? "—"}</span>
                  </div>
                  <div className="text-sm">
                    Tracking #:{" "}
                    <span className="font-mono">{order.fulfillment?.trackingNumber ?? "—"}</span>
                  </div>
                  {order.fulfillment?.trackingUrl && (
                    <a
                      href={order.fulfillment.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-1"
                    >
                      Track shipment <ChevronRight className="w-3 h-3" />
                    </a>
                  )}
                </section>
              )}

              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Payment
                </h3>
                <div className="rounded-xl border border-border p-3 text-sm space-y-1">
                  <div className="flex justify-between"><span className="text-muted-foreground">Method</span><span>{paymentLabel(order)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span>{paymentStatusLabel(order)}</span></div>
                </div>
              </section>

              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Price breakdown
                </h3>
                <div className="rounded-xl border border-border p-3 text-sm space-y-1">
                  <Row label="Subtotal" value={formatCurrency(order.subtotal, order.currency)} />
                  {parseFloat(order.totalShipping) > 0 && (
                    <Row label="Shipping" value={formatCurrency(order.totalShipping, order.currency)} />
                  )}
                  {order.taxLines.length > 0 ? (
                    order.taxLines.map((t, i) => (
                      <Row
                        key={i}
                        label={`${t.title}${t.rate ? ` (${(t.rate * 100).toFixed(2)}%)` : ""}`}
                        value={formatCurrency(t.price, order.currency)}
                      />
                    ))
                  ) : parseFloat(order.totalTax) > 0 ? (
                    <Row label="Tax" value={formatCurrency(order.totalTax, order.currency)} />
                  ) : null}
                  <div className="border-t border-border my-1" />
                  <Row label="Total" value={formatCurrency(order.total, order.currency)} bold />
                </div>
              </section>

              {order.note && (
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                    Notes
                  </h3>
                  <p className="text-sm rounded-xl border border-border p-3 whitespace-pre-wrap">{order.note}</p>
                </section>
              )}

              <div className="flex flex-wrap gap-2 pt-2 pb-6">
                <Button size="sm" onClick={() => downloadOrderInvoice(order)}>
                  <Download className="w-3.5 h-3.5 mr-1.5" /> Download invoice
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link to="/help">Contact support</Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "font-semibold text-base" : ""}`}>
      <span className={bold ? "" : "text-muted-foreground"}>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

function AddressBlock({ title, address }: { title: string; address: NonNullable<MyOrder["shippingAddress"]> }) {
  return (
    <div className="rounded-xl border border-border p-3">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1 mb-1">
        <MapPin className="w-3 h-3" /> {title}
      </h4>
      <div className="text-sm leading-relaxed">
        {address.name && <div className="font-medium">{address.name}</div>}
        {address.address1 && <div>{address.address1}</div>}
        {address.address2 && <div>{address.address2}</div>}
        <div>{[address.city, address.province, address.zip].filter(Boolean).join(", ")}</div>
        {address.country && <div>{address.country}</div>}
        {address.phone && <div className="text-muted-foreground">{address.phone}</div>}
      </div>
    </div>
  );
}

/* ----------------------------- States ----------------------------- */

function OrderSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <div className="mt-4 flex gap-4">
        <Skeleton className="w-20 h-20 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
        <Skeleton className="h-7 w-24" />
      </div>
      <div className="mt-5 flex gap-2">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-6 w-12 rounded-full" />
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16 rounded-2xl border border-dashed border-border bg-card/50">
      <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 grid place-items-center text-primary">
        <ShoppingBag className="w-10 h-10" />
      </div>
      <h2 className="mt-4 text-xl font-bold">You haven't placed any orders yet</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Discover our premium rice varieties — fresh from the mill to your door.
      </p>
      <Button asChild size="lg" className="mt-5">
        <Link to="/" hash="products">Shop now</Link>
      </Button>
    </div>
  );
}

function NoMatchState({ onReset }: { onReset: () => void }) {
  return (
    <div className="text-center py-12 rounded-2xl border border-dashed border-border bg-card/50">
      <p className="text-sm text-muted-foreground">No orders match your filters.</p>
      <Button variant="link" onClick={onReset}>Clear filters</Button>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message?: string; onRetry: () => void }) {
  return (
    <div className="text-center py-12 rounded-2xl border border-destructive/30 bg-destructive/5">
      <p className="text-sm text-destructive font-medium">{message ?? "Something went wrong loading your orders."}</p>
      <Button variant="outline" className="mt-3" onClick={onRetry}>
        <Loader2 className="w-4 h-4 mr-1.5" /> Try again
      </Button>
    </div>
  );
}
