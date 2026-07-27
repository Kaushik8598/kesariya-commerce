"use client";

import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Barcode as BarcodeIcon,
  Printer,
  RefreshCw,
  Copy,
  Check,
  Search,
  Tag,
  Package,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  Sliders,
} from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { toast } from "sonner";

interface ProductItem {
  id: string;
  name: string;
  sku: string;
  basePrice: number;
  salePrice?: number | null;
  category?: { name: string } | null;
  brand?: { name: string } | null;
  variants?: { id: string; sku: string; size?: string; color?: string }[];
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function BarcodePage() {
  // Generator State
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [categoryCode, setCategoryCode] = useState("KES");
  const [colorCode, setColorCode] = useState("RED");
  const [size, setSize] = useState("XL");
  const [customSequence, setCustomSequence] = useState("001");
  const [copied, setCopied] = useState(false);

  // Table Search & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const labelPrintRef = useRef<HTMLDivElement>(null);

  // Fetch real products: GET /admin/products?page=1&limit=10&search=...
  const { data: responseData, isLoading } = useQuery<{
    data: ProductItem[];
    pagination: PaginationMeta;
  }>({
    queryKey: ["adminProductsBarcode", page, limit, searchTerm],
    queryFn: async () => {
      const res = await api.get("/admin/products", {
        params: { page, limit, search: searchTerm || undefined },
      });
      return res.data?.data && res.data?.pagination
        ? res.data
        : {
            data: Array.isArray(res.data) ? res.data : [],
            pagination: { total: Array.isArray(res.data) ? res.data.length : 0, page: 1, limit: 10, totalPages: 1 },
          };
    },
  });

  const productsList: ProductItem[] = responseData?.data || [];
  const pagination: PaginationMeta = responseData?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 };

  // Generated Codes
  const activeProductName = selectedProduct ? selectedProduct.name : "Royal Kesariya Silk Kurta";
  const activeSKU = selectedProduct
    ? selectedProduct.sku
    : `${categoryCode}-${colorCode}-${size}-${customSequence}`.toUpperCase();
  const activePrice = selectedProduct?.salePrice || selectedProduct?.basePrice || 2499;
  const activeBarcode = `890${Math.floor(100000000 + Math.random() * 900000000)}`;

  const handleCopySKU = () => {
    navigator.clipboard.writeText(activeSKU);
    setCopied(true);
    toast.success("SKU copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    toast.info(`Sending Barcode Label sticker [${activeSKU}] to Thermal Printer...`);
    window.print();
  };

  const selectProductForLabel = (product: ProductItem) => {
    setSelectedProduct(product);
    const parts = product.sku.split("-");
    if (parts.length >= 3) {
      setCategoryCode(parts[0] || "KES");
      setColorCode(parts[1] || "RED");
      setSize(parts[2] || "XL");
    }
    toast.success(`Loaded "${product.name}" for label printing!`);
  };

  const startItemIndex = (pagination.page - 1) * pagination.limit + 1;
  const endItemIndex = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground font-heading">
            Barcode & SKU Management
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Format SKU codes, generate EAN-13 barcode stickers, and print inventory labels for catalog products.
          </p>
        </div>
      </div>

      {/* Overview Stat Cards (No Page Number Card) */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="p-5 !flex-row items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total SKUs
            </p>
            <p className="text-2xl font-extrabold text-foreground font-heading">
              {pagination.total}
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0 border border-primary/20">
            <Tag className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-5 !flex-row items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Barcode Format
            </p>
            <p className="text-2xl font-extrabold text-emerald-400 font-heading">
              EAN-13 / C128
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
            <BarcodeIcon className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-5 !flex-row items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Selected Product
            </p>
            <p className="text-sm font-bold text-sky-400 truncate max-w-[120px]">
              {selectedProduct ? selectedProduct.name : "Custom Demo"}
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/20">
            <Package className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-5 !flex-row items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Thermal Printing
            </p>
            <p className="text-2xl font-extrabold text-amber-400 font-heading">
              Ready
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
            <Printer className="h-5 w-5" />
          </div>
        </Card>
      </div>

      {/* Main Generator & Sticker Preview Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Generator Controls */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-bold text-foreground font-heading">
                SKU Builder & Formatter
              </h2>
            </div>
            {selectedProduct && (
              <Button
                variant="ghost"
                size="xs"
                onClick={() => setSelectedProduct(null)}
                className="text-[11px] text-muted-foreground"
              >
                Clear Selection
              </Button>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                Target Product Name
              </label>
              <input
                type="text"
                value={activeProductName}
                readOnly={Boolean(selectedProduct)}
                onChange={(e) => !selectedProduct && setCategoryCode(e.target.value)}
                placeholder="Product name..."
                className="h-10 w-full px-3.5 rounded-lg bg-secondary border border-border text-xs text-foreground font-semibold outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  Category Prefix
                </label>
                <input
                  type="text"
                  value={categoryCode}
                  onChange={(e) => setCategoryCode(e.target.value.toUpperCase())}
                  maxLength={4}
                  className="h-10 w-full px-3 rounded-lg bg-secondary border border-border text-xs font-mono font-bold text-center text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  Color Code
                </label>
                <input
                  type="text"
                  value={colorCode}
                  onChange={(e) => setColorCode(e.target.value.toUpperCase())}
                  maxLength={4}
                  className="h-10 w-full px-3 rounded-lg bg-secondary border border-border text-xs font-mono font-bold text-center text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  Size
                </label>
                <input
                  type="text"
                  value={size}
                  onChange={(e) => setSize(e.target.value.toUpperCase())}
                  maxLength={4}
                  className="h-10 w-full px-3 rounded-lg bg-secondary border border-border text-xs font-mono font-bold text-center text-foreground outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-between">
              <div>
                <span className="text-[11px] text-muted-foreground font-medium block">
                  Generated SKU Code:
                </span>
                <span className="text-base font-mono font-extrabold text-primary">
                  {activeSKU}
                </span>
              </div>
              <Button variant="outline" size="xs" onClick={handleCopySKU} className="gap-1.5">
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? "Copied" : "Copy SKU"}</span>
              </Button>
            </div>
          </div>
        </Card>

        {/* Physical Sticker Barcode Label Preview */}
        <Card className="p-6 flex flex-col items-center justify-center text-center bg-card/50 border-dashed border-border">
          <style>{`
            @media print {
              body * {
                visibility: hidden !important;
              }
              #printable-barcode-sticker, #printable-barcode-sticker * {
                visibility: visible !important;
              }
              #printable-barcode-sticker {
                position: fixed !important;
                left: 50% !important;
                top: 50% !important;
                transform: translate(-50%, -50%) !important;
                box-shadow: none !important;
                border: 2px solid #000 !important;
                background-color: #ffffff !important;
                color: #000000 !important;
                width: 280px !important;
                padding: 16px !important;
                border-radius: 8px !important;
              }
            }
          `}</style>

          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Physical Label Sticker Preview (Ready for Thermal Print)
          </span>

          {/* Simulated Physical Sticker Label */}
          <div
            id="printable-barcode-sticker"
            ref={labelPrintRef}
            className="w-64 bg-white text-black p-4 rounded-xl shadow-2xl border border-zinc-300 flex flex-col items-center gap-2 select-none"
          >
            <div className="font-extrabold text-sm tracking-tight truncate w-full text-center text-zinc-950 font-heading">
              KESARIYA ETHNIC
            </div>
            <div className="text-xs text-zinc-700 font-semibold truncate w-full text-center">
              {activeProductName}
            </div>

            {/* Visual Barcode Bars Simulation */}
            <div className="my-1.5 flex items-end justify-center gap-0.5 h-12 w-full px-2">
              {[2, 1, 3, 1, 2, 4, 1, 2, 3, 1, 1, 4, 2, 1, 3, 2, 1, 3, 1, 4, 2, 1].map((w, i) => (
                <div
                  key={i}
                  style={{ width: `${w * 2}px`, height: "100%", backgroundColor: "#000" }}
                />
              ))}
            </div>

            <div className="font-mono text-xs font-bold tracking-widest text-zinc-900">
              {activeSKU}
            </div>
            <div className="flex items-center justify-between w-full text-[11px] font-bold text-zinc-800 border-t border-zinc-200 pt-1.5 mt-1">
              <span>MRP: ₹{activePrice}</span>
              <span className="font-mono text-[10px] text-zinc-500">{activeBarcode}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6">
            <Button onClick={handlePrint} className="gap-2">
              <Printer className="h-4 w-4" />
              <span>Print Sticker Label</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => toast.success("New Barcode Hash Generated!")}
            >
              <RefreshCw className="h-4 w-4 mr-1.5" />
              <span>Regenerate Barcode</span>
            </Button>
          </div>
        </Card>
      </div>

      {/* Catalog Products Table with SKU Selection */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground font-heading">
              Select Product SKU from Catalog
            </h3>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search product or SKU..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="h-9 w-full pl-9 pr-4 rounded-lg bg-card border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="py-3.5 pl-6">Product Name</TableHead>
              <TableHead className="py-3.5">Category</TableHead>
              <TableHead className="py-3.5">SKU Code</TableHead>
              <TableHead className="py-3.5">Price</TableHead>
              <TableHead className="py-3.5 text-right pr-6">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  <Loader2 className="h-7 w-7 animate-spin mx-auto mb-2 text-primary" />
                  <p className="text-xs font-semibold">Loading product SKUs from database...</p>
                </TableCell>
              </TableRow>
            ) : productsList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-14 text-muted-foreground">
                  <p className="text-xs font-semibold">No products found in database.</p>
                </TableCell>
              </TableRow>
            ) : (
              productsList.map((product) => {
                const isSelected = selectedProduct?.id === product.id;
                return (
                  <TableRow key={product.id} className={isSelected ? "bg-primary/5" : ""}>
                    <TableCell className="py-3.5 pl-6 font-bold text-xs text-foreground">
                      {product.name}
                    </TableCell>
                    <TableCell className="py-3.5 text-xs text-muted-foreground">
                      {product.category?.name || "General"}
                    </TableCell>
                    <TableCell className="py-3.5">
                      <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                        {product.sku}
                      </span>
                    </TableCell>
                    <TableCell className="py-3.5 font-bold text-xs text-foreground">
                      ₹{product.salePrice || product.basePrice}
                    </TableCell>
                    <TableCell className="py-3.5 text-right pr-6">
                      <Button
                        variant={isSelected ? "secondary" : "outline"}
                        size="xs"
                        onClick={() => selectProductForLabel(product)}
                        className="h-7 px-2.5 text-[11px]"
                      >
                        {isSelected ? "Active Label" : "Load Barcode"}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
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
          entityName="products"
        />
      </Card>
    </div>
  );
}
