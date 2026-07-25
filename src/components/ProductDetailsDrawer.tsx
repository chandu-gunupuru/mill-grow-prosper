import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Heart,
  Share2,
  Plus,
  Minus,
  ShoppingCart,
  Star,
  Truck,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Tag,
} from "lucide-react";
import { toast } from "sonner";
import type { ShopifyProduct } from "@/lib/shopify";
import { wishlist } from "@/lib/wishlist";
import { recentlyViewed } from "@/lib/recentlyViewed";

interface Props {
  product: ShopifyProduct | null;
  allProducts: ShopifyProduct[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddToCart: (product: ShopifyProduct, quantity: number) => Promise<boolean> | boolean;
  onBuyNow: (product: ShopifyProduct) => void;
  onOpenProduct: (product: ShopifyProduct) => void;
  isBuying?: boolean;
}

function useWishlisted(id: string | undefined) {
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    if (!id) return;
    setSaved(wishlist.has(id));
    return wishlist.subscribe(() => setSaved(id ? wishlist.has(id) : false));
  }, [id]);
  return saved;
}

// Deterministic pseudo-rating so a product always shows the same stars/reviews.
function hashRating(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  const rating = 4 + ((h % 100) / 100) * 0.9; // 4.0 - 4.9
  const reviews = 120 + (h % 1400);
  return { rating: Math.round(rating * 10) / 10, reviews };
}

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`Rated ${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`w-4 h-4 ${n <= Math.round(value) ? "fill-gold text-gold" : "text-muted-foreground/40"}`}
        />
      ))}
    </span>
  );
}

export function ProductDetailsDrawer({
  product,
  allProducts,
  open,
  onOpenChange,
  onAddToCart,
  onBuyNow,
  onOpenProduct,
  isBuying,
}: Props) {
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const saved = useWishlisted(product?.node.id);

  useEffect(() => {
    if (product) {
      setActiveImg(0);
      setQty(1);
      recentlyViewed.push(product.node.id);
    }
  }, [product]);

  const variant = product?.node.variants.edges[0]?.node;
  const images = product?.node.images.edges ?? [];
  const inStock = variant?.availableForSale ?? false;
  const cur = product?.node.priceRange.minVariantPrice.currencyCode ?? "INR";
  const symbol = cur === "INR" ? "₹" : cur + " ";
  const price = product ? parseFloat(product.node.priceRange.minVariantPrice.amount) : 0;
  // Fake MRP for strike-through (10-20% discount) derived from product id.
  const { rating, reviews, mrp, discountPct } = useMemo(() => {
    if (!product) return { rating: 0, reviews: 0, mrp: 0, discountPct: 0 };
    const { rating, reviews } = hashRating(product.node.id);
    const pct = 10 + ((reviews % 12));
    const mrp = Math.round(price / (1 - pct / 100));
    return { rating, reviews, mrp, discountPct: pct };
  }, [product, price]);

  const specs = useMemo(() => {
    if (!product) return [] as Array<[string, string]>;
    const rows: Array<[string, string]> = [];
    for (const o of variant?.selectedOptions ?? []) rows.push([o.name, o.value]);
    for (const o of product.node.options ?? []) {
      if (!rows.find(([k]) => k === o.name)) rows.push([o.name, o.values.join(", ")]);
    }
    rows.push(["Availability", inStock ? "In Stock" : "Out of Stock"]);
    rows.push(["Currency", cur]);
    return rows;
  }, [product, variant, inStock, cur]);

  const related = useMemo(() => {
    if (!product) return [];
    return allProducts.filter((p) => p.node.id !== product.node.id).slice(0, 4);
  }, [allProducts, product]);

  const recent = useMemo(() => {
    if (typeof window === "undefined" || !product) return [];
    const ids = recentlyViewed.list().filter((id) => id !== product.node.id);
    return ids
      .map((id) => allProducts.find((p) => p.node.id === id))
      .filter((p): p is ShopifyProduct => Boolean(p))
      .slice(0, 4);
  }, [allProducts, product, open]);

  async function handleAdd() {
    if (!product) return;
    setAdding(true);
    try {
      const ok = await onAddToCart(product, qty);
      if (ok) toast.success(`${product.node.title} added to cart`, { description: `Qty ${qty}` });
    } finally {
      setAdding(false);
    }
  }

  function handleWishlist() {
    if (!product) return;
    const nowSaved = wishlist.toggle(product.node.id);
    toast.success(nowSaved ? "Added to Wishlist" : "Removed from Wishlist");
  }

  async function handleShare() {
    if (!product) return;
    const url = typeof window !== "undefined" ? window.location.origin + "/#shop" : "";
    const shareData = { title: product.node.title, text: product.node.title, url };
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share(shareData);
      } else if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(`${product.node.title} — ${url}`);
        toast.success("Link copied to clipboard");
      }
    } catch {
      /* user cancelled */
    }
  }

  const eta = useMemo(() => {
    const d1 = new Date();
    d1.setDate(d1.getDate() + 3);
    const d2 = new Date();
    d2.setDate(d2.getDate() + 6);
    const fmt = (d: Date) => d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
    return `${fmt(d1)} – ${fmt(d2)}`;
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex h-full w-full max-w-none flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl lg:max-w-4xl"
      >
        <SheetHeader className="shrink-0 border-b border-border px-5 py-3">
          <SheetTitle className="truncate text-base">Product details</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto overscroll-contain">
          <AnimatePresence mode="wait">
            {product && (
              <motion.div
                key={product.node.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
                className="grid gap-6 p-5 md:grid-cols-2 md:gap-8 md:p-6"
              >
                {/* IMAGE COLUMN */}
                <div>
                  <div className="relative aspect-square overflow-hidden rounded-2xl bg-cream">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={images[activeImg]?.node.url ?? "empty"}
                        src={images[activeImg]?.node.url}
                        alt={images[activeImg]?.node.altText || product.node.title}
                        initial={{ opacity: 0, scale: 1.02 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="h-full w-full object-cover"
                      />
                    </AnimatePresence>
                    {discountPct > 0 && (
                      <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-md bg-destructive px-2 py-1 text-xs font-bold text-destructive-foreground shadow">
                        <Tag className="h-3 w-3" /> {discountPct}% OFF
                      </span>
                    )}
                    <motion.button
                      whileTap={{ scale: 0.8 }}
                      whileHover={{ scale: 1.06 }}
                      onClick={handleWishlist}
                      aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
                      aria-pressed={saved}
                      className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-background/85 backdrop-blur shadow-md ring-1 ring-border transition hover:bg-background"
                    >
                      <motion.span
                        key={saved ? "on" : "off"}
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 18 }}
                      >
                        <Heart
                          className={`h-5 w-5 transition-colors ${
                            saved ? "fill-red-500 text-red-500" : "text-foreground"
                          }`}
                        />
                      </motion.span>
                    </motion.button>
                  </div>
                  {images.length > 1 && (
                    <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                      {images.map((im, i) => (
                        <button
                          key={im.node.url}
                          onClick={() => setActiveImg(i)}
                          className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                            i === activeImg ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"
                          }`}
                          aria-label={`View image ${i + 1}`}
                        >
                          <img src={im.node.url} alt="" className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* INFO COLUMN */}
                <div className="flex flex-col">
                  <div className="text-xs font-semibold uppercase tracking-wider text-gold">
                    Premium Rice
                  </div>
                  <h2 className="mt-1 font-display text-2xl font-bold text-primary md:text-3xl">
                    {product.node.title}
                  </h2>

                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <Stars value={rating} />
                    <span className="font-semibold">{rating.toFixed(1)}</span>
                    <span className="text-muted-foreground">({reviews.toLocaleString()} reviews)</span>
                  </div>

                  <div className="mt-4 flex items-baseline gap-3">
                    <span className="font-display text-3xl font-bold text-primary">
                      {symbol}
                      {price.toFixed(0)}
                    </span>
                    {discountPct > 0 && (
                      <>
                        <span className="text-sm text-muted-foreground line-through">
                          {symbol}
                          {mrp}
                        </span>
                        <span className="text-sm font-semibold text-green-600">Save {discountPct}%</span>
                      </>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        inStock
                          ? "bg-green-500/10 text-green-600"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> {inStock ? "In Stock" : "Out of Stock"}
                    </span>
                    <button
                      onClick={handleShare}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs font-medium hover:bg-muted transition"
                    >
                      <Share2 className="h-3.5 w-3.5" /> Share
                    </button>
                  </div>

                  {product.node.description && (
                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                      {product.node.description}
                    </p>
                  )}

                  {/* Quantity */}
                  <div className="mt-5 flex items-center gap-4">
                    <span className="text-sm font-semibold">Quantity</span>
                    <div className="inline-flex items-center rounded-full border border-border">
                      <button
                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                        className="grid h-9 w-9 place-items-center rounded-l-full hover:bg-muted"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <motion.span
                        key={qty}
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                        className="w-10 text-center text-sm font-bold tabular-nums"
                      >
                        {qty}
                      </motion.span>
                      <button
                        onClick={() => setQty((q) => Math.min(99, q + 1))}
                        className="grid h-9 w-9 place-items-center rounded-r-full hover:bg-muted"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* CTAs */}
                  <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={handleAdd}
                      disabled={adding || !inStock}
                      className="inline-flex items-center justify-center gap-2 rounded-md bg-primary py-3 font-semibold text-primary-foreground transition hover:bg-gold hover:text-primary disabled:opacity-60"
                    >
                      {adding ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <ShoppingCart className="h-4 w-4" /> Add to Cart
                        </>
                      )}
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => onBuyNow(product)}
                      disabled={isBuying || !inStock}
                      className="inline-flex items-center justify-center gap-2 rounded-md bg-gradient-gold py-3 font-bold text-primary shadow-gold transition hover:scale-[1.01] disabled:opacity-60"
                    >
                      {isBuying ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                        <>
                          Buy Now <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </motion.button>
                  </div>

                  {/* Delivery */}
                  <div className="mt-5 space-y-2 rounded-xl border border-border bg-muted/40 p-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-primary" />
                      <span>
                        Estimated delivery <span className="font-semibold">{eta}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      <span>Secure payment · Easy returns within 7 days</span>
                    </div>
                  </div>

                  {/* Specifications */}
                  <div className="mt-6">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-primary">
                      Specifications
                    </h3>
                    <div className="mt-2 overflow-hidden rounded-xl border border-border">
                      <table className="w-full text-sm">
                        <tbody>
                          {specs.map(([k, v], i) => (
                            <tr key={k} className={i % 2 === 0 ? "bg-muted/40" : ""}>
                              <td className="w-1/3 px-4 py-2 font-medium text-muted-foreground">{k}</td>
                              <td className="px-4 py-2">{v}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Related products */}
                {related.length > 0 && (
                  <div className="md:col-span-2">
                    <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-primary">
                      Related products
                    </h3>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {related.map((p) => (
                        <MiniCard key={p.node.id} p={p} onOpen={() => onOpenProduct(p)} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Recently viewed */}
                {recent.length > 0 && (
                  <div className="md:col-span-2">
                    <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-primary">
                      Recently viewed
                    </h3>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {recent.map((p) => (
                        <MiniCard key={p.node.id} p={p} onOpen={() => onOpenProduct(p)} />
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function MiniCard({ p, onOpen }: { p: ShopifyProduct; onOpen: () => void }) {
  const img = p.node.images.edges[0]?.node;
  const cur = p.node.priceRange.minVariantPrice.currencyCode;
  const symbol = cur === "INR" ? "₹" : cur + " ";
  const price = parseFloat(p.node.priceRange.minVariantPrice.amount);
  return (
    <motion.button
      whileHover={{ y: -3 }}
      onClick={onOpen}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card text-left transition hover:shadow-premium"
    >
      <div className="aspect-square overflow-hidden bg-cream">
        {img && (
          <img
            src={img.url}
            alt={img.altText || p.node.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
      </div>
      <div className="p-3">
        <div className="line-clamp-2 text-sm font-semibold text-primary">{p.node.title}</div>
        <div className="mt-1 font-display text-base font-bold text-primary">
          {symbol}
          {price.toFixed(0)}
        </div>
      </div>
    </motion.button>
  );
}
