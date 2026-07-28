import { Link, useRouterState } from "@tanstack/react-router";
import {
  User as UserIcon,
  Package,
  Heart,
  MapPin,
  CreditCard,
  Bell,
  Gift,
  Star,
  Settings,
  Shield,
  Languages,
  ArrowLeft,
} from "lucide-react";
import { Toaster } from "@/components/ui/sonner";

const NAV = [
  { to: "/profile", label: "My Profile", icon: UserIcon },
  { to: "/orders", label: "My Orders", icon: Package },
  { to: "/wishlist", label: "Wishlist", icon: Heart },
  { to: "/addresses", label: "Saved Addresses", icon: MapPin },
  { to: "/payment-methods", label: "Payment Methods", icon: CreditCard },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/offers", label: "Offers & Coupons", icon: Gift },
  { to: "/reviews", label: "Reviews & Ratings", icon: Star },
  { to: "/settings", label: "Account Settings", icon: Settings },
  { to: "/privacy", label: "Privacy & Security", icon: Shield },
  { to: "/language", label: "Language", icon: Languages },
] as const;

export function AccountLayout({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      <Toaster richColors position="top-center" />
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="container mx-auto max-w-6xl flex items-center justify-between py-4 px-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
          <h1 className="text-sm md:text-base font-semibold truncate">{title}</h1>
          <span className="w-20" />
        </div>
      </header>

      <main className="container mx-auto max-w-6xl px-4 py-6 md:py-8 grid gap-6 md:grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <nav
          aria-label="Account navigation"
          className="md:sticky md:top-20 md:self-start"
        >
          {/* Mobile: horizontal scroll */}
          <div className="md:hidden -mx-4 px-4 overflow-x-auto">
            <ul className="flex gap-2 pb-2 min-w-max">
              {NAV.map(({ to, label, icon: Icon }) => {
                const active = pathname === to;
                return (
                  <li key={to}>
                    <Link
                      to={to}
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium border transition whitespace-nowrap ${
                        active
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card text-foreground border-border hover:border-primary/40"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Desktop: vertical list */}
          <ul className="hidden md:flex flex-col gap-1 bg-card border border-border/60 rounded-xl p-2 shadow-sm">
            {NAV.map(({ to, label, icon: Icon }) => {
              const active = pathname === to;
              return (
                <li key={to}>
                  <Link
                    to={to}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                      active
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? "text-primary" : "text-muted-foreground"}`} />
                    <span className="truncate">{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Content */}
        <section className="min-w-0">
          <div className="mb-5">
            <h2 className="text-2xl font-display font-bold">{title}</h2>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          {children}
        </section>
      </main>
    </div>
  );
}
