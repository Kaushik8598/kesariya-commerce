"use client";

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function ThemePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Theme Management</h1>
        <p className="text-xs text-foreground-muted mt-1">
          Customize storefront branding, primary accent color, typography, and logos.
        </p>
      </div>

      <Card className="max-w-xl p-6 flex flex-col gap-4">
        <CardHeader className="p-0">
          <CardTitle>Brand Colors & Styling</CardTitle>
          <CardDescription>Configure primary brand colors and visual theme</CardDescription>
        </CardHeader>

        <div>
          <label className="text-xs font-medium text-foreground-muted block mb-1">
            Store Name
          </label>
          <Input defaultValue="Kesariya" />
        </div>

        <div>
          <label className="text-xs font-medium text-foreground-muted block mb-1">
            Primary Accent Color (Hex)
          </label>
          <div className="flex gap-2">
            <Input defaultValue="#f97316" className="font-mono" />
            <div className="h-9 w-9 rounded-lg bg-[#f97316] border border-border shrink-0" />
          </div>
        </div>

        <div className="pt-4 border-t border-border flex justify-end">
          <Button onClick={() => toast.success("Theme settings saved successfully!")}>
            Save Changes
          </Button>
        </div>
      </Card>
    </div>
  );
}
