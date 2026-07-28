import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart, Trash2 } from "lucide-react";
import { AccountLayout } from "@/components/AccountLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { wishlist } from "@/lib/wishlist";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/wishlist")({
  head: () => ({ meta: [{ title: "Wishlist — Gayathri Rice Mill" }] }),
  component: WishlistPage,
});

function WishlistPage() {
  const [ids, setIds] = useState<string[]>(() => wishlist.list());
  useEffect(() => wishlist.subscribe(() => setIds(wishlist.list())), []);

  return (
    <AccountLayout title="Wishlist" description="Products you've saved for later.">
      {ids.length === 0 ? (
        <Card className="p-10 text-center border-border/60">
          <Heart className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-semibold">Your wishlist is empty</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Tap the heart on any product to save it here.
          </p>
          <Link
            to="/"
            hash="shop"
            className="inline-flex items-center gap-2 mt-4 text-sm text-primary hover:underline"
          >
            Browse products
          </Link>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {ids.map((id) => {
            const short = id.split("/").pop() || id;
            return (
              <Card key={id} className="p-4 border-border/60 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate">Product #{short}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Saved to your wishlist</div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button asChild size="sm" variant="outline">
                    <Link to="/" hash="shop">View</Link>
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Remove from wishlist"
                    onClick={() => {
                      wishlist.remove(id);
                      toast.success("Removed from Wishlist");
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </AccountLayout>
  );
}
