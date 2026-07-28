import { createFileRoute, Link } from "@tanstack/react-router";
import { Gift, Copy, Sparkles } from "lucide-react";
import { AccountLayout } from "@/components/AccountLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/offers")({
  head: () => ({ meta: [{ title: "Offers & Coupons — Gayathri Rice Mill" }] }),
  component: OffersPage,
});

const OFFERS = [
  { code: "WELCOME10", title: "10% off your first order", desc: "Valid on orders above ₹500. New customers only." },
  { code: "RICE50", title: "Flat ₹50 off", desc: "Applies to any 5kg pack of premium rice." },
  { code: "FREESHIP", title: "Free shipping", desc: "On prepaid orders above ₹999." },
];

export function OffersPage() {
  return (
    <AccountLayout
      title="Offers & Coupons"
      description="Active deals you can use at checkout."
    >
      <div className="grid sm:grid-cols-2 gap-3">
        {OFFERS.map((o) => (
          <Card
            key={o.code}
            className="p-5 border-border/60 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-bl-full" />
            <div className="relative flex items-start gap-3">
              <div className="grid place-items-center w-10 h-10 rounded-md bg-primary/10 text-primary shrink-0">
                <Gift className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-sm">{o.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{o.desc}</div>
                <div className="mt-3 flex items-center gap-2">
                  <code className="px-2 py-1 rounded-md bg-muted text-xs font-mono">{o.code}</code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      navigator.clipboard?.writeText(o.code);
                      toast.success(`Copied ${o.code}`);
                    }}
                  >
                    <Copy className="w-3.5 h-3.5 mr-1" /> Copy
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <Card className="mt-4 p-5 border-border/60 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-primary" />
          <div className="text-sm">
            <div className="font-medium">Shop now to use your coupons</div>
            <div className="text-xs text-muted-foreground">Apply at checkout to save.</div>
          </div>
        </div>
        <Button asChild size="sm">
          <Link to="/" hash="shop">Shop now</Link>
        </Button>
      </Card>
    </AccountLayout>
  );
}
