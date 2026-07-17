import { useQuery } from "@tanstack/react-query";
import { orderService } from "@/services/order.service";
import { useAuth } from "@/providers/auth-provider";

export function useUserOrders(filters?: { status?: string; paymentStatus?: string; search?: string }) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["orders", filters],
    queryFn: async () => {
      const res = await orderService.getUserOrders(filters);
      return res.data || null;
    },
    enabled: isAuthenticated,
  });
}

export function useOrderDetails(orderNumber: string) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["orders", orderNumber],
    queryFn: async () => {
      const res = await orderService.getOrderDetails(orderNumber);
      return res.data || null;
    },
    enabled: isAuthenticated && !!orderNumber,
  });
}
