"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cartService, checkoutService } from "@/services/cart.service";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";

export function useCart() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const res = await cartService.getCart();
      return res.data;
    },
    enabled: isAuthenticated,
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: { productId: string; variantId?: string; quantity?: number; measurementProfileId?: string }) => {
      if (!isAuthenticated) {
        toast.error("Please login to add to bag");
        const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
        router.push("/login?redirectTo=" + pathname);
        throw new Error("Not authenticated");
      }
      const res = await cartService.addItem(data);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["cart"], data);
      toast.success("Added to Bag");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to add to bag");
    },
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      const res = await cartService.updateItemQuantity(itemId, quantity);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["cart"], data);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update quantity");
    },
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      const res = await cartService.removeItem(itemId);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["cart"], data);
      toast.info("Item removed from bag");
    },
  });
}

export function useApplyCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (code: string) => {
      const res = await cartService.applyCoupon(code);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["cart"], data);
      toast.success("Coupon applied successfully");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Invalid coupon");
    },
  });
}

export function useRemoveCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await cartService.removeCoupon();
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["cart"], data);
      toast.info("Coupon removed");
    },
  });
}

export function useCheckout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { shippingAddressId?: string; notes?: string; paymentMethod?: string }) => {
      const res = await checkoutService.processCheckout(data);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Order placed successfully!");
      router.push(`/orders/${data.orderNumber}`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to place order");
    },
  });
}
