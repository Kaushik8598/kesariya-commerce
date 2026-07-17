import { api } from "@/lib/axios";
import type { ReviewsResponse, Review } from "@/types/product";

export const reviewService = {
  getReviews: (
    slug: string,
    params?: { page?: number; limit?: number }
  ) => api.get<ReviewsResponse>(`/products/${slug}/reviews`, { params }),

  createReview: (slug: string, data: { rating: number; title?: string; comment?: string }) =>
    api.post<Review>(`/products/${slug}/reviews`, data),

  updateReview: (id: string, data: { rating?: number; title?: string; comment?: string }) =>
    api.patch<Review>(`/reviews/${id}`, data),

  deleteReview: (id: string) => api.delete<{ message: string }>(`/reviews/${id}`),
};
