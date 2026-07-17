import { api } from "@/lib/axios";
import type { Product } from "@/types/product";

export const wishlistService = {
  getWishlist: () => api.get<Product[]>("/wishlist"),

  checkIsWishlisted: (productId: string) =>
    api.get<boolean>(`/wishlist/${productId}/check`),

  toggleWishlistItem: (productId: string) =>
    api.post<{ success: boolean; message: string; isWishlisted: boolean }>(
      `/wishlist/${productId}/toggle`
    ),
};
