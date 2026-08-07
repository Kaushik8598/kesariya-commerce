"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  Eye,
  ExternalLink,
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
  DialogContent,
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
  const router = useRouter();
  const queryClient = useQueryClient();

  // Search & Pagination State
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Standalone Full Preview Modal State
  const [previewTarget, setPreviewTarget] = useState<CmsPageRecord | null>(null);

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
  const publishedCount =
    responseData?.stats?.publishedCount || pagesList.filter((p) => p.isPublished).length;

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
        <Button onClick={() => router.push("/admin/cms/create")} className="gap-2 self-start sm:self-auto">
          <Plus className="h-4 w-4" />
          <span>Create New Page</span>
        </Button>
      </div>

      {/* Overview Stat Cards */}
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
              Storefront Route
            </p>
            <p className="text-2xl font-extrabold text-sky-400 font-heading">
              /info/[slug]
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
                  <Button
                    onClick={() => router.push("/admin/cms/create")}
                    variant="outline"
                    size="sm"
                    className="mt-4 gap-2"
                  >
                    <Plus className="h-4 w-4" /> Create Page Now
                  </Button>
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
                      /info/{cmsPage.slug}
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
                        variant="outline"
                        size="xs"
                        onClick={() => setPreviewTarget(cmsPage)}
                        className="h-7 px-2.5 gap-1 text-sky-400 border-sky-500/30 hover:bg-sky-500/10"
                        title="Live Preview Page"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Preview</span>
                      </Button>

                      <Button
                        variant="secondary"
                        size="xs"
                        onClick={() => router.push(`/admin/cms/edit/${cmsPage.id}`)}
                        className="h-7 px-2.5 gap-1"
                        title="Edit Page"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        <span>Edit</span>
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

        {/* Bottom Pagination Bar */}
        <DataTablePagination
          page={page}
          limit={limit}
          total={pagination.total}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
          onLimitChange={setLimit}
          entityName="pages"
        />
      </Card>

      {/* Standalone Full Live Preview Dialog Modal */}
      <Dialog open={Boolean(previewTarget)} onOpenChange={(open) => !open && setPreviewTarget(null)}>
        <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between pr-6">
            <div>
              <DialogTitle className="text-lg font-bold">
                {previewTarget?.title}
              </DialogTitle>
              <DialogDescription className="font-mono text-xs text-primary">
                Storefront Route: /info/{previewTarget?.slug}
              </DialogDescription>
            </div>
            <Badge variant={previewTarget?.isPublished ? "success" : "secondary"}>
              {previewTarget?.isPublished ? "PUBLISHED" : "DRAFT"}
            </Badge>
          </div>
        </DialogHeader>

        <div className="p-6 max-h-[60vh] overflow-y-auto bg-background rounded-xl border border-border my-2 prose prose-invert max-w-none text-xs leading-relaxed">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground mb-4 font-heading border-b border-border pb-3">
            {previewTarget?.title}
          </h1>

          {previewTarget?.content ? (
            <div
              dangerouslySetInnerHTML={{ __html: previewTarget.content }}
              className="space-y-3 text-muted-foreground font-sans [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:mt-5 [&_h2]:mb-2 [&_h3]:text-sm [&_h3]:font-bold [&_h3]:text-foreground [&_h3]:mt-4 [&_h3]:mb-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1.5 [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:py-1 [&_blockquote]:italic [&_blockquote]:text-foreground/90 [&_a]:text-primary [&_a]:underline"
            />
          ) : (
            <p className="text-muted-foreground italic">No content available for preview.</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setPreviewTarget(null)}>
            Close Preview
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

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
                <DialogTitle>Confirm CMS Page Deletion</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete CMS page "{deleteTarget?.title}"?
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="py-3 text-xs text-muted-foreground">
            This action will permanently delete CMS page <span className="text-foreground font-bold font-heading">"{deleteTarget?.title}"</span> (/info/{deleteTarget?.slug}) from Neon PostgreSQL database.
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
        </DialogContent>
      </Dialog>
    </div>
  );
}
