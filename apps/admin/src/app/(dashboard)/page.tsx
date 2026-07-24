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

// Mock data — will be replaced with real API calls
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

const statusColors: Record<string, { bg: string; color: string }> = {
  PENDING: { bg: "var(--warning-muted)", color: "var(--warning)" },
  PROCESSING: { bg: "var(--info-muted)", color: "var(--info)" },
  SHIPPED: { bg: "var(--accent-muted)", color: "var(--primary)" },
  DELIVERED: { bg: "var(--success-muted)", color: "var(--success)" },
  CANCELLED: { bg: "var(--danger-muted)", color: "var(--danger)" },
};

export default function DashboardPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Page Title */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--foreground)" }}>Dashboard</h1>
        <p style={{ fontSize: 13, color: "var(--foreground-muted)", marginTop: 4 }}>
          Welcome back! Here&apos;s what&apos;s happening in your store.
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
        {kpiCards.map((card) => {
          const Icon = card.icon;
          const Trend = card.positive ? TrendingUp : TrendingDown;
          return (
            <div
              key={card.label}
              style={{
                background: "var(--background-secondary)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: "20px 22px",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    background: card.bg,
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: card.color,
                  }}
                >
                  <Icon size={18} />
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 12,
                    fontWeight: 600,
                    color: card.positive ? "var(--success)" : "var(--danger)",
                    background: card.positive ? "var(--success-muted)" : "var(--danger-muted)",
                    padding: "3px 8px",
                    borderRadius: 20,
                  }}
                >
                  <Trend size={11} />
                  {card.change}
                </div>
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "var(--foreground)", marginBottom: 4 }}>
                {card.value}
              </div>
              <div style={{ fontSize: 12.5, color: "var(--foreground-muted)" }}>{card.label}</div>
            </div>
          );
        })}
      </div>

      {/* Revenue Chart */}
      <div
        style={{
          background: "var(--background-secondary)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: "22px 24px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, color: "var(--foreground)" }}>Revenue Overview</div>
            <div style={{ fontSize: 12, color: "var(--foreground-muted)", marginTop: 2 }}>Monthly revenue for 2025</div>
          </div>
          <select
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 7,
              padding: "6px 10px",
              color: "var(--foreground-muted)",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            <option>Last 7 months</option>
            <option>Last 12 months</option>
          </select>
        </div>
        <ResponsiveContainer width="100%" height={220}>
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
      </div>

      {/* Recent Orders */}
      <div
        style={{
          background: "var(--background-secondary)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 24px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div style={{ fontWeight: 600, fontSize: 15, color: "var(--foreground)" }}>Recent Orders</div>
          <Link
            href="/orders"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 12.5,
              color: "var(--primary)",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            View All <ArrowRight size={13} />
          </Link>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Order ID", "Customer", "Amount", "Status", "Date"].map((col) => (
                  <th
                    key={col}
                    style={{
                      padding: "10px 24px",
                      textAlign: "left",
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      color: "var(--foreground-muted)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order, i) => {
                const s = statusColors[order.status];
                return (
                  <tr
                    key={order.id}
                    style={{
                      borderBottom: i < recentOrders.length - 1 ? "1px solid var(--border-muted)" : "none",
                    }}
                  >
                    <td style={{ padding: "14px 24px", fontSize: 13, color: "var(--primary)", fontWeight: 600 }}>
                      {order.id}
                    </td>
                    <td style={{ padding: "14px 24px", fontSize: 13, color: "var(--foreground)" }}>
                      {order.customer}
                    </td>
                    <td style={{ padding: "14px 24px", fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>
                      {formatCurrency(order.amount)}
                    </td>
                    <td style={{ padding: "14px 24px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "3px 10px",
                          borderRadius: 20,
                          fontSize: 11.5,
                          fontWeight: 600,
                          background: s?.bg,
                          color: s?.color,
                        }}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "14px 24px",
                        fontSize: 12.5,
                        color: "var(--foreground-muted)",
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <Clock size={12} />
                      {formatDate(order.date)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
