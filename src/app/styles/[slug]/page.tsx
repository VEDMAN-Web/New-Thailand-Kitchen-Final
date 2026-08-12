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

/** Legacy path — next.config redirects /styles/:slug → /kitchens/styles/:slug */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return generateCategoryMetadata(slug, "style", "Style");
}

export default async function StyleCategoryPage({ params }: Props) {
  const { slug } = await params;
  return <CategoryCommercialPage slug={slug} categoryType="style" />;
}
