import { createFileRoute } from "@tanstack/react-router";
import { CreditCard, ShieldCheck } from "lucide-react";
import { AccountLayout } from "@/components/AccountLayout";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/payment-methods")({
  head: () => ({ meta: [{ title: "Payment Methods — Gayathri Rice Mill" }] }),
  component: PaymentMethodsPage,
});

function PaymentMethodsPage() {
  const methods = [
    { name: "UPI", desc: "Google Pay, PhonePe, Paytm & any UPI app" },
    { name: "Credit / Debit Card", desc: "Visa, Mastercard, RuPay, Amex" },
    { name: "Net Banking", desc: "All major Indian banks supported" },
    { name: "Cash on Delivery", desc: "Available on eligible orders" },
  ];

  return (
    <AccountLayout
      title="Payment Methods"
      description="Payment options available at checkout."
    >
      <div className="grid sm:grid-cols-2 gap-3">
        {methods.map((m) => (
          <Card key={m.name} className="p-5 border-border/60 flex items-start gap-3">
            <div className="grid place-items-center w-10 h-10 rounded-md bg-primary/10 text-primary shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-sm">{m.name}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{m.desc}</div>
            </div>
          </Card>
        ))}
      </div>
      <Card className="mt-4 p-4 border-border/60 flex items-center gap-3 bg-muted/40">
        <ShieldCheck className="w-5 h-5 text-emerald-600" />
        <p className="text-sm text-muted-foreground">
          Payment details are never stored on our servers. All transactions are
          processed securely by our payment provider.
        </p>
      </Card>
    </AccountLayout>
  );
}
