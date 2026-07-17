import { useState, useEffect } from "react";
import { productService } from "@/services/product.service";
import type { Product, ProductQueryParams, ProductListResponse } from "@/types/product";

export function useProducts(params?: ProductQueryParams) {
  const [data, setData] = useState<ProductListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await productService.getProducts(params);
        if (mounted) {
          setData(res.data);
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
  }, [JSON.stringify(params)]);

  return { data, loading, error };
}

export function useFeaturedProducts(limit = 8) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    productService.getFeaturedProducts(limit)
      .then((res) => {
        if (mounted) setProducts(res.data);
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
      .then((res) => {
        if (mounted) setProducts(res.data);
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
      .then((res) => {
        if (mounted) {
          setProduct(res.data);
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
