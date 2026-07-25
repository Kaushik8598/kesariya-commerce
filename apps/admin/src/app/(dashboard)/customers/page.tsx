"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Trash2,
  Users,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Filter,
  Loader2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  UserCheck,
  UserX,
  Phone,
  Mail,
  ShoppingBag,
} from "lucide-react";
import api from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface UserCustomer {
  id: string;
  firstName: string;
  lastName?: string | null;
  email?: string | null;
  countryCode: string;
  mobile: string;
  avatar?: string | null;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  role?: { name: string; slug: string } | null;
  _count?: { orders: number; addresses: number };
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function CustomersPage() {
  const queryClient = useQueryClient();

  // Search, Filter & Pagination State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Delete Target Modal State
  const [deleteTarget, setDeleteTarget] = useState<UserCustomer | null>(null);

  // Fetch Customers: GET /admin/users?page=1&limit=10&search=...&status=...
  const { data: responseData, isLoading } = useQuery<{
    data: UserCustomer[];
    stats: { verifiedCount: number };
    pagination: PaginationMeta;
  }>({
    queryKey: ["adminCustomers", page, limit, searchTerm, statusFilter],
    queryFn: async () => {
      const res = await api.get("/admin/users", {
        params: {
          page,
          limit,
          search: searchTerm || undefined,
          status: statusFilter !== "ALL" ? statusFilter : undefined,
        },
      });
      return res.data?.data && res.data?.pagination
        ? res.data
        : {
            data: Array.isArray(res.data) ? res.data : [],
            stats: { verifiedCount: 0 },
            pagination: {
              total: Array.isArray(res.data) ? res.data.length : 0,
              page: 1,
              limit: 10,
              totalPages: 1,
            },
          };
    },
  });

  const customersList: UserCustomer[] = responseData?.data || [];
  const pagination: PaginationMeta = responseData?.pagination || {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  };
  const verifiedCount = responseData?.stats?.verifiedCount || 0;

  // Toggle Account Active Status Mutation: PATCH /admin/users/:id/status
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await api.patch(`/admin/users/${id}/status`, { isActive });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Customer account status updated!");
      queryClient.invalidateQueries({ queryKey: ["adminCustomers"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to update account status");
    },
  });

  // Delete Customer Record Mutation: DELETE /admin/users/:id
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/admin/users/${id}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Customer record deleted!");
      queryClient.invalidateQueries({ queryKey: ["adminCustomers"] });
      setDeleteTarget(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to delete customer");
    },
  });

  const activeCount = customersList.filter((c) => c.isActive).length;
  const startItemIndex = (pagination.page - 1) * pagination.limit + 1;
  const endItemIndex = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground font-heading">
            Customers Directory
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage registered store buyers, mobile verification statuses, and account access permissions.
          </p>
        </div>
      </div>

      {/* Overview Stat Cards (No Page Number Card) */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="p-5 !flex-row items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Customers
            </p>
            <p className="text-2xl font-extrabold text-foreground font-heading">
              {pagination.total}
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0 border border-primary/20">
            <Users className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-5 !flex-row items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Active Accounts
            </p>
            <p className="text-2xl font-extrabold text-emerald-400 font-heading">
              {activeCount}
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-5 !flex-row items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Disabled / Blocked
            </p>
            <p className="text-2xl font-extrabold text-amber-400 font-heading">
              {customersList.length - activeCount}
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
            <XCircle className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-5 !flex-row items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Verified Profiles
            </p>
            <p className="text-2xl font-extrabold text-sky-400 font-heading">
              {verifiedCount}
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/20">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search customer by name, email or mobile..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="h-10 w-full pl-10 pr-4 rounded-lg bg-card border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="h-10 rounded-lg border border-border bg-card px-3 text-xs font-semibold text-foreground outline-none cursor-pointer focus:border-primary"
            >
              <option value="ALL">All Customers</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Disabled / Blocked</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="py-3.5 pl-6">Customer Name</TableHead>
              <TableHead className="py-3.5">Contact Details</TableHead>
              <TableHead className="py-3.5">Total Orders</TableHead>
              <TableHead className="py-3.5">Verification</TableHead>
              <TableHead className="py-3.5">Account Status</TableHead>
              <TableHead className="py-3.5 text-right pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-14 text-muted-foreground">
                  <Loader2 className="h-7 w-7 animate-spin mx-auto mb-2 text-primary" />
                  <p className="text-xs font-semibold">Loading registered customers from database...</p>
                </TableCell>
              </TableRow>
            ) : customersList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-16 text-muted-foreground">
                  <div className="h-14 w-14 rounded-2xl bg-secondary border border-border flex items-center justify-center mx-auto mb-3">
                    <Users className="h-7 w-7 opacity-50 text-muted-foreground" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">No Customers Found</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                    {searchTerm || statusFilter !== "ALL"
                      ? "No customer accounts matched your search or status filter."
                      : "No customer accounts registered yet."}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              customersList.map((customer) => {
                const fullName = `${customer.firstName} ${customer.lastName || ""}`.trim();
                return (
                  <TableRow key={customer.id}>
                    {/* Name + Joined Date */}
                    <TableCell className="py-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/15 border border-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                          {customer.firstName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-xs text-foreground">
                            {fullName}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            Joined {formatDate(customer.createdAt)}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Contact */}
                    <TableCell className="py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-foreground flex items-center gap-1.5 font-medium">
                          <Mail className="h-3 w-3 text-muted-foreground shrink-0" />
                          {customer.email || "No Email"}
                        </span>
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1.5 font-mono">
                          <Phone className="h-3 w-3 text-muted-foreground shrink-0" />
                          {customer.countryCode} {customer.mobile}
                        </span>
                      </div>
                    </TableCell>

                    {/* Orders count */}
                    <TableCell className="py-4">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                        <ShoppingBag className="h-3.5 w-3.5 text-primary" />
                        {customer._count?.orders || 0} orders placed
                      </div>
                    </TableCell>

                    {/* Verification */}
                    <TableCell className="py-4">
                      <Badge variant={customer.isVerified ? "success" : "secondary"}>
                        {customer.isVerified ? "VERIFIED" : "UNVERIFIED"}
                      </Badge>
                    </TableCell>

                    {/* Account Status Badge */}
                    <TableCell className="py-4">
                      <Badge variant={customer.isActive ? "success" : "danger"}>
                        {customer.isActive ? "ACTIVE" : "BLOCKED"}
                      </Badge>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="py-4 text-right pr-6">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant={customer.isActive ? "outline" : "secondary"}
                          size="xs"
                          onClick={() =>
                            toggleStatusMutation.mutate({
                              id: customer.id,
                              isActive: !customer.isActive,
                            })
                          }
                          className="h-7 px-2.5 gap-1 text-[11px]"
                          title={customer.isActive ? "Block Account" : "Activate Account"}
                        >
                          {customer.isActive ? (
                            <>
                              <UserX className="h-3.5 w-3.5 text-rose-400" />
                              <span>Block</span>
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
                              <span>Activate</span>
                            </>
                          )}
                        </Button>

                        <Button
                          variant="destructive"
                          size="xs"
                          onClick={() => setDeleteTarget(customer)}
                          className="h-7 px-2"
                          title="Delete Customer Profile"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Bottom Pagination Bar with Integrated Per-Page Selector */}
        {pagination.total > 0 && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6 py-4 border-t border-border bg-card/40">
            <div className="flex items-center gap-4">
              <div className="text-xs text-muted-foreground font-medium">
                Showing <span className="font-bold text-foreground">{startItemIndex}</span> to{" "}
                <span className="font-bold text-foreground">{endItemIndex}</span> of{" "}
                <span className="font-bold text-foreground">{pagination.total}</span> customers
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
                  <option value={50}>50</option>
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
                {page} / {pagination.totalPages}
              </span>

              <Button
                variant="outline"
                size="xs"
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page >= pagination.totalPages}
              >
                Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
              <Button
                variant="outline"
                size="xs"
                onClick={() => setPage(pagination.totalPages)}
                disabled={page >= pagination.totalPages}
              >
                <ChevronsRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Confirm Customer Profile Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete customer "{deleteTarget ? `${deleteTarget.firstName} ${deleteTarget.lastName || ""}`.trim() : ""}"?
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-3 text-xs text-muted-foreground">
          This action will permanently delete profile <span className="text-foreground font-bold font-heading">"{deleteTarget ? `${deleteTarget.firstName} ${deleteTarget.lastName || ""}`.trim() : ""}"</span> ({deleteTarget?.email || deleteTarget?.mobile}) from Neon PostgreSQL database.
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setDeleteTarget(null)}
            disabled={deleteMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete Customer"}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
