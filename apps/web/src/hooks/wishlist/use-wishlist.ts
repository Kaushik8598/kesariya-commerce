"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { wishlistService } from "@/services/wishlist.service";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";

export function useWishlist() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => {
      const res = await wishlistService.getWishlist();
      return res.data;
    },
    enabled: isAuthenticated,
  });
}

export function useToggleWishlist() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  return useMutation({
    mutationFn: async (productId: string) => {
      if (!isAuthenticated) {
        toast.error("Please login to add to wishlist");
        const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
        router.push("/login?redirectTo=" + pathname);
        throw new Error("Not authenticated");
      }
      const res = await wishlistService.toggleWishlistItem(productId);
      return { productId, ...res.data };
    },
    onMutate: async (productId) => {
      if (!isAuthenticated) return;

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["wishlist"] });

      // Snapshot the previous value
      const previousWishlist = queryClient.getQueryData<any[]>(["wishlist"]);

      // Optimistically update
      if (previousWishlist) {
        const isWishlisted = previousWishlist.some(p => p.id === productId);
        queryClient.setQueryData<any[]>(["wishlist"], (old) => {
          if (!old) return old;
          if (isWishlisted) {
            return old.filter(p => p.id !== productId);
          } else {
            // Optimistically add a placeholder product (id is enough for the check)
            return [...old, { id: productId }];
          }
        });
      }

      return { previousWishlist, productId };
    },
    onError: (err, productId, context) => {
      if (context?.previousWishlist !== undefined) {
        queryClient.setQueryData(["wishlist"], context.previousWishlist);
      }
    },
    onSuccess: (data) => {
      // Invalidate to fetch the real product data if it was added
      queryClient.invalidateQueries({ queryKey: ["wishlist"], exact: true });
      
      if (data.isWishlisted) {
        toast.success(data.message);
      } else {
        toast.info(data.message);
      }
    },
  });
}
