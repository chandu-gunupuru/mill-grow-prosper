import { useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { X, Loader2, Camera, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Props = {
  open: boolean;
  onClose: () => void;
  user: User;
};

export function ProfileModal({ open, onClose, user }: Props) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setFullName(user.user_metadata?.full_name || user.user_metadata?.name || "");
    setEmail(user.email ?? "");
    setAvatarUrl(user.user_metadata?.avatar_url ?? null);
    setStatus(null);
  }, [open, user]);

  if (!open) return null;

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setStatus({ type: "error", msg: "Image must be under 5MB." });
      return;
    }
    setUploading(true);
    setStatus(null);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${user.id}/avatar-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;
      const { data: signed, error: signErr } = await supabase.storage
        .from("avatars")
        .createSignedUrl(path, 60 * 60 * 24 * 365);
      if (signErr) throw signErr;
      setAvatarUrl(signed.signedUrl);
      setStatus({ type: "success", msg: "Photo ready — click Save to apply." });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setStatus({ type: "error", msg });
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      const updates: { email?: string; data: Record<string, unknown> } = {
        data: {
          ...user.user_metadata,
          full_name: fullName.trim(),
          avatar_url: avatarUrl,
        },
      };
      if (email && email !== user.email) updates.email = email.trim();
      const { error } = await supabase.auth.updateUser(updates);
      if (error) throw error;
      // Sync profile row
      await supabase.from("profiles").upsert(
        { id: user.id, email: email || user.email, full_name: fullName, avatar_url: avatarUrl },
        { onConflict: "id" },
      );
      setStatus({
        type: "success",
        msg: email !== user.email
          ? "Saved. Check your new email to confirm the change."
          : "Profile updated successfully.",
      });
      setTimeout(onClose, 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update profile";
      setStatus({ type: "error", msg });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="font-display text-lg font-bold text-primary">Edit Profile</h2>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-md hover:bg-secondary"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-5 px-6 py-5">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="grid h-24 w-24 place-items-center overflow-hidden rounded-full border-2 border-border bg-secondary">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-muted-foreground">
                    {(fullName || email || "U").charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-1 -right-1 grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90 disabled:opacity-50"
                aria-label="Change photo"
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <p className="text-xs text-muted-foreground">PNG or JPG, up to 5MB</p>
          </div>

          {status && (
            <div
              role="status"
              className={`flex items-start gap-2 rounded-md border p-2.5 text-xs ${
                status.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                  : "border-red-200 bg-red-50 text-red-900"
              }`}
            >
              {status.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              )}
              <span>{status.msg}</span>
            </div>
          )}

          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Full Name
            </span>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              maxLength={100}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={255}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <span className="mt-1 block text-[11px] text-muted-foreground">
              Changing email requires confirmation via the new address.
            </span>
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
