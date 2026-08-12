import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

/** Legacy /blog/[slug] — next.config also 301s; safety net. */
export default async function LegacyBlogSlugPage({ params }: Props) {
  const { slug } = await params;
  redirect(`/guides/${slug}`);
}
