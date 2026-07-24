"use client";

import { useState } from "react";
import { Barcode as BarcodeIcon, Printer, RefreshCw, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function BarcodePage() {
  const [productName, setProductName] = useState("Royal Kesariya Silk Kurta");
  const [categoryCode, setCategoryCode] = useState("KUR");
  const [size, setSize] = useState("XL");
  const [colorCode, setColorCode] = useState("RED");
  const [copied, setCopied] = useState(false);

  const generatedSKU = `${categoryCode}-${colorCode}-${size}-001`.toUpperCase();
  const generatedBarcode = `890${Math.floor(100000000 + Math.random() * 900000000)}`;

  const handleCopySKU = () => {
    navigator.clipboard.writeText(generatedSKU);
    setCopied(true);
    toast.success("SKU copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    toast.info(`Sending Barcode Label [${generatedSKU}] to Printer...`);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Barcode & SKU Management</h1>
        <p className="text-xs text-foreground-muted mt-1">
          Generate unique SKU codes, format barcode labels, and print inventory labels.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Generator Form */}
        <Card className="flex flex-col gap-4">
          <h2 className="text-base font-semibold text-foreground border-b border-border pb-3">
            SKU Generator Tool
          </h2>

          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-medium text-foreground-muted mb-1 block">
                Product Name
              </label>
              <Input
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Enter product name..."
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-foreground-muted mb-1 block">
                  Category Prefix
                </label>
                <Input
                  value={categoryCode}
                  onChange={(e) => setCategoryCode(e.target.value.toUpperCase())}
                  placeholder="KUR"
                  maxLength={3}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-foreground-muted mb-1 block">
                  Color Code
                </label>
                <Input
                  value={colorCode}
                  onChange={(e) => setColorCode(e.target.value.toUpperCase())}
                  placeholder="RED"
                  maxLength={4}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-foreground-muted mb-1 block">
                  Size
                </label>
                <Input
                  value={size}
                  onChange={(e) => setSize(e.target.value.toUpperCase())}
                  placeholder="XL"
                  maxLength={4}
                />
              </div>
            </div>

            <div className="pt-2 border-t border-border flex items-center justify-between">
              <div>
                <div className="text-xs text-foreground-muted">Generated SKU</div>
                <div className="text-lg font-mono font-bold text-primary mt-0.5">
                  {generatedSKU}
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleCopySKU} className="gap-1.5">
                {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy SKU"}
              </Button>
            </div>
          </div>
        </Card>

        {/* Barcode Label Preview */}
        <Card className="flex flex-col items-center justify-center p-8 text-center bg-surface border-dashed">
          <div className="text-xs font-semibold uppercase tracking-wider text-foreground-muted mb-4">
            Barcode Label Preview (Ready to Print)
          </div>

          {/* Simulated Physical Sticker Label */}
          <div className="w-64 bg-white text-black p-4 rounded-lg shadow-lg border border-zinc-300 flex flex-col items-center gap-2">
            <div className="font-bold text-sm tracking-tight truncate w-full text-center">
              KESARIYA ETHNIC
            </div>
            <div className="text-xs text-zinc-700 font-medium truncate w-full text-center">
              {productName}
            </div>

            {/* Visual Barcode Graphic Simulation */}
            <div className="my-1 flex items-end justify-center gap-0.5 h-12 w-full px-2">
              {[2, 1, 3, 1, 2, 4, 1, 2, 3, 1, 1, 4, 2, 1, 3, 2, 1, 3, 1, 4, 2, 1].map((w, i) => (
                <div
                  key={i}
                  style={{ width: `${w * 2}px`, height: "100%", backgroundColor: "#000" }}
                />
              ))}
            </div>

            <div className="font-mono text-xs font-bold tracking-widest text-zinc-900">
              {generatedSKU}
            </div>
            <div className="text-[10px] text-zinc-500 font-mono">{generatedBarcode}</div>
          </div>

          <div className="flex items-center gap-3 mt-6">
            <Button onClick={handlePrint} className="gap-2">
              <Printer className="h-4 w-4" /> Print Label
            </Button>
            <Button variant="outline" onClick={() => toast.success("New Barcode Generated!")}>
              <RefreshCw className="h-4 w-4 mr-1.5" /> Regenerate
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
