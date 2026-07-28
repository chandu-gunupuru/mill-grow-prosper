import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Shield, KeyRound, LogOut, Trash2, Loader2, AlertTriangle } from "lucide-react";
import { AccountLayout } from "@/components/AccountLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader,
  AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { deleteMyAccount } from "@/lib/profile.functions";

export const Route = createFileRoute("/_authenticated/privacy")({
  head: () => ({ meta: [{ title: "Privacy & Security — Gayathri Rice Mill" }] }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const navigate = useNavigate();
  const deleteAccountFn = useServerFn(deleteMyAccount);
  const [newPwd, setNewPwd] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);

  async function handleChangePassword() {
    if (newPwd.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setPwdLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPwd });
    setPwdLoading(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Password updated");
      setNewPwd("");
    }
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
    <AccountLayout
      title="Privacy & Security"
      description="Protect your account with strong credentials and privacy controls."
    >
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-6 border-border/60">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <KeyRound className="w-4 h-4" /> Change password
          </h3>
          <div className="space-y-3">
            <Input
              type="password"
              placeholder="New password (min. 8 chars)"
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
            />
            <Button
              onClick={handleChangePassword}
              disabled={pwdLoading || newPwd.length < 8}
              className="w-full"
            >
              {pwdLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update password"}
            </Button>
          </div>
        </Card>

        <Card className="p-6 border-border/60">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                <Shield className="w-4 h-4" /> Two-factor authentication
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Add an extra layer of security with TOTP.
              </p>
            </div>
            <Switch disabled />
          </div>
          <p className="text-xs text-muted-foreground mt-3">Coming soon.</p>
        </Card>

        <Card className="p-6 border-border/60 md:col-span-2">
          <h3 className="font-semibold flex items-center gap-2">
            <LogOut className="w-4 h-4" /> Sessions & devices
          </h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Sign out of every device where you're currently signed in.
          </p>
          <Button variant="outline" onClick={handleSignOutAll}>
            <LogOut className="w-4 h-4 mr-2" /> Sign out from all devices
          </Button>
        </Card>

        <Card className="p-6 border-destructive/40 md:col-span-2">
          <h3 className="font-semibold mb-2 flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-4 h-4" /> Danger zone
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Permanently delete your account and all associated data. This cannot be undone.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="w-4 h-4 mr-2" /> Delete account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete account?</AlertDialogTitle>
                <AlertDialogDescription>
                  This permanently removes your profile, addresses, and saved items.
                  Your past orders remain in our records for tax/legal reasons.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete forever
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </Card>
      </div>
    </AccountLayout>
  );
}
