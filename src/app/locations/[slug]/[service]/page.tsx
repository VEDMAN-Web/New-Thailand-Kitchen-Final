import type { Metadata } from "next";
import {
  CategoryCommercialPage,
  generateCategoryMetadata,
} from "../../../../components/seo/CategoryCommercialPage";

interface Props {
  params: Promise<{ slug: string; service: string }>;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, service } = await params;
  return generateCategoryMetadata(
    service,
    "service",
    "Service",
    slug
  );
}

/** Location × service page: /locations/{location}/{service} */
export default async function LocationServicePage({ params }: Props) {
  const { slug, service } = await params;
  return (
    <CategoryCommercialPage
      slug={service}
      categoryType="service"
      parentLocationSlug={slug}
    />
  );
}
