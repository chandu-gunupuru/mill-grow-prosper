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
} from "lucide-react";

export const ACCOUNT_NAV = [
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

/** Horizontal, scrollable account navigation (used on full-width pages). */
export function AccountNavBar({ className = "" }: { className?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav aria-label="Account navigation" className={`-mx-4 px-4 overflow-x-auto ${className}`}>
      <ul className="flex gap-2 pb-2 min-w-max">
        {ACCOUNT_NAV.map(({ to, label, icon: Icon }) => {
          const active = pathname === to;
          return (
            <li key={to}>
              <Link
                to={to}
                aria-current={active ? "page" : undefined}
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
    </nav>
  );
}

/** Sidebar account navigation: chips on mobile, vertical list on desktop. */
export function AccountNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav aria-label="Account navigation" className="md:sticky md:top-20 md:self-start">
      <div className="md:hidden">
        <AccountNavBar />
      </div>
      <ul className="hidden md:flex flex-col gap-1 bg-card border border-border/60 rounded-xl p-2 shadow-sm">
        {ACCOUNT_NAV.map(({ to, label, icon: Icon }) => {
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
  );
}
