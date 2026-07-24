"use client";

import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export default function AuditLogsPage() {
  const logs = [
    { id: "1", user: "Super Admin", action: "UPDATE_ORDER_STATUS", details: "Order #ORD-2025-001 updated to DELIVERED", ip: "192.168.1.1", time: new Date().toISOString() },
    { id: "2", user: "Vikram Mehta", action: "CREATE_PRODUCT", details: "Added product 'Royal Kesariya Silk Kurta'", ip: "192.168.1.15", time: new Date().toISOString() },
    { id: "3", user: "Super Admin", action: "UPDATE_STOCK", details: "Stock increased +10 for SKU KURTA-SILK-M-RED", ip: "192.168.1.1", time: new Date().toISOString() },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Audit Logs</h1>
        <p className="text-xs text-foreground-muted mt-1">
          Full security trail of administrative actions, user logins, and system changes.
        </p>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-semibold text-foreground">{log.user}</TableCell>
                <TableCell><Badge variant="default" className="font-mono">{log.action}</Badge></TableCell>
                <TableCell className="text-foreground-muted text-xs">{log.details}</TableCell>
                <TableCell className="font-mono text-xs text-foreground-muted">{log.ip}</TableCell>
                <TableCell className="text-xs text-foreground-muted">{formatDate(log.time)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
