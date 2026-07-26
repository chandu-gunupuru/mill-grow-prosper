import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft, User as UserIcon, MapPin, Settings, Package, Heart, Shield,
  Plus, Trash2, Pencil, Loader2, CheckCircle2, KeyRound, Link2, Link2Off,
  LogOut, AlertTriangle, BadgeCheck, Mail, Phone as PhoneIcon, Calendar,
  Hash, Save,
} from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader,
  AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  getMyProfile, updateMyProfile, listMyAddresses, upsertMyAddress,
  deleteMyAddress, setDefaultAddress, deleteMyAccount, type AddressRow,
} from "@/lib/profile.functions";
import { listMyShopifyOrders } from "@/lib/orders.functions";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "My Profile — Gayathri Rice Mill" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const getProfileFn = useServerFn(getMyProfile);
  const updateProfileFn = useServerFn(updateMyProfile);
  const listAddressesFn = useServerFn(listMyAddresses);
  const upsertAddressFn = useServerFn(upsertMyAddress);
  const deleteAddressFn = useServerFn(deleteMyAddress);
  const setDefaultFn = useServerFn(setDefaultAddress);
  const deleteAccountFn = useServerFn(deleteMyAccount);
  const listOrdersFn = useServerFn(listMyShopifyOrders);

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => getProfileFn(),
  });
  const { data: addressData, isLoading: addrLoading } = useQuery({
    queryKey: ["my-addresses"],
    queryFn: () => listAddressesFn(),
  });
  const { data: ordersData } = useQuery({
    queryKey: ["my-orders-summary"],
    queryFn: () => listOrdersFn(),
  });

  const profile = profileData?.profile;
  const meta = user?.user_metadata ?? {};
  const fullNameDisplay =
    profile?.full_name || (meta.full_name as string) || (meta.name as string) || user?.email?.split("@")[0] || "Guest";
  const avatarUrl = profile?.avatar_url || (meta.avatar_url as string) || (meta.picture as string) || "";
  const initials = fullNameDisplay.split(/\s+/).map(w => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
  const providers = profileData?.providers ?? [];
  const hasGoogle = providers.includes("google");
  const customerId = user?.id ? user.id.slice(0, 8).toUpperCase() : "—";
  const joined = profile?.created_at || user?.created_at;

  // Personal Info form
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  // Initialize once profile loads
  useMemo(() => {
    if (profile && !fullName && !phone) {
      setFullName(profile.full_name || fullNameDisplay);
      setPhone(profile.phone || "");
    }
  }, [profile]);

  async function handleSaveProfile() {
    setSavingProfile(true);
    try {
      await updateProfileFn({ data: { full_name: fullName, phone, avatar_url: avatarUrl } });
      toast.success("Profile updated");
      qc.invalidateQueries({ queryKey: ["my-profile"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    } finally {
      setSavingProfile(false);
    }
  }

  // Order summary derivation
  const orders = ordersData?.orders ?? [];
  const summary = useMemo(() => {
    let active = 0, delivered = 0, cancelled = 0, totalSpent = 0;
    for (const o of orders) {
      const t = parseFloat(o.total || "0");
      if (Number.isFinite(t)) totalSpent += t;
      if (o.cancelledAt) cancelled++;
      else if ((o.fulfillmentStatus ?? "").toLowerCase() === "fulfilled") delivered++;
      else active++;
    }
    return { total: orders.length, active, delivered, cancelled, totalSpent };
  }, [orders]);

  // Change password
  const [newPwd, setNewPwd] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);
  async function handleChangePassword() {
    if (newPwd.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    setPwdLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPwd });
    setPwdLoading(false);
    if (error) toast.error(error.message);
    else { toast.success("Password updated"); setNewPwd(""); }
  }

  async function handleSignOutAll() {
    await supabase.auth.signOut({ scope: "global" });
    toast.success("Signed out everywhere");
    navigate({ to: "/" });
  }

  async function handleDeleteAccount() {
    try {
      await deleteAccountFn();
      await supabase.auth.signOut();
      toast.success("Account deleted");
      navigate({ to: "/" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not delete account");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      <Toaster richColors position="top-center" />
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="container mx-auto max-w-5xl flex items-center justify-between py-4 px-4">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
          <h1 className="text-sm md:text-base font-semibold">My Profile</h1>
          <span className="w-20" />
        </div>
      </header>

      <main className="container mx-auto max-w-5xl px-4 py-6 md:py-10">
        {/* Hero card */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Card className="relative overflow-hidden border-border/60 bg-gradient-to-br from-primary/10 via-card to-card shadow-lg">
            <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6">
              <span className="relative shrink-0 mx-auto md:mx-0">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={fullNameDisplay} referrerPolicy="no-referrer"
                       className="w-24 h-24 rounded-full object-cover border-4 border-background shadow-xl" />
                ) : (
                  <span className="grid place-items-center w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/60 text-primary-foreground text-2xl font-bold border-4 border-background shadow-xl">
                    {initials || "U"}
                  </span>
                )}
                <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 ring-4 ring-background" />
              </span>
              <div className="text-center md:text-left flex-1 min-w-0">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <h2 className="text-2xl md:text-3xl font-display font-bold truncate">{fullNameDisplay}</h2>
                  {profileData?.emailVerified && <BadgeCheck className="w-5 h-5 text-primary" />}
                </div>
                <div className="mt-1 text-sm text-muted-foreground truncate">{user?.email}</div>
                <div className="mt-3 flex flex-wrap justify-center md:justify-start gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted">
                    <Hash className="w-3 h-3" /> {customerId}
                  </span>
                  {joined && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted">
                      <Calendar className="w-3 h-3" /> Joined {new Date(joined).toLocaleDateString(undefined, { month: "short", year: "numeric" })}
                    </span>
                  )}
                  {hasGoogle && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                      <Link2 className="w-3 h-3" /> Google linked
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <Tabs defaultValue="personal" className="mt-6">
          <TabsList className="w-full overflow-x-auto justify-start md:justify-center flex-nowrap whitespace-nowrap">
            <TabsTrigger value="personal"><UserIcon className="w-4 h-4 md:mr-1" /><span className="hidden md:inline">Personal</span></TabsTrigger>
            <TabsTrigger value="addresses"><MapPin className="w-4 h-4 md:mr-1" /><span className="hidden md:inline">Addresses</span></TabsTrigger>
            <TabsTrigger value="account"><Settings className="w-4 h-4 md:mr-1" /><span className="hidden md:inline">Account</span></TabsTrigger>
            <TabsTrigger value="orders"><Package className="w-4 h-4 md:mr-1" /><span className="hidden md:inline">Orders</span></TabsTrigger>
            <TabsTrigger value="saved"><Heart className="w-4 h-4 md:mr-1" /><span className="hidden md:inline">Saved</span></TabsTrigger>
            <TabsTrigger value="security"><Shield className="w-4 h-4 md:mr-1" /><span className="hidden md:inline">Security</span></TabsTrigger>
          </TabsList>

          {/* PERSONAL */}
          <TabsContent value="personal" className="mt-4">
            <Card className="p-6 border-border/60">
              {profileLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-1/2" />
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full name</Label>
                    <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1"><Mail className="w-3 h-3" /> Email</Label>
                    <Input value={user?.email ?? ""} readOnly disabled />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1"><PhoneIcon className="w-3 h-3" /> Phone</Label>
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 90000 00000" />
                  </div>
                  <div className="space-y-2">
                    <Label>Customer ID</Label>
                    <Input value={customerId} readOnly disabled />
                  </div>
                  <div className="md:col-span-2 flex justify-end">
                    <Button onClick={handleSaveProfile} disabled={savingProfile}>
                      {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      <span className="ml-2">Save changes</span>
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* ADDRESSES */}
          <TabsContent value="addresses" className="mt-4 space-y-4">
            <AddressManager
              loading={addrLoading}
              addresses={addressData?.addresses ?? []}
              onSave={async (a) => {
                try { await upsertAddressFn({ data: a }); toast.success("Address saved"); qc.invalidateQueries({ queryKey: ["my-addresses"] }); }
                catch (e) { toast.error(e instanceof Error ? e.message : "Save failed"); }
              }}
              onDelete={async (id) => {
                try { await deleteAddressFn({ data: { id } }); toast.success("Address removed"); qc.invalidateQueries({ queryKey: ["my-addresses"] }); }
                catch (e) { toast.error(e instanceof Error ? e.message : "Delete failed"); }
              }}
              onSetDefault={async (id) => {
                try { await setDefaultFn({ data: { id } }); toast.success("Default updated"); qc.invalidateQueries({ queryKey: ["my-addresses"] }); }
                catch (e) { toast.error(e instanceof Error ? e.message : "Update failed"); }
              }}
            />
          </TabsContent>

          {/* ACCOUNT */}
          <TabsContent value="account" className="mt-4 grid md:grid-cols-2 gap-4">
            <Card className="p-6 border-border/60">
              <h3 className="font-semibold mb-3 flex items-center gap-2"><KeyRound className="w-4 h-4" /> Change password</h3>
              <div className="space-y-3">
                <Input type="password" placeholder="New password (min. 8 chars)" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} />
                <Button onClick={handleChangePassword} disabled={pwdLoading || newPwd.length < 8} className="w-full">
                  {pwdLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update password"}
                </Button>
              </div>
            </Card>

            <Card className="p-6 border-border/60">
              <h3 className="font-semibold mb-3 flex items-center gap-2"><Link2 className="w-4 h-4" /> Linked accounts</h3>
              <div className="space-y-2 text-sm">
                {(["google", "email"] as const).map((p) => (
                  <div key={p} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                    <span className="capitalize">{p}</span>
                    {providers.includes(p) ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400"><CheckCircle2 className="w-4 h-4" /> Linked</span>
                    ) : (
                      <span className="text-muted-foreground inline-flex items-center gap-1"><Link2Off className="w-3.5 h-3.5" /> Not linked</span>
                    )}
                  </div>
                ))}
                <p className="text-xs text-muted-foreground pt-2">Linking and unlinking is managed via your sign-in screen.</p>
              </div>
            </Card>

            <Card className="p-6 border-border/60 md:col-span-2 border-destructive/40">
              <h3 className="font-semibold mb-2 flex items-center gap-2 text-destructive"><AlertTriangle className="w-4 h-4" /> Danger zone</h3>
              <p className="text-sm text-muted-foreground mb-4">Permanently delete your account and all associated data. This cannot be undone.</p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive"><Trash2 className="w-4 h-4 mr-2" /> Delete account</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete account?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This permanently removes your profile, addresses, and saved items. Your past orders remain in our records for tax/legal reasons.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete forever
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </Card>
          </TabsContent>

          {/* ORDERS SUMMARY */}
          <TabsContent value="orders" className="mt-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { label: "Total", value: summary.total },
                { label: "Active", value: summary.active },
                { label: "Delivered", value: summary.delivered },
                { label: "Cancelled", value: summary.cancelled },
                { label: "Spent", value: `₹${summary.totalSpent.toFixed(0)}` },
              ].map((s) => (
                <Card key={s.label} className="p-4 border-border/60 text-center">
                  <div className="text-2xl font-bold text-primary">{s.value}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{s.label}</div>
                </Card>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Link to="/orders" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
                View full order history <Package className="w-4 h-4" />
              </Link>
            </div>
          </TabsContent>

          {/* SAVED */}
          <TabsContent value="saved" className="mt-4">
            <WishlistTabContent />
          </TabsContent>

          {/* SECURITY */}
          <TabsContent value="security" className="mt-4 space-y-4">
            <Card className="p-6 border-border/60">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold flex items-center gap-2"><Shield className="w-4 h-4" /> Two-factor authentication</h3>
                  <p className="text-sm text-muted-foreground mt-1">Add an extra layer of security with TOTP.</p>
                </div>
                <Switch disabled />
              </div>
              <p className="text-xs text-muted-foreground mt-3">Coming soon.</p>
            </Card>

            <Card className="p-6 border-border/60">
              <h3 className="font-semibold flex items-center gap-2"><LogOut className="w-4 h-4" /> Sessions & devices</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">Sign out of every device where you're currently signed in.</p>
              <Button variant="outline" onClick={handleSignOutAll}>
                <LogOut className="w-4 h-4 mr-2" /> Sign out from all devices
              </Button>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function AddressManager({
  loading, addresses, onSave, onDelete, onSetDefault,
}: {
  loading: boolean;
  addresses: AddressRow[];
  onSave: (a: Partial<AddressRow> & { line1: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onSetDefault: (id: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState<Partial<AddressRow> | null>(null);
  const empty: Partial<AddressRow> = { label: "Home", line1: "", city: "", state: "", postal_code: "", country: "India", is_default: false };

  return (
    <>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Saved addresses</h3>
        <Button size="sm" onClick={() => setEditing(empty)}><Plus className="w-4 h-4 mr-1" /> Add new</Button>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-3">
          {[1, 2].map((i) => <Skeleton key={i} className="h-32" />)}
        </div>
      ) : addresses.length === 0 ? (
        <Card className="p-8 border-border/60 text-center">
          <MapPin className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-semibold">No addresses saved</h3>
          <p className="text-sm text-muted-foreground mt-1">Add an address to speed up checkout.</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {addresses.map((a) => (
            <Card key={a.id} className={`p-5 border-border/60 ${a.is_default ? "ring-2 ring-primary/30" : ""}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{a.label || "Address"}</span>
                    {a.is_default && <span className="text-[10px] uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full">Default</span>}
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
                  <Button size="icon" variant="ghost" onClick={() => setEditing(a)}><Pencil className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => onDelete(a.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
              </div>
              {!a.is_default && (
                <Button size="sm" variant="outline" className="mt-3 w-full" onClick={() => onSetDefault(a.id)}>
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
          onSave={async (a) => { await onSave(a); setEditing(null); }}
        />
      )}
    </>
  );
}

function AddressEditor({ initial, onCancel, onSave }: {
  initial: Partial<AddressRow>;
  onCancel: () => void;
  onSave: (a: Partial<AddressRow> & { line1: string }) => Promise<void>;
}) {
  const [a, setA] = useState<Partial<AddressRow>>(initial);
  const [saving, setSaving] = useState(false);

  return (
    <Card className="p-6 border-primary/30">
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
          onClick={async () => { setSaving(true); try { await onSave({ ...a, line1: a.line1!.trim() }); } finally { setSaving(false); } }}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span className="ml-2">Save</span>
        </Button>
      </div>
    </Card>
  );
}
