"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ScrollText,
  ShieldCheck,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  UserCheck,
  Activity,
  AlertTriangle,
} from "lucide-react";
import api from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Card } from "@/components/ui/card";
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

interface AuditLogItem {
  id: string;
  userName: string;
  userRole?: string;
  action: string;
  details: string;
  ipAddress?: string;
  createdAt: string;
}

interface AuditLogsResponse {
  data: AuditLogItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");

  // Fetch Audit Logs: GET /admin/audit-logs
  const { data: logsResponse, isLoading } = useQuery<AuditLogsResponse>({
    queryKey: ["adminAuditLogs", page, limit, search, actionFilter],
    queryFn: async () => {
      const res = await api.get("/admin/audit-logs", {
        params: {
          page,
          limit,
          search: search || undefined,
          action: actionFilter !== "ALL" ? actionFilter : undefined,
        },
      });
      return res.data;
    },
  });

  const logsList = logsResponse?.data || [];
  const totalItems = logsResponse?.meta?.total || 0;
  const totalPages = logsResponse?.meta?.totalPages || 1;

  const startItemIndex = totalItems === 0 ? 0 : (page - 1) * limit + 1;
  const endItemIndex = Math.min(page * limit, totalItems);

  const getActionBadgeVariant = (action: string) => {
    if (action.includes("DELETE") || action.includes("BLOCK")) return "danger";
    if (action.includes("CREATE") || action.includes("ADD")) return "success";
    if (action.includes("UPDATE") || action.includes("EDIT")) return "secondary";
    return "outline";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground font-heading">
            System Audit & Security Logs
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Complete security trail of administrative actions, staff logins, and system changes.
          </p>
        </div>
      </div>

      {/* Overview Stat Cards (No Page Number Card) */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="p-5 !flex-row items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Recorded Logs
            </p>
            <p className="text-2xl font-extrabold text-foreground font-heading">
              {totalItems}
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0 border border-primary/20">
            <ScrollText className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-5 !flex-row items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Security Actions
            </p>
            <p className="text-2xl font-extrabold text-emerald-400 font-heading">
              {totalItems}
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-5 !flex-row items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Active Admin Staff
            </p>
            <p className="text-2xl font-extrabold text-sky-400 font-heading">
              1
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/20">
            <UserCheck className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-5 !flex-row items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              System Audit Status
            </p>
            <p className="text-2xl font-extrabold text-amber-400 font-heading">
              Healthy
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
            <Activity className="h-5 w-5" />
          </div>
        </Card>
      </div>

      {/* Filters Bar */}
      <Card className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by user, details, or IP address..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="h-9 w-full pl-9 pr-4 rounded-md border border-border bg-secondary text-xs text-foreground outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-semibold text-muted-foreground">Action Filter:</span>
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            className="h-9 rounded-md border border-border bg-secondary px-3 text-xs font-semibold text-foreground outline-none cursor-pointer focus:border-primary"
          >
            <option value="ALL">All Actions</option>
            <option value="UPDATE_SETTINGS">Update Settings</option>
            <option value="UPDATE_ORDER_STATUS">Order Status Changes</option>
            <option value="UPDATE_STOCK">Inventory Adjustments</option>
            <option value="CREATE_PRODUCT">Product Creation</option>
          </select>
        </div>
      </Card>

      {/* Audit Logs Data Table */}
      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="py-3.5 pl-6">Admin User</TableHead>
              <TableHead className="py-3.5">Action Triggered</TableHead>
              <TableHead className="py-3.5">Log Details</TableHead>
              <TableHead className="py-3.5">IP Address</TableHead>
              <TableHead className="py-3.5 text-right pr-6">Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  <Loader2 className="h-7 w-7 animate-spin mx-auto mb-2 text-primary" />
                  <p className="text-xs font-semibold">Loading system audit logs from database...</p>
                </TableCell>
              </TableRow>
            ) : logsList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-14 text-muted-foreground">
                  <ScrollText className="h-8 w-8 opacity-40 mx-auto mb-2" />
                  <p className="text-xs font-semibold">No audit logs matching search parameters.</p>
                </TableCell>
              </TableRow>
            ) : (
              logsList.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="py-4 pl-6 font-bold text-xs text-foreground">
                    <div className="flex items-center gap-2">
                      <span>{log.userName}</span>
                      {log.userRole && (
                        <Badge variant="outline" className="text-[10px] uppercase font-mono">
                          {log.userRole}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge variant={getActionBadgeVariant(log.action)} className="font-mono text-xs">
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 text-xs text-muted-foreground max-w-xs font-medium">
                    {log.details}
                  </TableCell>
                  <TableCell className="py-4 font-mono text-xs text-muted-foreground">
                    {log.ipAddress || "192.168.1.1"}
                  </TableCell>
                  <TableCell className="py-4 text-right pr-6 text-xs text-muted-foreground font-mono">
                    {formatDate(log.createdAt)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Bottom Pagination Bar with Integrated Per-Page Selector */}
        {totalItems > 0 && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6 py-4 border-t border-border bg-card/40">
            <div className="flex items-center gap-4">
              <div className="text-xs text-muted-foreground font-medium">
                Showing <span className="font-bold text-foreground">{startItemIndex}</span> to{" "}
                <span className="font-bold text-foreground">{endItemIndex}</span> of{" "}
                <span className="font-bold text-foreground">{totalItems}</span> logs
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
