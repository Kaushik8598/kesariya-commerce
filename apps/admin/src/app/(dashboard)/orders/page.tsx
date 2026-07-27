"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  ShoppingCart,
  Clock,
  Truck,
  IndianRupee,
  Filter,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  User,
  MapPin,
  Tag,
  Ruler,
  Palette,
} from "lucide-react";
import api from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
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

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product?: { id?: string; name: string; sku?: string; slug: string };
  variant?: { id?: string; sku?: string; size?: string; color?: string } | null;
  measurementProfile?: {
    name?: string;
    values?: { id?: string; type?: string; value: number }[];
  } | null;
}

interface Order {
  id: string;
  orderNumber: string;
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "RETURNED";
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  paymentMethod: "COD" | "ONLINE";
  user?: { id: string; firstName: string; lastName?: string | null; email: string; mobile?: string | null };
  items: OrderItem[];
  shippingAddress?: {
    addressLine1?: string;
    city?: string;
    state?: string;
    postalCode?: string;
  } | null;
  createdAt: string;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function OrdersPage() {
  const queryClient = useQueryClient();

  // Search, Filter & Pagination State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Detail Modal State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Fetch Orders: GET /admin/orders?page=1&limit=10&search=...&status=...
  const { data: responseData, isLoading } = useQuery<{
    data: Order[];
    stats: { totalRevenue: number };
    pagination: PaginationMeta;
  }>({
    queryKey: ["adminOrders", page, limit, searchTerm, statusFilter],
    queryFn: async () => {
      const res = await api.get("/admin/orders", {
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
            stats: { totalRevenue: 0 },
            pagination: {
              total: Array.isArray(res.data) ? res.data.length : 0,
              page: 1,
              limit: 10,
              totalPages: 1,
            },
          };
    },
  });

  const ordersList: Order[] = responseData?.data || [];
  const pagination: PaginationMeta = responseData?.pagination || {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  };
  const totalRevenue = responseData?.stats?.totalRevenue || 0;

  // Update Status Mutation: PATCH /admin/orders/:id/status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, paymentStatus }: { id: string; status?: string; paymentStatus?: string }) => {
      const res = await api.patch(`/admin/orders/${id}/status`, { status, paymentStatus });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Order status updated!");
      queryClient.invalidateQueries({ queryKey: ["adminOrders"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to update order status");
    },
  });

  const pendingCount = ordersList.filter((o) => o.status === "PENDING").length;
  const processingCount = ordersList.filter((o) => o.status === "PROCESSING" || o.status === "SHIPPED").length;

  const startItemIndex = (pagination.page - 1) * pagination.limit + 1;
  const endItemIndex = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground font-heading">
            Orders Management
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Track customer orders, inspect SKU/color/size variant specs, and manage order workflow.
          </p>
        </div>
      </div>

      {/* Overview Stat Cards (No Page Number Card) */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="p-5 !flex-row items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Orders
            </p>
            <p className="text-2xl font-extrabold text-foreground font-heading">
              {pagination.total}
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0 border border-primary/20">
            <ShoppingCart className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-5 !flex-row items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Pending Orders
            </p>
            <p className="text-2xl font-extrabold text-amber-400 font-heading">
              {pendingCount}
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
            <Clock className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-5 !flex-row items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Processing / Shipped
            </p>
            <p className="text-2xl font-extrabold text-sky-400 font-heading">
              {processingCount}
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/20">
            <Truck className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-5 !flex-row items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Revenue
            </p>
            <p className="text-2xl font-extrabold text-emerald-400 font-heading">
              {formatCurrency(totalRevenue)}
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
            <IndianRupee className="h-5 w-5" />
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
              placeholder="Search by order number or customer name..."
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
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="py-3.5 pl-6">Order #</TableHead>
              <TableHead className="py-3.5">Customer</TableHead>
              <TableHead className="py-3.5">Items Count</TableHead>
              <TableHead className="py-3.5">Total Amount</TableHead>
              <TableHead className="py-3.5">Order Status</TableHead>
              <TableHead className="py-3.5">Payment</TableHead>
              <TableHead className="py-3.5 text-right pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-14 text-muted-foreground">
                  <Loader2 className="h-7 w-7 animate-spin mx-auto mb-2 text-primary" />
                  <p className="text-xs font-semibold">Loading orders from database...</p>
                </TableCell>
              </TableRow>
            ) : ordersList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-16 text-muted-foreground">
                  <div className="h-14 w-14 rounded-2xl bg-secondary border border-border flex items-center justify-center mx-auto mb-3">
                    <ShoppingCart className="h-7 w-7 opacity-50 text-muted-foreground" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">No Orders Found</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                    {searchTerm || statusFilter !== "ALL"
                      ? "No order records matched your filter criteria."
                      : "No customer orders have been placed yet."}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              ordersList.map((order) => (
                <TableRow key={order.id}>
                  {/* Order # */}
                  <TableCell className="py-4 pl-6">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-mono text-xs font-bold text-primary">
                        {order.orderNumber}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </span>
                    </div>
                  </TableCell>

                  {/* Customer */}
                  <TableCell className="py-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold text-foreground">
                        {order.user ? `${order.user.firstName || ""} ${order.user.lastName || ""}`.trim() : "Guest Customer"}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {order.user?.email || "N/A"}
                      </span>
                    </div>
                  </TableCell>

                  {/* Items Count */}
                  <TableCell className="py-4 text-xs font-semibold text-foreground">
                    {order.items?.length || 0} items
                  </TableCell>

                  {/* Total */}
                  <TableCell className="py-4 text-xs font-bold text-emerald-400">
                    {formatCurrency(order.total)}
                  </TableCell>

                  {/* Order Status Select Dropdown */}
                  <TableCell className="py-4">
                    <select
                      value={order.status}
                      onChange={(e) =>
                        updateStatusMutation.mutate({
                          id: order.id,
                          status: e.target.value,
                        })
                      }
                      className="h-8 rounded-md border border-border bg-card px-2.5 text-xs font-bold text-foreground outline-none cursor-pointer focus:border-primary"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </TableCell>

                  {/* Payment */}
                  <TableCell className="py-4">
                    <Badge
                      variant={
                        order.paymentStatus === "PAID"
                          ? "success"
                          : order.paymentStatus === "FAILED"
                          ? "danger"
                          : "warning"
                      }
                    >
                      {order.paymentStatus} ({order.paymentMethod})
                    </Badge>
                  </TableCell>

                  {/* Actions (View Details for fulfillment packing) */}
                  <TableCell className="py-4 text-right pr-6">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="secondary"
                        size="xs"
                        onClick={() => setSelectedOrder(order)}
                        className="h-7 px-3 gap-1.5"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>View Details & Items</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Bottom Pagination Bar */}
        <DataTablePagination
          page={page}
          limit={limit}
          total={pagination.total}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
          onLimitChange={setLimit}
          entityName="orders"
        />
      </Card>

      {/* Order Details & Fulfillment Packing Breakdown Modal */}
      <Dialog
        open={Boolean(selectedOrder)}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
      >
        <DialogHeader>
          <DialogTitle>Order Breakdown #{selectedOrder?.orderNumber}</DialogTitle>
          <DialogDescription>
            Placed on {selectedOrder?.createdAt ? formatDate(selectedOrder.createdAt) : ""}
          </DialogDescription>
        </DialogHeader>

        {selectedOrder && (
          <div className="space-y-4 py-3 max-h-[75vh] overflow-y-auto pr-1">
            {/* Customer & Shipping Summary */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-secondary/50 border border-border">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-foreground mb-1">
                  <User className="h-3.5 w-3.5 text-primary" /> Customer Info
                </div>
                <p className="text-xs font-semibold text-foreground">
                  {selectedOrder.user ? `${selectedOrder.user.firstName || ""} ${selectedOrder.user.lastName || ""}`.trim() : "Guest"}
                </p>
                <p className="text-[11px] text-muted-foreground">{selectedOrder.user?.email}</p>
                <p className="text-[11px] text-muted-foreground">{selectedOrder.user?.mobile || "No mobile"}</p>
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-foreground mb-1">
                  <MapPin className="h-3.5 w-3.5 text-primary" /> Shipping Address
                </div>
                <p className="text-xs text-muted-foreground">
                  {selectedOrder.shippingAddress?.addressLine1 || "No address recorded"}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.postalCode}
                </p>
              </div>
            </div>

            {/* Exact Items & SKU / Variant Packing Specifications */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-foreground">
                  Fulfillment Packing Items ({selectedOrder.items?.length || 0})
                </span>
                <span className="text-[11px] text-muted-foreground font-mono">
                  Exact SKU & Variant Specs
                </span>
              </div>

              <div className="rounded-xl border border-border overflow-hidden bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="py-2.5 pl-4 text-xs">Product & Variant Specs</TableHead>
                      <TableHead className="py-2.5 text-xs">SKU Code</TableHead>
                      <TableHead className="py-2.5 text-xs">Qty</TableHead>
                      <TableHead className="py-2.5 text-xs text-right pr-4">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.items?.map((item) => {
                      const itemSku = item.variant?.sku || item.product?.sku || "NO-SKU";
                      return (
                        <TableRow key={item.id}>
                          <TableCell className="py-3 pl-4">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs font-bold text-foreground">
                                {item.product?.name || "Product Item"}
                              </span>

                              {/* Variant Attributes (Color & Size) */}
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {item.variant?.color && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-secondary px-2 py-0.5 rounded border border-border text-foreground">
                                    <Palette className="h-3 w-3 text-primary" />
                                    Color: {item.variant.color}
                                  </span>
                                )}
                                {item.variant?.size && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-secondary px-2 py-0.5 rounded border border-border text-foreground">
                                    <Tag className="h-3 w-3 text-emerald-400" />
                                    Size: {item.variant.size}
                                  </span>
                                )}
                              </div>

                              {/* Custom Measurement Profile (if custom tailored) */}
                              {item.measurementProfile && (
                                <div className="mt-1 p-2 rounded bg-secondary/70 border border-border text-[11px] space-y-1">
                                  <div className="font-bold text-foreground flex items-center gap-1 text-[10px]">
                                    <Ruler className="h-3 w-3 text-sky-400" /> Custom Tailoring: {item.measurementProfile.name || "Profile"}
                                  </div>
                                  <div className="grid grid-cols-2 gap-1 text-[10px] text-muted-foreground font-mono">
                                    {item.measurementProfile.values?.map((m: any) => (
                                      <span key={m.id}>
                                        {m.type}: <strong className="text-foreground">{m.value}"</strong>
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </TableCell>

                          {/* SKU */}
                          <TableCell className="py-3">
                            <span className="font-mono text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                              {itemSku}
                            </span>
                          </TableCell>

                          {/* Qty */}
                          <TableCell className="py-3 text-xs font-bold font-mono">
                            x{item.quantity}
                          </TableCell>

                          {/* Total */}
                          <TableCell className="py-3 text-xs font-bold text-right pr-4 text-emerald-400">
                            {formatCurrency(item.price * item.quantity)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Totals Breakdown */}
            <div className="space-y-1.5 pt-2 border-t border-border text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatCurrency(selectedOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Tax</span>
                <span>{formatCurrency(selectedOrder.tax)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span>{formatCurrency(selectedOrder.shipping)}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Discount</span>
                  <span>-{formatCurrency(selectedOrder.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-extrabold text-foreground pt-2 border-t border-border">
                <span>Grand Total</span>
                <span className="text-emerald-400">{formatCurrency(selectedOrder.total)}</span>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setSelectedOrder(null)}>
            Close
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
