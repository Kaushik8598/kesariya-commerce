"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Award,
  CheckCircle2,
  XCircle,
  Package,
  Filter,
  Loader2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Upload,
  X,
  Lock,
} from "lucide-react";
import api from "@/lib/api";
import { uploadToSupabase } from "@/lib/supabase-storage";
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

interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logo?: string | null;
  isActive: boolean;
  _count?: { products: number };
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

export default function BrandsPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Search, Filter & Pagination State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Add / Edit Modal State
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    logo: "",
    isActive: true,
  });

  // Delete Confirmation Modal State
  const [deleteTarget, setDeleteTarget] = useState<Brand | null>(null);

  // Fetch Brands: GET /admin/brands?page=1&limit=10&search=...&status=...
  const { data: responseData, isLoading } = useQuery<{
    data: Brand[];
    pagination: PaginationMeta;
  }>({
    queryKey: ["adminBrands", page, limit, searchTerm, statusFilter],
    queryFn: async () => {
      const res = await api.get("/admin/brands", {
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

  const brandsList: Brand[] = responseData?.data || [];
  const pagination: PaginationMeta = responseData?.pagination || {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  };

  // Handle direct logo file upload
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const result = await uploadToSupabase(file, {
        folder: "brands",
        onProgress: (pct) => setUploadProgress(pct),
      });
      setFormData((prev) => ({ ...prev, logo: result.secureUrl || result.url }));
      toast.success("Brand logo uploaded!");
    } catch (err: any) {
      console.warn("Cloudinary upload fallback:", err);
      // Fallback to Data URL if Cloudinary unsigned preset is missing
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({ ...prev, logo: reader.result as string }));
        toast.success("Logo attached!");
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Create Brand Mutation: POST /admin/brands
  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post("/admin/brands", payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Brand created successfully!");
      queryClient.invalidateQueries({ queryKey: ["adminBrands"] });
      closeFormModal();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to create brand");
    },
  });

  // Edit Brand Mutation: PATCH /admin/brands/:id
  const editMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
      const res = await api.patch(`/admin/brands/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Brand updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["adminBrands"] });
      closeFormModal();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to update brand");
    },
  });

  // Delete Brand Mutation: DELETE /admin/brands/:id
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/admin/brands/${id}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Brand deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["adminBrands"] });
      setDeleteTarget(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to delete brand");
    },
  });

  const openAddModal = () => {
    setEditingBrand(null);
    setFormData({ name: "", slug: "", description: "", logo: "", isActive: true });
    setShowAddEditModal(true);
  };

  const openEditModal = (brand: Brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      slug: brand.slug,
      description: brand.description || "",
      logo: brand.logo || "",
      isActive: brand.isActive,
    });
    setShowAddEditModal(true);
  };

  const closeFormModal = () => {
    setShowAddEditModal(false);
    setEditingBrand(null);
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
      toast.error("Brand name is required");
      return;
    }

    const payload = {
      name: formData.name,
      slug: formData.slug || generateSlug(formData.name),
      description: formData.description,
      logo: formData.logo || undefined,
      isActive: formData.isActive,
    };

    if (editingBrand) {
      editMutation.mutate({ id: editingBrand.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const activeCount = brandsList.filter((b) => b.isActive).length;
  const totalLinkedProducts = brandsList.reduce((acc, b) => acc + (b._count?.products || 0), 0);
  const startItemIndex = (pagination.page - 1) * pagination.limit + 1;
  const endItemIndex = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground font-heading">
            Brands Management
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage manufacturer labels, brand logos, designer partners, and active listings.
          </p>
        </div>
        <Button onClick={openAddModal} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" /> Add Brand
        </Button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="p-5 !flex-row items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Brands
            </p>
            <p className="text-2xl font-extrabold text-foreground font-heading">
              {pagination.total}
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0 border border-primary/20">
            <Award className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-5 !flex-row items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Active Brands
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
              Disabled Brands
            </p>
            <p className="text-2xl font-extrabold text-amber-400 font-heading">
              {brandsList.length - activeCount}
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
            <XCircle className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-5 !flex-row items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Linked Products
            </p>
            <p className="text-2xl font-extrabold text-sky-400 font-heading">
              {totalLinkedProducts}
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/20">
            <Package className="h-5 w-5" />
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
              placeholder="Search brand by name or slug..."
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
              <option value="ALL">All Brands</option>
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
              <TableHead className="py-3.5 pl-6">Brand</TableHead>
              <TableHead className="py-3.5">Slug</TableHead>
              <TableHead className="py-3.5">Total Products</TableHead>
              <TableHead className="py-3.5">Status</TableHead>
              <TableHead className="py-3.5 text-right pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-14 text-muted-foreground">
                  <Loader2 className="h-7 w-7 animate-spin mx-auto mb-2 text-primary" />
                  <p className="text-xs font-semibold">Loading brands from database...</p>
                </TableCell>
              </TableRow>
            ) : brandsList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-16 text-muted-foreground">
                  <div className="h-14 w-14 rounded-2xl bg-secondary border border-border flex items-center justify-center mx-auto mb-3">
                    <Award className="h-7 w-7 opacity-50 text-muted-foreground" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">No Brands Found</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                    {searchTerm || statusFilter !== "ALL"
                      ? "No brands matched your filter criteria."
                      : "Your brand listing is empty. Click 'Add Brand' to create your first designer brand."}
                  </p>
                  <Button onClick={openAddModal} variant="outline" size="sm" className="mt-4 gap-2">
                    <Plus className="h-4 w-4" /> Add Brand Now
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              brandsList.map((brand) => (
                <TableRow key={brand.id}>
                  <TableCell className="py-4 pl-6 font-bold text-xs text-foreground">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 aspect-square rounded-xl border border-border bg-secondary flex items-center justify-center overflow-hidden shrink-0 shadow-sm p-1">
                        {brand.logo ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={brand.logo}
                            alt={brand.name}
                            className="h-full w-full object-contain aspect-square"
                          />
                        ) : (
                          <Award className="h-5 w-5 text-muted-foreground/60" />
                        )}
                      </div>
                      <span>{brand.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 font-mono text-[11px] text-muted-foreground">
                    {brand.slug}
                  </TableCell>
                  <TableCell className="py-4 text-xs font-bold text-foreground">
                    {brand._count?.products || 0} products
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge variant={brand.isActive ? "success" : "secondary"}>
                      {brand.isActive ? "ACTIVE" : "DISABLED"}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 text-right pr-6">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="secondary"
                        size="xs"
                        onClick={() => openEditModal(brand)}
                        className="h-7 px-2.5 gap-1"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </Button>
                      <Button
                        variant="destructive"
                        size="xs"
                        onClick={() => setDeleteTarget(brand)}
                        className="h-7 px-2"
                        title="Delete Brand"
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
          entityName="brands"
        />
      </Card>

      {/* Add / Edit Brand Modal */}
      <Dialog open={showAddEditModal} onOpenChange={setShowAddEditModal}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleFormSubmit}>
          <DialogHeader>
            <DialogTitle>
              {editingBrand ? "Edit Brand" : "Add New Brand"}
            </DialogTitle>
            <DialogDescription>
              {editingBrand
                ? `Update details, logo image, and status for "${editingBrand.name}"`
                : "Fill details to add a new designer or supplier brand"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">
                Brand Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={handleNameChange}
                placeholder="e.g. Kesariya Studio"
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
                placeholder="kesariya-studio"
                className="h-10 w-full px-3.5 rounded-lg bg-muted/60 border border-border text-xs text-foreground font-mono cursor-not-allowed opacity-75"
              />
            </div>

            {/* Brand Logo Upload & Preview */}
            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">
                Brand Logo / Image (Square View)
              </label>
              <div className="space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.logo}
                    onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                    placeholder="Paste logo URL or click upload →"
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
                    <span>{isUploading ? `${uploadProgress}%` : "Upload Logo"}</span>
                  </Button>
                </div>

                {formData.logo && (
                  <div className="relative mt-2 h-28 w-28 aspect-square rounded-xl border border-border bg-secondary p-2 flex items-center justify-center overflow-hidden group shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={formData.logo}
                      alt="Brand Logo Preview"
                      className="h-full w-full object-contain aspect-square"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, logo: "" })}
                      className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-rose-600 transition-colors"
                      title="Remove logo"
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
                placeholder="Optional brand overview..."
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
                : editingBrand
                ? "Save Changes"
                : "Create Brand"}
            </Button>
          </DialogFooter>
        </form>
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
                <DialogTitle>Confirm Brand Deletion</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete "{deleteTarget?.name}"?
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="py-3 text-xs text-muted-foreground">
            This action will permanently delete brand <span className="text-foreground font-bold font-heading">"{deleteTarget?.name}"</span> from Neon PostgreSQL database. This action cannot be undone.
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
              {deleteMutation.isPending ? "Deleting..." : "Delete Brand"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
