// Customer-scoped profile, address, and wishlist server functions.
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface ProfileRow {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
}

export interface AddressRow {
  id: string;
  user_id: string;
  label: string | null;
  recipient_name: string | null;
  phone: string | null;
  line1: string;
  line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId, claims } = context;
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return {
      profile: (data ?? null) as ProfileRow | null,
      email: (claims?.email as string | undefined) ?? null,
      providers: ((claims as { app_metadata?: { providers?: string[] } } | null)?.app_metadata?.providers ?? []) as string[],
      emailVerified: Boolean((claims as { email_verified?: boolean } | null)?.email_verified),
    };
  });

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { full_name?: string; phone?: string; avatar_url?: string }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId, claims } = context;
    const payload = {
      id: userId,
      email: (claims?.email as string | undefined) ?? null,
      full_name: typeof data.full_name === "string" ? data.full_name.trim() || null : undefined,
      phone: typeof data.phone === "string" ? data.phone.trim() || null : undefined,
      avatar_url: typeof data.avatar_url === "string" ? data.avatar_url.trim() || null : undefined,
    };
    const { error } = await supabase.from("profiles").upsert(payload, { onConflict: "id" });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const listMyAddresses = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("user_addresses")
      .select("*")
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { addresses: (data ?? []) as AddressRow[] };
  });

export const upsertMyAddress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: Partial<AddressRow> & { line1: string }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    if (data.is_default) {
      await supabase.from("user_addresses").update({ is_default: false }).eq("user_id", userId);
    }
    const { id, ...rest } = data;
    const row = {
      user_id: userId,
      label: rest.label ?? null,
      recipient_name: rest.recipient_name ?? null,
      phone: rest.phone ?? null,
      line1: rest.line1,
      line2: rest.line2 ?? null,
      city: rest.city ?? null,
      state: rest.state ?? null,
      postal_code: rest.postal_code ?? null,
      country: rest.country ?? "India",
      is_default: rest.is_default ?? false,
    };
    const { data: saved, error } = id
      ? await supabase.from("user_addresses").update(row).eq("id", id).eq("user_id", userId).select().single()
      : await supabase.from("user_addresses").insert(row).select().single();
    if (error) throw new Error(error.message);
    return { address: saved as AddressRow };
  });

export const deleteMyAddress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("user_addresses")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const setDefaultAddress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await supabase.from("user_addresses").update({ is_default: false }).eq("user_id", userId);
    const { error } = await supabase
      .from("user_addresses")
      .update({ is_default: true })
      .eq("id", data.id)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const deleteMyAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.deleteUser(context.userId);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
