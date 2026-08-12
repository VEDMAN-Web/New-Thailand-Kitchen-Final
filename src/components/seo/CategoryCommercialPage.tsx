import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CategoryLandingView from "./CategoryLandingView";
import Breadcrumbs from "./Breadcrumbs";
import JsonLd from "./JsonLd";
import {
  projectTitleFromCms,
  type RelatedProjectItem,
} from "./RelatedProjects";
import {
  getCategoryBySlug,
  getLocationServiceCategory,
  getRelatedGalleryProjects,
  type CategoryTypeFilter,
  type CmsCategory,
} from "../../services/cmsPublic";
import { pickCmsText } from "../../lib/cmsText";
import {
  categoryBreadcrumbTrail,
  categoryPublicPath,
  categorySectionLabel,
  type CategoryType,
} from "../../lib/categoryRoutes";
import { absoluteUrl, SITE_ORIGIN } from "../../lib/siteUrl";

function normalizeSlug(slug: string) {
  return String(slug || "")
    .trim()
    .replace(/^\/+|\/+$/g, "")
    .toLowerCase();
}

function parentSlugOf(category: CmsCategory): string {
  const parent = category.parentId;
  if (parent && typeof parent === "object" && "slug" in parent) {
    return normalizeSlug(String((parent as { slug?: string }).slug || ""));
  }
  return "";
}

function parentTitleOf(category: CmsCategory): string {
  const parent = category.parentId;
  if (parent && typeof parent === "object" && "title" in parent) {
    return pickCmsText((parent as { title?: unknown }).title, "", "EN");
  }
  return "";
}

export async function generateCategoryMetadata(
  slug: string,
  categoryType: CategoryTypeFilter,
  fallbackLabel: string,
  parentLocationSlug?: string
): Promise<Metadata> {
  const normalized = normalizeSlug(decodeURIComponent(slug));
  const category = parentLocationSlug
    ? await getLocationServiceCategory(
        normalizeSlug(parentLocationSlug),
        normalized
      )
    : await getCategoryBySlug(normalized, categoryType);

  if (!category) {
    return { title: `${fallbackLabel} Not Found` };
  }

  const title =
    category.metaTitle ||
    `${pickCmsText(category.title, "", "EN")} | Thailand Kitchens`;
  const description =
    category.metaDescription || pickCmsText(category.description, "", "EN");

  const path = categoryPublicPath(category);
  const metadata: Metadata = {
    title,
    description,
    alternates: {
      canonical: category.canonicalUrl || absoluteUrl(path),
    },
  };

  if (category.indexable === false) {
    metadata.robots = { index: false, follow: true };
  }

  return metadata;
}

export async function CategoryCommercialPage({
  slug,
  categoryType,
  parentLocationSlug,
}: {
  slug: string;
  categoryType: CategoryType;
  /** When set, resolve location × service under /locations/{location}/{service} */
  parentLocationSlug?: string;
}) {
  const normalized = normalizeSlug(decodeURIComponent(slug));
  const locationSlug = parentLocationSlug
    ? normalizeSlug(decodeURIComponent(parentLocationSlug))
    : "";

  const category = locationSlug
    ? await getLocationServiceCategory(locationSlug, normalized)
    : await getCategoryBySlug(normalized, categoryType as CategoryTypeFilter);

  if (!category) {
    notFound();
  }

  // Guard: nested route must be a service with that location parent
  if (locationSlug) {
    if (category.categoryType !== "service") notFound();
    if (parentSlugOf(category) !== locationSlug) notFound();
  }

  const categoryTitle = pickCmsText(
    category.title,
    categorySectionLabel(categoryType),
    "EN"
  );
  const description = pickCmsText(category.description, "", "EN");
  const relatedRaw = await getRelatedGalleryProjects(categoryType, {
    slug: normalized,
    title: categoryTitle,
    locationSlug: locationSlug || parentSlugOf(category) || undefined,
  });
  const related: RelatedProjectItem[] = relatedRaw.map((g) => ({
    id: String(g.id),
    image: g.image,
    title: projectTitleFromCms(g),
    description: g.projectDesc || undefined,
    href: "/gallery",
  }));

  const locSlug = locationSlug || parentSlugOf(category);
  const locTitle = parentTitleOf(category) || locSlug;
  const trail = categoryBreadcrumbTrail(categoryType, {
    locationSlug: categoryType === "service" ? locSlug || undefined : undefined,
    locationTitle: locTitle || undefined,
  });
  const pagePath = categoryPublicPath(category);
  const pageUrl = absoluteUrl(pagePath);

  return (
    <main className="w-full">
      <Breadcrumbs
        items={trail}
        currentPage={categoryTitle}
        currentHref={pagePath}
      />
      {categoryType === "service" ? (
        <JsonLd
          type="Service"
          data={{
            name: categoryTitle,
            description: description || categoryTitle,
            provider: "Thailand Kitchens",
            url: pageUrl,
            areaServed: locTitle || undefined,
          }}
        />
      ) : null}
      {categoryType === "location" ? (
        <JsonLd
          type="LocalBusiness"
          data={{
            name: `Thailand Kitchens — ${categoryTitle}`,
            description: description || categoryTitle,
            url: pageUrl,
            image: category.image || `${SITE_ORIGIN}/icon.png`,
            areaServed: categoryTitle,
          }}
        />
      ) : null}
      <CategoryLandingView
        category={category}
        related={related}
        sectionLabel={categorySectionLabel(categoryType)}
      />
    </main>
  );
}
