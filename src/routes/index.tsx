import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import {
  Phone, Mail, MapPin, MessageCircle, Award, Truck, Sparkles, ShieldCheck,
  Factory, Leaf, Package, CheckCircle2, Star, ArrowRight, ArrowLeft, Menu, X, Download,
  ShoppingCart, Plus, Minus, Trash2, Loader2, ExternalLink, AlertCircle, Bell,
} from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { sendQuoteInquiry } from "@/lib/inquiry.functions";
import { fetchShopifyProducts, createShopifyCart, type ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { useCartSync } from "@/hooks/useCartSync";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "@tanstack/react-router";
import { LogIn, LogOut, User as UserIcon, Settings, LayoutDashboard, ChevronRight } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { openShopifyCheckout, getOpenInSameTab, setOpenInSameTab } from "@/lib/checkout";
import { getStoreStatus } from "@/lib/store-status.functions";
import { logProductClick } from "@/lib/analytics";
import { ProfileModal } from "@/components/ProfileModal";


import paddyField from "@/assets/paddy-field.jpg?w=900&format=webp&quality=72&imagetools";
import heroMill from "@/assets/hero-mill.jpg?w=1600&format=webp&quality=72&imagetools";
import warehouse from "@/assets/warehouse.jpg?w=1200&format=webp&quality=72&imagetools";
import machinery from "@/assets/machinery.jpg?w=1600&format=webp&quality=65&imagetools";
import riceSona from "@/assets/rice-sona.jpg?w=800&format=webp&quality=72&imagetools";
import riceBasmati from "@/assets/rice-basmati.jpg?w=800&format=webp&quality=72&imagetools";
import riceSteam from "@/assets/rice-steam.jpg?w=800&format=webp&quality=72&imagetools";
import riceRaw from "@/assets/rice-raw.jpg?w=800&format=webp&quality=72&imagetools";
import riceBroken from "@/assets/rice-broken.jpg?w=800&format=webp&quality=72&imagetools";
import riceBran from "@/assets/rice-bran.jpg?w=800&format=webp&quality=72&imagetools";

import millAerial from "@/assets/mill-aerial.jpg?w=1200&format=webp&quality=72&imagetools";
import millInterior from "@/assets/mill-interior.jpg?w=1200&format=webp&quality=72&imagetools";
import millLab from "@/assets/mill-lab.jpg?w=1200&format=webp&quality=72&imagetools";
import millWarehouse from "@/assets/mill-warehouse.jpg?w=1200&format=webp&quality=72&imagetools";
import millPacking from "@/assets/mill-packing.jpg?w=1200&format=webp&quality=72&imagetools";



export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Gayathri Modern Rice Mill — Premium Rice Manufacturer & Wholesale Supplier" },
      { name: "description", content: "Wholesale rice manufacturer & exporter. Sona Masoori, Basmati, Steam Rice, Raw Rice direct from our modern processing mill. Bulk supply for distributors, retailers, hotels." },
      { name: "keywords", content: "rice mill, rice manufacturer, wholesale rice supplier, premium rice exporter, sona masoori, basmati rice, steam rice, rice processing company" },
      { property: "og:title", content: "Gayathri Modern Rice Mill — Premium Rice Direct From Our Mill" },
      { property: "og:description", content: "Wholesale rice manufacturer & exporter. Bulk supply for distributors, retailers and hotels." },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Gayathri Modern Rice Mill",
        description: "Premium rice manufacturer, processor and wholesale supplier.",
        sameAs: [],
      }),
    }],
  }),
  component: Index,
});

const WHATSAPP = "+919398553951";
const PHONE = "+91 93985 53951";
const EMAIL = "gunupuruchandu29@gmail.com";

const products = [
  { name: "Sona Masoori Rice", img: riceSona, grade: "Premium AAA", pack: "5 / 25 / 50 kg bags", stock: "In stock" },
  { name: "Basmati Rice", img: riceBasmati, grade: "Long Grain Premium", pack: "10 / 25 kg bags", stock: "In stock" },
  { name: "Steam Rice", img: riceSteam, grade: "Parboiled Grade A", pack: "25 / 50 kg bags", stock: "Bulk available" },
  { name: "Raw Rice", img: riceRaw, grade: "Grade A", pack: "25 / 50 kg bags", stock: "In stock" },
  { name: "Broken Rice", img: riceBroken, grade: "Industrial Grade", pack: "50 kg bags", stock: "Bulk available" },
  { name: "Rice Bran", img: riceBran, grade: "Solvent Grade", pack: "Bulk / 50 kg", stock: "On order" },
];

const whyUs = [
  { icon: Sparkles, t: "Premium Quality", d: "Strict multi-stage quality assurance on every batch." },
  { icon: Factory, t: "Advanced Machinery", d: "Modern Satake & Buhler-grade processing equipment." },
  { icon: ShieldCheck, t: "Lab Tested", d: "Moisture, grain length & purity tested in-house." },
  { icon: Truck, t: "Timely Delivery", d: "Pan-India logistics with export-ready dispatch." },
  { icon: Package, t: "Bulk Supply", d: "Container loads & customised private labelling." },
  { icon: Award, t: "Best Pricing", d: "Direct-from-mill rates with no middlemen." },
];

const process = [
  "Paddy Procurement", "Cleaning", "Milling", "Polishing", "Quality Testing", "Packaging", "Delivery",
];

const stats = [
  { v: "8+", l: "Years in Business" },
  { v: "20,000+", l: "Tons Processed Annually" },
  { v: "900+", l: "Happy Customers" },
  { v: "5+", l: "States Served" },
];

const certs = ["FSSAI Certified", "ISO 22000:2018", "APEDA Export", "HACCP Standards"];

const testimonials = [
  { n: "Ramesh Traders", r: "Distributor, Hyderabad", q: "Consistent quality across every consignment — our retailers trust the Gayathri brand." },
  { n: "Golden Spoon Hotels", r: "Procurement Head", q: "Their Sona Masoori is the best we've sourced in years. Always on time, always graded right." },
  { n: "Al-Noor Exports", r: "Exporter, Dubai", q: "Export-grade packing and documentation — they made our shipments effortless." },
];

const gallery = [
  { img: millAerial, alt: "Aerial view of Gayathri Modern Rice Mill facility" },
  { img: millInterior, alt: "Modern rice milling machinery and processing floor" },
  { img: millLab, alt: "In-house rice quality testing laboratory" },
  { img: millWarehouse, alt: "Warehouse with stacked rice bags ready for dispatch" },
  { img: millPacking, alt: "Automated rice packaging line" },
];

function Index() {
  const [navOpen, setNavOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const touchStartX = useRef(0);
  const [form, setForm] = useState({ name: "", company: "", email: "", phone: "", product: "Sona Masoori Rice", qty: "", message: "" });
  const [sending, setSending] = useState(false);
  const sendInquiry = useServerFn(sendQuoteInquiry);
  const fetchStoreStatus = useServerFn(getStoreStatus);
  const { data: storeStatus } = useQuery({
    queryKey: ["store-status"],
    queryFn: () => fetchStoreStatus(),
    staleTime: 5 * 60 * 1000,
  });

  // Sync Shopify cart on load + tab focus (clears after checkout)
  useCartSync();

  const { user } = useAuth();
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
  };

  const items = useCartStore((s) => s.items);
  const isLoading = useCartStore((s) => s.isLoading);
  const isSyncing = useCartStore((s) => s.isSyncing);
  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const getCheckoutUrl = useCartStore((s) => s.getCheckoutUrl);
  const syncCart = useCartStore((s) => s.syncCart);
  const checkoutError = useCartStore((s) => s.checkoutError);
  const setCheckoutError = useCartStore((s) => s.setCheckoutError);

  const [sameTab, setSameTab] = useState(false);
  const [blockedUrl, setBlockedUrl] = useState<string | null>(null);
  useEffect(() => { setSameTab(getOpenInSameTab()); }, []);
  function toggleSameTab(v: boolean) {
    setSameTab(v);
    setOpenInSameTab(v);
  }


  const cartCount = items.reduce((n, i) => n + i.quantity, 0);
  const cartTotal = items.reduce((n, i) => n + i.quantity * parseFloat(i.price.amount), 0);
  const currency = items[0]?.price.currencyCode || "INR";

  const { data: shopifyProducts = [], isLoading: productsLoading } = useQuery({
    queryKey: ["shopify-products"],
    queryFn: () => fetchShopifyProducts(20),
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    if (window.location.hash) {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }, []);

  useEffect(() => { if (cartOpen) syncCart(); }, [cartOpen, syncCart]);

  async function addProductToCart(product: ShopifyProduct) {
    const variant = product.node.variants.edges[0]?.node;
    if (!variant) return false;
    await addItem({
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions || [],
    });
    return !useCartStore.getState().checkoutError;
  }

  async function handleAddToCart(product: ShopifyProduct) {
    const variantId = product.node.variants.edges[0]?.node?.id ?? null;
    void logProductClick("add_to_cart", product.node.id, variantId);
    const ok = await addProductToCart(product);
    if (ok) toast.success(`${product.node.title} added to cart`);
  }

  function checkout() {
    const url = getCheckoutUrl();
    const result = openShopifyCheckout(url);
    if (!result.ok) {
      if (result.reason === "popup_blocked" && url) {
        setBlockedUrl(url);
        setCheckoutError(
          "Your browser blocked the checkout window. Click the link below to continue.",
        );
      } else {
        setBlockedUrl(null);
        setCheckoutError(
          "Checkout link is missing. Please try adding the item again or contact us.",
        );
      }
      return false;
    }
    setBlockedUrl(null);
    setCheckoutError(null);
    setCartOpen(false);
    return true;
  }

  const [buyingId, setBuyingId] = useState<string | null>(null);
  async function buyNow(product: ShopifyProduct) {
    // Buy Now is a direct checkout: create a one-off Shopify cart for just
    // this item and open its checkoutUrl. The user's persistent cart is NOT
    // touched, so the cart badge does not increment.
    const variant = product.node.variants.edges[0]?.node;
    if (!variant) return;
    void logProductClick("buy_now", product.node.id, variant.id);
    setBuyingId(product.node.id);
    try {
      const result = await createShopifyCart(variant.id, 1);
      if (!result?.checkoutUrl) {
        setBlockedUrl(null);
        setCheckoutError("Could not start checkout. Please try again.");
        setCartOpen(true);
        return;
      }
      const opened = openShopifyCheckout(result.checkoutUrl);
      if (!opened.ok) {
        if (opened.reason === "popup_blocked") {
          setBlockedUrl(result.checkoutUrl);
          setCheckoutError(
            "Your browser blocked the checkout window. Click the link below to continue.",
          );
        } else {
          setBlockedUrl(null);
          setCheckoutError("Could not open checkout window.");
        }
        setCartOpen(true);
      }
    } finally {
      setBuyingId(null);
    }
  }





  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) {
      toast.error("Please fill in name, email and phone.");
      return;
    }
    setSending(true);
    try {
      await sendInquiry({ data: form });
      toast.success("Inquiry sent! We'll get back to you within 2 business hours.");
      setForm({ name: "", company: "", email: "", phone: "", product: "Sona Masoori Rice", qty: "", message: "" });
    } catch (err) {
      console.error(err);
      toast.error("Could not send inquiry. Please try again or call us directly.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster richColors position="top-center" />
      {user && <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} user={user} />}


      {/* NAV */}
      <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="#top" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-md bg-gradient-gold grid place-items-center shadow-gold">
              <Leaf className="w-5 h-5 text-primary" />
            </div>
            <div className="leading-tight">
              <div className="font-display font-bold text-primary">Gayathri</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Modern Rice Mill</div>
            </div>
          </a>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            {["About","Shop","Products","Process","Why Us","Contact"].map(i => (
              <a key={i} href={`#${i.toLowerCase().replace(" ","-")}`} className="text-foreground/80 hover:text-primary transition-colors">{i}</a>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-2">
            {user && (
              <Sheet open={accountOpen} onOpenChange={setAccountOpen}>
                <SheetTrigger asChild>
                  <button className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-sm font-semibold text-primary hover:bg-primary/5 transition-colors">
                    {user.user_metadata?.avatar_url ? (
                      <img src={user.user_metadata.avatar_url} alt="" className="w-6 h-6 rounded-full object-cover border border-primary/20" />
                    ) : (
                      <UserIcon className="w-4 h-4" />
                    )}
                    <span className="max-w-[100px] truncate">{user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0]}</span>
                  </button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-80 sm:max-w-sm"
                  onInteractOutside={() => setAccountOpen(false)}
                  onEscapeKeyDown={() => setAccountOpen(false)}
                  onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
                  onTouchEnd={(e) => {
                    const diff = e.changedTouches[0].clientX - touchStartX.current;
                    if (diff > 80) setAccountOpen(false);
                  }}
                >
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-3">
                      {user.user_metadata?.avatar_url ? (
                        <img src={user.user_metadata.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover border border-primary/20" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/10 grid place-items-center">
                          <UserIcon className="w-5 h-5 text-primary" />
                        </div>
                      )}
                      <div className="text-left">
                        <div className="text-base font-semibold">{user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0]}</div>
                        <div className="text-xs text-muted-foreground font-normal">{user.email}</div>
                      </div>
                    </SheetTitle>
                  </SheetHeader>
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
                    }}
                    className="mt-8 flex flex-col gap-2"
                  >
                    <motion.div variants={{ hidden: { opacity: 0, x: 30 }, visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } }}>
                      <button
                        onClick={() => { setAccountOpen(false); setProfileOpen(true); }}
                        className="flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm font-medium hover:bg-primary/5 transition-colors"
                      >
                        <span className="flex items-center gap-3">
                          <UserIcon className="w-4 h-4 text-muted-foreground" /> Profile
                        </span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </motion.div>
                    <motion.div variants={{ hidden: { opacity: 0, x: 30 }, visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } }}>
                      <Link
                        to="/admin/orders"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm font-medium hover:bg-primary/5 transition-colors"
                      >
                        <span className="flex items-center gap-3">
                          <LayoutDashboard className="w-4 h-4 text-muted-foreground" /> Admin
                        </span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </Link>
                    </motion.div>
                    <motion.div variants={{ hidden: { opacity: 0, x: 30 }, visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } }}>
                      <Link
                        to="/settings"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm font-medium hover:bg-primary/5 transition-colors"
                      >
                        <span className="flex items-center gap-3">
                          <Settings className="w-4 h-4 text-muted-foreground" /> Settings
                        </span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </Link>
                    </motion.div>
                    <motion.div variants={{ hidden: { opacity: 0, x: 30 }, visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } }} className="my-2 h-px bg-border" />
                    <motion.div variants={{ hidden: { opacity: 0, x: 30 }, visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } }}>
                      <button
                        onClick={() => { setAccountOpen(false); handleSignOut(); }}
                        className="flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/5 transition-colors"
                      >
                        <span className="flex items-center gap-3">
                          <LogOut className="w-4 h-4" /> Sign out
                        </span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </motion.div>
                  </motion.div>
                </SheetContent>
              </Sheet>
            )}
            <button
              onClick={() => toast.info("No new notifications", { description: "You're all caught up." })}
              aria-label="View notifications"
              className="relative w-11 h-11 rounded-md bg-transparent grid place-items-center hover:text-primary transition"
            >
              <span className="relative inline-flex">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-gold ring-2 ring-background" aria-hidden="true" />
              </span>
            </button>
            <button onClick={() => setCartOpen(true)} aria-label="Open cart" className="relative w-11 h-11 rounded-md bg-transparent grid place-items-center hover:text-primary transition">
              <span className="relative inline-flex">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 1.4, opacity: 0.6 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 18 }}
                    className="absolute -top-2 -right-2.5 text-primary text-[11px] md:text-xs font-bold leading-none tabular-nums tracking-tight"
                  >
                    {cartCount > 99 ? "99+" : cartCount}
                  </motion.span>
                )}
              </span>
            </button>
            {!user && (
              <Link to="/auth" className="inline-flex items-center gap-1.5 bg-transparent px-4 py-2 rounded-md text-sm font-semibold hover:text-primary transition">
                <LogIn className="w-4 h-4" /> Login
              </Link>
            )}
            <ThemeToggle />
          </div>
          <div className="flex md:hidden items-center gap-2">
            {user && (
              <button
                onClick={() => setAccountOpen(true)}
                className="relative w-10 h-10 rounded-md bg-transparent grid place-items-center hover:text-primary transition"
                aria-label="Open account menu"
              >
                {user.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="" className="w-6 h-6 rounded-full object-cover" />
                ) : (
                  <UserIcon className="w-5 h-5" />
                )}
              </button>
            )}
            <button
              onClick={() => toast.info("No new notifications", { description: "You're all caught up." })}
              aria-label="View notifications"
              className="relative w-10 h-10 grid place-items-center"
            >
              <span className="relative inline-flex">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-gold ring-2 ring-background" aria-hidden="true" />
              </span>
            </button>
            <button onClick={() => setCartOpen(true)} aria-label="Open cart" className="relative w-10 h-10 grid place-items-center">
              <span className="relative inline-flex">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 1.4, opacity: 0.6 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 18 }}
                    className="absolute -top-2 -right-2.5 text-primary text-[11px] font-bold leading-none tabular-nums tracking-tight"
                  >
                    {cartCount > 99 ? "99+" : cartCount}
                  </motion.span>
                )}
              </span>
            </button>
            <button onClick={() => setNavOpen(!navOpen)} aria-label="Toggle menu">
              {navOpen ? <X /> : <Menu />}
            </button>
            <ThemeToggle />
          </div>
        </div>
        {navOpen && (
          <div className="md:hidden border-t border-border bg-background">
            <div className="px-6 py-4 flex flex-col gap-3">
              {["About","Shop","Products","Process","Why Us","Contact"].map(i => (
                <a key={i} href={`#${i.toLowerCase().replace(" ","-")}`} onClick={() => setNavOpen(false)} className="text-foreground/80">{i}</a>
              ))}
              {!user && (
                <Link to="/auth" onClick={() => setNavOpen(false)} className="text-foreground/80 font-medium">Login</Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* STORE STATUS BANNER */}
      {storeStatus && (
        <div className="fixed top-16 inset-x-0 z-40">
          <div
            className={`px-4 py-2 text-sm font-medium flex items-center justify-center gap-2 border-b ${
              storeStatus.paymentsEnabled
                ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                : "bg-amber-50 text-amber-900 border-amber-200"
            }`}
            role="status"
            aria-live="polite"
          >
            {storeStatus.paymentsEnabled ? (
              <>
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>
                  Store claimed{storeStatus.planName ? ` (${storeStatus.planName})` : ""} —
                  payments are enabled. Checkout is live.
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>
                  Demo mode: store is not yet claimed, so live payments are disabled.
                  Browse freely — checkout will not charge any card.
                </span>
              </>
            )}
          </div>
        </div>
      )}


      {/* HERO */}
      <section id="top" className="relative min-h-screen flex items-center pt-16 overflow-hidden bg-primary">
        {/* Animated brand backdrop — replaces the static photo */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,oklch(0.35_0.06_60_/_0.9),transparent_60%),radial-gradient(circle_at_80%_30%,oklch(0.55_0.14_70_/_0.45),transparent_55%),radial-gradient(circle_at_50%_90%,oklch(0.25_0.04_60_/_0.95),transparent_60%)]" aria-hidden="true" />

        {/* Slow drifting gold orbs */}
        <motion.div
          aria-hidden="true"
          className="absolute -top-32 -left-20 w-[34rem] h-[34rem] rounded-full bg-gold/20 blur-3xl"
          animate={{ x: [0, 40, -20, 0], y: [0, 30, -10, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden="true"
          className="absolute -bottom-40 right-[-6rem] w-[40rem] h-[40rem] rounded-full bg-gold/15 blur-3xl"
          animate={{ x: [0, -50, 20, 0], y: [0, -30, 20, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Sweeping light ray */}
        <motion.div
          aria-hidden="true"
          className="absolute inset-y-0 -left-1/3 w-1/2 bg-gradient-to-r from-transparent via-gold/10 to-transparent skew-x-12"
          animate={{ x: ["0%", "260%"] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.5 }}
        />

        {/* Floating rice grains */}
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          {[
            { left: "8%", size: 14, delay: 0, dur: 11 },
            { left: "18%", size: 9, delay: 1.5, dur: 13 },
            { left: "32%", size: 12, delay: 3, dur: 10 },
            { left: "46%", size: 8, delay: 0.8, dur: 14 },
            { left: "60%", size: 15, delay: 2.2, dur: 12 },
            { left: "73%", size: 10, delay: 4, dur: 11 },
            { left: "86%", size: 13, delay: 1, dur: 13 },
            { left: "92%", size: 9, delay: 3.5, dur: 15 },
          ].map((g, i) => (
            <motion.span
              key={i}
              className="absolute block rounded-full bg-gradient-to-br from-gold to-amber-200/80 shadow-[0_0_12px_rgba(255,200,80,0.4)]"
              style={{
                left: g.left,
                top: "110%",
                width: g.size,
                height: g.size * 2.2,
                transform: "rotate(20deg)",
              }}
              animate={{
                top: ["110%", "-15%"],
                opacity: [0, 0.85, 0.85, 0],
                rotate: [20, 35, 12, 25],
              }}
              transition={{
                duration: g.dur,
                delay: g.delay,
                repeat: Infinity,
                ease: "easeInOut",
                times: [0, 0.15, 0.85, 1],
              }}
            />
          ))}
        </div>

        {/* Foreground readability wash */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/70 via-primary/30 to-transparent" aria-hidden="true" />

        <div className="relative max-w-7xl mx-auto px-6 py-20 w-full grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/20 backdrop-blur border border-gold/40 text-gold text-xs font-semibold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" /> FSSAI · ISO · Export Certified
            </span>
            <h1 className="mt-6 font-display font-bold text-5xl md:text-7xl text-white text-balance leading-[1.05]">
              Premium Quality Rice <span className="text-gold">Direct From Our Mill</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-white/85 max-w-2xl">
              A decade of milling excellence. Processing 20,000+ tons annually with modern machinery, lab-tested quality and reliable bulk supply for distributors, exporters, hotels & retailers across India.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <a href="#contact" className="inline-flex items-center gap-2 bg-gradient-gold text-primary px-7 py-3.5 rounded-md font-semibold shadow-gold hover:scale-[1.02] transition">
                Get a Quote <ArrowRight className="w-4 h-4" />
              </a>
              <a href={`tel:${PHONE.replace(/\s/g, "")}`} className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/30 text-white px-7 py-3.5 rounded-md font-semibold hover:bg-white/20 transition">
                <Phone className="w-4 h-4" /> Contact Us
              </a>
            </div>
            <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl">
              {stats.slice(0,4).map(s => (
                <div key={s.l}>
                  <div className="font-display text-3xl md:text-4xl text-gold font-bold">{s.v}</div>
                  <div className="text-xs md:text-sm text-white/70 mt-1">{s.l}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Animated Mill Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="hidden lg:block relative"
            aria-hidden="true"
          >
            <div className="relative aspect-square max-w-[520px] mx-auto">
              <div className="absolute inset-0 rounded-full bg-gold/15 blur-3xl" />
              <svg viewBox="0 0 400 400" className="relative w-full h-full drop-shadow-[0_20px_40px_rgba(0,0,0,0.45)]">
                <defs>
                  <linearGradient id="millBody" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#f4d58a" />
                    <stop offset="1" stopColor="#c8932f" />
                  </linearGradient>
                  <linearGradient id="roofGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#7a3f1a" />
                    <stop offset="1" stopColor="#4a230d" />
                  </linearGradient>
                  <radialGradient id="grainGrad" cx="0.5" cy="0.4" r="0.6">
                    <stop offset="0" stopColor="#fff3c8" />
                    <stop offset="1" stopColor="#e0a93a" />
                  </radialGradient>
                </defs>

                <ellipse cx="200" cy="360" rx="150" ry="10" fill="rgba(0,0,0,0.35)" />

                {/* mill body */}
                <path d="M120 360 L130 180 L270 180 L280 360 Z" fill="url(#millBody)" stroke="#5a3210" strokeWidth="3" />
                <rect x="155" y="220" width="30" height="38" rx="3" fill="#1d3147" stroke="#5a3210" strokeWidth="2" />
                <rect x="215" y="220" width="30" height="38" rx="3" fill="#1d3147" stroke="#5a3210" strokeWidth="2" />
                <path d="M180 360 L180 290 Q200 270 220 290 L220 360 Z" fill="#5a3210" stroke="#2a1605" strokeWidth="2" />
                <circle cx="212" cy="325" r="2.5" fill="#f4d58a" />

                {/* roof */}
                <path d="M110 185 L200 110 L290 185 Z" fill="url(#roofGrad)" stroke="#2a1605" strokeWidth="3" />
                <rect x="196" y="110" width="8" height="40" fill="#3a1c08" />

                {/* rotating windmill blades */}
                <motion.g
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  style={{ transformBox: "fill-box", transformOrigin: "200px 105px" }}
                >
                  {[0, 90, 180, 270].map((a) => (
                    <path key={a} transform={`rotate(${a} 200 105)`} d="M200 105 L210 35 L195 38 Z" fill="#f4d58a" stroke="#5a3210" strokeWidth="2" />
                  ))}
                  <circle cx="200" cy="105" r="9" fill="#5a3210" stroke="#2a1605" strokeWidth="2" />
                  <circle cx="200" cy="105" r="3" fill="#f4d58a" />
                </motion.g>

                {/* chimney + smoke puffs */}
                <rect x="240" y="135" width="18" height="55" fill="#5a3210" stroke="#2a1605" strokeWidth="2" />
                {[0, 1, 2].map((i) => (
                  <motion.circle
                    key={i}
                    cx="249"
                    cy="130"
                    r="8"
                    fill="rgba(255,255,255,0.55)"
                    animate={{ cy: [130, 60], opacity: [0, 0.7, 0], r: [6, 14, 20] }}
                    transition={{ duration: 4, repeat: Infinity, delay: i * 1.3, ease: "easeOut" }}
                  />
                ))}

                {/* conveyor belt */}
                <rect x="270" y="300" width="100" height="14" rx="3" fill="#2a2a2a" stroke="#000" strokeWidth="1.5" />
                <circle cx="275" cy="307" r="10" fill="#444" stroke="#000" strokeWidth="1.5" />
                <circle cx="365" cy="307" r="10" fill="#444" stroke="#000" strokeWidth="1.5" />

                {/* moving grains on belt */}
                {[0, 1, 2, 3].map((i) => (
                  <motion.ellipse
                    key={i}
                    cy="298"
                    rx="4"
                    ry="2.5"
                    fill="url(#grainGrad)"
                    animate={{ cx: [275, 365], opacity: [0, 1, 1, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: i * 0.75, ease: "linear", times: [0, 0.1, 0.9, 1] }}
                  />
                ))}

                {/* grains falling off end */}
                {[0, 1, 2].map((i) => (
                  <motion.ellipse
                    key={`f${i}`}
                    cx="370"
                    rx="3"
                    ry="2"
                    fill="url(#grainGrad)"
                    animate={{ cy: [305, 355], opacity: [1, 1, 0] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.4, ease: "easeIn" }}
                  />
                ))}

                {/* sign */}
                <rect x="150" y="155" width="100" height="20" rx="3" fill="#f4d58a" stroke="#5a3210" strokeWidth="2" />
                <text x="200" y="170" textAnchor="middle" fontSize="11" fontWeight="700" fill="#5a3210" fontFamily="serif">RICE MILL</text>
              </svg>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <img src={paddyField} alt="Beautiful lush green rice fields at golden hour" width={1024} height={1024} loading="lazy" className="rounded-2xl shadow-premium w-full aspect-[4/5] object-cover" />
          </motion.div>
          <div>
            <span className="text-gold font-semibold uppercase tracking-widest text-xs">About Us</span>
            <h2 className="mt-3 text-4xl md:text-5xl font-bold text-primary text-balance">From Paddy Fields to Premium Plates — for 10 Years.</h2>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              Founded in 2016, Gayathri Modern Rice Mill is one of South India's most trusted rice processing companies. We source premium paddy directly from farmers, process it through state-of-the-art Satake-grade machinery, and deliver consistent, lab-tested quality to wholesalers, exporters and HoReCa clients across 5 states.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4">
              {[
                { i: Factory, t: "Modern Facility" },
                { i: Leaf, t: "Farm to Mill" },
                { i: ShieldCheck, t: "Quality Assured" },
                { i: Award, t: "Award-winning" },
              ].map(({ i: Icon, t }) => (
                <div key={t} className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border">
                  <Icon className="w-5 h-5 text-primary" />
                  <span className="font-medium text-sm">{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SHOP — RICE PACKETS */}
      <section id="shop" className="py-24 bg-gradient-to-b from-background to-cream">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-gold font-semibold uppercase tracking-widest text-xs">Shop Our Rice</span>
            <h2 className="mt-3 text-4xl md:text-5xl font-bold text-primary text-balance">Buy Premium Rice Packets Online</h2>
            <p className="mt-4 text-muted-foreground">Mill-fresh, lab-tested rice delivered straight to your doorstep. Free shipping on orders above ₹1,500.</p>
          </div>
          {productsLoading ? (
            <div className="mt-14 grid place-items-center py-16 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : shopifyProducts.length === 0 ? (
            <div className="mt-14 text-center py-16 text-muted-foreground">No products found.</div>
          ) : (
            <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {shopifyProducts.map((p, idx) => {
                const variant = p.node.variants.edges[0]?.node;
                const img = p.node.images.edges[0]?.node;
                const price = parseFloat(p.node.priceRange.minVariantPrice.amount);
                const cur = p.node.priceRange.minVariantPrice.currencyCode;
                const symbol = cur === "INR" ? "₹" : cur + " ";
                const weight = variant?.selectedOptions?.find((o) => o.name === "Weight")?.value;
                return (
                  <motion.div
                    key={p.node.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.06 }}
                    className="group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-premium transition-all flex flex-col"
                  >
                    <div className="relative aspect-square overflow-hidden bg-cream">
                      {img && (
                        <img src={img.url} alt={img.altText || p.node.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      )}
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-bold text-primary leading-tight">{p.node.title}</h3>
                      {weight && <div className="text-xs text-muted-foreground mt-1">{weight} pack</div>}
                      <div className="mt-3 flex items-baseline gap-2">
                        <span className="font-display text-2xl font-bold text-primary">{symbol}{price.toFixed(0)}</span>
                      </div>
                      <div className="mt-4 flex flex-col gap-2">
                        <button
                          onClick={() => handleAddToCart(p)}
                          disabled={isLoading || buyingId !== null || !variant?.availableForSale}
                          className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-md font-semibold hover:bg-gold hover:text-primary transition disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ShoppingCart className="w-4 h-4" /> Add to Cart</>}
                        </button>
                        <button
                          onClick={() => buyNow(p)}
                          disabled={isLoading || buyingId !== null || !variant?.availableForSale}
                          className="w-full inline-flex items-center justify-center gap-2 bg-gradient-gold text-primary py-2.5 rounded-md font-bold shadow-gold hover:scale-[1.01] transition disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {buyingId === p.node.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Buy Now <ArrowRight className="w-4 h-4" /></>}
                        </button>

                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

        </div>
      </section>

      {/* PRODUCTS */}
      <section id="products" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-gold font-semibold uppercase tracking-widest text-xs">Our Products</span>
            <h2 className="mt-3 text-4xl md:text-5xl font-bold text-primary text-balance">A Complete Range of Premium Rice</h2>
            <p className="mt-4 text-muted-foreground">Available in custom packaging, private labels and container-load quantities.</p>
          </div>
          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {products.map((p, idx) => (
              <motion.article
                key={p.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className="group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-premium transition-all"
              >
                <div className="aspect-[4/3] overflow-hidden bg-cream">
                  <img src={p.img} alt={p.name} width={1024} height={1024} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-primary">{p.name}</h3>
                  <dl className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between"><dt className="text-muted-foreground">Grade</dt><dd className="font-medium">{p.grade}</dd></div>
                    <div className="flex justify-between"><dt className="text-muted-foreground">Packaging</dt><dd className="font-medium">{p.pack}</dd></div>
                    <div className="flex justify-between"><dt className="text-muted-foreground">Status</dt><dd className="text-primary font-semibold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" />{p.stock}</dd></div>
                  </dl>
                  <a href="#contact" onClick={() => setForm(f => ({ ...f, product: p.name }))} className="mt-5 w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-md font-semibold hover:opacity-90 transition">
                    Inquire Now <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </motion.article>
            ))}
          </div>
          <div className="mt-10 text-center">
            <a href="#contact" className="inline-flex items-center gap-2 text-primary font-semibold hover:text-gold transition">
              <Download className="w-4 h-4" /> Download Full Product Catalog (PDF)
            </a>
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section id="why-us" className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url(${machinery})`, backgroundSize: "cover" }} />
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-gold font-semibold uppercase tracking-widest text-xs">Why Choose Us</span>
            <h2 className="mt-3 text-4xl md:text-5xl font-bold text-balance">Built on Trust. Delivered with Precision.</h2>
          </div>
          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyUs.map(({ icon: Icon, t, d }, i) => (
              <motion.div
                key={t}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="p-7 rounded-xl bg-white/5 backdrop-blur border border-white/10 hover:border-gold/50 transition"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-gold grid place-items-center text-primary">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="mt-5 text-xl font-bold">{t}</h3>
                <p className="mt-2 text-primary-foreground/75 text-sm">{d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section id="process" className="py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-gold font-semibold uppercase tracking-widest text-xs">Our Process</span>
            <h2 className="mt-3 text-4xl md:text-5xl font-bold text-primary text-balance">Seven Steps. One Standard of Excellence.</h2>
          </div>
          <div className="mt-16 relative">
            <div className="hidden lg:block absolute top-8 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent" />
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
              {process.map((step, i) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="text-center"
                >
                  <div className="relative mx-auto w-16 h-16 rounded-full bg-gradient-gold text-primary grid place-items-center font-display text-xl font-bold shadow-gold">
                    {i + 1}
                  </div>
                  <div className="mt-4 font-semibold text-primary text-sm">{step}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-20 bg-gradient-gold">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map(s => (
            <div key={s.l}>
              <div className="font-display text-5xl md:text-6xl font-bold text-primary">{s.v}</div>
              <div className="mt-2 text-primary/80 font-medium">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CERTIFICATIONS */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <span className="text-gold font-semibold uppercase tracking-widest text-xs">Certifications</span>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold text-primary">Compliant. Certified. Trusted.</h2>
          </div>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {certs.map(c => (
              <div key={c} className="p-8 rounded-xl border-2 border-border bg-card text-center hover:border-gold transition group">
                <Award className="w-10 h-10 mx-auto text-gold group-hover:scale-110 transition" />
                <div className="mt-4 font-semibold text-primary">{c}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-gold font-semibold uppercase tracking-widest text-xs">Testimonials</span>
            <h2 className="mt-3 text-4xl md:text-5xl font-bold text-primary text-balance">What Our Partners Say</h2>
          </div>
          <div className="mt-14 grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.n}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-8 bg-card rounded-2xl border border-border shadow-premium"
              >
                <div className="flex gap-0.5 text-gold">
                  {Array.from({length: 5}).map((_, k) => <Star key={k} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="mt-4 text-foreground/85 italic">"{t.q}"</p>
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="font-bold text-primary">{t.n}</div>
                  <div className="text-sm text-muted-foreground">{t.r}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section id="gallery" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-gold font-semibold uppercase tracking-widest text-xs">Gallery</span>
            <h2 className="mt-3 text-4xl md:text-5xl font-bold text-primary text-balance">Inside Our Mill</h2>
          </div>
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px] md:auto-rows-[220px]">
            {gallery.map((item, i) => (
              <div key={i} className={`overflow-hidden rounded-xl relative group ${i === 0 ? "col-span-2 row-span-2" : ""}`}>
                <img src={item.img} alt={item.alt} width={1024} height={1024} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition duration-300">
                  <p className="text-white text-sm font-semibold drop-shadow">{item.alt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-24 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-14">
          <div>
            <span className="text-gold font-semibold uppercase tracking-widest text-xs">Contact</span>
            <h2 className="mt-3 text-4xl md:text-5xl font-bold text-balance">Get an Instant Wholesale Quote</h2>
            <p className="mt-4 text-primary-foreground/80">Tell us your product and quantity — our sales team responds within 2 business hours.</p>
            <div className="mt-10 space-y-5">
              <a href={`tel:${PHONE}`} className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-lg bg-white/10 grid place-items-center group-hover:bg-gold group-hover:text-primary transition"><Phone className="w-5 h-5" /></div>
                <div><div className="text-xs text-primary-foreground/60">Call us</div><div className="font-semibold">{PHONE}</div></div>
              </a>
              <a href={`mailto:${EMAIL}`} className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-lg bg-white/10 grid place-items-center group-hover:bg-gold group-hover:text-primary transition"><Mail className="w-5 h-5" /></div>
                <div><div className="text-xs text-primary-foreground/60">Email</div><div className="font-semibold">{EMAIL}</div></div>
              </a>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-white/10 grid place-items-center"><MapPin className="w-5 h-5" /></div>
                <div><div className="text-xs text-primary-foreground/60">Address</div><div className="font-semibold">Jiyyammavalasa, Andhra Pradesh, India</div></div>
              </div>
            </div>
            <div className="mt-8 rounded-xl overflow-hidden border border-white/10">
              <iframe
                title="Mill location"
                src="https://www.google.com/maps?q=Jiyyammavalasa,Andhra+Pradesh,India&output=embed"
                width="100%"
                height="240"
                style={{ border: 0 }}
                loading="lazy"
              />
            </div>
          </div>

          <form onSubmit={submit} className="bg-card text-foreground p-8 rounded-2xl shadow-premium space-y-4">
            <h3 className="text-2xl font-bold text-primary">Request a Quote</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <input required placeholder="Full Name *" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-3 rounded-md bg-secondary border border-border focus:border-primary outline-none" />
              <input placeholder="Company" value={form.company} onChange={e => setForm({...form, company: e.target.value})} className="w-full px-4 py-3 rounded-md bg-secondary border border-border focus:border-primary outline-none" />
              <input required type="email" placeholder="Email *" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-4 py-3 rounded-md bg-secondary border border-border focus:border-primary outline-none" />
              <input required placeholder="Phone *" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full px-4 py-3 rounded-md bg-secondary border border-border focus:border-primary outline-none" />
              <select value={form.product} onChange={e => setForm({...form, product: e.target.value})} className="w-full px-4 py-3 rounded-md bg-secondary border border-border focus:border-primary outline-none">
                {products.map(p => <option key={p.name}>{p.name}</option>)}
              </select>
              <input placeholder="Quantity (tons / bags)" value={form.qty} onChange={e => setForm({...form, qty: e.target.value})} className="w-full px-4 py-3 rounded-md bg-secondary border border-border focus:border-primary outline-none" />
            </div>
            <textarea placeholder="Message / Specifications" rows={4} value={form.message} onChange={e => setForm({...form, message: e.target.value})} className="w-full px-4 py-3 rounded-md bg-secondary border border-border focus:border-primary outline-none resize-none" />
            <button type="submit" disabled={sending} className="w-full inline-flex items-center justify-center gap-2 bg-gradient-gold text-primary py-3.5 rounded-md font-bold shadow-gold hover:scale-[1.01] transition disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100">
              {sending ? "Sending…" : <>Send Inquiry <ArrowRight className="w-4 h-4" /></>}
            </button>
            <p className="text-xs text-muted-foreground text-center">Your details are kept confidential. Used only for quote response.</p>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-foreground text-background/80 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between gap-4 text-sm">
          <div>© {new Date().getFullYear()} Gayathri Modern Rice Mill. All rights reserved.</div>
          <div className="flex gap-6">
            <a href="#about" className="hover:text-gold">About</a>
            <a href="#products" className="hover:text-gold">Products</a>
            <a href="#contact" className="hover:text-gold">Contact</a>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Chat Button */}
      <a
        href={`https://wa.me/${WHATSAPP.replace(/[^0-9]/g, "")}?text=Hello%20Gayathri%20Rice%20Mill,%20I'd%20like%20a%20wholesale%20quote.`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] text-white grid place-items-center shadow-2xl hover:scale-110 transition"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="w-7 h-7" />
        <span className="absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-40 animate-ping" />
      </a>

      {/* CART DRAWER */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setCartOpen(false)}
              className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed top-0 right-0 bottom-0 z-[61] w-full sm:w-[420px] bg-background shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-5 border-b border-border">
                <div className="flex items-center gap-3">
                  <button onClick={() => setCartOpen(false)} aria-label="Back" className="w-9 h-9 grid place-items-center rounded-md hover:bg-secondary">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <ShoppingCart className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-lg text-primary">Your Cart ({cartCount})</h3>
                </div>
                <button onClick={() => setCartOpen(false)} aria-label="Close cart" className="w-9 h-9 grid place-items-center rounded-md hover:bg-secondary">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {checkoutError && (
                <div className="mx-5 mt-4 flex items-start gap-3 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive" role="alert">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">{checkoutError}</div>
                  <button onClick={() => setCheckoutError(null)} aria-label="Dismiss error" className="text-destructive/70 hover:text-destructive">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}


              <div className="flex-1 overflow-y-auto p-5">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center gap-3 py-20">
                    <div className="w-16 h-16 rounded-full bg-secondary grid place-items-center">
                      <ShoppingCart className="w-7 h-7 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">Your cart is empty</p>
                    <button onClick={() => setCartOpen(false)} className="text-primary font-semibold hover:text-gold">Continue Shopping</button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map((item) => {
                      const img = item.product.node.images.edges[0]?.node;
                      const symbol = item.price.currencyCode === "INR" ? "₹" : item.price.currencyCode + " ";
                      const lineTotal = parseFloat(item.price.amount) * item.quantity;
                      return (
                        <div key={item.variantId} className="flex gap-3 p-3 rounded-lg border border-border bg-card">
                          {img && <img src={img.url} alt={item.product.node.title} width={80} height={80} loading="lazy" className="w-20 h-20 rounded-md object-cover bg-cream" />}
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm text-primary truncate">{item.product.node.title}</div>
                            <div className="text-xs text-muted-foreground">{item.variantTitle}</div>
                            <div className="mt-2 flex items-center justify-between">
                              <div className="flex items-center gap-2 border border-border rounded-md">
                                <button onClick={() => updateQuantity(item.variantId, item.quantity - 1)} disabled={item.quantity <= 1} aria-label="Decrease" className="w-7 h-7 grid place-items-center hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed"><Minus className="w-3.5 h-3.5" /></button>
                                <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.variantId, item.quantity + 1)} aria-label="Increase" className="w-7 h-7 grid place-items-center hover:bg-secondary"><Plus className="w-3.5 h-3.5" /></button>
                              </div>
                              <div className="font-bold text-primary">{symbol}{lineTotal.toFixed(0)}</div>
                            </div>
                          </div>
                          <button onClick={() => removeItem(item.variantId)} aria-label="Remove" className="text-muted-foreground hover:text-destructive self-start"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {items.length > 0 && (
                <div className="p-5 border-t border-border bg-cream space-y-3">
                  <div className="flex justify-between text-lg font-bold"><span>Total</span><span className="text-primary">{currency === "INR" ? "₹" : currency + " "}{cartTotal.toFixed(2)}</span></div>
                  {blockedUrl ? (
                    <>
                      <a
                        href={blockedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-2 bg-gradient-gold text-primary py-3 rounded-md font-bold shadow-gold hover:scale-[1.01] transition"
                      >
                        <ExternalLink className="w-4 h-4" /> Click to Open Checkout
                      </a>
                      <button onClick={() => { setBlockedUrl(null); setCheckoutError(null); }} className="w-full inline-flex items-center justify-center gap-2 border border-border text-muted-foreground py-2 rounded-md text-sm hover:bg-secondary transition">
                        <ArrowLeft className="w-4 h-4" /> Back to Cart
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={checkout} disabled={isLoading || isSyncing} className="w-full inline-flex items-center justify-center gap-2 bg-gradient-gold text-primary py-3 rounded-md font-bold shadow-gold hover:scale-[1.01] transition disabled:opacity-60 disabled:cursor-not-allowed">
                        {isLoading || isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ShoppingCart className="w-4 h-4" /> Buy Now</>}
                      </button>
                      <button onClick={checkout} disabled={isLoading || isSyncing} className="w-full inline-flex items-center justify-center gap-2 border border-primary text-primary py-2.5 rounded-md font-semibold hover:bg-primary/5 transition disabled:opacity-60 disabled:cursor-not-allowed">
                        {isLoading || isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ExternalLink className="w-4 h-4" /> Checkout Securely</>}
                      </button>
                    </>
                  )}
                  <label className="flex items-center gap-2 text-xs text-muted-foreground select-none pt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sameTab}
                      onChange={(e) => toggleSameTab(e.target.checked)}
                      className="w-4 h-4 accent-primary rounded"
                    />
                    Open checkout in the same tab (use this if your browser blocks popups)
                  </label>
                </div>
              )}


            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
