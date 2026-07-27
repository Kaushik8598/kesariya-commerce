"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Warehouse,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Filter,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Plus,
  Minus,
  PackageCheck,
  Save,
} from "lucide-react";
import api from "@/lib/api";
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

interface InventoryProduct {
  id: string;
  name: string;
  sku: string;
  stock: number;
  status: string;
  category?: { name: string } | null;
  brand?: { name: string } | null;
  images?: { url: string }[];
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function InventoryPage() {
  const queryClient = useQueryClient();

  // Search, Filter & Pagination State
  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Local editing state for inline stock values
  const [editingStockMap, setEditingStockMap] = useState<Record<string, number>>({});

  // Fetch Inventory Data: GET /admin/products/inventory?page=1&limit=10&search=...&stockFilter=...
  const { data: responseData, isLoading } = useQuery<{
    data: InventoryProduct[];
    stats: { inStockCount: number; lowStockCount: number; outOfStockCount: number };
    pagination: PaginationMeta;
  }>({
    queryKey: ["adminInventory", page, limit, searchTerm, stockFilter],
    queryFn: async () => {
      const res = await api.get("/admin/products/inventory", {
        params: {
          page,
          limit,
          search: searchTerm || undefined,
          stockFilter: stockFilter !== "ALL" ? stockFilter : undefined,
        },
      });
      return res.data?.data && res.data?.pagination
        ? res.data
        : {
            data: Array.isArray(res.data) ? res.data : [],
            stats: { inStockCount: 0, lowStockCount: 0, outOfStockCount: 0 },
            pagination: {
              total: Array.isArray(res.data) ? res.data.length : 0,
              page: 1,
              limit: 10,
              totalPages: 1,
            },
          };
    },
  });

  const inventoryList: InventoryProduct[] = responseData?.data || [];
  const pagination: PaginationMeta = responseData?.pagination || {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  };
  const stats = responseData?.stats || { inStockCount: 0, lowStockCount: 0, outOfStockCount: 0 };

  // Stock Update Mutation: PATCH /admin/products/:id/stock
  const updateStockMutation = useMutation({
    mutationFn: async ({ id, stock }: { id: string; stock: number }) => {
      const res = await api.patch(`/admin/products/${id}/stock`, { stock });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Stock inventory updated!");
      queryClient.invalidateQueries({ queryKey: ["adminInventory"] });
      queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to update stock");
    },
  });

  const handleStockInputChange = (id: string, currentStock: number, value: string) => {
    const parsed = parseInt(value, 10);
    setEditingStockMap((prev) => ({
      ...prev,
      [id]: isNaN(parsed) ? 0 : Math.max(0, parsed),
    }));
  };

  const handleStockStep = (id: string, currentStock: number, delta: number) => {
    const base = editingStockMap[id] !== undefined ? editingStockMap[id] : currentStock;
    const newStock = Math.max(0, base + delta);
    setEditingStockMap((prev) => ({ ...prev, [id]: newStock }));
    updateStockMutation.mutate({ id, stock: newStock });
  };

  const handleSaveStock = (id: string, currentStock: number) => {
    const newStock = editingStockMap[id] !== undefined ? editingStockMap[id] : currentStock;
    updateStockMutation.mutate({ id, stock: newStock });
  };

  const startItemIndex = (pagination.page - 1) * pagination.limit + 1;
  const endItemIndex = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground font-heading">
            Inventory & Stock Control
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Monitor real-time warehouse stock levels, adjust SKU quantities, and manage low stock thresholds.
          </p>
        </div>
      </div>

      {/* Overview Stat Cards (No Page Number Card) */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="p-5 !flex-row items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Catalog Items
            </p>
            <p className="text-2xl font-extrabold text-foreground font-heading">
              {pagination.total}
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0 border border-primary/20">
            <Warehouse className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-5 !flex-row items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              In Stock Items
            </p>
            <p className="text-2xl font-extrabold text-emerald-400 font-heading">
              {stats.inStockCount}
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-5 !flex-row items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Low Stock Warnings
            </p>
            <p className="text-2xl font-extrabold text-amber-400 font-heading">
              {stats.lowStockCount}
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-5 !flex-row items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Out of Stock
            </p>
            <p className="text-2xl font-extrabold text-rose-400 font-heading">
              {stats.outOfStockCount}
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/20">
            <XCircle className="h-5 w-5" />
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
              placeholder="Search inventory by product name or SKU..."
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
            <span className="text-xs text-muted-foreground font-semibold">Stock Status:</span>
            <select
              value={stockFilter}
              onChange={(e) => {
                setStockFilter(e.target.value);
                setPage(1);
              }}
              className="h-10 rounded-lg border border-border bg-card px-3 text-xs font-semibold text-foreground outline-none cursor-pointer focus:border-primary"
            >
              <option value="ALL">All Items</option>
              <option value="IN_STOCK">In Stock (&gt;10)</option>
              <option value="LOW">Low Stock (&le;10)</option>
              <option value="OUT">Out of Stock (0)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="py-3.5 pl-6">Product & Category</TableHead>
              <TableHead className="py-3.5">SKU Code</TableHead>
              <TableHead className="py-3.5">Stock Status</TableHead>
              <TableHead className="py-3.5">Stock Quantity</TableHead>
              <TableHead className="py-3.5 text-right pr-6">Quick Adjustments</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-14 text-muted-foreground">
                  <Loader2 className="h-7 w-7 animate-spin mx-auto mb-2 text-primary" />
                  <p className="text-xs font-semibold">Loading product stock levels from database...</p>
                </TableCell>
              </TableRow>
            ) : inventoryList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-16 text-muted-foreground">
                  <div className="h-14 w-14 rounded-2xl bg-secondary border border-border flex items-center justify-center mx-auto mb-3">
                    <Warehouse className="h-7 w-7 opacity-50 text-muted-foreground" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">No Inventory Items Found</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                    {searchTerm || stockFilter !== "ALL"
                      ? "No stock records matched your search or status filter."
                      : "No inventory items in catalog database."}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              inventoryList.map((product) => {
                const stockVal = editingStockMap[product.id] !== undefined ? editingStockMap[product.id] : product.stock;
                const isOut = stockVal === 0;
                const isLow = stockVal > 0 && stockVal <= 10;
                const isModified = editingStockMap[product.id] !== undefined && editingStockMap[product.id] !== product.stock;

                return (
                  <TableRow key={product.id}>
                    {/* Product Name */}
                    <TableCell className="py-4 pl-6">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-xs text-foreground">
                          {product.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          Category: {product.category?.name || "General"} {product.brand?.name ? `| ${product.brand.name}` : ""}
                        </span>
                      </div>
                    </TableCell>

                    {/* SKU */}
                    <TableCell className="py-4">
                      <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                        {product.sku}
                      </span>
                    </TableCell>

                    {/* Stock Status Badge */}
                    <TableCell className="py-4">
                      <Badge variant={isOut ? "danger" : isLow ? "warning" : "success"}>
                        {isOut ? "OUT OF STOCK" : isLow ? "LOW STOCK" : "IN STOCK"}
                      </Badge>
                    </TableCell>

                    {/* Stock Quantity Field */}
                    <TableCell className="py-4">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          value={stockVal}
                          onChange={(e) => handleStockInputChange(product.id, product.stock, e.target.value)}
                          className="h-8 w-20 px-2 rounded border border-border bg-secondary text-xs font-mono font-bold text-foreground text-center focus:outline-none focus:border-primary"
                        />
                        {isModified && (
                          <Button
                            size="xs"
                            variant="secondary"
                            onClick={() => handleSaveStock(product.id, product.stock)}
                            className="h-8 px-2 gap-1 text-[11px]"
                            title="Save Updated Stock"
                          >
                            <Save className="h-3 w-3 text-primary" />
                            <span>Save</span>
                          </Button>
                        )}
                      </div>
                    </TableCell>

                    {/* Quick Adjustments */}
                    <TableCell className="py-4 text-right pr-6">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => handleStockStep(product.id, product.stock, -5)}
                          className="h-7 px-2 text-[11px]"
                        >
                          -5
                        </Button>
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => handleStockStep(product.id, product.stock, -1)}
                          className="h-7 w-7 p-0"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => handleStockStep(product.id, product.stock, 1)}
                          className="h-7 w-7 p-0"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => handleStockStep(product.id, product.stock, 5)}
                          className="h-7 px-2 text-[11px]"
                        >
                          +5
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
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
                <span className="font-bold text-foreground">{pagination.total}</span> catalog items
              </div>

              {/* Rows Per Page selector */}
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
    </div>
  );
}
