"use client";

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function TaxPage() {
  const taxRules = [
    { category: "Apparel & Kurtas (< ₹1000)", hsnCode: "6204", gstRate: "5%", type: "GST" },
    { category: "Apparel & Suits (> ₹1000)", hsnCode: "6204", gstRate: "12%", type: "GST" },
    { category: "Silk Sarees & Dupattas", hsnCode: "5007", gstRate: "5%", type: "GST" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">GST & Tax Management</h1>
        <p className="text-xs text-foreground-muted mt-1">
          Manage HSN codes, GST tax slabs per category, and tax invoice settings.
        </p>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category / Rule</TableHead>
              <TableHead>HSN Code</TableHead>
              <TableHead>GST Rate</TableHead>
              <TableHead>Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {taxRules.map((rule) => (
              <TableRow key={rule.category}>
                <TableCell className="font-semibold text-foreground">{rule.category}</TableCell>
                <TableCell className="font-mono text-xs text-primary">{rule.hsnCode}</TableCell>
                <TableCell className="font-bold">{rule.gstRate}</TableCell>
                <TableCell><Badge variant="default">{rule.type}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
