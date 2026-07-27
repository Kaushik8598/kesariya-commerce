"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ShoppingCart,
  Users,
  Package,
  DollarSign,
  ArrowRight,
  Clock,
  Loader2,
  BarChart3,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";

interface AnalyticsData {
  stats: {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    totalProducts: number;
    averageOrderValue: number;
  };
  categorySales: { name: string; sales: number }[];
}

interface OrderItem {
  id: string;
  orderNumber: string;
  user?: { firstName: string; lastName: string };
  total: number;
  status: string;
  createdAt: string;
}

type BadgeVariant = "warning" | "info" | "default" | "success" | "danger";

const statusBadges: Record<string, BadgeVariant> = {
  PENDING: "warning",
  PROCESSING: "info",
  SHIPPED: "default",
  DELIVERED: "success",
  CANCELLED: "danger",
};

export default function DashboardPage() {
  // Real Analytics Query
  const { data: analyticsData, isLoading: isAnalyticsLoading } = useQuery<AnalyticsData>({
    queryKey: ["adminOverviewAnalytics"],
    queryFn: async () => {
      const res = await api.get("/admin/analytics");
      return res.data;
    },
  });

  // Real Recent Orders Query
  const { data: ordersResponse, isLoading: isOrdersLoading } = useQuery<{ data: OrderItem[] }>({
    queryKey: ["adminRecentOrdersOverview"],
    queryFn: async () => {
      const res = await api.get("/admin/orders", { params: { limit: 5 } });
      return res.data;
    },
  });

  const stats = analyticsData?.stats || {
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    averageOrderValue: 0,
  };
  const categorySales = analyticsData?.categorySales || [];
  const recentOrders = ordersResponse?.data || [];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground font-heading">
          Store Dashboard Overview
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Real-time performance summary, sales distribution, and latest customer orders.
        </p>
      </div>

      {/* Real KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="p-5 !flex-row items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Revenue
            </p>
            <p className="text-2xl font-extrabold text-foreground font-heading">
              {formatCurrency(stats.totalRevenue)}
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0 border border-primary/20">
            <DollarSign className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-5 !flex-row items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Orders
            </p>
            <p className="text-2xl font-extrabold text-emerald-400 font-heading">
              {stats.totalOrders}
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
            <ShoppingCart className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-5 !flex-row items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Customers
            </p>
            <p className="text-2xl font-extrabold text-amber-400 font-heading">
              {stats.totalCustomers}
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
            <Users className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-5 !flex-row items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Active Catalog Items
            </p>
            <p className="text-2xl font-extrabold text-sky-400 font-heading">
              {stats.totalProducts}
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/20">
            <Package className="h-5 w-5" />
          </div>
        </Card>
      </div>

      {/* Real Category Revenue Breakdown Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle>Category Revenue Breakdown</CardTitle>
            <CardDescription>Real sales revenue generated per category from database</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {isAnalyticsLoading ? (
            <div className="h-60 flex items-center justify-center text-muted-foreground">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
          ) : categorySales.length === 0 ? (
            <div className="h-60 flex flex-col items-center justify-center text-muted-foreground">
              <BarChart3 className="h-10 w-10 mb-2 opacity-40" />
              <p className="text-xs font-semibold">No category sales records in database.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={categorySales} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid stroke="#27272a" strokeDasharray="4 4" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#e4e4e7", fontSize: 12, fontWeight: 600 }}
                  axisLine={{ stroke: "#3f3f46" }}
                  tickLine={false}
                  interval={0}
                  dy={8}
                />
                <YAxis
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`}
                  tick={{ fill: "#a1a1aa", fontSize: 11, fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    borderColor: "#3f3f46",
                    borderRadius: 10,
                    color: "#ffffff",
                    fontSize: 12,
                    boxShadow: "0 12px 32px rgba(0,0,0,0.8)",
                  }}
                  itemStyle={{ color: "#f97316", fontWeight: 700 }}
                  labelStyle={{ color: "#ffffff", fontWeight: 700, marginBottom: 4 }}
                  cursor={{ fill: "rgba(249, 115, 22, 0.12)" }}
                  formatter={(v) => [formatCurrency(Number(v)), "Revenue"]}
                />
                <Bar dataKey="sales" fill="#f97316" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Real Recent Orders Table */}
      <Card className="p-0 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <CardTitle>Recent Customer Orders</CardTitle>
            <CardDescription className="mt-0.5">Latest transactions recorded in database</CardDescription>
          </div>
          <Link href="/orders" className={buttonVariants({ variant: "ghost", size: "sm" }) + " text-primary hover:text-primary"}>
            View All Orders <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="py-3.5 pl-6">Order Number</TableHead>
              <TableHead className="py-3.5">Customer Name</TableHead>
              <TableHead className="py-3.5">Total Amount</TableHead>
              <TableHead className="py-3.5">Status</TableHead>
              <TableHead className="py-3.5 text-right pr-6">Date & Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isOrdersLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  <Loader2 className="h-7 w-7 animate-spin mx-auto mb-2 text-primary" />
                  <p className="text-xs font-semibold">Loading recent orders...</p>
                </TableCell>
              </TableRow>
            ) : recentOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-14 text-muted-foreground">
                  <ShoppingBag className="h-8 w-8 opacity-40 mx-auto mb-2" />
                  <p className="text-xs font-semibold">No recent customer orders found in database.</p>
                </TableCell>
              </TableRow>
            ) : (
              recentOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="py-4 pl-6 font-bold text-xs text-primary font-mono">
                    #{order.orderNumber}
                  </TableCell>
                  <TableCell className="py-4 font-semibold text-xs text-foreground">
                    {order.user ? `${order.user.firstName} ${order.user.lastName}` : "Guest User"}
                  </TableCell>
                  <TableCell className="py-4 font-bold text-xs text-foreground">
                    {formatCurrency(Number(order.total || 0))}
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge variant={statusBadges[order.status] || "default"}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 text-right pr-6 text-xs text-muted-foreground font-mono">
                    <div className="flex items-center justify-end gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      {formatDate(order.createdAt)}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
