/**
 * Normalize Thailand home sections into Varsovia-style {en,th,pl} text maps.
 * Legacy plain strings become { en: string, th: "", pl: "" } then merge with defaults
 * so empty th/pl inherit from seeded i18n defaults.
 */
const { DEFAULT_HOME_SECTIONS } = require("../seed/thailandSiteDefaults");
const { mergeLocalized, mergeLocalizedFillEmpty, asLocalized } = require("./localized");

function mergeLinkList(raw, fallback) {
  const fb = Array.isArray(fallback) ? fallback : [];
  if (!Array.isArray(raw) || !raw.length) {
    return fb.map((l) => ({
      label: mergeLocalized(l.label, l.label),
      href: String(l.href || "").trim(),
    }));
  }
  return raw.map((l, i) => ({
    label: mergeLocalized(l?.label, fb[i]?.label || ""),
    href: String(l?.href || fb[i]?.href || "").trim(),
  }));
}

function normalizeLocalizedHomeSections(raw = {}) {
  const defaults = structuredClone(DEFAULT_HOME_SECTIONS);
  const src = raw && typeof raw === "object" ? raw : {};

  const heroSrc = src.hero || {};
  const hero = {
    subtitle: mergeLocalized(
      heroSrc.subtitle || heroSrc.eyebrow,
      defaults.hero.subtitle
    ),
    title: mergeLocalized(heroSrc.title, defaults.hero.title),
    description: mergeLocalized(
      heroSrc.description,
      defaults.hero.description
    ),
    buttonText: mergeLocalized(
      heroSrc.buttonText || heroSrc.cta,
      defaults.hero.buttonText
    ),
    image: String(heroSrc.image || defaults.hero.image || "").trim(),
    videoUrl: String(heroSrc.videoUrl || "").trim(),
  };

  const storySrc = src.story || {};
  const story = {
    title: mergeLocalized(storySrc.title, defaults.story.title),
    subtitle: mergeLocalized(storySrc.subtitle, defaults.story.subtitle),
    description: mergeLocalized(
      storySrc.description || storySrc.text,
      defaults.story.description
    ),
    image: String(storySrc.image || defaults.story.image || "").trim(),
  };

  const transitionSrc = src.transition || {};
  const pillarsRaw = Array.isArray(transitionSrc.pillars)
    ? transitionSrc.pillars
    : Array.isArray(transitionSrc.items)
      ? transitionSrc.items
      : [];
  const transition = {
    pillars:
      pillarsRaw.length > 0
        ? pillarsRaw.map((p, i) => ({
            title: mergeLocalized(
              p.title,
              defaults.transition.pillars[i]?.title || ""
            ),
            description: mergeLocalized(
              p.description,
              defaults.transition.pillars[i]?.description || ""
            ),
            icon: String(p.icon || "").trim(),
          }))
        : defaults.transition.pillars,
  };

  const partnersSrc = src.partners || {};
  const logosRaw = Array.isArray(partnersSrc.logos)
    ? partnersSrc.logos
    : Array.isArray(partnersSrc.items)
      ? partnersSrc.items
      : [];
  const mappedLogos = logosRaw
    .map((l) => ({
      name: String(l.name || l.title || "Partner"),
      image: String(l.image || l.logo || "").trim(),
    }))
    .filter(
      (l) =>
        l.image &&
        !l.image.includes("/brand/brand.png") &&
        l.image !== "/brand/brand.png"
    );
  const partners = {
    logos: mappedLogos.length > 0 ? mappedLogos : defaults.partners.logos,
  };

  const statsItems =
    Array.isArray(src.statistics?.items) && src.statistics.items.length
      ? src.statistics.items.map((it, i) => ({
          label: mergeLocalized(
            it.label,
            defaults.statistics.items[i]?.label || ""
          ),
          value: String(it.value || "").replace(/\+$/, "") || it.value || "",
          suffix: String(
            it.suffix != null && typeof it.suffix !== "object"
              ? it.suffix
              : String(it.value || "").endsWith("+")
                ? "+"
                : ""
          ),
        }))
      : defaults.statistics.items;

  const advantagesSrc = src.advantages || {};
  const advantagesItemsRaw =
    Array.isArray(advantagesSrc.items) && advantagesSrc.items.length
      ? advantagesSrc.items
      : defaults.advantages.items;
  const advantages = {
    eyebrow: mergeLocalized(
      advantagesSrc.eyebrow,
      defaults.advantages.eyebrow
    ),
    title: mergeLocalized(advantagesSrc.title, defaults.advantages.title),
    items: advantagesItemsRaw.map((it, i) => ({
      title: mergeLocalized(it.title, defaults.advantages.items[i]?.title || ""),
      description: mergeLocalized(
        it.description,
        defaults.advantages.items[i]?.description || ""
      ),
      icon: String(it.icon || "").trim(),
    })),
  };

  const testimonialsSrc = src.testimonials || {};
  const testimonialsItemsRaw =
    Array.isArray(testimonialsSrc.items) && testimonialsSrc.items.length
      ? testimonialsSrc.items
      : defaults.testimonials.items;
  const testimonials = {
    eyebrow: mergeLocalized(
      testimonialsSrc.eyebrow,
      defaults.testimonials.eyebrow
    ),
    title: mergeLocalized(
      testimonialsSrc.title,
      defaults.testimonials.title
    ),
    items: testimonialsItemsRaw.map((it, i) => ({
      name: mergeLocalized(
        it.name,
        defaults.testimonials.items[i]?.name || ""
      ),
      role: mergeLocalized(
        it.role,
        defaults.testimonials.items[i]?.role || ""
      ),
      quote: mergeLocalized(
        it.quote,
        defaults.testimonials.items[i]?.quote || ""
      ),
      image: String(
        it.image || defaults.testimonials.items[i]?.image || ""
      ).trim(),
      rating: Number(it.rating) || 5,
    })),
  };

  const catalogueSrc = src.catalogue || {};
  const catalogueItemsRaw =
    Array.isArray(catalogueSrc.items) && catalogueSrc.items.length
      ? catalogueSrc.items
      : defaults.catalogue.items;
  const catalogue = {
    eyebrow: mergeLocalized(catalogueSrc.eyebrow, defaults.catalogue.eyebrow),
    title: mergeLocalized(catalogueSrc.title, defaults.catalogue.title),
    items: catalogueItemsRaw.map((c, i) => ({
      title: mergeLocalized(c.title, defaults.catalogue.items[i]?.title || "Catalogue"),
      category: mergeLocalized(
        c.category,
        defaults.catalogue.items[i]?.category || ""
      ),
      image: String(c.image || defaults.catalogue.items[i]?.image || "").trim(),
      pdfUrl: String(c.pdfUrl || "").trim(),
      fileName: String(c.fileName || defaults.catalogue.items[i]?.fileName || "").trim(),
      downloadName: String(
        c.downloadName ||
          c.fileName ||
          defaults.catalogue.items[i]?.downloadName ||
          ""
      ).trim(),
    })),
  };

  const faqItemsRaw =
    Array.isArray(src.faq?.items) && src.faq.items.length
      ? src.faq.items
      : defaults.faq.items;
  const faqSrc = src.faq || {};
  const faq = {
    eyebrow: mergeLocalizedFillEmpty(
      faqSrc.eyebrow,
      defaults.faq.eyebrow || ""
    ),
    title: mergeLocalizedFillEmpty(faqSrc.title, defaults.faq.title || ""),
    items: faqItemsRaw.map((it, i) => ({
      question: mergeLocalized(
        it.question,
        defaults.faq.items[i]?.question || ""
      ),
      answer: mergeLocalized(it.answer, defaults.faq.items[i]?.answer || ""),
    })),
  };

  const footerSrc = src.footer || {};
  const footer = {
    email: String(footerSrc.email || defaults.footer.email || "").trim(),
    phone: String(footerSrc.phone || defaults.footer.phone || "").trim(),
    address: mergeLocalized(footerSrc.address, defaults.footer.address),
    facebook: String(footerSrc.facebook || defaults.footer.facebook || "").trim(),
    instagram: String(
      footerSrc.instagram || defaults.footer.instagram || ""
    ).trim(),
    line: String(footerSrc.line || defaults.footer.line || "").trim(),
    logoUrl: String(footerSrc.logoUrl || defaults.footer.logoUrl || "").trim(),
    tagline: mergeLocalized(footerSrc.tagline, defaults.footer.tagline),
    homeColumnTitle: mergeLocalized(
      footerSrc.homeColumnTitle,
      defaults.footer.homeColumnTitle
    ),
    productColumnTitle: mergeLocalized(
      footerSrc.productColumnTitle,
      defaults.footer.productColumnTitle
    ),
    homeLinks: mergeLinkList(footerSrc.homeLinks, defaults.footer.homeLinks),
    productLinks: mergeLinkList(
      footerSrc.productLinks,
      defaults.footer.productLinks
    ),
  };

  const navSrc = src.nav || {};
  const nav = {
    consultationLabel: mergeLocalized(
      navSrc.consultationLabel,
      defaults.nav.consultationLabel
    ),
    searchPlaceholder: mergeLocalized(
      navSrc.searchPlaceholder,
      defaults.nav.searchPlaceholder
    ),
    links: mergeLinkList(navSrc.links, defaults.nav.links),
  };

  const seoSrc = src.seo || {};
  const seo = {
    title: mergeLocalized(seoSrc.title, defaults.seo.title),
    description: mergeLocalized(seoSrc.description, defaults.seo.description),
    ogImage: String(seoSrc.ogImage || defaults.seo.ogImage || "").trim(),
  };

  const galleryPageSrc = src.galleryPage || {};
  const collageRaw = Array.isArray(galleryPageSrc.collage)
    ? galleryPageSrc.collage.map((c) => String(c || "").trim()).filter(Boolean)
    : [];
  const filtersRaw = Array.isArray(galleryPageSrc.filters)
    ? galleryPageSrc.filters
    : [];
  const galleryPage = {
    eyebrow: mergeLocalizedFillEmpty(
      galleryPageSrc.eyebrow,
      defaults.galleryPage.eyebrow
    ),
    title: mergeLocalizedFillEmpty(
      galleryPageSrc.title,
      defaults.galleryPage.title
    ),
    description: mergeLocalizedFillEmpty(
      galleryPageSrc.description,
      defaults.galleryPage.description
    ),
    collage:
      collageRaw.length > 0 ? collageRaw : defaults.galleryPage.collage,
    filters:
      filtersRaw.length > 0
        ? filtersRaw
            .map((f, i) => ({
              id: String(f?.id || defaults.galleryPage.filters[i]?.id || "").trim(),
              label: mergeLocalizedFillEmpty(
                f?.label || f?.id,
                defaults.galleryPage.filters[i]?.label || ""
              ),
            }))
            .filter((f) => f.id)
        : defaults.galleryPage.filters,
  };

  const productsPageSrc = src.productsPage || {};
  const productsPage = {
    label: mergeLocalizedFillEmpty(
      productsPageSrc.label,
      defaults.productsPage.label
    ),
    title: mergeLocalizedFillEmpty(
      productsPageSrc.title,
      defaults.productsPage.title
    ),
    videoUrl: String(
      productsPageSrc.videoUrl || defaults.productsPage.videoUrl || ""
    ).trim(),
    homeEyebrow: mergeLocalizedFillEmpty(
      productsPageSrc.homeEyebrow,
      defaults.productsPage.homeEyebrow
    ),
    homeTitle: mergeLocalizedFillEmpty(
      productsPageSrc.homeTitle,
      defaults.productsPage.homeTitle
    ),
    homeCta: mergeLocalizedFillEmpty(
      productsPageSrc.homeCta,
      defaults.productsPage.homeCta
    ),
  };

  const blogPageSrc = src.blogPage || {};
  const shareLinksRaw = Array.isArray(blogPageSrc.shareLinks)
    ? blogPageSrc.shareLinks
    : [];
  const blogPage = {
    eyebrow: mergeLocalizedFillEmpty(
      blogPageSrc.eyebrow,
      defaults.blogPage.eyebrow
    ),
    title: mergeLocalizedFillEmpty(blogPageSrc.title, defaults.blogPage.title),
    videoUrl: String(
      blogPageSrc.videoUrl || defaults.blogPage.videoUrl || ""
    ).trim(),
    relatedTitle: mergeLocalizedFillEmpty(
      blogPageSrc.relatedTitle,
      defaults.blogPage.relatedTitle
    ),
    shareLinks:
      shareLinksRaw.length > 0
        ? shareLinksRaw
            .map((l, i) => ({
              label: mergeLocalizedFillEmpty(
                l?.label,
                defaults.blogPage.shareLinks[i]?.label || ""
              ),
              href: String(
                l?.href || defaults.blogPage.shareLinks[i]?.href || ""
              ).trim(),
            }))
            .filter((l) => asLocalized(l.label).en || asLocalized(l.label).th)
        : defaults.blogPage.shareLinks,
  };

  const faqPageSrc = src.faqPage || {};
  const faqPage = {
    eyebrow: mergeLocalizedFillEmpty(
      faqPageSrc.eyebrow,
      defaults.faqPage.eyebrow
    ),
    title: mergeLocalizedFillEmpty(faqPageSrc.title, defaults.faqPage.title),
    videoUrl: String(
      faqPageSrc.videoUrl || defaults.faqPage.videoUrl || ""
    ).trim(),
  };

  const contactPageSrc = src.contactPage || {};
  const contactLocationsRaw = Array.isArray(contactPageSrc.locations)
    ? contactPageSrc.locations
    : [];
  const contactLocations =
    contactLocationsRaw.length > 0
      ? contactLocationsRaw.map((loc, i) => ({
          title: mergeLocalized(
            loc?.title,
            defaults.contactPage.locations[i]?.title || ""
          ),
          address: mergeLocalized(
            loc?.address,
            defaults.contactPage.locations[i]?.address || ""
          ),
        }))
      : defaults.contactPage.locations;
  const contactPage = {
    title: mergeLocalized(contactPageSrc.title, defaults.contactPage.title),
    titleAccent: mergeLocalized(
      contactPageSrc.titleAccent,
      defaults.contactPage.titleAccent
    ),
    description: mergeLocalized(
      contactPageSrc.description,
      defaults.contactPage.description
    ),
    videoUrl: String(
      contactPageSrc.videoUrl || defaults.contactPage.videoUrl || ""
    ).trim(),
    craftImage: String(
      contactPageSrc.craftImage || defaults.contactPage.craftImage || ""
    ).trim(),
    email: String(
      contactPageSrc.email || defaults.contactPage.email || ""
    ).trim(),
    phone: String(
      contactPageSrc.phone || defaults.contactPage.phone || ""
    ).trim(),
    locations: contactLocations,
  };

  return {
    hero,
    statistics: { items: statsItems },
    advantages,
    story,
    transition,
    testimonials,
    catalogue,
    partners,
    faq,
    footer,
    nav,
    seo,
    galleryPage,
    productsPage,
    blogPage,
    faqPage,
    contactPage,
  };
}

module.exports = { normalizeLocalizedHomeSections };
