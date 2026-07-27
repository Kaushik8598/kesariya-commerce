"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  GripVertical,
  Image as ImageIcon,
  Video,
  X,
  Star,
  Loader2,
  ArrowLeft,
  Save,
  Eye,
  Package,
  DollarSign,
  Layers,
  FileText,
  Tag,
  Info,
  Upload,
  CloudUpload,
  CheckCircle2,
  AlertCircle,
  Film,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox";
import api from "@/lib/api";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import {
  uploadToCloudinary,
  isImageFile,
  isVideoFile,
  isVideoUrl,
  ACCEPTED_IMAGE_TYPES,
  ACCEPTED_VIDEO_TYPES,
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
} from "@/lib/cloudinary";

// Dynamic import for TipTap (SSR safe)
const RichTextEditor = dynamic(
  () => import("./rich-text-editor").then((m) => m.RichTextEditor),
  {
    ssr: false,
    loading: () => (
      <div className="h-36 rounded-lg border border-border bg-card/30 animate-pulse" />
    ),
  }
);

/* ─── Types ─────────────────────────────────────────────────────────── */
interface Category {
  id: string;
  name: string;
  slug: string;
}
interface Brand {
  id: string;
  name: string;
  slug: string;
}

interface ContentBlock {
  title: string;
  content: string;
  sortOrder: number;
  isOpen?: boolean;
}

interface ProductImage {
  url: string;
  publicId?: string;
  alt?: string;
  color?: string;
  isPrimary?: boolean;
  sortOrder?: number;
  type?: "image" | "video";
}

interface ProductVariant {
  _tempId?: string;
  id?: string;
  size?: string;
  color?: string;
  colorCode?: string;
  material?: string;
  sku: string;
  price: number | string;
  stock: number | string;
}

interface ProductFormData {
  name: string;
  slug: string;
  shortDescription: string;
  status: "ACTIVE" | "DRAFT" | "ARCHIVED";
  categoryId: string;
  brandId: string;
  isFeatured: boolean;
  isNewArrival: boolean;
  isCustomizable: boolean;
  basePrice: string;
  salePrice: string;
  sku: string;
  stock: string;
  weight: string;
  material: string;
  careInstructions: string;
  metaTitle: string;
  metaDescription: string;
  tags: string;
  videoUrl: string;
  images: ProductImage[];
  contentBlocks: ContentBlock[];
  variants: ProductVariant[];
}

const DEFAULT_BLOCKS: ContentBlock[] = [
  { title: "Description", content: "", sortOrder: 0, isOpen: true },
  { title: "Details & Materials", content: "", sortOrder: 1, isOpen: false },
  { title: "Care Instructions", content: "", sortOrder: 2, isOpen: false },
];

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "Free Size"];

function generateSlug(name?: string): string {
  return (name || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function generateVariantSku(masterSku?: string, color?: string, size?: string): string {
  const base = (masterSku || "SKU").trim().toUpperCase();
  const colorPart = (color || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  const sizePart = (size || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");

  const parts = [base];
  if (colorPart) parts.push(colorPart);
  if (sizePart) parts.push(sizePart);

  return parts.join("-");
}

/* ─── Section wrapper using shadcn Card ─────────────────────────────── */
function FormSection({
  id,
  icon,
  title,
  children,
}: {
  id: string;
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card id={id} className="mb-6">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-base">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary border border-primary/20">
            {icon}
          </span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

/* ─── Field row helper ──────────────────────────────────────────────── */
function FieldRow({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>;
}

/* ─── Main ProductForm ──────────────────────────────────────────────── */
interface ProductFormProps {
  productId?: string;
}

export default function ProductForm({ productId }: ProductFormProps) {
  const router = useRouter();
  const isEdit = Boolean(productId);

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    slug: "",
    shortDescription: "",
    status: "DRAFT",
    categoryId: "",
    brandId: "",
    isFeatured: false,
    isNewArrival: false,
    isCustomizable: false,
    basePrice: "",
    salePrice: "",
    sku: "",
    stock: "0",
    weight: "",
    material: "",
    careInstructions: "",
    metaTitle: "",
    metaDescription: "",
    tags: "",
    videoUrl: "",
    images: [],
    contentBlocks: DEFAULT_BLOCKS,
    variants: [],
  });

  const [newImageUrl, setNewImageUrl] = useState("");
  const [activeSection, setActiveSection] = useState("basic");

  /* ─── Upload & Preview state ── */
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingCount, setUploadingCount] = useState({ done: 0, total: 0 });
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  /* ─── Load Categories & Brands ── */
  const { data: categoriesData } = useQuery({
    queryKey: ["admin-categories-all"],
    queryFn: async () => {
      const res = await api.get("/admin/categories?limit=100");
      return res.data;
    },
  });
  const { data: brandsData } = useQuery({
    queryKey: ["admin-brands-all"],
    queryFn: async () => {
      const res = await api.get("/admin/brands?limit=100");
      return res.data;
    },
  });

  const categories: Category[] =
    categoriesData?.data || categoriesData?.categories || [];
  const brands: Brand[] = brandsData?.data || brandsData?.brands || [];

  /* ─── Load product for editing ── */
  const { data: productData, isLoading: isLoadingProduct } = useQuery({
    queryKey: ["admin-product", productId],
    queryFn: async () => {
      const res = await api.get(`/admin/products/${productId}`);
      return res.data;
    },
    enabled: isEdit && !!productId,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (productData) {
      const defaultDesc = productData?.description || "";
      const defaultMat = productData?.material || "";
      const defaultCare = productData?.careInstructions || "";

      let blocks: ContentBlock[] = [];
      if (Array.isArray(productData?.contentBlocks) && productData.contentBlocks.length > 0) {
        blocks = productData.contentBlocks.map((b: any, i: number) => ({
          title: b?.title || (i === 0 ? "Description" : i === 1 ? "Details & Materials" : i === 2 ? "Care Instructions" : `Section ${i + 1}`),
          content: (b?.content !== undefined && b?.content !== null && b?.content !== "")
            ? b.content
            : (i === 0 ? defaultDesc : i === 1 ? defaultMat : i === 2 ? defaultCare : ""),
          sortOrder: b?.sortOrder ?? i,
          isOpen: i === 0,
        }));
      } else {
        blocks = [
          { title: "Description", content: defaultDesc, sortOrder: 0, isOpen: true },
          { title: "Details & Materials", content: defaultMat, sortOrder: 1, isOpen: false },
          { title: "Care Instructions", content: defaultCare, sortOrder: 2, isOpen: false },
        ];
      }

      setFormData({
        name: productData?.name || "",
        slug: productData?.slug || "",
        shortDescription: productData?.shortDescription || "",
        status: productData?.status || "DRAFT",
        categoryId: productData?.category?.id || productData?.categoryId || "",
        brandId: productData?.brand?.id || productData?.brandId || "",
        isFeatured: Boolean(productData?.isFeatured),
        isNewArrival: Boolean(productData?.isNewArrival),
        isCustomizable: Boolean(productData?.isCustomizable),
        basePrice: productData?.basePrice?.toString() || "",
        salePrice: productData?.salePrice?.toString() || "",
        sku: productData?.sku || "",
        stock: productData?.stock?.toString() || "0",
        weight: productData?.weight || "",
        material: defaultMat,
        careInstructions: defaultCare,
        metaTitle: productData?.metaTitle || "",
        metaDescription: productData?.metaDescription || "",
        tags: Array.isArray(productData?.tags) ? productData.tags.join(", ") : "",
        videoUrl: productData?.videoUrl || "",
        images: (() => {
          const loaded: ProductImage[] = Array.isArray(productData?.images)
            ? productData.images.map((img: any) => ({
                ...img,
                type: isVideoUrl(img?.url) ? "video" : "image",
                isPrimary: isVideoUrl(img?.url) ? false : Boolean(img?.isPrimary),
              }))
            : [];

          if (productData?.videoUrl && !loaded.some((i) => i.url === productData.videoUrl)) {
            loaded.push({
              url: productData.videoUrl,
              type: "video",
              isPrimary: false,
            });
          }
          return loaded;
        })(),
        contentBlocks: blocks,
        variants: Array.isArray(productData?.variants)
          ? productData.variants.map((v: any) => ({
              id: v?.id,
              sku: v?.sku || "",
              color: v?.color || "",
              colorCode: v?.colorCode || "#6366f1",
              size: v?.size || "",
              price: v?.price !== undefined && v?.price !== null ? v.price.toString() : (productData?.basePrice?.toString() || "0"),
              stock: v?.stock !== undefined && v?.stock !== null ? v.stock.toString() : "0",
            }))
          : [],
      });
    }
  }, [productData]);

  /* ─── Mutations ── */
  const createMutation = useMutation({
    mutationFn: async (payload: object) => {
      const res = await api.post("/admin/products", payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Product created successfully!");
      router.push("/products");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to create product");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: object) => {
      const res = await api.patch(`/admin/products/${productId}`, payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Product updated successfully!");
      router.push("/products");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to update product");
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  const set = useCallback((key: keyof ProductFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }, []);

  /* Auto-generate slug from name */
  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }));
  };

  /* Auto-update variant SKUs when master SKU changes */
  const handleMasterSkuChange = (sku: string) => {
    const upperSku = sku.toUpperCase();
    setFormData((prev) => ({
      ...prev,
      sku: upperSku,
      variants: prev.variants.map((v) => ({
        ...v,
        sku: generateVariantSku(upperSku, v.color, v.size),
      })),
    }));
  };

  /* ─── Image/Video helpers ── */
  const addImage = () => {
    if (!newImageUrl.trim()) return;

    // Support multiple space/comma/newline separated URLs pasted at once!
    const rawUrls = newImageUrl
      .split(/[\n,\s]+/)
      .map((u) => u.trim())
      .filter(Boolean);

    if (rawUrls.length === 0) return;

    setFormData((prev) => {
      const updatedImages = [...prev.images];

      for (const url of rawUrls) {
        const isVid = isVideoUrl(url);
        const hasPrimary = updatedImages.some(
          (img) => img.isPrimary && !isVideoUrl(img.url) && img.type !== "video"
        );

        updatedImages.push({
          url,
          type: isVid ? "video" : "image",
          isPrimary: !isVid && !hasPrimary,
          sortOrder: updatedImages.length,
        });
      }

      return {
        ...prev,
        images: updatedImages,
      };
    });

    setNewImageUrl("");
    toast.success(`Added ${rawUrls.length} media link${rawUrls.length > 1 ? "s" : ""}`);
  };

  const removeImage = (idx: number) => {
    setFormData((prev) => {
      const imgs = prev.images.filter((_, i) => i !== idx);
      const hasPrimary = imgs.some(
        (i) => i.isPrimary && !isVideoUrl(i.url) && i.type !== "video"
      );
      if (!hasPrimary) {
        const firstImgIdx = imgs.findIndex(
          (i) => !isVideoUrl(i.url) && i.type !== "video"
        );
        if (firstImgIdx !== -1) {
          imgs[firstImgIdx].isPrimary = true;
        }
      }
      return { ...prev, images: imgs };
    });
  };

  const setPrimaryImage = (idx: number) => {
    setFormData((prev) => {
      const target = prev.images[idx];
      if (target && (target.type === "video" || isVideoUrl(target.url))) {
        toast.error("Videos cannot be set as primary image");
        return prev;
      }

      return {
        ...prev,
        images: prev.images.map((img, i) => ({
          ...img,
          isPrimary: i === idx && !isVideoUrl(img.url) && img.type !== "video",
        })),
      };
    });
  };

  const updateImageColor = (idx: number, color: string) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.map((img, i) =>
        i === idx ? { ...img, color: color || undefined } : img
      ),
    }));
  };

  /* ─── Unified Cloudinary upload helper (Images & Videos in one zone) ── */
  const handleMediaUpload = async (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter((f) => {
      const isVid = isVideoFile(f);
      const isImg = isImageFile(f);

      if (!isVid && !isImg) {
        toast.error(`"${f.name}" is not a valid image or video file`);
        return false;
      }
      if (isVid && f.size > MAX_VIDEO_SIZE) {
        toast.error(`"${f.name}" exceeds 100 MB video limit`);
        return false;
      }
      if (isImg && f.size > MAX_IMAGE_SIZE) {
        toast.error(`"${f.name}" exceeds 10 MB image limit`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadingCount({ done: 0, total: validFiles.length });

    let completed = 0;
    for (const file of validFiles) {
      try {
        const isVid = isVideoFile(file);
        const resourceType = isVid ? "video" : "image";
        const folder = isVid ? "kesariya/products/videos" : "kesariya/products";

        const result = await uploadToCloudinary(file, {
          resourceType,
          folder,
          onProgress: (pct) => setUploadProgress(pct),
        });

        setFormData((prev) => {
          const hasPrimary = prev.images.some(
            (img) => img.isPrimary && !isVideoUrl(img.url) && img.type !== "video"
          );

          return {
            ...prev,
            images: [
              ...prev.images,
              {
                url: result.secureUrl,
                publicId: result.publicId,
                type: isVid ? "video" : "image",
                isPrimary: !isVid && !hasPrimary,
                sortOrder: prev.images.length,
              },
            ],
          };
        });

        completed++;
        setUploadingCount({ done: completed, total: validFiles.length });
      } catch (err: any) {
        toast.error(`Failed to upload "${file.name}": ${err?.message || "Unknown error"}`);
      }
    }

    setIsUploading(false);
    setUploadProgress(0);
    if (completed > 0) {
      toast.success(`${completed} file${completed > 1 ? "s" : ""} uploaded successfully`);
    }
  };

  /* Drag-and-drop handlers */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleMediaUpload(files);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  /* ─── Content block helpers ── */
  const addBlock = () => {
    setFormData((prev) => ({
      ...prev,
      contentBlocks: [
        ...prev.contentBlocks,
        {
          title: "New Section",
          content: "",
          sortOrder: prev.contentBlocks.length,
          isOpen: true,
        },
      ],
    }));
  };

  const removeBlock = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      contentBlocks: prev.contentBlocks
        .filter((_, i) => i !== idx)
        .map((b, i) => ({ ...b, sortOrder: i })),
    }));
  };

  const updateBlock = (
    idx: number,
    key: keyof ContentBlock,
    value: string | boolean | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      contentBlocks: prev.contentBlocks.map((b, i) =>
        i === idx ? { ...b, [key]: value } : b
      ),
    }));
  };

  const toggleBlock = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      contentBlocks: prev.contentBlocks.map((b, i) =>
        i === idx ? { ...b, isOpen: !b.isOpen } : b
      ),
    }));
  };

  /* ─── Variant helpers ── */
  const addVariant = () => {
    setFormData((prev) => {
      const masterSku = prev.sku || "SKU";
      const defaultPrice = prev.basePrice || "0";
      const autoSku = generateVariantSku(masterSku, "", "");
      const newVariants = [
        ...prev.variants,
        {
          _tempId: Math.random().toString(36).slice(2),
          sku: autoSku,
          price: defaultPrice,
          stock: "0",
          color: "",
          colorCode: "#6366f1",
          size: "",
        },
      ];
      const totalVariantStock = newVariants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
      return {
        ...prev,
        stock: totalVariantStock.toString(),
        variants: newVariants,
      };
    });
  };

  const removeVariant = (idx: number) => {
    setFormData((prev) => {
      const newVariants = prev.variants.filter((_, i) => i !== idx);
      const totalVariantStock = newVariants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
      return {
        ...prev,
        stock: newVariants.length > 0 ? totalVariantStock.toString() : prev.stock,
        variants: newVariants,
      };
    });
  };

  const updateVariant = (idx: number, key: keyof ProductVariant, value: string | null) => {
    setFormData((prev) => {
      const newVariants = prev.variants.map((v, i) => {
        if (i !== idx) return v;
        const updated = { ...v, [key]: value ?? "" };
        if (key === "color" || key === "size") {
          updated.sku = generateVariantSku(prev.sku, updated.color, updated.size);
        }
        return updated;
      });

      const totalVariantStock = newVariants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);

      return {
        ...prev,
        stock: newVariants.length > 0 ? totalVariantStock.toString() : prev.stock,
        variants: newVariants,
      };
    });
  };

  /* ─── Submit ── */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error("Product name is required");
    if (!formData.sku.trim()) return toast.error("SKU is required");
    if (!formData.basePrice || isNaN(Number(formData.basePrice)))
      return toast.error("Valid base price is required");

    const payload = {
      name: formData.name,
      slug: formData.slug || generateSlug(formData.name),
      shortDescription: formData.shortDescription || undefined,
      sku: formData.sku,
      basePrice: Number(formData.basePrice),
      salePrice: formData.salePrice ? Number(formData.salePrice) : undefined,
      stock: Number(formData.stock || 0),
      status: formData.status,
      categoryId: formData.categoryId || undefined,
      brandId: formData.brandId || undefined,
      isFeatured: formData.isFeatured,
      isNewArrival: formData.isNewArrival,
      isCustomizable: formData.isCustomizable,
      weight: formData.weight || undefined,
      description: formData.contentBlocks?.[0]?.content || undefined,
      material: formData.contentBlocks?.[1]?.content || formData.material || undefined,
      careInstructions: formData.contentBlocks?.[2]?.content || formData.careInstructions || undefined,
      videoUrl:
        formData.images.find((img) => img.type === "video" || isVideoUrl(img.url))?.url ||
        formData.videoUrl ||
        undefined,
      metaTitle: formData.metaTitle || undefined,
      metaDescription: formData.metaDescription || undefined,
      tags: formData.tags
        ? formData.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
      contentBlocks: (formData.contentBlocks || []).map(({ isOpen, ...b }, idx) => ({
        title: b?.title || (idx === 0 ? "Description" : idx === 1 ? "Details & Materials" : idx === 2 ? "Care Instructions" : `Section ${idx + 1}`),
        content: b?.content || "",
        sortOrder: b?.sortOrder ?? idx,
      })),
      images: formData.images.map((img, idx) => ({
        url: img.url,
        publicId: img.publicId || undefined,
        alt: img.alt || undefined,
        color: img.color || undefined,
        isPrimary: Boolean(img.isPrimary),
        sortOrder: idx,
      })),
      variants: formData.variants
        .filter((v) => v.sku)
        .map((v) => ({
          id: v.id,
          sku: v.sku,
          price: Number(v.price) || 0,
          stock: Number(v.stock) || 0,
          color: v.color || undefined,
          colorCode: v.colorCode || undefined,
          size: v.size || undefined,
          material: v.material || undefined,
        })),
    };

    if (isEdit) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const sections = [
    { id: "basic", label: "Basic Info", icon: <Info size={14} /> },
    { id: "pricing", label: "Pricing & Stock", icon: <DollarSign size={14} /> },
    { id: "media", label: "Media", icon: <ImageIcon size={14} /> },
    { id: "content", label: "Content", icon: <FileText size={14} /> },
    { id: "variants", label: "Variants", icon: <Layers size={14} /> },
    { id: "meta", label: "SEO & Tags", icon: <Tag size={14} /> },
  ];

  if (isEdit && isLoadingProduct) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[220px_1fr] gap-6 items-start">
      {/* ── Left Sidebar Quick Jump (Sticky) ── */}
      <div className="sticky top-20 z-20">
        <Card>
          <CardContent className="p-4">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Jump to section
            </p>
            <nav className="space-y-1">
              {sections.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    document
                      .getElementById(`section-${s.id}`)
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                    setActiveSection(s.id);
                  }}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] font-medium transition-all ${
                    activeSection === s.id
                      ? "bg-primary/12 text-primary font-semibold"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  {s.icon}
                  {s.label}
                </button>
              ))}
            </nav>
            <div className="mt-5 border-t border-border pt-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 text-muted-foreground"
                onClick={() => router.push("/products")}
              >
                <ArrowLeft size={14} /> Back to Products
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Right Form ── */}
      <form onSubmit={handleSubmit} className="space-y-0">
        {/* Sticky Top Action Bar */}
        <Card className="sticky top-20 z-30 mb-6 border-border bg-card/95 backdrop-blur-md shadow-md">
          <CardContent className="flex items-center justify-between p-4 sm:px-6">
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-foreground">
                {isEdit ? "Edit Product" : "New Product"}
              </h1>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {isEdit
                  ? "Update product information and content sections"
                  : "Fill in the details below to create a new product"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={`gap-1.5 ${
                  formData.status === "ACTIVE"
                    ? "border-emerald-500/40 text-emerald-400"
                    : "text-muted-foreground"
                }`}
                onClick={() =>
                  set("status", formData.status === "ACTIVE" ? "DRAFT" : "ACTIVE")
                }
              >
                <Eye size={13} />
                {formData.status === "ACTIVE" ? "Active" : "Draft"}
              </Button>
              <Button type="submit" size="sm" className="gap-1.5" disabled={isPending}>
                {isPending ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Save size={13} />
                )}
                {isPending ? "Saving..." : isEdit ? "Update Product" : "Save Product"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ── Section 1: Basic Information ── */}
        <FormSection id="section-basic" icon={<Info size={16} />} title="Basic Information">
          <FieldRow>
            <div className="space-y-1.5">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Classic Bandhani Kurta"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="slug" className="flex items-center gap-2">
                URL Slug
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  Auto-generated
                </Badge>
              </Label>
              <Input
                id="slug"
                value={formData.slug}
                readOnly
                disabled
                className="font-mono text-xs opacity-70"
                placeholder="auto-generated-from-name"
              />
            </div>
          </FieldRow>

          <div className="space-y-1.5">
            <Label htmlFor="shortDescription">Short Description</Label>
            <Input
              id="shortDescription"
              value={formData.shortDescription}
              onChange={(e) => set("shortDescription", e.target.value)}
              placeholder="Brief product tagline shown in product cards..."
            />
          </div>

          <FieldRow>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Combobox
                options={categories.map((c) => ({ value: c.id, label: c.name }))}
                value={formData.categoryId}
                onValueChange={(v) => set("categoryId", v)}
                placeholder="Select category..."
                searchPlaceholder="Search categories..."
              />
            </div>
            <div className="space-y-1.5">
              <Label>Brand</Label>
              <Combobox
                options={brands.map((b) => ({ value: b.id, label: b.name }))}
                value={formData.brandId}
                onValueChange={(v) => set("brandId", v)}
                placeholder="Select brand..."
                searchPlaceholder="Search brands..."
              />
            </div>
          </FieldRow>

          <FieldRow>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Combobox
                options={[
                  { value: "ACTIVE", label: "Active (Visible on storefront)" },
                  { value: "DRAFT", label: "Draft (Hidden)" },
                  { value: "ARCHIVED", label: "Archived (Discontinued)" },
                ]}
                value={formData.status}
                onValueChange={(v) =>
                  set("status", v as "ACTIVE" | "DRAFT" | "ARCHIVED")
                }
                placeholder="Select status..."
                searchPlaceholder="Search status..."
              />
            </div>
          </FieldRow>

          {/* Toggle badges */}
          <div className="flex flex-wrap gap-6 pt-2">
            {[
              { key: "isFeatured", label: "Featured Product", emoji: "⭐" },
              { key: "isNewArrival", label: "New Arrival", emoji: "🆕" },
              { key: "isCustomizable", label: "Custom Fitting", emoji: "📐" },
            ].map(({ key, label, emoji }) => (
              <label
                key={key}
                className="flex cursor-pointer items-center gap-3 select-none"
              >
                <Switch
                  checked={!!formData[key as keyof ProductFormData]}
                  onCheckedChange={(v) => set(key as keyof ProductFormData, v)}
                />
                <span className="text-sm text-muted-foreground">
                  {emoji} {label}
                </span>
              </label>
            ))}
          </div>
        </FormSection>

        {/* ── Section 2: Pricing & Inventory ── */}
        <FormSection
          id="section-pricing"
          icon={<DollarSign size={16} />}
          title="Pricing & Inventory"
        >
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="space-y-1.5">
              <Label htmlFor="basePrice">Base Price (₹) *</Label>
              <Input
                id="basePrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.basePrice}
                onChange={(e) => set("basePrice", e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="salePrice">Compare-at Price (₹)</Label>
              <Input
                id="salePrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.salePrice}
                onChange={(e) => set("salePrice", e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sku">Master SKU *</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => handleMasterSkuChange(e.target.value)}
                placeholder="KES-001"
                className="font-mono"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="stock" className="flex items-center gap-1.5">
                Total Stock
                {formData.variants.length > 0 && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    Auto-sum ({formData.variants.length} variants)
                  </Badge>
                )}
              </Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => set("stock", e.target.value)}
                readOnly={formData.variants.length > 0}
                disabled={formData.variants.length > 0}
                placeholder="0"
                className={formData.variants.length > 0 ? "opacity-75 font-semibold" : ""}
              />
            </div>
          </div>
        </FormSection>

        {/* ── Section 3: Media Gallery (Unified Images & Videos) ── */}
        <FormSection
          id="section-media"
          icon={<ImageIcon size={16} />}
          title="Media Gallery"
        >
          {/* ── Single Unified Drop Zone for BOTH Images & Videos ── */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-all duration-200 cursor-pointer ${
              isDragOver
                ? "border-primary bg-primary/10 scale-[1.01]"
                : "border-border bg-card/30 hover:border-primary/50 hover:bg-primary/5"
            } ${isUploading ? "pointer-events-none opacity-70" : ""}`}
            onClick={() => !isUploading && imageInputRef.current?.click()}
          >
            <input
              ref={imageInputRef}
              type="file"
              multiple
              accept={`${ACCEPTED_IMAGE_TYPES},${ACCEPTED_VIDEO_TYPES}`}
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleMediaUpload(e.target.files);
                  e.target.value = "";
                }
              }}
            />

            {isUploading ? (
              <div className="flex flex-col items-center gap-3 w-full max-w-xs">
                <Loader2 size={28} className="animate-spin text-primary" />
                <p className="text-sm font-semibold text-foreground">
                  Uploading {uploadingCount.done + 1} of {uploadingCount.total}...
                </p>
                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-violet-500 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground font-mono">{uploadProgress}%</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-primary/15 text-primary mb-3">
                  <CloudUpload size={24} />
                </div>
                <p className="text-sm font-semibold text-foreground mb-1">
                  {isDragOver ? "Drop files here" : "Drag & drop images & videos here"}
                </p>
                <p className="text-xs text-muted-foreground mb-3 text-center">
                  Select multiple Images (JPG, PNG, WebP) or Videos (MP4, WebM) • Max 10MB image / 100MB video
                </p>
                <Button type="button" variant="secondary" size="sm" className="gap-2 pointer-events-none">
                  <Upload size={14} /> Browse Files
                </Button>
              </>
            )}
          </div>

          {/* ── OR paste URL(s) ── */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">or paste media link(s)</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="flex gap-2">
            <Input
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="Paste single or multiple image/video URLs (separated by space or comma)..."
              onKeyDown={(e) =>
                e.key === "Enter" && (e.preventDefault(), addImage())
              }
              className="flex-1"
            />
            <Button type="button" onClick={addImage} variant="secondary" className="shrink-0 gap-1.5">
              <Plus size={14} /> Add Links
            </Button>
          </div>

          {/* ── Combined Media Grid (Images & Videos) ── */}
          {formData.images.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-muted-foreground">
                  {formData.images.length} item{formData.images.length !== 1 ? "s" : ""} (
                  {formData.images.filter((i) => !isVideoUrl(i.url) && i.type !== "video").length} images,{" "}
                  {formData.images.filter((i) => isVideoUrl(i.url) || i.type === "video").length} videos)
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Click <Star size={9} className="inline text-primary" /> on an image to set as primary
                </p>
              </div>

              <div className="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-3">
                {formData.images.map((img, idx) => {
                  const isVid = img.type === "video" || isVideoUrl(img.url);
                  const availableColors = Array.from(
                    new Set(formData.variants.map((v) => v.color).filter(Boolean))
                  ) as string[];

                  return (
                    <div
                      key={idx}
                      className={`group relative aspect-square overflow-hidden rounded-xl border-2 transition-all ${
                        img.isPrimary && !isVid
                          ? "border-primary shadow-[0_0_12px_rgba(99,102,241,0.3)]"
                          : isVid
                          ? "border-violet-500/40 hover:border-violet-500"
                          : "border-border hover:border-primary/40"
                      } bg-card`}
                    >
                      {/* Media Display */}
                      {isVid ? (
                        <div
                          className="relative h-full w-full bg-slate-950 flex items-center justify-center cursor-pointer group/vid"
                          onClick={() => setPreviewVideoUrl(img.url)}
                          onMouseEnter={(e) => {
                            const vid = e.currentTarget.querySelector("video");
                            if (vid) vid.play().catch(() => {});
                          }}
                          onMouseLeave={(e) => {
                            const vid = e.currentTarget.querySelector("video");
                            if (vid) {
                              vid.pause();
                              vid.currentTime = 0;
                            }
                          }}
                        >
                          <video
                            src={img.url}
                            className="h-full w-full object-cover opacity-80"
                            muted
                            loop
                            playsInline
                            preload="metadata"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover/vid:bg-black/10 transition-colors">
                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/90 text-white shadow-xl group-hover/vid:scale-110 transition-transform">
                              <Play size={16} className="ml-0.5" fill="currentColor" />
                            </span>
                          </div>
                        </div>
                      ) : (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={img.url}
                          alt={img.alt || ""}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://placehold.co/110x110/1a1a2e/6366f1?text=IMG";
                          }}
                        />
                      )}

                      {/* Top Badges & Color Tag */}
                      {isVid ? (
                        <span className="absolute left-1 top-1 rounded-md bg-violet-600 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-md flex items-center gap-0.5 z-10">
                          <Film size={9} /> VIDEO
                        </span>
                      ) : (
                        img.isPrimary && (
                          <span className="absolute left-1 top-1 rounded-md bg-primary px-1.5 py-0.5 text-[9px] font-bold text-primary-foreground shadow-md flex items-center gap-0.5 z-10">
                            <Star size={8} fill="currentColor" /> PRIMARY
                          </span>
                        )
                      )}

                      {/* Color Tag Selector */}
                      <div className="absolute right-1 top-1 z-10">
                        <select
                          value={img.color || ""}
                          onChange={(e) => updateImageColor(idx, e.target.value)}
                          className="h-5 rounded bg-black/85 text-[9px] text-white px-1 font-semibold outline-none border border-white/20 cursor-pointer max-w-[65px] truncate"
                          title="Assign image to color variant"
                        >
                          <option value="">All Colors</option>
                          {availableColors.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Hover Overlay Actions */}
                      <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1 bg-gradient-to-t from-black/80 via-black/40 to-transparent pb-2 pt-6 opacity-0 group-hover:opacity-100 transition-opacity">
                        {isVid && (
                          <button
                            type="button"
                            onClick={() => setPreviewVideoUrl(img.url)}
                            title="Preview video"
                            className="rounded-md bg-violet-600/90 p-1.5 text-white hover:bg-violet-600 transition-colors"
                          >
                            <Eye size={12} />
                          </button>
                        )}
                        {!isVid && !img.isPrimary && (
                          <button
                            type="button"
                            onClick={() => setPrimaryImage(idx)}
                            title="Set as primary image"
                            className="rounded-md bg-primary/90 p-1.5 text-white hover:bg-primary transition-colors"
                          >
                            <Star size={12} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          title="Remove media"
                          className="rounded-md bg-destructive/90 p-1.5 text-white hover:bg-destructive transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </FormSection>

        {/* ── Section 4: Dynamic Content Blocks ── */}
        <FormSection
          id="section-content"
          icon={<FileText size={16} />}
          title="Content Sections"
        >
          <p className="text-xs text-muted-foreground">
            Each section appears as a collapsible accordion on the product page. Click the
            title to rename it.
          </p>

          <div className="space-y-3">
            {(formData.contentBlocks || []).map((block, idx) => (
              <div
                key={idx}
                className="overflow-hidden rounded-xl border border-border bg-card/40"
              >
                {/* Accordion header */}
                <div
                  className={`flex items-center gap-2 px-4 py-3 ${
                    block?.isOpen ? "border-b border-border bg-primary/5" : ""
                  }`}
                >
                  <GripVertical
                    size={15}
                    className="shrink-0 cursor-grab text-muted-foreground/50"
                  />
                  <input
                    className="flex-1 bg-transparent text-sm font-semibold text-foreground outline-none placeholder:text-muted-foreground"
                    value={block?.title || ""}
                    onChange={(e) => updateBlock(idx, "title", e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="Section title..."
                  />
                  <div className="flex gap-1.5">
                    {(formData.contentBlocks || []).length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeBlock(idx);
                        }}
                      >
                        <Trash2 size={12} />
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      className="h-7 w-7 p-0 text-primary hover:bg-primary/10"
                      onClick={() => toggleBlock(idx)}
                    >
                      {block?.isOpen ? (
                        <ChevronUp size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Rich text body */}
                {block.isOpen && (
                  <div className="p-3">
                    <RichTextEditor
                      value={block.content}
                      onChange={(html) => updateBlock(idx, "content", html)}
                      placeholder={`Write ${block.title.toLowerCase()} here...`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full gap-2 border-dashed"
            onClick={addBlock}
          >
            <Plus size={14} /> Add Section
          </Button>
        </FormSection>

        {/* ── Section 5: Variants & Sizes ── */}
        <FormSection
          id="section-variants"
          icon={<Layers size={16} />}
          title="Variants & Sizes"
        >
          <p className="text-xs text-muted-foreground">
            Define color/size variants with individual pricing and stock. Leave empty to use
            master SKU stock.
          </p>

          {formData.variants.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border py-8 text-muted-foreground">
              <Package size={24} className="mb-2 opacity-40" />
              <p className="text-sm">No variants added.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {formData.variants.map((v, idx) => (
                <div
                  key={v._tempId || v.id || idx}
                  className="rounded-xl border border-border bg-card/40 p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">
                      Variant {idx + 1}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                      onClick={() => removeVariant(idx)}
                    >
                      <Trash2 size={12} />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                    <div className="space-y-1.5">
                      <Label className="text-[11px]">Color Name</Label>
                      <Input
                        value={v.color || ""}
                        onChange={(e) => updateVariant(idx, "color", e.target.value)}
                        placeholder="e.g. Indigo"
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px]">Color Hex</Label>
                      <div className="flex h-9 items-center gap-2 rounded-lg border border-border bg-card/60 px-2">
                        <input
                          type="color"
                          value={v.colorCode || "#6366f1"}
                          onChange={(e) =>
                            updateVariant(idx, "colorCode", e.target.value)
                          }
                          className="h-6 w-6 cursor-pointer rounded border-0 bg-transparent p-0"
                        />
                        <span className="font-mono text-xs text-muted-foreground">
                          {v.colorCode || "#6366f1"}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px]">Size</Label>
                      <Combobox
                        options={SIZES.map((s) => ({ value: s, label: s }))}
                        value={v.size || ""}
                        onValueChange={(val) => updateVariant(idx, "size", val)}
                        placeholder="Select size..."
                        searchPlaceholder="Search size..."
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px] flex items-center gap-1">
                        Variant SKU *
                        <Badge variant="secondary" className="text-[9px] px-1 py-0 font-normal">
                          Auto
                        </Badge>
                      </Label>
                      <Input
                        value={v.sku}
                        onChange={(e) =>
                          updateVariant(idx, "sku", e.target.value.toUpperCase())
                        }
                        placeholder="KES-001-BLU-M"
                        className="h-8 font-mono text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1.5">
                        <Label className="text-[11px]">Price ₹</Label>
                        <Input
                          type="number"
                          min="0"
                          value={v.price as string}
                          onChange={(e) => updateVariant(idx, "price", e.target.value)}
                          placeholder="0"
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[11px]">Stock</Label>
                        <Input
                          type="number"
                          min="0"
                          value={v.stock as string}
                          onChange={(e) => updateVariant(idx, "stock", e.target.value)}
                          placeholder="0"
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            className="w-full gap-2 border-dashed"
            onClick={addVariant}
          >
            <Plus size={14} /> Add Variant
          </Button>
        </FormSection>

        {/* ── Section 6: SEO & Tags ── */}
        <FormSection id="section-meta" icon={<Tag size={16} />} title="SEO & Tags">
          <div className="space-y-1.5">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => set("tags", e.target.value)}
              placeholder="cotton, kurta, festive, men (comma-separated)"
            />
          </div>
          <FieldRow>
            <div className="space-y-1.5">
              <Label htmlFor="metaTitle">Meta Title (SEO)</Label>
              <Input
                id="metaTitle"
                value={formData.metaTitle}
                onChange={(e) => set("metaTitle", e.target.value)}
                placeholder="SEO page title..."
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="metaDescription">Meta Description (SEO)</Label>
              <Input
                id="metaDescription"
                value={formData.metaDescription}
                onChange={(e) => set("metaDescription", e.target.value)}
                placeholder="SEO meta description..."
              />
            </div>
          </FieldRow>
        </FormSection>

        {/* Bottom Save Bar */}
        <Card>
          <CardContent className="flex justify-end gap-3 p-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/products")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="gap-2">
              {isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Save size={14} />
              )}
              {isPending ? "Saving..." : isEdit ? "Update Product" : "Create Product"}
            </Button>
          </CardContent>
        </Card>
        {/* Video Preview Modal */}
        {previewVideoUrl && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            onClick={() => setPreviewVideoUrl(null)}
          >
            <div
              className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-card border border-border p-2 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 py-2 border-b border-border">
                <span className="text-sm font-bold flex items-center gap-2">
                  <Film size={16} className="text-violet-400" /> Video Preview
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewVideoUrl(null)}
                  className="rounded-lg p-1 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="aspect-video w-full bg-black rounded-xl overflow-hidden mt-2">
                <video
                  src={previewVideoUrl}
                  controls
                  autoPlay
                  className="h-full w-full object-contain"
                />
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
