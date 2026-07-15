import { api } from "@/lib/axios";
import type { Category, CategoryDetailResponse } from "@/types/product";

export const categoryService = {
  getCategories: (tree = false) =>
    api.get<Category[]>("/categories", { params: { tree } }),

  getCategoryBySlug: (
    slug: string,
    params?: { page?: number; limit?: number; sort?: string }
  ) => api.get<CategoryDetailResponse>(`/categories/${slug}`, { params }),
};
