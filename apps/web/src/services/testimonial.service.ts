import { api } from "@/lib/axios";

export interface Testimonial {
  id: string;
  name: string;
  role?: string;
  location?: string;
  avatar?: string;
  comment: string;
  rating: number;
  product?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export const testimonialService = {
  getPublicTestimonials: () => api.get<Testimonial[]>("/public/testimonials"),
};
