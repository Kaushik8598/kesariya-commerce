"use client";

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
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

const salesByCategory = [
  { name: "Kurtas", sales: 485000 },
  { name: "Sherwanis", sales: 390000 },
  { name: "Sarees & Lehengas", sales: 720000 },
  { name: "Dupattas", sales: 185000 },
  { name: "Jackets", sales: 240000 },
];

const deviceData = [
  { name: "Mobile", value: 68, color: "#f97316" },
  { name: "Desktop", value: 28, color: "#58a6ff" },
  { name: "Tablet", value: 4, color: "#3fb950" },
];

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Analytics & Reports</h1>
        <p className="text-xs text-foreground-muted mt-1">
          Detailed sales performance, category revenue breakdown, and visitor analytics.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Category Revenue Bar Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
            <CardDescription>Total revenue breakdown per main category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={salesByCategory}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "var(--foreground-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} tick={{ fill: "var(--foreground-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground)" }}
                  formatter={(v) => [formatCurrency(Number(v)), "Sales"]}
                />
                <Bar dataKey="sales" fill="#f97316" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Traffic Share Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Traffic Sources</CardTitle>
            <CardDescription>Device breakdown of store visitors</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={deviceData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value">
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground)" }}
                  formatter={(v) => [`${v}%`, "Share"]}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="flex justify-center gap-4 mt-2">
              {deviceData.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs text-foreground-muted">
                  <div className="h-3 w-3 rounded-full" style={{ background: d.color }} />
                  {d.name} ({d.value}%)
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
