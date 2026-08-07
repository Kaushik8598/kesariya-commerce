import { useState, useEffect } from "react";
import { productService } from "@/services/product.service";
import type { Product, ProductQueryParams, ProductListResponse } from "@/types/product";

export function useProducts(
  params?: ProductQueryParams,
  options?: { enabled?: boolean }
) {
  const [data, setData] = useState<ProductListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const enabled = options?.enabled !== false;

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    let mounted = true;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res: any = await productService.getProducts(params);
        if (mounted) {
          const rawData = res?.data?.products ? res.data : res?.products ? res : res?.data || res;
          const productsList = Array.isArray(rawData?.products)
            ? rawData.products
            : Array.isArray(rawData)
            ? rawData
            : [];
          const paginationObj = rawData?.pagination || { page: 1, limit: 12, total: productsList.length, totalPages: 1 };
          const filtersObj = rawData?.filters || { categories: [], brands: [], priceRange: { min: 0, max: 0 } };

          setData({
            products: productsList,
            pagination: paginationObj,
            filters: filtersObj,
          });
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err as Error);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      mounted = false;
    };
  }, [JSON.stringify(params), enabled]);

  return { data, loading, error };
}

export function useFeaturedProducts(limit = 8) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    productService.getFeaturedProducts(limit)
      .then((res: any) => {
        if (mounted) {
          const list = Array.isArray(res)
            ? res
            : Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res?.data?.data)
            ? res.data.data
            : [];
          setProducts(list);
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, [limit]);

  return { products, loading };
}

export function useNewArrivals(limit = 8) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    productService.getNewArrivals(limit)
      .then((res: any) => {
        if (mounted) {
          const list = Array.isArray(res)
            ? res
            : Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res?.data?.data)
            ? res.data.data
            : [];
          setProducts(list);
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, [limit]);

  return { products, loading };
}

export function useProduct(slug: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    productService.getProduct(slug)
      .then((res: any) => {
        if (mounted) {
          const prod = res?.data || res;
          setProduct(prod);
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
  }, [slug]);

  return { product, loading, error };
}
