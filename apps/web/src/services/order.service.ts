import { api } from '@/lib/axios';

export const orderService = {
  getUserOrders: (params?: { status?: string; paymentStatus?: string; search?: string }) => {
    return api.get("/orders", { params });
  },
  getOrderDetails: (orderNumber: string) => api.get(`/orders/${orderNumber}`),
};
