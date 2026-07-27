"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  FolderTree,
  CheckCircle2,
  XCircle,
  Filter,
  Loader2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  GitBranch,
  Upload,
  X,
  Lock,
} from "lucide-react";
import api from "@/lib/api";
import { uploadToCloudinary } from "@/lib/cloudinary";
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
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  parentId?: string | null;
  parent?: { name: string } | null;
  isActive: boolean;
  _count?: { products: number; children: number };
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const generateSlug = (str: string) => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
};

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Search, Filter & Pagination State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Add / Edit Modal State
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    image: "",
    isActive: true,
  });

  // Delete Confirmation Modal State
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  // Fetch Categories: GET /admin/categories?page=1&limit=10&search=...&status=...
  const { data: responseData, isLoading } = useQuery<{
    data: Category[];
    pagination: PaginationMeta;
  }>({
    queryKey: ["adminCategories", page, limit, searchTerm, statusFilter],
    queryFn: async () => {
      const res = await api.get("/admin/categories", {
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
            pagination: {
              total: Array.isArray(res.data) ? res.data.length : 0,
              page: 1,
              limit: 10,
              totalPages: 1,
            },
          };
    },
  });

  const categoriesList: Category[] = responseData?.data || [];
  const pagination: PaginationMeta = responseData?.pagination || {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  };

  // Handle direct image file upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const result = await uploadToCloudinary(file, {
        folder: "kesariya/categories",
        onProgress: (pct) => setUploadProgress(pct),
      });
      setFormData((prev) => ({ ...prev, image: result.secureUrl || result.url }));
      toast.success("Category image uploaded!");
    } catch (err: any) {
      console.warn("Cloudinary upload fallback:", err);
      // Fallback to Data URL if Cloudinary unsigned preset is missing
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({ ...prev, image: reader.result as string }));
        toast.success("Image attached!");
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Create Category Mutation: POST /admin/categories
  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post("/admin/categories", payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Category created successfully!");
      queryClient.invalidateQueries({ queryKey: ["adminCategories"] });
      closeFormModal();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to create category");
    },
  });

  // Edit Category Mutation: PATCH /admin/categories/:id
  const editMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
      const res = await api.patch(`/admin/categories/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Category updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["adminCategories"] });
      closeFormModal();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to update category");
    },
  });

  // Delete Category Mutation: DELETE /admin/categories/:id
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/admin/categories/${id}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Category deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["adminCategories"] });
      setDeleteTarget(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to delete category");
    },
  });

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({ name: "", slug: "", description: "", image: "", isActive: true });
    setShowAddEditModal(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      image: category.image || "",
      isActive: category.isActive,
    });
    setShowAddEditModal(true);
  };

  const closeFormModal = () => {
    setShowAddEditModal(false);
    setEditingCategory(null);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name: newName,
      slug: generateSlug(newName),
    }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error("Category name is required");
      return;
    }

    const payload = {
      name: formData.name,
      slug: formData.slug || generateSlug(formData.name),
      description: formData.description,
      image: formData.image || undefined,
      isActive: formData.isActive,
    };

    if (editingCategory) {
      editMutation.mutate({ id: editingCategory.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const activeCount = categoriesList.filter((c) => c.isActive).length;
  const subCategoryCount = categoriesList.filter((c) => c.parentId).length;
  const startItemIndex = (pagination.page - 1) * pagination.limit + 1;
  const endItemIndex = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground font-heading">
            Categories Management
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Organize product catalog taxonomy, category banners, parent-child hierarchies, and active visibility.
          </p>
        </div>
        <Button onClick={openAddModal} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" /> Add Category
        </Button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="p-5 !flex-row items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Categories
            </p>
            <p className="text-2xl font-extrabold text-foreground font-heading">
              {pagination.total}
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0 border border-primary/20">
            <FolderTree className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-5 !flex-row items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Active Categories
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
              Disabled Categories
            </p>
            <p className="text-2xl font-extrabold text-amber-400 font-heading">
              {categoriesList.length - activeCount}
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
            <XCircle className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-5 !flex-row items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Sub-Categories
            </p>
            <p className="text-2xl font-extrabold text-sky-400 font-heading">
              {subCategoryCount}
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/20">
            <GitBranch className="h-5 w-5" />
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
              placeholder="Search category by name or slug..."
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
              <option value="ALL">All Categories</option>
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
              <TableHead className="py-3.5 pl-6">Category</TableHead>
              <TableHead className="py-3.5">Slug</TableHead>
              <TableHead className="py-3.5">Parent Category</TableHead>
              <TableHead className="py-3.5">Total Products</TableHead>
              <TableHead className="py-3.5">Status</TableHead>
              <TableHead className="py-3.5 text-right pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-14 text-muted-foreground">
                  <Loader2 className="h-7 w-7 animate-spin mx-auto mb-2 text-primary" />
                  <p className="text-xs font-semibold">Loading categories from database...</p>
                </TableCell>
              </TableRow>
            ) : categoriesList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-16 text-muted-foreground">
                  <div className="h-14 w-14 rounded-2xl bg-secondary border border-border flex items-center justify-center mx-auto mb-3">
                    <FolderTree className="h-7 w-7 opacity-50 text-muted-foreground" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">No Categories Found</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                    {searchTerm || statusFilter !== "ALL"
                      ? "No categories matched your filter criteria."
                      : "Your category tree is empty. Click 'Add Category' to create your first taxonomy level."}
                  </p>
                  <Button onClick={openAddModal} variant="outline" size="sm" className="mt-4 gap-2">
                    <Plus className="h-4 w-4" /> Add Category Now
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              categoriesList.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="py-4 pl-6 font-bold text-xs text-foreground">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 aspect-square rounded-xl border border-border bg-secondary flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                        {cat.image ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={cat.image}
                            alt={cat.name}
                            className="h-full w-full object-cover aspect-square"
                          />
                        ) : (
                          <FolderTree className="h-5 w-5 text-muted-foreground/60" />
                        )}
                      </div>
                      <span>{cat.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 font-mono text-[11px] text-muted-foreground">
                    {cat.slug}
                  </TableCell>
                  <TableCell className="py-4 text-xs font-semibold text-muted-foreground">
                    {cat.parent?.name || "Root Category"}
                  </TableCell>
                  <TableCell className="py-4 text-xs font-bold text-foreground">
                    {cat._count?.products || 0} products
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge variant={cat.isActive ? "success" : "secondary"}>
                      {cat.isActive ? "ACTIVE" : "DISABLED"}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 text-right pr-6">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="secondary"
                        size="xs"
                        onClick={() => openEditModal(cat)}
                        className="h-7 px-2.5 gap-1"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </Button>
                      <Button
                        variant="destructive"
                        size="xs"
                        onClick={() => setDeleteTarget(cat)}
                        className="h-7 px-2"
                        title="Delete Category"
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
          entityName="categories"
        />
      </Card>

      {/* Add / Edit Category Modal */}
      <Dialog open={showAddEditModal} onOpenChange={setShowAddEditModal}>
        <form onSubmit={handleFormSubmit}>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Add New Category"}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? `Update details, image banner, and status for "${editingCategory.name}"`
                : "Fill details to create a new category level"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">
                Category Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={handleNameChange}
                placeholder="e.g. Linen Shirts"
                className="h-10 w-full px-3.5 rounded-lg bg-secondary border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Slug (Auto-generated from Name)
                </label>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Lock className="h-3 w-3" /> Auto-Generated
                </span>
              </div>
              <input
                type="text"
                disabled
                value={formData.slug}
                placeholder="linen-shirts"
                className="h-10 w-full px-3.5 rounded-lg bg-muted/60 border border-border text-xs text-foreground font-mono cursor-not-allowed opacity-75"
              />
            </div>

            {/* Category Image Upload & Preview */}
            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">
                Category Image (Square View)
              </label>
              <div className="space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="Paste image URL or click upload →"
                    className="h-10 flex-1 px-3.5 rounded-lg bg-secondary border border-border text-xs text-foreground font-mono placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="h-10 gap-1.5 shrink-0"
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    <span>{isUploading ? `${uploadProgress}%` : "Upload Image"}</span>
                  </Button>
                </div>

                {formData.image && (
                  <div className="relative mt-2 h-28 w-28 aspect-square rounded-xl border border-border bg-secondary overflow-hidden group shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={formData.image}
                      alt="Category Preview"
                      className="h-full w-full object-cover aspect-square"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image: "" })}
                      className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-rose-600 transition-colors"
                      title="Remove image"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">
                Description
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional category description..."
                className="w-full p-3 rounded-lg bg-secondary border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">
                Status *
              </label>
              <select
                value={formData.isActive ? "ACTIVE" : "INACTIVE"}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.value === "ACTIVE" })
                }
                className="h-10 w-full px-3.5 rounded-lg bg-secondary border border-border text-xs text-foreground outline-none focus:border-primary"
              >
                <option value="ACTIVE">ACTIVE (Enabled on storefront)</option>
                <option value="INACTIVE">DISABLED (Hidden)</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeFormModal}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || editMutation.isPending || isUploading}
            >
              {createMutation.isPending || editMutation.isPending
                ? "Saving..."
                : editingCategory
                ? "Save Changes"
                : "Create Category"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog Modal */}
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
              <DialogTitle>Confirm Category Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{deleteTarget?.name}"?
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-3 text-xs text-muted-foreground">
          This action will permanently delete category <span className="text-foreground font-bold font-heading">"{deleteTarget?.name}"</span> from Neon PostgreSQL database. This action cannot be undone.
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
            {deleteMutation.isPending ? "Deleting..." : "Delete Category"}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
