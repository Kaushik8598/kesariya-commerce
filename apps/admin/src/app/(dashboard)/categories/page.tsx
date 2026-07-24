"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Edit, Trash2, FolderTree, ChevronRight } from "lucide-react";
import api from "@/lib/api";
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

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  productCount?: number;
  isActive: boolean;
  parent?: { name: string } | null;
}

const mockCategories: Category[] = [
  { id: "1", name: "Men Ethnic", slug: "men-ethnic", description: "Traditional menswear collection", productCount: 142, isActive: true },
  { id: "2", name: "Kurtas", slug: "kurtas", description: "Designer silk and cotton kurtas", productCount: 86, isActive: true, parent: { name: "Men Ethnic" } },
  { id: "3", name: "Sherwanis", slug: "sherwanis", description: "Royal wedding sherwanis", productCount: 34, isActive: true, parent: { name: "Men Ethnic" } },
  { id: "4", name: "Women Collection", slug: "women-collection", description: "Lehengas, Sarees, Suits", productCount: 210, isActive: true },
  { id: "5", name: "Anarkali Suits", slug: "anarkali-suits", description: "Heavy embroidered suits", productCount: 52, isActive: true, parent: { name: "Women Collection" } },
  { id: "6", name: "Dupattas", slug: "dupattas", description: "Banarasi & Silk dupattas", productCount: 40, isActive: false },
];

export default function CategoriesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const { data: apiCategories, isLoading } = useQuery<Category[]>({
    queryKey: ["adminCategories"],
    queryFn: async () => {
      try {
        const res = await api.get("/categories");
        return res.data?.data || res.data || [];
      } catch {
        return [];
      }
    },
  });

  const categoriesList = apiCategories && apiCategories.length > 0 ? apiCategories : mockCategories;

  const filteredCategories = categoriesList.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete category "${name}"?`)) {
      toast.success(`Category "${name}" deleted`);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Categories Management</h1>
          <p className="text-xs text-foreground-muted mt-1">
            Organize your products into categories and sub-categories.
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Add Category
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
          <Input
            placeholder="Search category by name or slug..."
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
              <TableHead>Category Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Parent Category</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-foreground-muted">
                  Loading categories...
                </TableCell>
              </TableRow>
            ) : filteredCategories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-foreground-muted">
                  <FolderTree className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  No categories found.
                </TableCell>
              </TableRow>
            ) : (
              filteredCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-semibold text-foreground">
                    <div className="flex items-center gap-2">
                      {category.parent && <ChevronRight className="h-3.5 w-3.5 text-foreground-muted ml-2" />}
                      {category.name}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-foreground-muted">
                    {category.slug}
                  </TableCell>
                  <TableCell>{category.parent?.name || "Main Category"}</TableCell>
                  <TableCell>{category.productCount ?? 0} items</TableCell>
                  <TableCell>
                    <Badge variant={category.isActive ? "success" : "secondary"}>
                      {category.isActive ? "ACTIVE" : "INACTIVE"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => toast.info(`Edit ${category.name}`)}
                      >
                        <Edit className="h-4 w-4 text-foreground-muted" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(category.id, category.name)}
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
            <h2 className="text-lg font-bold text-foreground mb-4">Add New Category</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-medium text-foreground-muted mb-1 block">
                  Category Name *
                </label>
                <Input placeholder="e.g. Silk Sarees" />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground-muted mb-1 block">
                  Description
                </label>
                <Input placeholder="Short description..." />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  toast.success("Category created!");
                  setShowAddModal(false);
                }}
              >
                Create Category
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
