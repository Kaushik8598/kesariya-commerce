import { api } from "@/lib/axios";
import type {
  ProductListResponse,
  Product,
  ProductQueryParams,
} from "@/types/product";

export const productService = {
  getProducts: (params?: ProductQueryParams) =>
    api.get<ProductListResponse>("/products", { params }),

  getFeaturedProducts: (limit = 8) =>
    api.get<Product[]>("/products/featured", { params: { limit } }),

  getNewArrivals: (limit = 8) =>
    api.get<Product[]>("/products/new-arrivals", { params: { limit } }),

  getProduct: (slug: string) =>
    api.get<Product>(`/products/${slug}`),

  getRelatedProducts: (slug: string, limit = 6) =>
    api.get<Product[]>(`/products/${slug}/related`, { params: { limit } }),
};
