import { Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  User as UserIcon,
  Package,
  Heart,
  ShoppingCart,
  MapPin,
  CreditCard,
  Bell,
  Gift,
  Star,
  Settings,
  Shield,
  Languages,
  Sun,
  Moon,
  LifeBuoy,
  Phone,
  LogOut,
  ChevronDown,
  BadgeCheck,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTheme } from "@/hooks/useTheme";

type Action = () => void;
type Item = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  to?: string;
  onClick?: Action;
  destructive?: boolean;
  trailing?: React.ReactNode;
};

interface UserMenuProps {
  onOpenCart: () => void;
}

export function UserMenu({ onOpenCart }: UserMenuProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  if (!user) return null;

  const meta = user.user_metadata ?? {};
  const fullName =
    (meta.full_name as string) ||
    (meta.name as string) ||
    user.email?.split("@")[0] ||
    "Guest";
  const avatarUrl = (meta.avatar_url as string) || (meta.picture as string) || "";
  const emailVerified = Boolean(user.email_confirmed_at);
  const initials = fullName
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  async function handleSignOut() {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/" });
  }

  const sections: { title?: string; items: Item[] }[] = [
    {
      items: [
        { icon: UserIcon, label: "My Profile", to: "/profile" },
        { icon: Package, label: "My Orders", to: "/orders" },
        { icon: Heart, label: "Wishlist", to: "/profile", trailing: <span className="text-[10px] text-muted-foreground">Saved</span> },
        { icon: ShoppingCart, label: "Cart", onClick: () => { setOpen(false); onOpenCart(); } },
      ],
    },
    {
      title: "Account",
      items: [
        { icon: MapPin, label: "Saved Addresses", to: "/profile" },
        { icon: CreditCard, label: "Payment Methods", to: "/profile" },
        { icon: Bell, label: "Notifications", to: "/settings" },
        { icon: Gift, label: "Offers & Coupons", to: "/profile" },
        { icon: Star, label: "Reviews & Ratings", to: "/settings" },
      ],
    },
    {
      title: "Preferences",
      items: [
        { icon: Settings, label: "Account Settings", to: "/profile" },
        { icon: Shield, label: "Privacy & Security", to: "/profile" },
        { icon: Languages, label: "Language", to: "/settings" },
        {
          icon: theme === "dark" ? Sun : Moon,
          label: theme === "dark" ? "Light Mode" : "Dark Mode",
          onClick: toggleTheme,
        },
      ],
    },
    {
      title: "Support",
      items: [
        { icon: LifeBuoy, label: "Help & Support", to: "/help" },
        { icon: Phone, label: "Contact Us", to: "/", trailing: <span className="text-[10px] text-muted-foreground">#contact</span> },
      ],
    },
    {
      items: [{ icon: LogOut, label: "Logout", onClick: handleSignOut, destructive: true }],
    },
  ];

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Open account menu"
          className="group flex items-center gap-2 rounded-full bg-transparent pl-1 pr-2 py-1 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition"
        >
          <span className="relative">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={fullName}
                referrerPolicy="no-referrer"
                className="w-9 h-9 rounded-full object-cover border-2 border-primary/30"
              />
            ) : (
              <span className="grid place-items-center w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/60 text-primary-foreground text-xs font-bold border-2 border-primary/30">
                {initials || "U"}
              </span>
            )}
            <span
              aria-hidden
              className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-background"
            />
          </span>
          <span className="hidden md:block text-sm font-semibold truncate max-w-[110px]">
            {fullName}
          </span>
          <ChevronDown className="hidden md:block w-4 h-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-80 p-0 overflow-hidden border-border/60 shadow-2xl backdrop-blur supports-[backdrop-filter]:bg-background/85"
      >
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 340, damping: 28 }}
            >
              {/* Header card */}
              <div className="relative px-4 py-4 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-b border-border/60">
                <div className="flex items-center gap-3">
                  <span className="relative shrink-0">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={fullName}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-full object-cover border-2 border-primary/30"
                      />
                    ) : (
                      <span className="grid place-items-center w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 text-primary-foreground font-bold border-2 border-primary/30">
                        {initials || "U"}
                      </span>
                    )}
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-background" />
                  </span>
                  <div className="min-w-0">
                    <div className="font-semibold truncate text-sm">{fullName}</div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground truncate">
                      <span className="truncate">{user.email}</span>
                      {emailVerified && (
                        <BadgeCheck className="w-3.5 h-3.5 text-primary shrink-0" aria-label="Verified" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sections */}
              <div className="max-h-[60vh] overflow-y-auto py-1">
                {sections.map((section, si) => (
                  <div key={si} className="py-1">
                    {section.title && (
                      <div className="px-4 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                        {section.title}
                      </div>
                    )}
                    {section.items.map((item, ii) => {
                      const Icon = item.icon;
                      const base =
                        "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors focus:outline-none";
                      const colors = item.destructive
                        ? "text-destructive hover:bg-destructive/10 focus:bg-destructive/10"
                        : "hover:bg-primary/5 focus:bg-primary/5";
                      const inner = (
                        <>
                          <Icon className={`w-4 h-4 ${item.destructive ? "" : "text-muted-foreground"}`} />
                          <span className="flex-1 text-left truncate">{item.label}</span>
                          {item.trailing}
                        </>
                      );
                      if (item.to) {
                        return (
                          <Link
                            key={ii}
                            to={item.to}
                            onClick={() => setOpen(false)}
                            className={`${base} ${colors}`}
                          >
                            {inner}
                          </Link>
                        );
                      }
                      return (
                        <button
                          key={ii}
                          onClick={item.onClick}
                          className={`${base} ${colors}`}
                        >
                          {inner}
                        </button>
                      );
                    })}
                    {si < sections.length - 1 && <div className="my-1 h-px bg-border/60" />}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
