import { createFileRoute, Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { AccountLayout } from "@/components/AccountLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/reviews")({
  head: () => ({ meta: [{ title: "Reviews & Ratings — Gayathri Rice Mill" }] }),
  component: ReviewsPage,
});

function ReviewsPage() {
  // Reviews UI scaffold — data source can be attached later.
  const reviews: Array<{ id: string; product: string; rating: number; text: string; date: string }> = [];

  return (
    <AccountLayout
      title="Reviews & Ratings"
      description="Reviews you've left on our products."
    >
      {reviews.length === 0 ? (
        <Card className="p-10 border-border/60 text-center">
          <Star className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-semibold">No reviews yet</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Share your experience with our rice — your review helps other customers.
          </p>
          <Button asChild className="mt-4" size="sm">
            <Link to="/orders">Review a past order</Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <Card key={r.id} className="p-5 border-border/60">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-sm">{r.product}</div>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < r.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">{r.text}</p>
              <div className="text-xs text-muted-foreground mt-2">{r.date}</div>
            </Card>
          ))}
        </div>
      )}
    </AccountLayout>
  );
}
