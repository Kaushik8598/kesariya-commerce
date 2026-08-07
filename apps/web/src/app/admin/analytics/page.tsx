"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  Package,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  BarChart3,
} from "lucide-react";
import api from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

interface TopProduct {
  name: string;
  quantity: number;
  revenue: number;
}

interface AnalyticsData {
  stats: {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    totalProducts: number;
    averageOrderValue: number;
  };
  categorySales: { name: string; sales: number }[];
  topProducts: TopProduct[];
}



export default function AnalyticsPage() {
  // Table Pagination State for Top Products
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);

  // Fetch Analytics: GET /admin/analytics
  const { data: analyticsData, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["adminAnalytics"],
    queryFn: async () => {
      const res = await api.get("/admin/analytics");
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
  const topProductsList = analyticsData?.topProducts || [];

  const totalPages = Math.ceil(topProductsList.length / limit) || 1;
  const startItemIndex = (page - 1) * limit + 1;
  const endItemIndex = Math.min(page * limit, topProductsList.length);
  const paginatedTopProducts = topProductsList.slice((page - 1) * limit, page * limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground font-heading">
            Analytics & Business Reports
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time revenue performance, category sales distribution, and top performing products.
          </p>
        </div>
      </div>

      {/* Overview Stat Cards (No Page Number Card) */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="p-5 !flex-row items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Sales Revenue
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
              Avg Order Value (AOV)
            </p>
            <p className="text-2xl font-extrabold text-sky-400 font-heading">
              {formatCurrency(stats.averageOrderValue)}
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/20">
            <TrendingUp className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-5 !flex-row items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Registered Customers
            </p>
            <p className="text-2xl font-extrabold text-amber-400 font-heading">
              {stats.totalCustomers}
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
            <Users className="h-5 w-5" />
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6">
        {/* Category Revenue Bar Chart */}
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>Category Revenue Breakdown</CardTitle>
            <CardDescription>Total sales revenue generated per product category</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
              </div>
            ) : categorySales.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
                <BarChart3 className="h-10 w-10 mb-2 opacity-40" />
                <p className="text-xs font-semibold">No category sales records found.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={290}>
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
      </div>

      {/* Top Products Table */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-bold text-foreground font-heading">
            Top Performing Products by Revenue
          </h3>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="py-3.5 pl-6">Product Title</TableHead>
              <TableHead className="py-3.5">Units Sold</TableHead>
              <TableHead className="py-3.5 text-right pr-6">Total Generated Revenue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-12 text-muted-foreground">
                  <Loader2 className="h-7 w-7 animate-spin mx-auto mb-2 text-primary" />
                  <p className="text-xs font-semibold">Loading top products from database...</p>
                </TableCell>
              </TableRow>
            ) : topProductsList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-14 text-muted-foreground">
                  <Package className="h-8 w-8 opacity-40 mx-auto mb-2" />
                  <p className="text-xs font-semibold">No order items recorded yet.</p>
                </TableCell>
              </TableRow>
            ) : (
              paginatedTopProducts.map((prod, index) => (
                <TableRow key={index}>
                  <TableCell className="py-4 pl-6 font-bold text-xs text-foreground">
                    {prod.name}
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge variant="outline" className="font-mono text-xs font-bold">
                      {prod.quantity} units
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 text-right pr-6 font-bold text-xs text-emerald-400">
                    {formatCurrency(prod.revenue)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Bottom Pagination Bar with Integrated Per-Page Selector */}
        {topProductsList.length > 0 && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6 py-4 border-t border-border bg-card/40">
            <div className="flex items-center gap-4">
              <div className="text-xs text-muted-foreground font-medium">
                Showing <span className="font-bold text-foreground">{startItemIndex}</span> to{" "}
                <span className="font-bold text-foreground">{endItemIndex}</span> of{" "}
                <span className="font-bold text-foreground">{topProductsList.length}</span> items
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
                {page} / {totalPages}
              </span>

              <Button
                variant="outline"
                size="xs"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
              <Button
                variant="outline"
                size="xs"
                onClick={() => setPage(totalPages)}
                disabled={page >= totalPages}
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
