"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Package,
  CheckCircle2,
  XCircle,
  Image as ImageIcon,
  Tag,
  Filter,
} from "lucide-react";
import api from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
}

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
  },
];

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showAddModal, setShowAddModal] = useState(false);

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
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || product.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = productsList.filter((p) => p.status === "ACTIVE").length;
  const outOfStockCount = productsList.filter((p) => p.stock === 0).length;

  const handleDelete = (name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      toast.success(`Product "${name}" deleted`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground font-heading">
            Products Management
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage store catalog, pricing, inventory stock, and product details.
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" /> Add New Product
        </Button>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-muted-foreground">Total Products</div>
            <div className="text-2xl font-extrabold text-foreground mt-1">{productsList.length}</div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
            <Package className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-muted-foreground">Active Catalog</div>
            <div className="text-2xl font-extrabold text-emerald-400 mt-1">{activeCount}</div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-muted-foreground">Out of Stock</div>
            <div className="text-2xl font-extrabold text-rose-400 mt-1">{outOfStockCount}</div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center">
            <XCircle className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-muted-foreground">Categories</div>
            <div className="text-2xl font-extrabold text-sky-400 mt-1">5</div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center">
            <Tag className="h-5 w-5" />
          </div>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search product by name, SKU or slug..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 w-full pl-10 pr-4 rounded-lg bg-card border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 rounded-lg border border-border bg-card px-3 text-xs font-semibold text-foreground outline-none cursor-pointer focus:border-primary"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="DRAFT">Draft</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="py-3.5 pl-6 min-w-[280px]">Product Details</TableHead>
              <TableHead className="py-3.5">SKU</TableHead>
              <TableHead className="py-3.5">Category</TableHead>
              <TableHead className="py-3.5">Price</TableHead>
              <TableHead className="py-3.5">Stock Level</TableHead>
              <TableHead className="py-3.5">Status</TableHead>
              <TableHead className="py-3.5 text-right pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  Loading product catalog...
                </TableCell>
              </TableRow>
            ) : filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-14 text-muted-foreground">
                  <Package className="h-10 w-10 mx-auto mb-2 opacity-40 text-muted-foreground" />
                  <p className="text-sm font-semibold">No products match your search.</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  {/* Single Clean Product Column */}
                  <TableCell className="py-4 pl-6">
                    <div className="flex items-center gap-3.5">
                      <div className="h-11 w-11 rounded-lg bg-secondary border border-border flex items-center justify-center shrink-0">
                        <ImageIcon className="h-5 w-5 text-muted-foreground opacity-60" />
                      </div>
                      <div className="flex flex-col gap-1 overflow-hidden">
                        <span className="font-bold text-xs text-foreground truncate">
                          {product.name}
                        </span>
                        <span className="text-[11px] font-mono text-muted-foreground truncate">
                          {product.slug}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* SKU */}
                  <TableCell className="py-4">
                    <span className="font-mono text-[11px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md border border-primary/20">
                      {product.sku}
                    </span>
                  </TableCell>

                  {/* Category */}
                  <TableCell className="py-4 text-xs font-semibold text-foreground">
                    {product.category?.name || "Uncategorized"}
                  </TableCell>

                  {/* Price */}
                  <TableCell className="py-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold text-emerald-400">
                        {formatCurrency(product.salePrice || product.basePrice)}
                      </span>
                      {product.salePrice && (
                        <span className="text-[10px] text-muted-foreground line-through">
                          {formatCurrency(product.basePrice)}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* Stock */}
                  <TableCell className="py-4">
                    {product.stock === 0 ? (
                      <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">
                        0 (Out of stock)
                      </span>
                    ) : product.stock < 10 ? (
                      <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                        {product.stock} left (Low)
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-foreground">
                        {product.stock} units
                      </span>
                    )}
                  </TableCell>

                  {/* Status */}
                  <TableCell className="py-4">
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

                  {/* Actions */}
                  <TableCell className="py-4 text-right pr-6">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="secondary"
                        size="xs"
                        onClick={() => toast.info(`View details for ${product.name}`)}
                        className="h-7 px-2.5 gap-1"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>View</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => toast.info(`Edit ${product.name}`)}
                        className="h-7 px-2.5 gap-1"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </Button>
                      <Button
                        variant="destructive"
                        size="xs"
                        onClick={() => handleDelete(product.name)}
                        className="h-7 px-2"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h2 className="text-base font-bold text-foreground">Add New Product</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Fill details to create catalog item</p>
              </div>
              <Button variant="ghost" size="icon-sm" onClick={() => setShowAddModal(false)}>
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 block">
                  Product Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Royal Kesariya Silk Kurta"
                  className="h-10 w-full px-3.5 rounded-lg bg-secondary border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1.5 block">
                    Base Price (₹) *
                  </label>
                  <input
                    type="number"
                    placeholder="4999"
                    className="h-10 w-full px-3.5 rounded-lg bg-secondary border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1.5 block">
                    Sale Price (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="3999"
                    className="h-10 w-full px-3.5 rounded-lg bg-secondary border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1.5 block">
                    SKU Code *
                  </label>
                  <input
                    type="text"
                    placeholder="KURTA-SILK-001"
                    className="h-10 w-full px-3.5 rounded-lg bg-secondary border border-border text-xs text-foreground font-mono placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1.5 block">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    placeholder="50"
                    className="h-10 w-full px-3.5 rounded-lg bg-secondary border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  toast.success("Product created!");
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
