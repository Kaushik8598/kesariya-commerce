import ProductForm from "@/components/admin/products/product-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Edit Product | Kesariya Admin",
  description: "Edit product details, content sections, images and variants",
};

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;

  return <ProductForm productId={id} />;
}
