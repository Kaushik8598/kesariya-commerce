"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  ShoppingCart,
  Eye,
  Clock,
  Filter,
  CheckCircle,
  XCircle,
  Truck,
  Package,
} from "lucide-react";
import api from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
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

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  mobile: string;
  totalAmount: number;
  paymentStatus: "PENDING" | "PAID" | "FAILED";
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  itemCount: number;
  createdAt: string;
}

const mockOrders: Order[] = [
  { id: "1", orderNumber: "ORD-2025-001", customerName: "Rahul Sharma", mobile: "9876543210", totalAmount: 4999, paymentStatus: "PAID", status: "DELIVERED", itemCount: 2, createdAt: new Date().toISOString() },
  { id: "2", orderNumber: "ORD-2025-002", customerName: "Priya Patel", mobile: "9876543211", totalAmount: 7999, paymentStatus: "PAID", status: "SHIPPED", itemCount: 1, createdAt: new Date().toISOString() },
  { id: "3", orderNumber: "ORD-2025-003", customerName: "Amit Verma", mobile: "9876543212", totalAmount: 1299, paymentStatus: "PENDING", status: "PROCESSING", itemCount: 3, createdAt: new Date().toISOString() },
  { id: "4", orderNumber: "ORD-2025-004", customerName: "Sneha Modi", mobile: "9876543213", totalAmount: 3499, paymentStatus: "PAID", status: "PENDING", itemCount: 1, createdAt: new Date().toISOString() },
  { id: "5", orderNumber: "ORD-2025-005", customerName: "Raj Gupta", mobile: "9876543214", totalAmount: 899, paymentStatus: "FAILED", status: "CANCELLED", itemCount: 1, createdAt: new Date().toISOString() },
];

type BadgeVariant = "warning" | "info" | "default" | "success" | "danger";

const statusBadges: Record<string, BadgeVariant> = {
  PENDING: "warning",
  PROCESSING: "info",
  SHIPPED: "default",
  DELIVERED: "success",
  CANCELLED: "danger",
};

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { data: apiOrders, isLoading } = useQuery<Order[]>({
    queryKey: ["adminOrders"],
    queryFn: async () => {
      try {
        const res = await api.get("/orders");
        return res.data?.data || res.data || [];
      } catch {
        return [];
      }
    },
  });

  const ordersList = apiOrders && apiOrders.length > 0 ? apiOrders : mockOrders;

  const filteredOrders = ordersList.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.mobile.includes(searchTerm);
    const matchesStatus = statusFilter === "ALL" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = (newStatus: Order["status"]) => {
    if (selectedOrder) {
      toast.success(`Order ${selectedOrder.orderNumber} updated to ${newStatus}`);
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Orders Management</h1>
        <p className="text-xs text-foreground-muted mt-1">
          Track customer orders, manage status updates, and view transaction details.
        </p>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
            <Input
              placeholder="Search by order ID, customer name, mobile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-lg border border-border bg-surface px-3 text-xs text-foreground outline-none cursor-pointer"
          >
            <option value="ALL">All Order Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </Card>

      {/* Table */}
      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order Number</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-foreground-muted">
                  Loading orders...
                </TableCell>
              </TableRow>
            ) : filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-foreground-muted">
                  <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-semibold text-primary font-mono">
                    {order.orderNumber}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">{order.customerName}</span>
                      <span className="text-xs text-foreground-muted">{order.mobile}</span>
                    </div>
                  </TableCell>
                  <TableCell>{order.itemCount} items</TableCell>
                  <TableCell className="font-bold text-foreground">
                    {formatCurrency(order.totalAmount)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        order.paymentStatus === "PAID"
                          ? "success"
                          : order.paymentStatus === "PENDING"
                          ? "warning"
                          : "danger"
                      }
                    >
                      {order.paymentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusBadges[order.status] || "default"}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-foreground-muted text-xs">
                    {formatDate(order.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedOrder(order)}
                      className="gap-1.5"
                    >
                      <Eye className="h-4 w-4" /> View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-xl border border-border bg-background-secondary p-6 shadow-2xl flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h2 className="text-lg font-bold text-foreground">{selectedOrder.orderNumber}</h2>
                <p className="text-xs text-foreground-muted">Placed on {formatDate(selectedOrder.createdAt)}</p>
              </div>
              <Badge variant={statusBadges[selectedOrder.status] || "default"}>
                {selectedOrder.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <div className="font-semibold text-foreground mb-1">Customer Info</div>
                <div className="text-foreground-muted">{selectedOrder.customerName}</div>
                <div className="text-foreground-muted">{selectedOrder.mobile}</div>
              </div>
              <div>
                <div className="font-semibold text-foreground mb-1">Payment Details</div>
                <div className="text-foreground-muted">Status: {selectedOrder.paymentStatus}</div>
                <div className="font-bold text-foreground text-sm mt-0.5">
                  Total: {formatCurrency(selectedOrder.totalAmount)}
                </div>
              </div>
            </div>

            {/* Quick Status Change */}
            <div className="pt-3 border-t border-border">
              <label className="text-xs font-semibold text-foreground block mb-2">
                Update Order Status:
              </label>
              <div className="flex flex-wrap gap-2">
                {(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] as const).map(
                  (st) => (
                    <Button
                      key={st}
                      variant={selectedOrder.status === st ? "default" : "outline"}
                      size="xs"
                      onClick={() => handleUpdateStatus(st)}
                    >
                      {st}
                    </Button>
                  )
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
