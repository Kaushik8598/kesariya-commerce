"use client";

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Send } from "lucide-react";
import { toast } from "sonner";

export default function NotificationsPage() {
  const templates = [
    { name: "Order Confirmation Email", channel: "Email", status: "ACTIVE" },
    { name: "Order Shipped SMS Alert", channel: "SMS", status: "ACTIVE" },
    { name: "Registration OTP Email", channel: "Email", status: "ACTIVE" },
    { name: "Abandoned Cart Push Alert", channel: "Push", status: "INACTIVE" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Notification Management</h1>
          <p className="text-xs text-foreground-muted mt-1">
            Configure automated email, SMS, and push notification templates.
          </p>
        </div>
        <Button onClick={() => toast.info("Broadcast Notification")} className="gap-2">
          <Send className="h-4 w-4" /> Send Broadcast
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {templates.map((t) => (
          <Card key={t.name} className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-primary shrink-0" />
              <div>
                <h3 className="font-bold text-foreground">{t.name}</h3>
                <span className="text-xs text-foreground-muted">Channel: {t.channel}</span>
              </div>
            </div>
            <Badge variant={t.status === "ACTIVE" ? "success" : "secondary"}>
              {t.status}
            </Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}
