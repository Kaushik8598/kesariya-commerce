import { useState, useEffect } from "react";
import { categoryService } from "@/services/category.service";
import type { Category } from "@/types/product";

export function useCategories(tree = false) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    categoryService.getCategories(tree)
      .then((res: any) => {
        if (mounted) {
          const list = Array.isArray(res)
            ? res
            : Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res?.data?.data)
            ? res.data.data
            : [];
          setCategories(list);
          setError(null);
        }
      })
      .catch((err) => {
        if (mounted) setError(err as Error);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, [tree]);

  return { categories, loading, error };
}
