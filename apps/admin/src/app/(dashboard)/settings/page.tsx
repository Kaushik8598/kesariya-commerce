"use client";

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/providers/auth-provider";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-xs text-foreground-muted mt-1">
          Manage your administrator profile and security preferences.
        </p>
      </div>

      <Card className="max-w-xl p-6 flex flex-col gap-4">
        <CardHeader className="p-0">
          <CardTitle>Admin Profile</CardTitle>
          <CardDescription>Update your personal info and login mobile</CardDescription>
        </CardHeader>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-foreground-muted block mb-1">First Name</label>
            <Input defaultValue={user?.firstName || "Super"} />
          </div>
          <div>
            <label className="text-xs font-medium text-foreground-muted block mb-1">Last Name</label>
            <Input defaultValue={user?.lastName || "Admin"} />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-foreground-muted block mb-1">Mobile Number</label>
          <Input defaultValue={user?.mobile || "9999999999"} disabled />
        </div>

        <div className="pt-4 border-t border-border flex justify-end">
          <Button onClick={() => toast.success("Profile updated successfully!")}>
            Save Profile
          </Button>
        </div>
      </Card>
    </div>
  );
}
