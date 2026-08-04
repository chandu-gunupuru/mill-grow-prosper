import { Link, useNavigate } from "@tanstack/react-router";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
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
  BadgeCheck,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTheme } from "@/hooks/useTheme";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

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
    setOpen(false);
    await supabase.auth.signOut();
    toast.success(t("common.signedOut"));
    navigate({ to: "/" });
  }

  const sections: { title?: string; items: Item[] }[] = [
    {
      items: [
        { icon: UserIcon, label: t("account.myProfile"), to: "/profile" },
        { icon: Package, label: t("account.myOrders"), to: "/orders" },
        { icon: Heart, label: t("wishlist.title"), to: "/wishlist" },
        { icon: ShoppingCart, label: t("account.cart"), onClick: () => { setOpen(false); onOpenCart(); } },
      ],
    },
    {
      title: t("account.account"),
      items: [
        { icon: MapPin, label: t("account.savedAddresses"), to: "/addresses" },
        { icon: CreditCard, label: t("account.paymentMethods"), to: "/payment-methods" },
        { icon: Bell, label: t("account.notifications"), to: "/notifications" },
        { icon: Gift, label: t("account.offers"), to: "/offers" },
        { icon: Star, label: t("account.reviews"), to: "/reviews" },
      ],
    },
    {
      title: t("account.preferences"),
      items: [
        { icon: Settings, label: t("account.settings"), to: "/settings" },
        { icon: Shield, label: t("account.privacy"), to: "/privacy" },
        { icon: Languages, label: t("account.language"), to: "/language" },
        {
          icon: theme === "dark" ? Sun : Moon,
          label: theme === "dark" ? t("theme.light") : t("theme.dark"),
          onClick: toggleTheme,
        },
      ],
    },
    {
      title: t("account.support"),
      items: [
        { icon: LifeBuoy, label: t("account.help"), to: "/help" },
        { icon: Phone, label: t("account.contactUs"), to: "/", trailing: <span className="text-[10px] text-muted-foreground">#contact</span> },
      ],
    },
    {
      items: [{ icon: LogOut, label: t("common.signOut"), onClick: handleSignOut, destructive: true }],
    },
  ];


  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          aria-label={t("account.openMenu")}
          className="group flex items-center rounded-full bg-transparent p-1 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition"
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
        </button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-[88vw] sm:w-96 p-0 flex flex-col gap-0 border-border/60"
      >
        {/* Header card */}
        <div className="relative px-5 py-5 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-b border-border/60">
          <div className="flex items-center gap-3">
            <span className="relative shrink-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={fullName}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-full object-cover border-2 border-primary/30"
                />
              ) : (
                <span className="grid place-items-center w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/60 text-primary-foreground font-bold border-2 border-primary/30">
                  {initials || "U"}
                </span>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-background" />
            </span>
            <div className="min-w-0">
              <div className="font-semibold truncate text-base">{fullName}</div>
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
        <div className="flex-1 overflow-y-auto py-1">
          {sections.map((section, si) => (
            <div key={si} className="py-1">
              {section.title && (
                <div className="px-5 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                  {section.title}
                </div>
              )}
              {section.items.map((item, ii) => {
                const Icon = item.icon;
                const base =
                  "w-full flex items-center gap-3 px-5 py-3 text-sm transition-colors focus:outline-none";
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
      </SheetContent>
    </Sheet>
  );
}
