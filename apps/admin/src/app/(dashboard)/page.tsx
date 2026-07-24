"use client";

import {
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  AreaChart,
  Area,
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
import { Button, buttonVariants } from "@/components/ui/button";

const revenueData = [
  { month: "Jan", revenue: 420000 },
  { month: "Feb", revenue: 380000 },
  { month: "Mar", revenue: 510000 },
  { month: "Apr", revenue: 460000 },
  { month: "May", revenue: 620000 },
  { month: "Jun", revenue: 580000 },
  { month: "Jul", revenue: 710000 },
];

const recentOrders = [
  { id: "#ORD-001", customer: "Rahul Sharma", amount: 2499, status: "DELIVERED", date: new Date().toISOString() },
  { id: "#ORD-002", customer: "Priya Patel", amount: 4999, status: "PROCESSING", date: new Date().toISOString() },
  { id: "#ORD-003", customer: "Amit Verma", amount: 1299, status: "PENDING", date: new Date().toISOString() },
  { id: "#ORD-004", customer: "Sneha Modi", amount: 3499, status: "SHIPPED", date: new Date().toISOString() },
  { id: "#ORD-005", customer: "Raj Gupta", amount: 899, status: "CANCELLED", date: new Date().toISOString() },
];

const kpiCards = [
  {
    label: "Total Revenue",
    value: formatCurrency(3120000),
    change: "+12.5%",
    positive: true,
    icon: TrendingUp,
    color: "var(--success)",
    bg: "var(--success-muted)",
  },
  {
    label: "Total Orders",
    value: "1,842",
    change: "+8.2%",
    positive: true,
    icon: ShoppingCart,
    color: "var(--info)",
    bg: "var(--info-muted)",
  },
  {
    label: "Total Customers",
    value: "5,621",
    change: "+15.1%",
    positive: true,
    icon: Users,
    color: "var(--primary)",
    bg: "var(--accent-muted)",
  },
  {
    label: "Active Products",
    value: "342",
    change: "-2.3%",
    positive: false,
    icon: Package,
    color: "var(--warning)",
    bg: "var(--warning-muted)",
  },
];

type BadgeVariant = "warning" | "info" | "default" | "success" | "danger";

const statusBadges: Record<string, BadgeVariant> = {
  PENDING: "warning",
  PROCESSING: "info",
  SHIPPED: "default",
  DELIVERED: "success",
  CANCELLED: "danger",
};

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-xs text-foreground-muted mt-1">
          Welcome back! Here&apos;s what&apos;s happening in your store today.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          const Trend = card.positive ? TrendingUp : TrendingDown;
          return (
            <Card key={card.label} className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{ background: card.bg, color: card.color }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <Badge variant={card.positive ? "success" : "danger"}>
                  <Trend className="h-3 w-3 mr-0.5" />
                  {card.change}
                </Badge>
              </div>
              <div className="text-2xl font-bold tracking-tight text-foreground">{card.value}</div>
              <div className="text-xs text-foreground-muted mt-1">{card.label}</div>
            </Card>
          );
        })}
      </div>

      {/* Revenue Chart Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Monthly revenue breakdown for 2025</CardDescription>
          </div>
          <select className="h-8 rounded-md border border-border bg-surface px-2.5 text-xs text-foreground-muted outline-none cursor-pointer">
            <option>Last 7 months</option>
            <option>Last 12 months</option>
          </select>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: "var(--foreground-muted)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`}
                tick={{ fill: "var(--foreground-muted)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  color: "var(--foreground)",
                  fontSize: 12,
                }}
                formatter={(v) => [formatCurrency(Number(v)), "Revenue"]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#f97316"
                strokeWidth={2.5}
                fill="url(#revenueGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Orders Table Card */}
      <Card className="p-0 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription className="mt-0.5">Latest transactions from your customers</CardDescription>
          </div>
          <Link href="/orders" className={buttonVariants({ variant: "ghost", size: "sm" }) + " text-primary hover:text-primary"}>
            View All <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-semibold text-primary">{order.id}</TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell className="font-semibold">{formatCurrency(order.amount)}</TableCell>
                <TableCell>
                  <Badge variant={statusBadges[order.status] || "default"}>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-foreground-muted flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDate(order.date)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
