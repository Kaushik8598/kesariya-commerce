"use client";

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoveUp, MoveDown, Eye } from "lucide-react";
import { toast } from "sonner";

export default function HomepagePage() {
  const sections = [
    { id: "1", name: "Hero Banner Slider", status: "ENABLED" },
    { id: "2", name: "Featured Categories Grid", status: "ENABLED" },
    { id: "3", name: "Featured Products Carousel", status: "ENABLED" },
    { id: "4", name: "New Arrivals Grid", status: "ENABLED" },
    { id: "5", name: "Brand Heritage Video Section", status: "DISABLED" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Homepage Management</h1>
        <p className="text-xs text-foreground-muted mt-1">
          Reorder homepage sections, toggle visibility, and configure featured content.
        </p>
      </div>

      <Card className="max-w-2xl p-4 flex flex-col gap-3">
        <CardHeader className="p-0 pb-2">
          <CardTitle>Homepage Layout Order</CardTitle>
          <CardDescription>Drag or reorder sections shown on storefront home page</CardDescription>
        </CardHeader>

        {sections.map((sec, idx) => (
          <div key={sec.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-surface">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-foreground-muted">#{idx + 1}</span>
              <span className="font-medium text-foreground">{sec.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={sec.status === "ENABLED" ? "success" : "secondary"}>
                {sec.status}
              </Badge>
              <Button variant="ghost" size="icon-sm" onClick={() => toast.info("Reordered")}>
                <MoveUp className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon-sm" onClick={() => toast.info("Reordered")}>
                <MoveDown className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
