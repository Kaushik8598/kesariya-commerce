"use client";

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Truck } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

export default function ShippingPage() {
  const zones = [
    { name: "Standard Shipping (Pan India)", minDays: 3, maxDays: 5, rate: 99, freeAbove: 1999, status: "ACTIVE" },
    { name: "Express Shipping (Metro Cities)", minDays: 1, maxDays: 2, rate: 249, freeAbove: 4999, status: "ACTIVE" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Shipping Management</h1>
        <p className="text-xs text-foreground-muted mt-1">
          Configure shipping zones, rates, delivery timelines, and courier integrations.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {zones.map((z) => (
          <Card key={z.name} className="p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <Truck className="h-4 w-4 text-primary" /> {z.name}
              </div>
              <Badge variant="success">{z.status}</Badge>
            </div>
            <div className="text-xs text-foreground-muted">
              Estimated: {z.minDays}-{z.maxDays} Business Days
            </div>
            <div className="flex justify-between items-center text-xs font-semibold pt-2 border-t border-border">
              <span>Flat Rate: {formatCurrency(z.rate)}</span>
              <span className="text-success">Free above {formatCurrency(z.freeAbove)}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
