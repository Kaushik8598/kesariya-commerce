"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Ticket,
  CheckCircle2,
  XCircle,
  Tag,
  Filter,
  Loader2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Percent,
  IndianRupee,
  Calendar,
  Gift,
} from "lucide-react";
import api from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
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

interface Coupon {
  id: string;
  code: string;
  description?: string | null;
  type: "PERCENTAGE" | "FIXED_AMOUNT";
  value: number;
  minOrderAmount?: number | null;
  maxDiscount?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  usageLimit?: number | null;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function CouponsPage() {
  const queryClient = useQueryClient();

  // Search, Filter & Pagination State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Form Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    type: "PERCENTAGE" as "PERCENTAGE" | "FIXED_AMOUNT",
    value: "",
    minOrderAmount: "",
    maxDiscount: "",
    startDate: "",
    endDate: "",
    usageLimit: "",
    isActive: true,
  });

  // Delete Target Modal State
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null);

  // Fetch Coupons: GET /admin/coupons?page=1&limit=10&search=...&status=...
  const { data: responseData, isLoading } = useQuery<{
    data: Coupon[];
    stats: { activeCount: number; totalRedemptions: number };
    pagination: PaginationMeta;
  }>({
    queryKey: ["adminCoupons", page, limit, searchTerm, statusFilter],
    queryFn: async () => {
      const res = await api.get("/admin/coupons", {
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
            stats: { activeCount: 0, totalRedemptions: 0 },
            pagination: {
              total: Array.isArray(res.data) ? res.data.length : 0,
              page: 1,
              limit: 10,
              totalPages: 1,
            },
          };
    },
  });

  const couponsList: Coupon[] = responseData?.data || [];
  const pagination: PaginationMeta = responseData?.pagination || {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  };
  const activeCount = responseData?.stats?.activeCount || 0;
  const totalRedemptions = responseData?.stats?.totalRedemptions || 0;

  // Open Form for Create / Edit
  const openCreateModal = () => {
    setEditingCoupon(null);
    setFormData({
      code: "",
      description: "",
      type: "PERCENTAGE",
      value: "15",
      minOrderAmount: "999",
      maxDiscount: "500",
      startDate: "",
      endDate: "",
      usageLimit: "100",
      isActive: true,
    });
    setIsFormOpen(true);
  };

  const openEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description || "",
      type: coupon.type,
      value: String(coupon.value),
      minOrderAmount: coupon.minOrderAmount ? String(coupon.minOrderAmount) : "",
      maxDiscount: coupon.maxDiscount ? String(coupon.maxDiscount) : "",
      startDate: coupon.startDate ? new Date(coupon.startDate).toISOString().slice(0, 16) : "",
      endDate: coupon.endDate ? new Date(coupon.endDate).toISOString().slice(0, 16) : "",
      usageLimit: coupon.usageLimit ? String(coupon.usageLimit) : "",
      isActive: coupon.isActive,
    });
    setIsFormOpen(true);
  };

  const closeFormModal = () => {
    setIsFormOpen(false);
    setEditingCoupon(null);
  };

  // Create Coupon Mutation: POST /admin/coupons
  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post("/admin/coupons", payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success("New discount coupon created!");
      queryClient.invalidateQueries({ queryKey: ["adminCoupons"] });
      closeFormModal();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to create coupon");
    },
  });

  // Edit Coupon Mutation: PATCH /admin/coupons/:id
  const editMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
      const res = await api.patch(`/admin/coupons/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Coupon code updated!");
      queryClient.invalidateQueries({ queryKey: ["adminCoupons"] });
      closeFormModal();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to update coupon");
    },
  });

  // Delete Coupon Mutation: DELETE /admin/coupons/:id
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/admin/coupons/${id}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Coupon code deleted!");
      queryClient.invalidateQueries({ queryKey: ["adminCoupons"] });
      setDeleteTarget(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to delete coupon");
    },
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      toast.error("Coupon code is required");
      return;
    }
    if (!formData.value || Number(formData.value) <= 0) {
      toast.error("Valid discount value is required");
      return;
    }

    const payload = {
      code: formData.code.trim().toUpperCase(),
      description: formData.description.trim() || undefined,
      type: formData.type,
      value: Number(formData.value),
      minOrderAmount: formData.minOrderAmount ? Number(formData.minOrderAmount) : undefined,
      maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : undefined,
      startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
      endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
      usageLimit: formData.usageLimit ? Number(formData.usageLimit) : undefined,
      isActive: formData.isActive,
    };

    if (editingCoupon) {
      editMutation.mutate({ id: editingCoupon.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const startItemIndex = (pagination.page - 1) * pagination.limit + 1;
  const endItemIndex = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground font-heading">
            Coupons & Discounts
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Create promotional discount codes, minimum order rules, and usage caps.
          </p>
        </div>
        <Button onClick={openCreateModal} className="gap-2 self-start sm:self-auto">
          <Plus className="h-4 w-4" />
          <span>Add New Coupon</span>
        </Button>
      </div>

      {/* Overview Stat Cards (No Page Number Card) */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="p-5 !flex-row items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Coupons
            </p>
            <p className="text-2xl font-extrabold text-foreground font-heading">
              {pagination.total}
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0 border border-primary/20">
            <Ticket className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-5 !flex-row items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Active Promo Codes
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
              Disabled / Expired
            </p>
            <p className="text-2xl font-extrabold text-amber-400 font-heading">
              {couponsList.length - activeCount}
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
            <XCircle className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-5 !flex-row items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Redemptions
            </p>
            <p className="text-2xl font-extrabold text-sky-400 font-heading">
              {totalRedemptions}
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/20">
            <Gift className="h-5 w-5" />
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
              placeholder="Search coupon code or description..."
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
              <option value="ALL">All Coupons</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Disabled Only</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="py-3.5 pl-6">Coupon Code</TableHead>
              <TableHead className="py-3.5">Discount Offer</TableHead>
              <TableHead className="py-3.5">Min Order & Cap</TableHead>
              <TableHead className="py-3.5">Usage Redemptions</TableHead>
              <TableHead className="py-3.5">Status</TableHead>
              <TableHead className="py-3.5 text-right pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-14 text-muted-foreground">
                  <Loader2 className="h-7 w-7 animate-spin mx-auto mb-2 text-primary" />
                  <p className="text-xs font-semibold">Loading discount codes from database...</p>
                </TableCell>
              </TableRow>
            ) : couponsList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-16 text-muted-foreground">
                  <div className="h-14 w-14 rounded-2xl bg-secondary border border-border flex items-center justify-center mx-auto mb-3">
                    <Ticket className="h-7 w-7 opacity-50 text-muted-foreground" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">No Coupon Codes Found</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                    {searchTerm || statusFilter !== "ALL"
                      ? "No coupons matched your search or status filter."
                      : "Create your first promotional discount coupon to boost sales!"}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              couponsList.map((coupon) => (
                <TableRow key={coupon.id}>
                  {/* Code */}
                  <TableCell className="py-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-primary/15 text-primary flex items-center justify-center font-bold text-xs shrink-0 border border-primary/20">
                        <Tag className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-mono text-xs font-extrabold tracking-wider text-primary">
                          {coupon.code}
                        </span>
                        <span className="text-[11px] text-muted-foreground line-clamp-1 max-w-[200px]">
                          {coupon.description || "No description"}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Discount Offer */}
                  <TableCell className="py-4">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 font-heading">
                      {coupon.type === "PERCENTAGE" ? (
                        <>
                          <Percent className="h-3.5 w-3.5 shrink-0" />
                          <span>{coupon.value}% OFF</span>
                        </>
                      ) : (
                        <>
                          <IndianRupee className="h-3.5 w-3.5 shrink-0" />
                          <span>{formatCurrency(coupon.value)} OFF</span>
                        </>
                      )}
                    </div>
                  </TableCell>

                  {/* Min Order & Cap */}
                  <TableCell className="py-4">
                    <div className="flex flex-col gap-0.5 text-xs">
                      <span className="font-semibold text-foreground">
                        Min Spend: {coupon.minOrderAmount ? formatCurrency(coupon.minOrderAmount) : "None"}
                      </span>
                      {coupon.maxDiscount && (
                        <span className="text-[11px] text-muted-foreground">
                          Max Cap: {formatCurrency(coupon.maxDiscount)}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* Usage */}
                  <TableCell className="py-4">
                    <div className="flex flex-col gap-0.5 text-xs">
                      <span className="font-bold text-foreground">
                        {coupon.usedCount} {coupon.usageLimit ? `/ ${coupon.usageLimit}` : "uses"}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {coupon.usageLimit ? `${Math.round((coupon.usedCount / coupon.usageLimit) * 100)}% claimed` : "Unlimited limit"}
                      </span>
                    </div>
                  </TableCell>

                  {/* Status */}
                  <TableCell className="py-4">
                    <Badge variant={coupon.isActive ? "success" : "secondary"}>
                      {coupon.isActive ? "ACTIVE" : "DISABLED"}
                    </Badge>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="py-4 text-right pr-6">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="secondary"
                        size="xs"
                        onClick={() => openEditModal(coupon)}
                        className="h-7 px-2"
                        title="Edit Coupon"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>

                      <Button
                        variant="destructive"
                        size="xs"
                        onClick={() => setDeleteTarget(coupon)}
                        className="h-7 px-2"
                        title="Delete Coupon"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
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
                <span className="font-bold text-foreground">{pagination.total}</span> coupons
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

      {/* Add / Edit Coupon Modal */}
      <Dialog open={isFormOpen} onOpenChange={(open) => !open && closeFormModal()}>
        <DialogHeader>
          <DialogTitle>{editingCoupon ? "Edit Coupon Code" : "Create New Coupon"}</DialogTitle>
          <DialogDescription>
            {editingCoupon
              ? `Update promotional rules for coupon code ${editingCoupon.code}.`
              : "Configure discount percentage or flat amount deduction rules."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleFormSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">
                Coupon Code *
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="FESTIVE20"
                className="h-10 w-full px-3.5 rounded-lg bg-secondary border border-border text-xs font-mono font-bold text-foreground uppercase placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">
                Discount Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value as "PERCENTAGE" | "FIXED_AMOUNT" })
                }
                className="h-10 w-full px-3.5 rounded-lg bg-secondary border border-border text-xs text-foreground outline-none focus:border-primary"
              >
                <option value="PERCENTAGE">PERCENTAGE (% OFF)</option>
                <option value="FIXED_AMOUNT">FLAT AMOUNT (₹ OFF)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">
                Discount Value *
              </label>
              <input
                type="number"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                placeholder={formData.type === "PERCENTAGE" ? "20" : "500"}
                className="h-10 w-full px-3.5 rounded-lg bg-secondary border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">
                Min Spend (₹)
              </label>
              <input
                type="number"
                value={formData.minOrderAmount}
                onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                placeholder="999"
                className="h-10 w-full px-3.5 rounded-lg bg-secondary border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">
                Max Cap (₹)
              </label>
              <input
                type="number"
                value={formData.maxDiscount}
                onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                placeholder="500"
                className="h-10 w-full px-3.5 rounded-lg bg-secondary border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5 block">
              Promo Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Get 20% off on all festive ethnic wear collections"
              className="h-10 w-full px-3.5 rounded-lg bg-secondary border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">
                Usage Redemptions Limit
              </label>
              <input
                type="number"
                value={formData.usageLimit}
                onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                placeholder="100"
                className="h-10 w-full px-3.5 rounded-lg bg-secondary border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">
                Coupon Status *
              </label>
              <select
                value={formData.isActive ? "true" : "false"}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.value === "true" })}
                className="h-10 w-full px-3.5 rounded-lg bg-secondary border border-border text-xs text-foreground outline-none focus:border-primary"
              >
                <option value="true font-bold">ACTIVE (Live for customers)</option>
                <option value="false">DISABLED (Inactive)</option>
              </select>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={closeFormModal}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || editMutation.isPending}
            >
              {createMutation.isPending || editMutation.isPending
                ? "Saving..."
                : editingCoupon
                ? "Save Changes"
                : "Create Coupon"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

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
              <DialogTitle>Confirm Coupon Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete coupon code "{deleteTarget?.code}"?
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-3 text-xs text-muted-foreground">
          This action will permanently delete coupon code <span className="font-mono text-foreground font-bold">{deleteTarget?.code}</span> from Neon PostgreSQL database. This action cannot be undone.
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
            {deleteMutation.isPending ? "Deleting..." : "Delete Coupon"}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
