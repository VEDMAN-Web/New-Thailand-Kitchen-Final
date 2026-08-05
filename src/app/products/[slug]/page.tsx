import { notFound } from "next/navigation";
import ProductDetailView from "../../../component/products/ProductDetailView";
import { productItems } from "../../../component/products/productData";
import {
  fetchMergedProducts,
  fetchProductBySlug,
} from "../../../services/cmsPublic";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const normalized = decodeURIComponent(slug)
    .trim()
    .replace(/^\/+|\/+$/g, "")
    .toLowerCase();
  const product = await fetchProductBySlug(normalized);

  if (!product) {
    const fromStatic = productItems.find(
      (p) => p.slug.trim().replace(/^\/+|\/+$/g, "").toLowerCase() === normalized
    );
    if (!fromStatic) notFound();
    return (
      <main className="w-full">
        <ProductDetailView product={fromStatic} />
      </main>
    );
  }

  return (
    <main className="w-full">
      <ProductDetailView product={product} />
    </main>
  );
}
