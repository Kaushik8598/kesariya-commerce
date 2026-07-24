"use client";

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, FileText, Plus } from "lucide-react";
import { toast } from "sonner";

export default function CMSPage() {
  const pages = [
    { title: "About Us", slug: "about-us", updatedAt: "2025-07-01" },
    { title: "Terms & Conditions", slug: "terms-and-conditions", updatedAt: "2025-06-15" },
    { title: "Privacy Policy", slug: "privacy-policy", updatedAt: "2025-06-15" },
    { title: "Return & Refund Policy", slug: "return-policy", updatedAt: "2025-07-10" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">CMS Pages</h1>
          <p className="text-xs text-foreground-muted mt-1">
            Manage static content pages (About Us, Terms & Conditions, Privacy Policy, etc.).
          </p>
        </div>
        <Button onClick={() => toast.info("New Page Modal")} className="gap-2">
          <Plus className="h-4 w-4" /> Create Page
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {pages.map((p) => (
          <Card key={p.slug} className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-primary shrink-0" />
              <div>
                <h3 className="font-bold text-foreground">{p.title}</h3>
                <span className="font-mono text-xs text-foreground-muted">/{p.slug}</span>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => toast.info(`Edit ${p.title}`)}>
              <Edit className="h-3.5 w-3.5 mr-1" /> Edit
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
