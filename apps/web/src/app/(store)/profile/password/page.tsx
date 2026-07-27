"use client";

import { useState } from "react";
import { useUpdatePassword } from "@/hooks/profile/use-profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Key } from "lucide-react";
import { toast } from "sonner";

export default function PasswordPage() {
  const { mutate: updatePassword, isPending: isUpdating } = useUpdatePassword();

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (formData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    updatePassword(
      {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      },
      {
        onSuccess: () => {
          setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        },
      }
    );
  };

  return (
    <div className="border border-border rounded-2xl p-6 md:p-8 bg-card shadow-sm space-y-6">
      <div className="flex items-center gap-3 border-b border-border pb-6">
        <div className="h-10 w-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center border border-primary/20">
          <Key className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-black uppercase tracking-wider font-heading text-foreground">
            Change Password
          </h2>
          <p className="text-xs text-muted-foreground font-medium">
            Update your account password to keep your account secure.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
            Current Password
          </label>
          <Input
            type="password"
            value={formData.currentPassword}
            onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
            New Password
          </label>
          <Input
            type="password"
            value={formData.newPassword}
            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
            Confirm New Password
          </label>
          <Input
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            required
          />
        </div>

        <div className="pt-4 border-t border-border">
          <Button
            type="submit"
            disabled={isUpdating}
            className="w-full sm:w-auto px-8 font-bold uppercase tracking-wider text-xs"
          >
            {isUpdating ? "Updating..." : "Update Password"}
          </Button>
        </div>
      </form>
    </div>
  );
}
