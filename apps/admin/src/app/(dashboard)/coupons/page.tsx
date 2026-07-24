"use client";

import { useState } from "react";
import { Plus, Ticket, Search, Edit, Trash2 } from "lucide-react";
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
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";

interface Coupon {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  minOrderAmount: number;
  usageCount: number;
  maxUsage: number;
  expiryDate: string;
  isActive: boolean;
}

const mockCoupons: Coupon[] = [
  { id: "1", code: "KESARIYA10", type: "PERCENTAGE", value: 10, minOrderAmount: 1999, usageCount: 142, maxUsage: 500, expiryDate: "2025-12-31", isActive: true },
  { id: "2", code: "FESTIVE500", type: "FIXED", value: 500, minOrderAmount: 4999, usageCount: 89, maxUsage: 200, expiryDate: "2025-11-15", isActive: true },
  { id: "3", code: "WELCOME100", type: "FIXED", value: 100, minOrderAmount: 999, usageCount: 310, maxUsage: 1000, expiryDate: "2026-01-01", isActive: true },
];

export default function CouponsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Offer & Coupon Management</h1>
          <p className="text-xs text-foreground-muted mt-1">
            Create discount codes, set usage limits, and run store promotions.
          </p>
        </div>
        <Button onClick={() => toast.info("Create Coupon Modal")} className="gap-2">
          <Plus className="h-4 w-4" /> Create Coupon
        </Button>
      </div>

      <Card className="p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
          <Input
            placeholder="Search coupon code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Coupon Code</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Min. Order</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockCoupons.map((coupon) => (
              <TableRow key={coupon.id}>
                <TableCell className="font-mono font-bold text-primary">{coupon.code}</TableCell>
                <TableCell className="font-semibold">
                  {coupon.type === "PERCENTAGE" ? `${coupon.value}% OFF` : formatCurrency(coupon.value) + " OFF"}
                </TableCell>
                <TableCell>{formatCurrency(coupon.minOrderAmount)}</TableCell>
                <TableCell>{coupon.usageCount} / {coupon.maxUsage}</TableCell>
                <TableCell className="text-xs text-foreground-muted">{formatDate(coupon.expiryDate)}</TableCell>
                <TableCell>
                  <Badge variant={coupon.isActive ? "success" : "secondary"}>
                    {coupon.isActive ? "ACTIVE" : "EXPIRED"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon-sm" onClick={() => toast.info(`Edit ${coupon.code}`)}>
                      <Edit className="h-4 w-4 text-foreground-muted" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => toast.success(`Deleted ${coupon.code}`)}>
                      <Trash2 className="h-4 w-4 text-danger" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
