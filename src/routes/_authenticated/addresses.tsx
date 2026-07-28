import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { MapPin, Plus, Pencil, Trash2, Loader2, Save } from "lucide-react";
import { AccountLayout } from "@/components/AccountLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  listMyAddresses,
  upsertMyAddress,
  deleteMyAddress,
  setDefaultAddress,
  type AddressRow,
} from "@/lib/profile.functions";

export const Route = createFileRoute("/_authenticated/addresses")({
  head: () => ({ meta: [{ title: "Saved Addresses — Gayathri Rice Mill" }] }),
  component: AddressesPage,
});

function AddressesPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(listMyAddresses);
  const upsertFn = useServerFn(upsertMyAddress);
  const deleteFn = useServerFn(deleteMyAddress);
  const setDefaultFn = useServerFn(setDefaultAddress);

  const { data, isLoading } = useQuery({
    queryKey: ["my-addresses"],
    queryFn: () => listFn(),
  });

  const addresses = data?.addresses ?? [];
  const [editing, setEditing] = useState<Partial<AddressRow> | null>(null);
  const empty: Partial<AddressRow> = {
    label: "Home",
    line1: "",
    city: "",
    state: "",
    postal_code: "",
    country: "India",
    is_default: false,
  };

  async function onSave(a: Partial<AddressRow> & { line1: string }) {
    try {
      await upsertFn({ data: a });
      toast.success("Address saved");
      qc.invalidateQueries({ queryKey: ["my-addresses"] });
      setEditing(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    }
  }

  async function onDelete(id: string) {
    try {
      await deleteFn({ data: { id } });
      toast.success("Address removed");
      qc.invalidateQueries({ queryKey: ["my-addresses"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  }

  async function onSetDefault(id: string) {
    try {
      await setDefaultFn({ data: { id } });
      toast.success("Default updated");
      qc.invalidateQueries({ queryKey: ["my-addresses"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    }
  }

  return (
    <AccountLayout
      title="Saved Addresses"
      description="Manage delivery addresses used at checkout."
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Your addresses</h3>
        <Button size="sm" onClick={() => setEditing(empty)}>
          <Plus className="w-4 h-4 mr-1" /> Add new
        </Button>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-3">
          {[1, 2].map((i) => <Skeleton key={i} className="h-32" />)}
        </div>
      ) : addresses.length === 0 ? (
        <Card className="p-8 border-border/60 text-center">
          <MapPin className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-semibold">No addresses saved</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Add an address to speed up checkout.
          </p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {addresses.map((a) => (
            <Card
              key={a.id}
              className={`p-5 border-border/60 ${a.is_default ? "ring-2 ring-primary/30" : ""}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{a.label || "Address"}</span>
                    {a.is_default && (
                      <span className="text-[10px] uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  {a.recipient_name && <div className="text-sm mt-1">{a.recipient_name}</div>}
                  <div className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    {a.line1}{a.line2 ? `, ${a.line2}` : ""}<br />
                    {[a.city, a.state, a.postal_code].filter(Boolean).join(", ")}<br />
                    {a.country}
                  </div>
                  {a.phone && <div className="text-xs text-muted-foreground mt-1">📞 {a.phone}</div>}
                </div>
                <div className="flex flex-col gap-1">
                  <Button size="icon" variant="ghost" onClick={() => setEditing(a)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => onDelete(a.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
              {!a.is_default && (
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3 w-full"
                  onClick={() => onSetDefault(a.id)}
                >
                  Set as default
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}

      {editing && (
        <AddressEditor
          initial={editing}
          onCancel={() => setEditing(null)}
          onSave={onSave}
        />
      )}
    </AccountLayout>
  );
}

function AddressEditor({
  initial,
  onCancel,
  onSave,
}: {
  initial: Partial<AddressRow>;
  onCancel: () => void;
  onSave: (a: Partial<AddressRow> & { line1: string }) => Promise<void>;
}) {
  const [a, setA] = useState<Partial<AddressRow>>(initial);
  const [saving, setSaving] = useState(false);

  return (
    <Card className="mt-4 p-6 border-primary/30">
      <h3 className="font-semibold mb-4">{a.id ? "Edit address" : "Add new address"}</h3>
      <div className="grid md:grid-cols-2 gap-3">
        <div className="space-y-2"><Label>Label</Label><Input value={a.label ?? ""} onChange={(e) => setA({ ...a, label: e.target.value })} placeholder="Home, Office..." /></div>
        <div className="space-y-2"><Label>Recipient name</Label><Input value={a.recipient_name ?? ""} onChange={(e) => setA({ ...a, recipient_name: e.target.value })} /></div>
        <div className="md:col-span-2 space-y-2"><Label>Address line 1 *</Label><Input required value={a.line1 ?? ""} onChange={(e) => setA({ ...a, line1: e.target.value })} /></div>
        <div className="md:col-span-2 space-y-2"><Label>Address line 2</Label><Input value={a.line2 ?? ""} onChange={(e) => setA({ ...a, line2: e.target.value })} /></div>
        <div className="space-y-2"><Label>City</Label><Input value={a.city ?? ""} onChange={(e) => setA({ ...a, city: e.target.value })} /></div>
        <div className="space-y-2"><Label>State</Label><Input value={a.state ?? ""} onChange={(e) => setA({ ...a, state: e.target.value })} /></div>
        <div className="space-y-2"><Label>Postal code</Label><Input value={a.postal_code ?? ""} onChange={(e) => setA({ ...a, postal_code: e.target.value })} /></div>
        <div className="space-y-2"><Label>Country</Label><Input value={a.country ?? "India"} onChange={(e) => setA({ ...a, country: e.target.value })} /></div>
        <div className="space-y-2"><Label>Phone</Label><Input value={a.phone ?? ""} onChange={(e) => setA({ ...a, phone: e.target.value })} /></div>
        <div className="flex items-center gap-2 mt-6">
          <Switch checked={Boolean(a.is_default)} onCheckedChange={(v) => setA({ ...a, is_default: v })} />
          <Label className="cursor-pointer">Set as default</Label>
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button
          disabled={saving || !a.line1?.trim()}
          onClick={async () => {
            setSaving(true);
            try {
              await onSave({ ...a, line1: a.line1!.trim() });
            } finally {
              setSaving(false);
            }
          }}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span className="ml-2">Save</span>
        </Button>
      </div>
    </Card>
  );
}
