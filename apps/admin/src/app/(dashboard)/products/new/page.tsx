import ProductForm from "@/components/products/product-form";

export const metadata = {
  title: "Add New Product | Kesariya Admin",
  description: "Create a new product with full details, images, content sections and variants",
};

export default function NewProductPage() {
  return (
    <div style={{ padding: "32px 40px", minHeight: "100vh" }}>
      <ProductForm />
    </div>
  );
}
