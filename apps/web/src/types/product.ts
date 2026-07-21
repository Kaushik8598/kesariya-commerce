// ─── Enums ──────────────────────────────────────────────────────────

export type ProductStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";

// ─── Models ─────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parentId: string | null;
  sortOrder: number;
  isActive: boolean;
  children?: Category[];
  _count?: { products: number };
  createdAt: string;
  updatedAt: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  isActive: boolean;
  _count?: { products: number };
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  publicId: string | null;
  alt: string | null;
  color?: string | null;
  sortOrder: number;
  isPrimary: boolean;
}

export interface ProductVariant {
  id: string;
  productId: string;
  size: string | null;
  color: string | null;
  colorCode: string | null;
  material: string | null;
  sku: string;
  price: number;
  stock: number;
  sortOrder: number;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title: string | null;
  comment: string | null;
  isVerified: boolean;
  isApproved: boolean;
  user: {
    id: string;
    firstName: string;
    lastName: string | null;
    avatar: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  sku: string;
  basePrice: number;
  salePrice: number | null;
  categoryId: string;
  brandId: string | null;
  isFeatured: boolean;
  isNewArrival: boolean;
  isCustomizable: boolean;
  stock: number;
  status: ProductStatus;
  metaTitle: string | null;
  metaDescription: string | null;
  tags: string[];
  weight: string | null;
  material: string | null;
  careInstructions: string | null;
  images: ProductImage[];
  variants: ProductVariant[];
  reviews?: Review[];
  category: { id?: string; name: string; slug: string };
  brand: { id?: string; name: string; slug: string } | null;
  _count?: { reviews: number };
  avgRating: number;
  totalReviews?: number;
  ratingBreakdown?: { star: number; count: number }[];
  createdAt: string;
  updatedAt: string;
}

// ─── API Response Types ─────────────────────────────────────────────

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProductFilters {
  categories: { name: string; slug: string; _count: { products: number } }[];
  brands: { name: string; slug: string; _count: { products: number } }[];
  priceRange: { min: number; max: number };
}

export interface ProductListResponse {
  products: Product[];
  filters: ProductFilters;
  pagination: PaginationMeta;
}

export interface CategoryDetailResponse {
  category: Category;
  products: Product[];
  pagination: PaginationMeta;
}

export interface ReviewsResponse {
  reviews: Review[];
  avgRating: number;
  totalReviews: number;
  ratingBreakdown: { star: number; count: number }[];
  pagination: PaginationMeta;
}

// ─── Query Params ───────────────────────────────────────────────────

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  sort?: string;
  q?: string;
  tags?: string;
}
