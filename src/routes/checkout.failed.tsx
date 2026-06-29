import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { XCircle, RotateCcw, CreditCard, LifeBuoy, Home } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/checkout/failed")({
  ssr: false,
  component: CheckoutFailedPage,
  validateSearch: (search: Record<string, unknown>) => ({
    reason: typeof search.reason === "string" ? search.reason : null,
  }),
});

function CheckoutFailedPage() {
  const { reason } = Route.useSearch();

  return (
    <div className="min-h-screen bg-cream text-foreground">
      <Toaster richColors position="top-right" />
      <main className="max-w-2xl mx-auto px-5 py-12">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 18 }}
          className="bg-card border border-destructive/30 rounded-2xl p-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 240, damping: 14 }}
            className="w-20 h-20 rounded-full bg-destructive/10 grid place-items-center mx-auto mb-4"
          >
            <XCircle className="w-12 h-12 text-destructive" strokeWidth={2.5} />
          </motion.div>
          <h1 className="text-3xl font-extrabold tracking-tight">Payment Failed</h1>
          <p className="text-muted-foreground mt-2">
            {reason
              ? reason
              : "Your payment couldn't be completed. No amount was charged."}
          </p>

          <div className="mt-6 grid sm:grid-cols-2 gap-2">
            <Link
              to="/checkout"
              className="inline-flex items-center justify-center gap-2 bg-gradient-gold text-primary px-4 py-3 rounded-md font-bold shadow-gold hover:scale-[1.01] transition"
            >
              <RotateCcw className="w-4 h-4" /> Retry Payment
            </Link>
            <Link
              to="/checkout"
              className="inline-flex items-center justify-center gap-2 border border-border bg-background px-4 py-3 rounded-md font-semibold hover:bg-secondary"
            >
              <CreditCard className="w-4 h-4" /> Change Payment Method
            </Link>
          </div>

          <div className="mt-3 grid sm:grid-cols-2 gap-2">
            <Link
              to="/help"
              className="inline-flex items-center justify-center gap-2 border border-border bg-background px-4 py-3 rounded-md font-semibold hover:bg-secondary"
            >
              <LifeBuoy className="w-4 h-4" /> Contact Support
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 border border-border bg-background px-4 py-3 rounded-md font-semibold hover:bg-secondary"
            >
              <Home className="w-4 h-4" /> Back to Home
            </Link>
          </div>

          <p className="text-xs text-muted-foreground mt-6">
            If you were charged but see this page, please contact our support team with your order
            details and we'll resolve it within 24 hours.
          </p>
        </motion.div>
      </main>
    </div>
  );
}
