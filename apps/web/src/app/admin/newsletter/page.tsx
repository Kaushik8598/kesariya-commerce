"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Mail,
  Trash2,
  Search,
  Loader2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Calendar,
  Send,
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
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface Subscriber {
  id: string;
  email: string;
  isActive: boolean;
  createdAt: string;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function NewsletterPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Subscriber | null>(null);

  // Fetch Subscribers: GET /admin/newsletter?page=1&limit=10&search=...
  const { data: responseData, isLoading } = useQuery<{
    data: Subscriber[];
    meta: PaginationMeta;
  }>({
    queryKey: ["adminNewsletterSubscribers", page, limit, searchTerm],
    queryFn: async () => {
      const res = await api.get("/admin/newsletter", {
        params: {
          page,
          limit,
          search: searchTerm || undefined,
        },
      });
      return res.data;
    },
  });

  const subscribersList: Subscriber[] = responseData?.data || [];
  const pagination: PaginationMeta = responseData?.meta || {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  };

  // Delete Subscriber Mutation: DELETE /admin/newsletter/:id
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/newsletter/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminNewsletterSubscribers"] });
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
            Footer Newsletter Subscribers
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Real customer email subscriptions collected directly from storefront footer form.
          </p>
        </div>
      </div>

      {/* Overview Stat Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:grid-cols-3">
        <Card className="p-5 !flex-row items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Subscriptions
            </p>
            <p className="text-2xl font-extrabold text-foreground font-heading">
              {pagination.total}
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0 border border-primary/20">
            <Send className="h-5 w-5" />
          </div>
        </Card>
      </div>

      {/* Filter / Search Controls */}
      <Card className="p-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by email address..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="h-9 w-full rounded-md border border-border bg-surface pl-9 pr-4 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
          />
        </div>
      </Card>

      {/* Table Card */}
      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="py-3.5 pl-6">Subscribed Email Address</TableHead>
              <TableHead className="py-3.5">Status</TableHead>
              <TableHead className="py-3.5">Subscribed Date</TableHead>
              <TableHead className="py-3.5 text-right pr-6">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-16 text-muted-foreground">
                  <Loader2 className="h-7 w-7 animate-spin mx-auto mb-2 text-primary" />
                  <p className="text-xs font-semibold">Loading newsletter subscribers...</p>
                </TableCell>
              </TableRow>
            ) : subscribersList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-16 text-muted-foreground">
                  <Mail className="h-8 w-8 opacity-40 mx-auto mb-2" />
                  <h3 className="text-sm font-bold text-foreground">No Newsletter Subscribers Found</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                    {searchTerm
                      ? "No subscriptions matched your search query."
                      : "No customer email subscriptions stored in database yet."}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              subscribersList.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="py-4 pl-6 font-bold text-xs text-foreground font-mono">
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                      {item.email}
                    </div>
                  </TableCell>

                  <TableCell className="py-4">
                    <Badge variant={item.isActive ? "success" : "outline"}>
                      {item.isActive ? "ACTIVE SUBSCRIBER" : "INACTIVE"}
                    </Badge>
                  </TableCell>

                  <TableCell className="py-4 text-xs text-muted-foreground font-mono">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      {formatDate(item.createdAt)}
                    </div>
                  </TableCell>

                  <TableCell className="py-4 text-right pr-6">
                    <Button
                      variant="destructive"
                      size="xs"
                      onClick={() => setDeleteTarget(item)}
                      className="h-7 px-2"
                      title="Remove Subscriber"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Bottom Pagination Bar */}
        {pagination.total > 0 && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 border-t border-border bg-card">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>
                Showing <strong className="text-foreground">{startItemIndex}</strong> to{" "}
                <strong className="text-foreground">{endItemIndex}</strong> of{" "}
                <strong className="text-foreground">{pagination.total}</strong> subscribers
              </span>
              <div className="flex items-center gap-1.5 pl-3 border-l border-border">
                <span className="text-[11px]">Rows per page:</span>
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                  className="h-7 rounded border border-border bg-surface px-1.5 text-xs text-foreground outline-none cursor-pointer focus:border-primary"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-1 self-end sm:self-auto">
              <Button
                variant="outline"
                size="xs"
                onClick={() => setPage(1)}
                disabled={page === 1}
              >
                <ChevronsLeft className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="xs"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <span className="px-2 text-xs font-bold text-foreground font-mono">
                {page} / {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="xs"
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page >= pagination.totalPages}
              >
                <ChevronRight className="h-3.5 w-3.5" />
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

      {/* Delete Modal */}
      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle>Delete Subscriber Record</DialogTitle>
                <DialogDescription>
                  Are you sure you want to remove email subscription for "{deleteTarget?.email}"?
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="py-3 text-xs text-muted-foreground">
            This action will permanently delete subscriber record <span className="text-foreground font-bold font-heading">"{deleteTarget?.email}"</span> from Neon PostgreSQL database.
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
              {deleteMutation.isPending ? "Removing..." : "Delete Subscriber"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
