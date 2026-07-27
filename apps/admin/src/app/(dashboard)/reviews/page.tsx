"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Star,
  Trash2,
  Search,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MessageSquare,
  Package,
  User,
  Check,
  Ban,
} from "lucide-react";
import api from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
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

interface ReviewItem {
  id: string;
  rating: number;
  title?: string;
  comment?: string;
  isApproved: boolean;
  isVerified: boolean;
  createdAt: string;
  product?: { id: string; name: string; slug: string };
  user?: { id: string; firstName: string; lastName: string; email: string };
}

interface StatsMeta {
  totalReviews: number;
  approvedReviews: number;
  pendingReviews: number;
  averageRating: string;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function ReviewsAdminPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [deleteTarget, setDeleteTarget] = useState<ReviewItem | null>(null);

  // Fetch Admin Reviews: GET /admin/reviews?page=1&limit=10&search=...&status=...
  const { data: responseData, isLoading } = useQuery<{
    stats: StatsMeta;
    data: ReviewItem[];
    meta: PaginationMeta;
  }>({
    queryKey: ["adminProductReviews", page, limit, searchTerm, statusFilter],
    queryFn: async () => {
      const res = await api.get("/admin/reviews", {
        params: {
          page,
          limit,
          search: searchTerm || undefined,
          status: statusFilter !== "ALL" ? statusFilter : undefined,
        },
      });
      return res.data;
    },
  });

  const reviewsList: ReviewItem[] = responseData?.data || [];
  const stats: StatsMeta = responseData?.stats || {
    totalReviews: 0,
    approvedReviews: 0,
    pendingReviews: 0,
    averageRating: "0.0",
  };
  const pagination: PaginationMeta = responseData?.meta || {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  };

  // Toggle Approval Mutation: PATCH /admin/reviews/:id/approve
  const toggleApproveMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/admin/reviews/${id}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminProductReviews"] });
    },
  });

  // Delete Review Mutation: DELETE /admin/reviews/:id
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/reviews/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminProductReviews"] });
      setDeleteTarget(null);
    },
  });

  const startItemIndex = pagination.total === 0 ? 0 : (page - 1) * limit + 1;
  const endItemIndex = Math.min(page * limit, pagination.total);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground font-heading">
            Customer Product Reviews & Ratings
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Moderate, approve, and audit customer product reviews submitted across storefront.
          </p>
        </div>
      </div>

      {/* Overview Stat Cards (No Page Number Card) */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="p-5 !flex-row items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Reviews
            </p>
            <p className="text-2xl font-extrabold text-foreground font-heading">
              {stats.totalReviews}
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0 border border-primary/20">
            <MessageSquare className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-5 !flex-row items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Approved & Live
            </p>
            <p className="text-2xl font-extrabold text-emerald-400 font-heading">
              {stats.approvedReviews}
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-5 !flex-row items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Pending Approval
            </p>
            <p className="text-2xl font-extrabold text-amber-400 font-heading">
              {stats.pendingReviews}
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
            <XCircle className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-5 !flex-row items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Average Store Rating
            </p>
            <p className="text-2xl font-extrabold text-amber-400 font-heading flex items-center gap-1">
              <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
              {stats.averageRating}
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
            <Star className="h-5 w-5" />
          </div>
        </Card>
      </div>

      {/* Filter / Search Controls */}
      <Card className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by product title, customer name, or comment content..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="h-9 w-full rounded-md border border-border bg-surface pl-9 pr-4 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="h-9 rounded-md border border-border bg-surface px-3 text-xs text-foreground outline-none cursor-pointer focus:border-primary"
          >
            <option value="ALL">All Reviews</option>
            <option value="APPROVED">Approved Only</option>
            <option value="PENDING">Pending Approval</option>
          </select>
        </div>
      </Card>

      {/* Table Card */}
      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="py-3.5 pl-6">Product Title</TableHead>
              <TableHead className="py-3.5">Customer</TableHead>
              <TableHead className="py-3.5">Rating</TableHead>
              <TableHead className="py-3.5">Review Comment</TableHead>
              <TableHead className="py-3.5">Status</TableHead>
              <TableHead className="py-3.5 text-right pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-16 text-muted-foreground">
                  <Loader2 className="h-7 w-7 animate-spin mx-auto mb-2 text-primary" />
                  <p className="text-xs font-semibold">Loading product reviews...</p>
                </TableCell>
              </TableRow>
            ) : reviewsList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-16 text-muted-foreground">
                  <MessageSquare className="h-8 w-8 opacity-40 mx-auto mb-2" />
                  <h3 className="text-sm font-bold text-foreground">No Product Reviews Found</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                    {searchTerm || statusFilter !== "ALL"
                      ? "No reviews matched your search or status filter."
                      : "No customer product reviews submitted in database yet."}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              reviewsList.map((review) => (
                <TableRow key={review.id}>
                  {/* Product */}
                  <TableCell className="py-4 pl-6">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-primary shrink-0" />
                      <span className="font-bold text-xs text-foreground line-clamp-1">
                        {review.product?.name || "Product Item"}
                      </span>
                    </div>
                  </TableCell>

                  {/* Customer */}
                  <TableCell className="py-4">
                    <div className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <div className="flex flex-col">
                        <span className="font-semibold text-xs text-foreground">
                          {review.user ? `${review.user.firstName} ${review.user.lastName || ""}`.trim() : "Guest"}
                        </span>
                        <span className="text-[10px] text-muted-foreground">{review.user?.email}</span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Rating Stars */}
                  <TableCell className="py-4">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3.5 w-3.5 ${
                            star <= review.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      ))}
                      <span className="text-xs font-bold text-foreground ml-1.5 font-mono">
                        {review.rating}.0
                      </span>
                    </div>
                  </TableCell>

                  {/* Comment */}
                  <TableCell className="py-4 max-w-xs">
                    <div className="flex flex-col gap-0.5">
                      {review.title && (
                        <span className="font-bold text-xs text-foreground line-clamp-1">
                          {review.title}
                        </span>
                      )}
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {review.comment || "No text comment written."}
                      </p>
                      <span className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                  </TableCell>

                  {/* Approval Status */}
                  <TableCell className="py-4">
                    <Badge variant={review.isApproved ? "success" : "warning"}>
                      {review.isApproved ? "APPROVED" : "PENDING"}
                    </Badge>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="py-4 text-right pr-6">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant={review.isApproved ? "outline" : "secondary"}
                        size="xs"
                        onClick={() => toggleApproveMutation.mutate(review.id)}
                        disabled={toggleApproveMutation.isPending}
                        className="h-7 px-2.5 gap-1 text-[11px]"
                        title={review.isApproved ? "Unapprove Review" : "Approve Review"}
                      >
                        {review.isApproved ? (
                          <>
                            <Ban className="h-3.5 w-3.5 text-amber-400" />
                            <span>Unapprove</span>
                          </>
                        ) : (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                            <span>Approve</span>
                          </>
                        )}
                      </Button>

                      <Button
                        variant="destructive"
                        size="xs"
                        onClick={() => setDeleteTarget(review)}
                        className="h-7 px-2"
                        title="Delete Review"
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

        {/* Bottom Pagination Bar */}
        <DataTablePagination
          page={page}
          limit={limit}
          total={pagination.total}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
          onLimitChange={setLimit}
          entityName="reviews"
        />
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
              <DialogTitle>Confirm Review Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete review for product "{deleteTarget?.product?.name}"?
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-3 text-xs text-muted-foreground">
          This action will permanently delete customer review for <span className="text-foreground font-bold font-heading">"{deleteTarget?.product?.name}"</span> from Neon PostgreSQL database.
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
            {deleteMutation.isPending ? "Deleting..." : "Delete Review Record"}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
