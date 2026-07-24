"use client";

import { useState } from "react";
import { Plus, Image as ImageIcon, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  linkUrl: string;
  isActive: boolean;
}

const mockBanners: Banner[] = [
  { id: "1", title: "Festive Collection 2025", subtitle: "Up to 30% OFF on Silk Kurtas", image: "/hero1.jpg", linkUrl: "/category/kurtas", isActive: true },
  { id: "2", title: "Royal Bridal Lehengas", subtitle: "Handcrafted Heritage Collection", image: "/hero2.jpg", linkUrl: "/category/lehengas", isActive: true },
];

export default function BannersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Banner Management</h1>
          <p className="text-xs text-foreground-muted mt-1">
            Manage storefront hero banners, promotional sliders, and click links.
          </p>
        </div>
        <Button onClick={() => toast.info("Add Banner Modal")} className="gap-2">
          <Plus className="h-4 w-4" /> Add Banner
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {mockBanners.map((banner) => (
          <Card key={banner.id} className="p-4 flex flex-col gap-3">
            <div className="aspect-[16/7] w-full rounded-lg bg-surface border border-border flex items-center justify-center text-foreground-muted">
              <ImageIcon className="h-10 w-10 opacity-40" />
            </div>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-foreground">{banner.title}</h3>
                <p className="text-xs text-foreground-muted">{banner.subtitle}</p>
                <div className="text-xs font-mono text-primary mt-1">{banner.linkUrl}</div>
              </div>
              <Badge variant={banner.isActive ? "success" : "secondary"}>
                {banner.isActive ? "ACTIVE" : "HIDDEN"}
              </Badge>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button variant="outline" size="sm" onClick={() => toast.info(`Edit banner ${banner.title}`)}>
                <Edit className="h-3.5 w-3.5 mr-1" /> Edit
              </Button>
              <Button variant="ghost" size="sm" onClick={() => toast.success("Banner removed")}>
                <Trash2 className="h-3.5 w-3.5 text-danger" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
