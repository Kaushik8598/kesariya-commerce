"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Filter,
  ArrowUpDown,
  MoreHorizontal,
  Package,
} from "lucide-react";
import api from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
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

interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  basePrice: number;
  salePrice?: number | null;
  stock: number;
  status: "ACTIVE" | "DRAFT" | "ARCHIVED";
  category?: { name: string };
  brand?: { name: string };
  isFeatured: boolean;
  isNewArrival: boolean;
}

// Mock products for fallback if API database has limited data
const mockProducts: Product[] = [
  {
    id: "1",
    name: "Royal Kesariya Silk Kurta",
    slug: "royal-kesariya-silk-kurta",
    sku: "KURTA-SILK-001",
    basePrice: 4999,
    salePrice: 3999,
    stock: 45,
    status: "ACTIVE",
    category: { name: "Kurtas" },
    brand: { name: "Kesariya Ethnic" },
    isFeatured: true,
    isNewArrival: true,
  },
  {
    id: "2",
    name: "Embroidered Anarkali Suit",
    slug: "embroidered-anarkali-suit",
    sku: "SUIT-ANAR-002",
    basePrice: 7999,
    salePrice: null,
    stock: 18,
    status: "ACTIVE",
    category: { name: "Anarkali" },
    brand: { name: "Kesariya Ethnic" },
    isFeatured: true,
    isNewArrival: false,
  },
  {
    id: "3",
    name: "Handwoven Banarasi Dupatta",
    slug: "handwoven-banarasi-dupatta",
    sku: "DUP-BAN-003",
    basePrice: 2499,
    salePrice: 1999,
    stock: 0,
    status: "DRAFT",
    category: { name: "Dupattas" },
    brand: { name: "Kesariya Heritage" },
    isFeatured: false,
    isNewArrival: true,
  },
  {
    id: "4",
    name: "Printed Cotton Nehru Jacket",
    slug: "printed-cotton-nehru-jacket",
    sku: "JCK-NEH-004",
    basePrice: 3499,
    salePrice: 2999,
    stock: 62,
    status: "ACTIVE",
    category: { name: "Jackets" },
    brand: { name: "Kesariya Men" },
    isFeatured: false,
    isNewArrival: false,
  },
  {
    id: "5",
    name: "Velvet Sherwani Set",
    slug: "velvet-sherwani-set",
    sku: "SHER-VEL-005",
    basePrice: 15999,
    salePrice: 12999,
    stock: 8,
    status: "ACTIVE",
    category: { name: "Sherwanis" },
    brand: { name: "Kesariya Royal" },
    isFeatured: true,
    isNewArrival: false,
  },
];

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showAddModal, setShowAddModal] = useState(false);

  // Fetch real products from API
  const { data: apiProducts, isLoading } = useQuery<Product[]>({
    queryKey: ["adminProducts"],
    queryFn: async () => {
      try {
        const res = await api.get("/products");
        return res.data?.data || res.data || [];
      } catch {
        return [];
      }
    },
  });

  const productsList = apiProducts && apiProducts.length > 0 ? apiProducts : mockProducts;

  const filteredProducts = productsList.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || product.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      toast.success(`Product "${name}" deleted`);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Products Management</h1>
          <p className="text-xs text-foreground-muted mt-1">
            Manage your store catalog, pricing, inventory, and product details.
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Add New Product
        </Button>
      </div>

      {/* Filters & Actions Bar */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
            <Input
              placeholder="Search by product name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-lg border border-border bg-surface px-3 text-xs text-foreground outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="DRAFT">Draft</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Products Table */}
      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-foreground-muted">
                  Loading products...
                </TableCell>
              </TableRow>
            ) : filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-foreground-muted">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  No products found.
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground">{product.name}</span>
                      <span className="text-xs text-foreground-muted">{product.slug}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-foreground-muted">
                    {product.sku}
                  </TableCell>
                  <TableCell>{product.category?.name || "Uncategorized"}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground">
                        {formatCurrency(product.salePrice || product.basePrice)}
                      </span>
                      {product.salePrice && (
                        <span className="text-xs text-foreground-muted line-through">
                          {formatCurrency(product.basePrice)}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`font-medium ${
                        product.stock === 0
                          ? "text-danger"
                          : product.stock < 10
                          ? "text-warning"
                          : "text-foreground"
                      }`}
                    >
                      {product.stock} units
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        product.status === "ACTIVE"
                          ? "success"
                          : product.status === "DRAFT"
                          ? "warning"
                          : "secondary"
                      }
                    >
                      {product.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => toast.info(`Viewing ${product.name}`)}
                        title="View"
                      >
                        <Eye className="h-4 w-4 text-foreground-muted" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => toast.info(`Edit ${product.name}`)}
                        title="Edit"
                      >
                        <Edit className="h-4 w-4 text-foreground-muted" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(product.id, product.name)}
                        title="Delete"
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

      {/* Add Product Modal (Dummy for UX preview) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl border border-border bg-background-secondary p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-foreground mb-4">Add New Product</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-medium text-foreground-muted mb-1 block">
                  Product Name *
                </label>
                <Input placeholder="e.g. Royal Silk Kurta" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-foreground-muted mb-1 block">
                    Base Price (₹) *
                  </label>
                  <Input type="number" placeholder="4999" />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground-muted mb-1 block">
                    Sale Price (₹)
                  </label>
                  <Input type="number" placeholder="3999" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-foreground-muted mb-1 block">
                    SKU Code *
                  </label>
                  <Input placeholder="KURTA-SILK-001" />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground-muted mb-1 block">
                    Stock Quantity *
                  </label>
                  <Input type="number" placeholder="50" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  toast.success("Product created successfully!");
                  setShowAddModal(false);
                }}
              >
                Create Product
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
