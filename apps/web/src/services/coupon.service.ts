import { api } from "@/lib/axios";

export interface PublicCoupon {
  id: string;
  code: string;
  description?: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT";
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  endDate?: string;
}

export const couponService = {
  getPublicCoupons: () => api.get<PublicCoupon[]>("/coupons/public"),
};
