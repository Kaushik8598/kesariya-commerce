"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  FileText,
  CheckCircle2,
  Globe,
  Loader2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ExternalLink,
  Eye,
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

interface CmsPageRecord {
  id: string;
  title: string;
  slug: string;
  content: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function CMSPage() {
  const queryClient = useQueryClient();

  // Search & Pagination State
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Form Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<CmsPageRecord | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    isPublished: true,
  });

  // Delete Target Modal State
  const [deleteTarget, setDeleteTarget] = useState<CmsPageRecord | null>(null);

  // Fetch CMS Pages: GET /admin/cms?page=1&limit=10&search=...
  const { data: responseData, isLoading } = useQuery<{
    data: CmsPageRecord[];
    stats: { publishedCount: number };
    pagination: PaginationMeta;
  }>({
    queryKey: ["adminCmsPages", page, limit, searchTerm],
    queryFn: async () => {
      const res = await api.get("/admin/cms", {
        params: { page, limit, search: searchTerm || undefined },
      });
      return res.data?.data && res.data?.pagination
        ? res.data
        : {
            data: Array.isArray(res.data) ? res.data : [],
            stats: { publishedCount: 0 },
            pagination: {
              total: Array.isArray(res.data) ? res.data.length : 0,
              page: 1,
              limit: 10,
              totalPages: 1,
            },
          };
    },
  });

  const pagesList: CmsPageRecord[] = responseData?.data || [];
  const pagination: PaginationMeta = responseData?.pagination || {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  };
  const publishedCount = responseData?.stats?.publishedCount || pagesList.filter((p) => p.isPublished).length;

  // Open Form Modals
  const openCreateModal = () => {
    setEditingPage(null);
    setFormData({
      title: "",
      slug: "",
      content: "",
      isPublished: true,
    });
    setIsFormOpen(true);
  };

  const openEditModal = (cmsPage: CmsPageRecord) => {
    setEditingPage(cmsPage);
    setFormData({
      title: cmsPage.title,
      slug: cmsPage.slug,
      content: cmsPage.content,
      isPublished: cmsPage.isPublished,
    });
    setIsFormOpen(true);
  };

  const closeFormModal = () => {
    setIsFormOpen(false);
    setEditingPage(null);
  };

  // Create CMS Page Mutation: POST /admin/cms
  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post("/admin/cms", payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success("New CMS Page created!");
      queryClient.invalidateQueries({ queryKey: ["adminCmsPages"] });
      closeFormModal();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to create CMS page");
    },
  });

  // Edit CMS Page Mutation: PATCH /admin/cms/:id
  const editMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
      const res = await api.patch(`/admin/cms/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success("CMS Page updated!");
      queryClient.invalidateQueries({ queryKey: ["adminCmsPages"] });
      closeFormModal();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to update CMS page");
    },
  });

  // Delete CMS Page Mutation: DELETE /admin/cms/:id
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/admin/cms/${id}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("CMS Page deleted!");
      queryClient.invalidateQueries({ queryKey: ["adminCmsPages"] });
      setDeleteTarget(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to delete CMS page");
    },
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Page title is required");
      return;
    }
    if (!formData.content.trim()) {
      toast.error("Page content body is required");
      return;
    }

    const payload = {
      title: formData.title.trim(),
      slug: formData.slug.trim() || undefined,
      content: formData.content.trim(),
      isPublished: formData.isPublished,
    };

    if (editingPage) {
      editMutation.mutate({ id: editingPage.id, payload });
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
            CMS Static Pages
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage static storefront content pages like About Us, Terms & Conditions, and Privacy Policy.
          </p>
        </div>
        <Button onClick={openCreateModal} className="gap-2 self-start sm:self-auto">
          <Plus className="h-4 w-4" />
          <span>Create New Page</span>
        </Button>
      </div>

      {/* Overview Stat Cards (No Page Number Card) */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="p-5 !flex-row items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Pages
            </p>
            <p className="text-2xl font-extrabold text-foreground font-heading">
              {pagination.total}
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0 border border-primary/20">
            <FileText className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-5 !flex-row items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Published Pages
            </p>
            <p className="text-2xl font-extrabold text-emerald-400 font-heading">
              {publishedCount}
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-5 !flex-row items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Draft / Hidden
            </p>
            <p className="text-2xl font-extrabold text-amber-400 font-heading">
              {pagination.total - publishedCount}
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
            <Eye className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-5 !flex-row items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Storefront Routing
            </p>
            <p className="text-2xl font-extrabold text-sky-400 font-heading">
              Live
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/20">
            <Globe className="h-5 w-5" />
          </div>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search page by title or URL slug..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="h-10 w-full pl-10 pr-4 rounded-lg bg-card border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </Card>

      {/* Table */}
      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="py-3.5 pl-6">Page Title</TableHead>
              <TableHead className="py-3.5">URL Route Slug</TableHead>
              <TableHead className="py-3.5">Status</TableHead>
              <TableHead className="py-3.5">Last Updated</TableHead>
              <TableHead className="py-3.5 text-right pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-14 text-muted-foreground">
                  <Loader2 className="h-7 w-7 animate-spin mx-auto mb-2 text-primary" />
                  <p className="text-xs font-semibold">Loading CMS pages from database...</p>
                </TableCell>
              </TableRow>
            ) : pagesList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-16 text-muted-foreground">
                  <div className="h-14 w-14 rounded-2xl bg-secondary border border-border flex items-center justify-center mx-auto mb-3">
                    <FileText className="h-7 w-7 opacity-50 text-muted-foreground" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">No CMS Pages Found</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                    {searchTerm
                      ? "No pages matched your search."
                      : "Create your first CMS static content page!"}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              pagesList.map((cmsPage) => (
                <TableRow key={cmsPage.id}>
                  {/* Page Title */}
                  <TableCell className="py-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-primary/15 border border-primary/20 text-primary flex items-center justify-center shrink-0">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-xs text-foreground">
                          {cmsPage.title}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Slug */}
                  <TableCell className="py-4">
                    <span className="font-mono text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                      /{cmsPage.slug}
                    </span>
                  </TableCell>

                  {/* Status */}
                  <TableCell className="py-4">
                    <Badge variant={cmsPage.isPublished ? "success" : "secondary"}>
                      {cmsPage.isPublished ? "PUBLISHED" : "DRAFT"}
                    </Badge>
                  </TableCell>

                  {/* Last Updated */}
                  <TableCell className="py-4 text-xs text-muted-foreground">
                    {formatDate(cmsPage.updatedAt)}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="py-4 text-right pr-6">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="secondary"
                        size="xs"
                        onClick={() => openEditModal(cmsPage)}
                        className="h-7 px-2"
                        title="Edit Page"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>

                      <Button
                        variant="destructive"
                        size="xs"
                        onClick={() => setDeleteTarget(cmsPage)}
                        className="h-7 px-2"
                        title="Delete Page"
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
                <span className="font-bold text-foreground">{pagination.total}</span> pages
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

      {/* Add / Edit CMS Page Modal */}
      <Dialog open={isFormOpen} onOpenChange={(open) => !open && closeFormModal()}>
        <DialogHeader>
          <DialogTitle>{editingPage ? `Edit "${editingPage.title}"` : "Create CMS Static Page"}</DialogTitle>
          <DialogDescription>
            Configure title, URL route slug, and page body content.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleFormSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">
                Page Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="About Us"
                className="h-10 w-full px-3.5 rounded-lg bg-secondary border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">
                URL Route Slug (e.g. about-us)
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
                placeholder="about-us"
                className="h-10 w-full px-3.5 rounded-lg bg-secondary border border-border text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5 block">
              Page Content Body *
            </label>
            <textarea
              rows={8}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Enter page text content or HTML markdown..."
              className="w-full p-3.5 rounded-lg bg-secondary border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5 block">
              Publish Status *
            </label>
            <select
              value={formData.isPublished ? "true" : "false"}
              onChange={(e) => setFormData({ ...formData, isPublished: e.target.value === "true" })}
              className="h-10 w-full px-3.5 rounded-lg bg-secondary border border-border text-xs text-foreground outline-none focus:border-primary"
            >
              <option value="true">PUBLISHED (Visible on Storefront)</option>
              <option value="false">DRAFT (Hidden / Work in Progress)</option>
            </select>
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
                : editingPage
                ? "Save Changes"
                : "Create Page"}
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
              <DialogTitle>Confirm CMS Page Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete CMS page "{deleteTarget?.title}"?
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-3 text-xs text-muted-foreground">
          This action will permanently delete CMS page <span className="text-foreground font-bold font-heading">"{deleteTarget?.title}"</span> (/{deleteTarget?.slug}) from Neon PostgreSQL database.
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
            {deleteMutation.isPending ? "Deleting..." : "Delete Page"}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
