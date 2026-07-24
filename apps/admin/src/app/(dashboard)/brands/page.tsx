"use client";

import { useState } from "react";
import { Plus, Search, Edit, Trash2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { toast } from "sonner";

interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string;
  productCount: number;
  isActive: boolean;
}

const mockBrands: Brand[] = [
  { id: "1", name: "Kesariya Ethnic", slug: "kesariya-ethnic", description: "In-house premium traditional wear", productCount: 184, isActive: true },
  { id: "2", name: "Kesariya Heritage", slug: "kesariya-heritage", description: "Handcrafted royal sarees & dupattas", productCount: 62, isActive: true },
  { id: "3", name: "Kesariya Royal", slug: "kesariya-royal", description: "Bespoke bridal & groom wear", productCount: 45, isActive: true },
  { id: "4", name: "Kesariya Men", slug: "kesariya-men", description: "Contemporary & classic menswear", productCount: 96, isActive: true },
];

export default function BrandsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredBrands = mockBrands.filter((b) =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (name: string) => {
    if (confirm(`Are you sure you want to delete brand "${name}"?`)) {
      toast.success(`Brand "${name}" deleted`);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Brands Management</h1>
          <p className="text-xs text-foreground-muted mt-1">
            Manage product brands, logos, and brand details.
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Add Brand
        </Button>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
          <Input
            placeholder="Search brand by name or slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </Card>

      {/* Table */}
      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Brand Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBrands.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-foreground-muted">
                  <Tag className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  No brands found.
                </TableCell>
              </TableRow>
            ) : (
              filteredBrands.map((brand) => (
                <TableRow key={brand.id}>
                  <TableCell className="font-semibold text-foreground">
                    {brand.name}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-foreground-muted">
                    {brand.slug}
                  </TableCell>
                  <TableCell className="text-foreground-muted max-w-xs truncate">
                    {brand.description}
                  </TableCell>
                  <TableCell>{brand.productCount} products</TableCell>
                  <TableCell>
                    <Badge variant={brand.isActive ? "success" : "secondary"}>
                      {brand.isActive ? "ACTIVE" : "INACTIVE"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => toast.info(`Edit ${brand.name}`)}
                      >
                        <Edit className="h-4 w-4 text-foreground-muted" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(brand.name)}
                      >
                        <Trash2 className="h-4 w-4 text-danger" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-background-secondary p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-foreground mb-4">Add New Brand</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-medium text-foreground-muted mb-1 block">
                  Brand Name *
                </label>
                <Input placeholder="e.g. Kesariya Studio" />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground-muted mb-1 block">
                  Description
                </label>
                <Input placeholder="Brand description..." />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  toast.success("Brand created!");
                  setShowAddModal(false);
                }}
              >
                Create Brand
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
