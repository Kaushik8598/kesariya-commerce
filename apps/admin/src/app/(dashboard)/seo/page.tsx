"use client";

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function SEOPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">SEO Management</h1>
        <p className="text-xs text-foreground-muted mt-1">
          Configure default meta titles, descriptions, OpenGraph tags, and sitemap settings.
        </p>
      </div>

      <Card className="max-w-xl p-6 flex flex-col gap-4">
        <CardHeader className="p-0">
          <CardTitle>Global Meta Tags</CardTitle>
          <CardDescription>Default search engine title and description tags</CardDescription>
        </CardHeader>

        <div>
          <label className="text-xs font-medium text-foreground-muted block mb-1">
            Meta Title
          </label>
          <Input defaultValue="Kesariya — Premium Indian Ethnic Fashion & Silk Store" />
        </div>

        <div>
          <label className="text-xs font-medium text-foreground-muted block mb-1">
            Meta Description
          </label>
          <Input defaultValue="Discover handcrafted silk kurtas, royal sherwanis, banarasi dupattas, and ethnic bridal wear." />
        </div>

        <div className="pt-4 border-t border-border flex justify-end">
          <Button onClick={() => toast.success("SEO settings saved!")}>
            Save Meta Tags
          </Button>
        </div>
      </Card>
    </div>
  );
}
