"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  Star,
  Quote,
  Loader2,
  MessageSquareQuote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Testimonial {
  id: string;
  name: string;
  role?: string;
  location?: string;
  comment: string;
  rating: number;
  product?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export default function TestimonialsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Testimonial | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    role: "Verified Buyer",
    location: "Mumbai, India",
    comment: "",
    rating: 5,
    product: "",
    sortOrder: 0,
    isActive: true,
  });

  // Fetch Testimonials
  const { data: responseData, isLoading } = useQuery({
    queryKey: ["adminTestimonials", page, limit, searchTerm],
    queryFn: async () => {
      const res = await api.get("/admin/testimonials", {
        params: { page, limit, search: searchTerm || undefined },
      });
      return res.data;
    },
  });

  const testimonialsList: Testimonial[] = responseData?.data || [];
  const stats = responseData?.stats || { total: 0, activeCount: 0 };
  const pagination = responseData?.pagination || { totalPages: 1 };

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      name: "",
      role: "Verified Buyer",
      location: "Mumbai, India",
      comment: "",
      rating: 5,
      product: "Pure Linen Shirt",
      sortOrder: testimonialsList.length + 1,
      isActive: true,
    });
    setIsFormOpen(true);
  };

  const openEditModal = (item: Testimonial) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      role: item.role || "",
      location: item.location || "",
      comment: item.comment,
      rating: item.rating,
      product: item.product || "",
      sortOrder: item.sortOrder || 0,
      isActive: item.isActive,
    });
    setIsFormOpen(true);
  };

  const closeFormModal = () => {
    setIsFormOpen(false);
    setEditingItem(null);
  };

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post("/admin/testimonials", payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success("New testimonial added!");
      queryClient.invalidateQueries({ queryKey: ["adminTestimonials"] });
      closeFormModal();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to create testimonial");
    },
  });

  // Edit Mutation
  const editMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
      const res = await api.patch(`/admin/testimonials/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Testimonial updated!");
      queryClient.invalidateQueries({ queryKey: ["adminTestimonials"] });
      closeFormModal();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to update testimonial");
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/admin/testimonials/${id}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Testimonial deleted!");
      queryClient.invalidateQueries({ queryKey: ["adminTestimonials"] });
      setDeleteTarget(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to delete testimonial");
    },
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Customer name is required");
      return;
    }
    if (!formData.comment.trim()) {
      toast.error("Testimonial comment is required");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      role: formData.role.trim() || undefined,
      location: formData.location.trim() || undefined,
      comment: formData.comment.trim(),
      rating: Number(formData.rating),
      product: formData.product.trim() || undefined,
      sortOrder: Number(formData.sortOrder) || 0,
      isActive: formData.isActive,
    };

    if (editingItem) {
      editMutation.mutate({ id: editingItem.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const toggleActive = (item: Testimonial) => {
    editMutation.mutate({
      id: item.id,
      payload: { isActive: !item.isActive },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <MessageSquareQuote className="h-6 w-6 text-primary" />
            Customer Testimonials
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage customer stories and 5-star testimonials displayed on the storefront landing page.
          </p>
        </div>

        <Button onClick={openCreateModal} className="gap-2">
          <Plus className="h-4 w-4" />
          <span>Add Testimonial</span>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Total Testimonials
          </p>
          <p className="mt-2 text-3xl font-extrabold text-foreground">{stats.total || 0}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Active Storefront Display
          </p>
          <p className="mt-2 text-3xl font-extrabold text-green-600">{stats.activeCount || 0}</p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by customer name, comment, or shirt model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>
      </div>

      {/* Testimonials Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 text-muted-foreground gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-xs font-medium">Loading testimonials...</p>
          </div>
        ) : testimonialsList.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <Quote className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="font-semibold text-foreground">No testimonials found</p>
            <p className="text-xs mt-1">Create your first customer testimonial to show on the homepage!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/40 uppercase font-mono tracking-wider text-muted-foreground">
                <tr>
                  <th className="py-3.5 pl-6">Customer</th>
                  <th className="py-3.5 px-4">Rating</th>
                  <th className="py-3.5 px-4">Comment</th>
                  <th className="py-3.5 px-4">Product Purchased</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {testimonialsList.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-4 pl-6 font-medium">
                      <p className="font-bold text-foreground">{item.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {item.location || item.role || "Verified Buyer"}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="h-3.5 w-3.5 fill-amber-500" />
                        <span>{item.rating}.0</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 max-w-sm">
                      <p className="text-foreground/80 line-clamp-2 italic">
                        &ldquo;{item.comment}&rdquo;
                      </p>
                    </td>
                    <td className="py-4 px-4 font-mono text-[11px] text-primary font-semibold">
                      {item.product || "Pure Linen Shirt"}
                    </td>
                    <td className="py-4 px-4">
                      <button
                        type="button"
                        onClick={() => toggleActive(item)}
                        className="cursor-pointer"
                      >
                        {item.isActive ? (
                          <Badge className="bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 border-emerald-500/20 gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground gap-1">
                            <XCircle className="h-3 w-3" /> Hidden
                          </Badge>
                        )}
                      </button>
                    </td>
                    <td className="py-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditModal(item)}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTarget(item)}
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-card border border-border p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-lg font-bold text-foreground">
                {editingItem ? "Edit Testimonial" : "Create New Customer Testimonial"}
              </h3>
              <button
                type="button"
                onClick={closeFormModal}
                className="text-muted-foreground hover:text-foreground text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Customer Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Vikramaditya Sharma"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">
                    Location / Tag
                  </label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Mumbai, India"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">
                    Role / Subtitle
                  </label>
                  <Input
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="e.g. Verified Buyer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">
                    Rating Stars (1 - 5)
                  </label>
                  <select
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                    className="w-full h-10 rounded-md border border-border bg-background px-3 text-xs font-bold"
                  >
                    <option value={5}>5 Stars (★★★★★)</option>
                    <option value={4}>4 Stars (★★★★☆)</option>
                    <option value={3}>3 Stars (★★★☆☆)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">
                    Shirt Model Purchased
                  </label>
                  <Input
                    value={formData.product}
                    onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                    placeholder="e.g. Pure Linen Mandarin Shirt"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Testimonial Comment / Review Text *
                </label>
                <textarea
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  rows={4}
                  className="w-full rounded-md border border-border bg-background p-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter customer feedback or story..."
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <label htmlFor="isActive" className="text-xs font-bold text-foreground">
                  Display active on Storefront Landing Page
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={closeFormModal}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || editMutation.isPending}>
                  {createMutation.isPending || editMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : editingItem ? (
                    "Save Changes"
                  ) : (
                    "Create Testimonial"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-foreground">Delete Testimonial?</h3>
            <p className="text-xs text-muted-foreground">
              Are you sure you want to delete the testimonial by{" "}
              <strong className="text-foreground">{deleteTarget.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-3 border-t border-border">
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteMutation.mutate(deleteTarget.id)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
