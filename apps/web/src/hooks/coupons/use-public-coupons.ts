import { useState, useEffect } from "react";
import { couponService, type PublicCoupon } from "@/services/coupon.service";

export function usePublicCoupons() {
  const [coupons, setCoupons] = useState<PublicCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    couponService
      .getPublicCoupons()
      .then((res: { data: PublicCoupon[] }) => {
        if (mounted) {
          setCoupons(res.data || []);
          setError(null);
        }
      })
      .catch((err: Error) => {
        if (mounted) {
          setError(err);
          setCoupons([]);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  return { coupons, loading, error };
}
