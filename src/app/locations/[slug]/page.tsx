import type { Metadata } from "next";
import {
  CategoryCommercialPage,
  generateCategoryMetadata,
} from "../../../components/seo/CategoryCommercialPage";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return generateCategoryMetadata(slug, "location", "Location");
}

export default async function LocationCategoryPage({ params }: Props) {
  const { slug } = await params;
  return <CategoryCommercialPage slug={slug} categoryType="location" />;
}
