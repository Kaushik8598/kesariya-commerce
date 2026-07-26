"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Package,
  CheckCircle2,
  XCircle,
  Image as ImageIcon,
  Filter,
  Loader2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  FileText,
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
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
  category?: { id?: string; name: string };
  brand?: { id?: string; name: string };
  images?: Array<{ url: string }>;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function ProductsPage() {
  const queryClient = useQueryClient();

  // Search, Filter & Pagination State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const router = useRouter();

  // Delete Confirmation Modal State
  const [deleteProductTarget, setDeleteProductTarget] = useState<Product | null>(null);

  // Fetch Products from Admin API: GET /admin/products?page=1&limit=10&search=...&status=...
  const { data: responseData, isLoading } = useQuery<{
    data: Product[];
    pagination: PaginationMeta;
  }>({
    queryKey: ["adminProducts", page, limit, searchTerm, statusFilter],
    queryFn: async () => {
      const res = await api.get("/admin/products", {
        params: {
          page,
          limit,
          search: searchTerm || undefined,
          status: statusFilter !== "ALL" ? statusFilter : undefined,
        },
      });
      return res.data?.data && res.data?.pagination
        ? res.data
        : {
            data: Array.isArray(res.data) ? res.data : [],
            pagination: {
              total: Array.isArray(res.data) ? res.data.length : 0,
              page: 1,
              limit: 10,
              totalPages: 1,
            },
          };
    },
  });

  const productsList: Product[] = responseData?.data || [];
  const pagination: PaginationMeta = responseData?.pagination || {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  };



  // Delete Product Mutation: DELETE /admin/products/:id
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/admin/products/${id}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Product deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
      setDeleteProductTarget(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to delete product");
    },
  });



  const activeCount = productsList.filter((p) => p.status === "ACTIVE").length;
  const draftArchivedCount = productsList.filter((p) => p.status !== "ACTIVE").length;
  const outOfStockCount = productsList.filter((p) => p.stock === 0).length;

  const startItemIndex = (pagination.page - 1) * pagination.limit + 1;
  const endItemIndex = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div className="space-y-6">
      {/* Top Banner & Header Action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground font-heading">
            Products Management
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage your catalog items, pricing, inventory stock, and product status.
          </p>
        </div>
        <Button onClick={() => router.push("/products/new")} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" /> Add New Product
        </Button>
      </div>

      {/* Overview Stat Cards (No Page Number Card) */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="p-5 !flex-row items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Catalog
            </p>
            <p className="text-2xl font-extrabold text-foreground font-heading">
              {pagination.total}
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0 border border-primary/20">
            <Package className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-5 !flex-row items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Active Items
            </p>
            <p className="text-2xl font-extrabold text-emerald-400 font-heading">
              {activeCount}
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-5 !flex-row items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Out of Stock
            </p>
            <p className="text-2xl font-extrabold text-rose-400 font-heading">
              {outOfStockCount}
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/20">
            <XCircle className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-5 !flex-row items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Draft / Archived
            </p>
            <p className="text-2xl font-extrabold text-amber-400 font-heading">
              {draftArchivedCount}
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
            <FileText className="h-5 w-5" />
          </div>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search product by name, SKU or slug..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="h-10 w-full pl-10 pr-4 rounded-lg bg-card border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="h-10 rounded-lg border border-border bg-card px-3 text-xs font-semibold text-foreground outline-none cursor-pointer focus:border-primary"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Only</option>
              <option value="DRAFT">Draft Only</option>
              <option value="ARCHIVED">Archived Only</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Products List Table */}
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
                <TableCell colSpan={7} className="text-center py-14 text-muted-foreground">
                  <Loader2 className="h-7 w-7 animate-spin mx-auto mb-2 text-primary" />
                  <p className="text-xs font-semibold">Fetching products from database...</p>
                </TableCell>
              </TableRow>
            ) : productsList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-16 text-muted-foreground">
                  <div className="h-14 w-14 rounded-2xl bg-secondary border border-border flex items-center justify-center mx-auto mb-3">
                    <Package className="h-7 w-7 opacity-50 text-muted-foreground" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">No Products Found</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                    {searchTerm || statusFilter !== "ALL"
                      ? "No catalog items matched your filter criteria. Try adjusting your search query."
                      : "Your database catalog is empty. Click 'Add New Product' to create your first product."}
                  </p>
                  <Button variant="outline" size="sm" className="mt-4 gap-2"
                    onClick={() => router.push("/products/new")}
                  >
                    <Plus className="h-4 w-4" /> Add Product Now
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              productsList.map((product) => (
                <TableRow key={product.id}>
                  {/* Thumbnail Avatar + Info */}
                  <TableCell className="py-4 pl-6">
                    <div className="flex items-center gap-3.5">
                      <div className="h-11 w-11 rounded-lg bg-secondary border border-border flex items-center justify-center shrink-0 overflow-hidden relative">
                        {product.images && product.images.length > 0 && product.images[0].url ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={product.images[0].url}
                            alt={product.name}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <ImageIcon className="h-5 w-5 text-muted-foreground opacity-60" />
                        )}
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
                        onClick={() => router.push(`/products/edit/${product.id}`)}
                        className="h-7 px-2.5 gap-1"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </Button>
                      <Button
                        variant="destructive"
                        size="xs"
                        onClick={() => setDeleteProductTarget(product)}
                        className="h-7 px-2"
                        title="Delete Product"
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

        {/* Bottom Pagination Bar with Integrated Per-Page Selector */}
        {pagination.total > 0 && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6 py-4 border-t border-border bg-card/40">
            <div className="flex items-center gap-4">
              <div className="text-xs text-muted-foreground font-medium">
                Showing <span className="font-bold text-foreground">{startItemIndex}</span> to{" "}
                <span className="font-bold text-foreground">{endItemIndex}</span> of{" "}
                <span className="font-bold text-foreground">{pagination.total}</span> products
              </div>

              {/* Rows Per Page selector in bottom pagination bar */}
              <div className="flex items-center gap-2 border-l border-border pl-4">
                <span className="text-xs text-muted-foreground font-semibold">Rows per page:</span>
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                  className="h-8 rounded-md border border-border bg-card px-2.5 text-xs font-semibold text-foreground outline-none cursor-pointer focus:border-primary"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="xs"
                onClick={() => setPage(1)}
                disabled={page <= 1}
              >
                <ChevronsLeft className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="xs"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Prev
              </Button>

              <span className="px-3 text-xs font-bold text-foreground">
                {page} / {pagination.totalPages}
              </span>

              <Button
                variant="outline"
                size="xs"
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page >= pagination.totalPages}
              >
                Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
              <Button
                variant="outline"
                size="xs"
                onClick={() => setPage(pagination.totalPages)}
                disabled={page >= pagination.totalPages}
              >
                <ChevronsRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </Card>


      {/* Shadcn Delete Confirmation Dialog Modal */}
      <Dialog
        open={Boolean(deleteProductTarget)}
        onOpenChange={(open) => !open && setDeleteProductTarget(null)}
      >
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Confirm Product Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{deleteProductTarget?.name}"?
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-3 text-xs text-muted-foreground">
          This action will permanently delete product <span className="text-foreground font-bold font-heading">"{deleteProductTarget?.name}"</span> (SKU: <span className="font-mono text-primary font-bold">{deleteProductTarget?.sku}</span>) from Neon PostgreSQL database. This action cannot be undone.
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setDeleteProductTarget(null)}
            disabled={deleteMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => deleteProductTarget && deleteMutation.mutate(deleteProductTarget.id)}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete Product"}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
