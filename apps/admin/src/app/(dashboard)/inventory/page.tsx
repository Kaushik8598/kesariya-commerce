"use client";

import { useState } from "react";
import { Search, Warehouse, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
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

interface InventoryItem {
  id: string;
  sku: string;
  productName: string;
  variant: string; // e.g. "Size L / Red"
  stock: number;
  lowStockThreshold: number;
}

const mockInventory: InventoryItem[] = [
  { id: "1", sku: "KURTA-SILK-L-RED", productName: "Royal Kesariya Silk Kurta", variant: "L / Kesariya Red", stock: 15, lowStockThreshold: 10 },
  { id: "2", sku: "KURTA-SILK-M-RED", productName: "Royal Kesariya Silk Kurta", variant: "M / Kesariya Red", stock: 4, lowStockThreshold: 10 },
  { id: "3", sku: "KURTA-SILK-XL-RED", productName: "Royal Kesariya Silk Kurta", variant: "XL / Kesariya Red", stock: 0, lowStockThreshold: 10 },
  { id: "4", sku: "SUIT-ANAR-M-GLD", productName: "Embroidered Anarkali Suit", variant: "M / Gold Embroidered", stock: 18, lowStockThreshold: 10 },
  { id: "5", sku: "DUP-BAN-FREE-BLU", productName: "Handwoven Banarasi Dupatta", variant: "Free Size / Royal Blue", stock: 2, lowStockThreshold: 5 },
  { id: "6", sku: "JCK-NEH-40-NVY", productName: "Printed Cotton Nehru Jacket", variant: "Size 40 / Navy Blue", stock: 32, lowStockThreshold: 10 },
];

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStock, setFilterStock] = useState("ALL");
  const [inventory, setInventory] = useState(mockInventory);

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.variant.toLowerCase().includes(searchTerm.toLowerCase());

    const isLow = item.stock > 0 && item.stock <= item.lowStockThreshold;
    const isOut = item.stock === 0;

    let matchesFilter = true;
    if (filterStock === "LOW") matchesFilter = isLow;
    if (filterStock === "OUT") matchesFilter = isOut;
    if (filterStock === "IN_STOCK") matchesFilter = item.stock > item.lowStockThreshold;

    return matchesSearch && matchesFilter;
  });

  const handleAdjustStock = (id: string, delta: number) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newStock = Math.max(0, item.stock + delta);
          toast.success(`Stock updated to ${newStock}`);
          return { ...item, stock: newStock };
        }
        return item;
      })
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Inventory Management</h1>
        <p className="text-xs text-foreground-muted mt-1">
          Monitor variant stock levels, low-stock warnings, and quickly adjust inventory count.
        </p>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
            <Input
              placeholder="Search by SKU, product name or variant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <select
            value={filterStock}
            onChange={(e) => setFilterStock(e.target.value)}
            className="h-9 rounded-lg border border-border bg-surface px-3 text-xs text-foreground outline-none cursor-pointer"
          >
            <option value="ALL">All Stock Levels</option>
            <option value="IN_STOCK">In Stock</option>
            <option value="LOW">Low Stock Alert</option>
            <option value="OUT">Out of Stock</option>
          </select>
        </div>
      </Card>

      {/* Table */}
      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Variant</TableHead>
              <TableHead>Stock Level</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Stock Adjustment</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInventory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-foreground-muted">
                  <Warehouse className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  No inventory items match your filter.
                </TableCell>
              </TableRow>
            ) : (
              filteredInventory.map((item) => {
                const isOut = item.stock === 0;
                const isLow = item.stock > 0 && item.stock <= item.lowStockThreshold;

                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-xs font-semibold text-primary">
                      {item.sku}
                    </TableCell>
                    <TableCell className="font-medium">{item.productName}</TableCell>
                    <TableCell className="text-foreground-muted">{item.variant}</TableCell>
                    <TableCell className="font-bold text-base">{item.stock}</TableCell>
                    <TableCell>
                      {isOut ? (
                        <Badge variant="danger" className="gap-1">
                          <XCircle className="h-3 w-3" /> Out of Stock
                        </Badge>
                      ) : isLow ? (
                        <Badge variant="warning" className="gap-1">
                          <AlertTriangle className="h-3 w-3" /> Low Stock
                        </Badge>
                      ) : (
                        <Badge variant="success" className="gap-1">
                          <CheckCircle2 className="h-3 w-3" /> In Stock
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAdjustStock(item.id, -1)}
                          disabled={item.stock === 0}
                        >
                          -1
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAdjustStock(item.id, +5)}
                        >
                          +5
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAdjustStock(item.id, +10)}
                        >
                          +10
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
