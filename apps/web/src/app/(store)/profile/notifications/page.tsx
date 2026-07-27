"use client";

import { useState } from "react";
import { useUpdateNotifications } from "@/hooks/profile/use-profile";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Bell } from "lucide-react";

export default function NotificationsPage() {
  const { mutate: updateNotifications, isPending: isUpdating } = useUpdateNotifications();

  const [formData, setFormData] = useState({
    emailOrderUpdates: true,
    emailPromotions: false,
    smsOrderUpdates: true,
    smsPromotions: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateNotifications(formData);
  };

  return (
    <div className="border border-border rounded-2xl p-6 md:p-8 bg-card shadow-sm space-y-6">
      <div className="flex items-center gap-3 border-b border-border pb-6">
        <div className="h-10 w-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center border border-primary/20">
          <Bell className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-black uppercase tracking-wider font-heading text-foreground">
            Notification Preferences
          </h2>
          <p className="text-xs text-muted-foreground font-medium">
            Manage how we communicate order updates and store announcements.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 max-w-md">
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-2">
            Email Notifications
          </h3>

          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center mt-0.5">
              <Checkbox
                id="emailOrderUpdates"
                checked={formData.emailOrderUpdates}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, emailOrderUpdates: checked as boolean })
                }
              />
            </div>
            <div className="grid gap-1 leading-none">
              <label htmlFor="emailOrderUpdates" className="text-xs font-bold cursor-pointer text-foreground">
                Order Status Updates
              </label>
              <p className="text-xs text-muted-foreground">Receive emails when your order status changes.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center mt-0.5">
              <Checkbox
                id="emailPromotions"
                checked={formData.emailPromotions}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, emailPromotions: checked as boolean })
                }
              />
            </div>
            <div className="grid gap-1 leading-none">
              <label htmlFor="emailPromotions" className="text-xs font-bold cursor-pointer text-foreground">
                Promotions & Offers
              </label>
              <p className="text-xs text-muted-foreground">Receive emails about sales and new arrivals.</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-2">
            SMS & WhatsApp Notifications
          </h3>

          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center mt-0.5">
              <Checkbox
                id="smsOrderUpdates"
                checked={formData.smsOrderUpdates}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, smsOrderUpdates: checked as boolean })
                }
              />
            </div>
            <div className="grid gap-1 leading-none">
              <label htmlFor="smsOrderUpdates" className="text-xs font-bold cursor-pointer text-foreground">
                Delivery Updates
              </label>
              <p className="text-xs text-muted-foreground">Receive text messages when order is shipped.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center mt-0.5">
              <Checkbox
                id="smsPromotions"
                checked={formData.smsPromotions}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, smsPromotions: checked as boolean })
                }
              />
            </div>
            <div className="grid gap-1 leading-none">
              <label htmlFor="smsPromotions" className="text-xs font-bold cursor-pointer text-foreground">
                Promotional Alerts
              </label>
              <p className="text-xs text-muted-foreground">Receive texts for flash sales and deals.</p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <Button
            type="submit"
            disabled={isUpdating}
            className="w-full sm:w-auto px-8 font-bold uppercase tracking-wider text-xs"
          >
            {isUpdating ? "Saving..." : "Save Preferences"}
          </Button>
        </div>
      </form>
    </div>
  );
}
