/**
 * CMS-shaped overlays of what live /th and /pl actually show
 * (Varsovia message catalogs + IA phrase map).
 */
import { isLocaleMap } from "@/lib/localized";
import LIVE_IA_PAGES from "./iaPagesSeed.json";
import thBase from "./liveMessages/th.json";
import plBase from "./liveMessages/pl.json";
import thExtra from "./liveMessages/th.extra.json";
import plExtra from "./liveMessages/pl.extra.json";
import legalTh from "./liveMessages/legal.th.json";
import legalPl from "./liveMessages/legal.pl.json";
import blogTh from "./liveMessages/blog.content.th.json";
import blogPl from "./liveMessages/blog.content.pl.json";
import faqTh from "./liveMessages/faq.content.th.json";
import faqPl from "./liveMessages/faq.content.pl.json";

type Dict = Record<string, unknown>;
type Msg = Record<string, any>;

function isPlainObject(value: unknown): value is Dict {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function mergeDeep(base: unknown, extra: unknown): unknown {
  if (!isPlainObject(base) || !isPlainObject(extra)) return extra ?? base;
  const out: Dict = { ...base };
  for (const [key, value] of Object.entries(extra)) {
    out[key] = isPlainObject(out[key]) && isPlainObject(value)
      ? mergeDeep(out[key], value)
      : value;
  }
  return out;
}

function messagesFor(locale: "th" | "pl"): Msg {
  const base = locale === "th" ? thBase : plBase;
  const extra = locale === "th" ? thExtra : plExtra;
  const legal = locale === "th" ? legalTh : legalPl;
  return mergeDeep(mergeDeep(base, extra), legal) as Msg;
}

const PHRASES: Record<"th" | "pl", Record<string, string>> = {
  th: {
    "Get a consultation": "ปรึกษาฟรี",
    "Explore": "สำรวจ",
    "Furniture": "เฟอร์นิเจอร์",
    "Interior": "อินทีเรีย",
    "Interior Design": "ออกแบบอินทีเรีย",
    "Showcase": "ผลงาน",
    "Locations": "สถานที่",
    "About": "เกี่ยวกับเรา",
    "About Us": "เกี่ยวกับเรา",
    "Services": "บริการ",
    "Complete Interiors": "อินทีเรียครบวงจร",
    "For Developers": "สำหรับนักพัฒนา",
    "Journal": "วารสาร",
    "Free Catalogue": "แคตตาล็อกฟรี",
    "Our Team": "ทีมของเรา",
    "Quality After Sales": "บริการหลังการขาย",
    "Contact": "ติดต่อ",
    "Contact Us": "ติดต่อเรา",
    "FAQ": "คำถามที่พบบ่อย",
    "Privacy": "ความเป็นส่วนตัว",
    "Privacy Policy": "นโยบายความเป็นส่วนตัว",
    "Terms": "ข้อกำหนด",
    "Kitchens": "ครัว",
    "Kitchen": "ครัว",
    "Wardrobes": "ตู้เสื้อผ้า",
    "Living Room": "ห้องนั่งเล่น",
    "Bedrooms": "ห้องนอน",
    "Bedroom": "ห้องนอน",
    "Bathroom": "ห้องน้ำ",
    "Dining": "ห้องอาหาร",
    "Doors": "ประตู",
    "Doors & Windows": "ประตูและหน้าต่าง",
    "Whole House": "ทั้งบ้าน",
    "Koh Samui": "เกาะสมุย",
    "Phuket": "ภูเก็ต",
    "Bangkok": "กรุงเทพฯ",
    "Pattaya": "พัทยา",
    "Hua Hin": "หัวหิน",
    "Chiang Mai": "เชียงใหม่",
    "Our locations": "สถานที่ของเรา",
    "Choose a city to see services and local projects.":
      "เลือกเมืองเพื่อดูบริการและผลงานในพื้นที่",
    "Services in this location": "บริการในพื้นที่นี้",
    "How we support homes and projects here.": "วิธีที่เราดูแลบ้านและโครงการที่นี่",
    "Related projects": "ผลงานที่เกี่ยวข้อง",
    "Locations | Varsovia Design": "สถานที่ | Varsovia Design",
    "Koh Samui | Varsovia Design": "เกาะสมุย | Varsovia Design",
    "Phuket | Varsovia Design": "ภูเก็ต | Varsovia Design",
    "Bangkok | Varsovia Design": "กรุงเทพฯ | Varsovia Design",
    "Pattaya | Varsovia Design": "พัทยา | Varsovia Design",
    "Hua Hin | Varsovia Design": "หัวหิน | Varsovia Design",
    "Chiang Mai | Varsovia Design": "เชียงใหม่ | Varsovia Design",
    "Home": "หน้าแรก",
    "Company": "บริษัท",
    "Projects": "ผลงาน",
    "Livo": "Livo",
    "Oppolia": "Oppolia",
  },
  pl: {
    "Get a consultation": "Bezpłatna konsultacja",
    "Explore": "Odkryj",
    "Furniture": "Meble",
    "Interior": "Wnętrza",
    "Interior Design": "Projektowanie wnętrz",
    "Showcase": "Realizacje",
    "Locations": "Lokalizacje",
    "About": "O nas",
    "About Us": "O nas",
    "Services": "Usługi",
    "Complete Interiors": "Kompleksowe wnętrza",
    "For Developers": "Dla deweloperów",
    "Journal": "Dziennik",
    "Free Catalogue": "Darmowy katalog",
    "Our Team": "Nasz zespół",
    "Quality After Sales": "Serwis posprzedażowy",
    "Contact": "Kontakt",
    "Contact Us": "Kontakt",
    "FAQ": "FAQ",
    "Privacy": "Prywatność",
    "Privacy Policy": "Polityka prywatności",
    "Terms": "Regulamin",
    "Kitchens": "Kuchnie",
    "Kitchen": "Kuchnia",
    "Wardrobes": "Szafy",
    "Living Room": "Salon",
    "Bedrooms": "Sypialnie",
    "Bedroom": "Sypialnia",
    "Bathroom": "Łazienka",
    "Dining": "Jadalnia",
    "Doors": "Drzwi",
    "Doors & Windows": "Drzwi i okna",
    "Whole House": "Cały dom",
    "Koh Samui": "Koh Samui",
    "Phuket": "Phuket",
    "Bangkok": "Bangkok",
    "Pattaya": "Pattaya",
    "Hua Hin": "Hua Hin",
    "Chiang Mai": "Chiang Mai",
    "Our locations": "Nasze lokalizacje",
    "Choose a city to see services and local projects.":
      "Wybierz miasto, aby zobaczyć usługi i realizacje.",
    "Services in this location": "Usługi w tej lokalizacji",
    "How we support homes and projects here.": "Jak wspieramy domy i projekty tutaj.",
    "Related projects": "Powiązane realizacje",
    "Locations | Varsovia Design": "Lokalizacje | Varsovia Design",
    "Koh Samui | Varsovia Design": "Koh Samui | Varsovia Design",
    "Phuket | Varsovia Design": "Phuket | Varsovia Design",
    "Bangkok | Varsovia Design": "Bangkok | Varsovia Design",
    "Pattaya | Varsovia Design": "Pattaya | Varsovia Design",
    "Hua Hin | Varsovia Design": "Hua Hin | Varsovia Design",
    "Chiang Mai | Varsovia Design": "Chiang Mai | Varsovia Design",
    "Home": "Strona główna",
    "Company": "Firma",
    "Projects": "Realizacje",
    "Livo": "Livo",
    "Oppolia": "Oppolia",
  },
};

function phrase(locale: "th" | "pl", english: string, fallback = ""): string {
  return PHRASES[locale][english] || fallback;
}

function iaOverlayFromSeed(seed: unknown, locale: "th" | "pl"): unknown {
  if (Array.isArray(seed)) {
    return seed.map((item) => iaOverlayFromSeed(item, locale));
  }
  if (isLocaleMap(seed)) {
    const map = seed as Record<string, string>;
    const en = String(map.en || "").trim();
    const stored = String(map[locale] || "").trim();
    if (stored && stored !== en) return stored;
    return phrase(locale, en, "");
  }
  if (isPlainObject(seed)) {
    const out: Dict = {};
    for (const [key, value] of Object.entries(seed)) {
      if (key === "image" || key === "ctaHref" || key === "href") continue;
      out[key] = iaOverlayFromSeed(value, locale);
    }
    return out;
  }
  return seed;
}

function legalOverlay(legal: Msg): Dict {
  const page = (block: Msg | undefined) => {
    if (!block) return {};
    return {
      title: block.title,
      subtitle: block.subtitle,
      metaTitle: block.title,
      metaDescription: block.metaDescription,
      updated: block.updated,
      blocks: Array.isArray(block.blocks)
        ? block.blocks.map((row: Msg) => ({ heading: row.heading, text: row.text }))
        : [],
    };
  };
  return {
    privacy: page(legal?.privacy),
    terms: page(legal?.terms),
  };
}

function navOverlay(m: Msg, locale: "th" | "pl"): Dict {
  const nav = m.nav || {};
  const drop = m.navDropdown || {};
  const showcase = m.showcase || {};
  const tabs = showcase.tabLabels || {};
  const cat = m.categories || {};
  const extraNav = {
    language: nav.language,
    byRoom: nav.byRoom,
    companySection: nav.companySection,
    supportSection: nav.supportSection,
  };

  const link = (href: string, title: string, subtitle = "") => ({
    href,
    title,
    label: title,
    subtitle: subtitle || drop[href] || "",
  });

  return {
    items: [
      { id: "home", href: "/", label: nav.home || phrase(locale, "Home") },
      {
        id: "furniture",
        href: "/furniture",
        label: nav.furniture || phrase(locale, "Furniture"),
        menu: {
          featuredLabel: nav.furniture || phrase(locale, "Furniture"),
          featuredSubtitle: drop["/furniture"] || "",
          sectionLabel: extraNav.byRoom || phrase(locale, "Explore"),
          links: [
            link("/furniture/kitchens", cat.kitchen || phrase(locale, "Kitchens"), drop["/furniture/kitchens"]),
            link("/furniture/wardrobes", phrase(locale, "Wardrobes"), drop["/furniture/wardrobes"]),
            link("/furniture/living-room", phrase(locale, "Living Room"), drop["/furniture/living-room"]),
            link("/furniture/bedrooms", cat.bedroom || phrase(locale, "Bedrooms"), drop["/furniture/bedrooms"]),
            link("/furniture/bathroom", cat.bathroom || phrase(locale, "Bathroom"), drop["/furniture/bathroom"]),
            link("/furniture/dining", phrase(locale, "Dining"), drop["/furniture/dining"]),
            link("/furniture/doors", phrase(locale, "Doors"), drop["/furniture/doors"]),
            link("/furniture/whole-house", cat.wholeHouse || phrase(locale, "Whole House"), drop["/furniture/whole-house"]),
          ],
        },
      },
      {
        id: "interior",
        href: "/interior-design",
        label: nav.interior || phrase(locale, "Interior"),
        menu: {
          featuredLabel: nav.allInteriors || phrase(locale, "Interior"),
          featuredSubtitle: drop["/interior-design"] || "",
          sectionLabel: extraNav.byRoom || "",
          links: [
            link("/interior-design?category=Kitchen", cat.kitchen || phrase(locale, "Kitchen"), drop["/interior-design?category=Kitchen"]),
            link("/interior-design?category=Bedroom", cat.bedroom || phrase(locale, "Bedroom"), drop["/interior-design?category=Bedroom"]),
            link("/interior-design?category=Bathroom", cat.bathroom || phrase(locale, "Bathroom"), drop["/interior-design?category=Bathroom"]),
            link("/interior-design?category=Door%20%26%20Windows", cat.doorWindows || phrase(locale, "Doors & Windows"), drop["/interior-design?category=Door%20%26%20Windows"]),
            link("/interior-design?category=Whole%20House%20Solutions", cat.wholeHouse || phrase(locale, "Whole House"), drop["/interior-design?category=Whole%20House%20Solutions"]),
          ],
        },
      },
      {
        id: "showcase",
        href: "/projects",
        label: nav.showcase || phrase(locale, "Showcase"),
        menu: {
          featuredLabel: showcase.navFeaturedTitle || phrase(locale, "Showcase"),
          featuredSubtitle: showcase.navEverySpace || drop["/projects"] || "",
          sectionLabel: showcase.navByRegion || "",
          links: [
            link("/projects?tab=Home%20case", tabs.homeCase || "Home Case", showcase.categoryMeta?.homeCase?.subtitle),
            link("/projects?tab=North%20America", tabs.northAmerica, showcase.categoryMeta?.northAmerica?.subtitle),
            link("/projects?tab=South%20America", tabs.southAmerica, showcase.categoryMeta?.southAmerica?.subtitle),
            link("/projects?tab=Africa", tabs.africa, showcase.categoryMeta?.africa?.subtitle),
            link("/projects?tab=Commercial%20Project", tabs.commercialProject, showcase.categoryMeta?.commercialProject?.subtitle),
            link("/projects?tab=Europe", tabs.europe, showcase.categoryMeta?.europe?.subtitle),
            link("/projects?tab=Australia", tabs.australia, showcase.categoryMeta?.australia?.subtitle),
            link("/projects?tab=Middle%20East", tabs.middleEast, showcase.categoryMeta?.middleEast?.subtitle),
            link("/projects?tab=Asia", tabs.asia, showcase.categoryMeta?.asia?.subtitle),
          ],
        },
      },
      {
        id: "locations",
        href: "/locations",
        label: phrase(locale, "Locations"),
        menu: {
          featuredLabel: phrase(locale, "Locations"),
          featuredSubtitle: drop["/locations"] || "",
          sectionLabel: phrase(locale, "Locations"),
          links: [
            link("/locations/koh-samui", phrase(locale, "Koh Samui"), drop["/locations/koh-samui"]),
            link("/locations/phuket", phrase(locale, "Phuket"), drop["/locations/phuket"]),
            link("/locations/bangkok", phrase(locale, "Bangkok"), drop["/locations/bangkok"]),
            link("/locations/pattaya", phrase(locale, "Pattaya"), drop["/locations/pattaya"]),
            link("/locations/hua-hin", phrase(locale, "Hua Hin"), drop["/locations/hua-hin"]),
            link("/locations/chiang-mai", phrase(locale, "Chiang Mai"), drop["/locations/chiang-mai"]),
          ],
        },
      },
      {
        id: "company",
        href: "/about",
        label: nav.company || phrase(locale, "Company"),
        menu: {
          featuredLabel: nav.aboutVarsovia || phrase(locale, "About Us"),
          featuredSubtitle: drop["/about"] || "",
          sectionLabel: extraNav.companySection || "",
          links: [
            link("/services", phrase(locale, "Services"), drop["/services"]),
            link("/catalogue", nav.freeCatalogue || phrase(locale, "Free Catalogue"), drop["/catalogue"]),
            link("/journal", nav.ourBlog || phrase(locale, "Journal"), drop["/journal"]),
            link("/complete-interiors", phrase(locale, "Complete Interiors"), drop["/complete-interiors"]),
            link("/for-developers", phrase(locale, "For Developers"), drop["/for-developers"]),
            link("/about/livo", "Livo", drop["/about/livo"]),
            link("/about/oppolia", "Oppolia", drop["/about/oppolia"]),
            link("/team", nav.ourTeam || phrase(locale, "Our Team"), drop["/team"]),
            link("/quality-sale", nav.qualityAfterSales || phrase(locale, "Quality After Sales"), drop["/quality-sale"]),
          ],
        },
      },
      {
        id: "contact",
        href: "/contact",
        label: nav.contact || phrase(locale, "Contact"),
        menu: {
          featuredLabel: nav.getInTouch || phrase(locale, "Contact Us"),
          featuredSubtitle: drop["/contact"] || "",
          sectionLabel: extraNav.supportSection || "",
          links: [
            link("/contact", nav.getInTouch || phrase(locale, "Contact Us"), drop["/contact"]),
            link("/faq", nav.faq || phrase(locale, "FAQ"), drop["/faq"]),
          ],
        },
      },
    ],
  };
}

function footerOverlay(m: Msg, locale: "th" | "pl"): Dict {
  const footer = m.footer || {};
  const nav = m.nav || {};
  const cat = m.categories || {};
  const label = (href: string, text: string) => ({ href, label: text });
  return {
    linkColumns: [
      {
        id: "primary",
        links: [
          label("/journal", footer.blog || phrase(locale, "Journal")),
          label("/about", footer.aboutUs || phrase(locale, "About Us")),
          label("/locations", phrase(locale, "Locations")),
          label("/services", phrase(locale, "Services")),
          label("/contact", footer.contactUs || phrase(locale, "Contact Us")),
          label("/faq", nav.faq || phrase(locale, "FAQ")),
          label("/catalogue", footer.catalogue || phrase(locale, "Free Catalogue")),
        ],
      },
      {
        id: "products",
        links: [
          label("/furniture", footer.products || nav.furniture || phrase(locale, "Furniture")),
          label("/interior-design?category=Kitchen", cat.kitchen || phrase(locale, "Kitchen")),
          label("/interior-design?category=Bedroom", cat.bedroom || phrase(locale, "Bedroom")),
          label("/interior-design?category=Bathroom", cat.bathroom || phrase(locale, "Bathroom")),
          label("/interior-design?category=Door%20%26%20Windows", cat.doorWindows || phrase(locale, "Doors & Windows")),
          label("/interior-design?category=Whole%20House%20Solutions", cat.wholeHouse || phrase(locale, "Whole House")),
          label("/projects", phrase(locale, "Projects")),
        ],
      },
    ],
    legalLinks: [
      label("/privacy", footer.privacy || phrase(locale, "Privacy")),
      label("/terms", footer.terms || phrase(locale, "Terms")),
      label("/sitemap.xml", footer.sitemap || "Sitemap"),
    ],
    contactHeading: footer.contactUs || phrase(locale, "Contact Us"),
    contactLabels: {
      email: footer.email,
      mobileWhatsapp: footer.mobileWhatsapp,
      contactNumber: footer.contactNumber,
    },
    socialLabels: {
      whatsapp: footer.whatsapp,
      facebook: footer.facebook,
      instagram: footer.instagram,
      x: footer.x,
    },
    copyright: footer.copyright,
  };
}

function inquiryOverlay(m: Msg): Dict {
  const c = m.contact || {};
  const common = m.common || {};
  const field = (key: string, label: string, placeholder: string) => ({
    key,
    label,
    placeholder,
  });
  return {
    submitLabel: c.submit || common.submit,
    fields: [
      field("name", c.fullName, c.fullNamePh),
      field("email", c.email, c.emailPh),
      field("whatsapp", c.whatsapp, c.whatsappPh),
      field("phone", c.phone, c.phonePh),
      field("city", c.city, c.cityPh),
      field("country", c.country, c.countryPh),
      field("projectType", c.projectType, c.projectTypePh),
      field("budget", c.budgetRange, c.budgetPh),
      field("message", c.message, c.messagePh),
    ],
  };
}

function siteOverlayFromMessages(m: Msg, locale: "th" | "pl"): Dict {
  const home = m.home || {};
  const about = m.aboutPage || {};
  const fallback = m.siteFallback || {};
  const team = m.teamPage || {};
  const quality = m.qualitySale || {};
  const faq = m.faq || {};
  const catalogue = m.cataloguePage || {};
  const contactPage = m.contactPage || {};
  const contact = m.contact || {};
  const showcase = m.showcase || {};
  const pageMeta = m.pageMeta || {};
  const search = m.search || {};
  const legal = m.legal || {};

  return {
    heroEyebrow: home.heroEyebrow,
    heroHeadline: home.heroHeadline,
    heroPrimaryCtaLabel: home.heroPrimaryCta,
    heroSecondaryCtaLabel: home.heroSecondaryCta,
    aboutTitle: home.aboutTitle,
    aboutSubtitle: home.aboutSubtitle,
    aboutCtaLabel: home.aboutLearnMore,
    aboutText: fallback.aboutText,
    aboutIntro: fallback.aboutIntro,
    aboutStory: fallback.aboutStory,
    aboutHeroTitle: about.heroTitle,
    aboutHeroSubtitle: fallback.aboutHeroSubtitle,
    footerBio: fallback.footerBio || m.footer?.defaultBio,
    stats: [
      { value: "+12", label: home.statYears },
      { value: "+140", label: home.statProjects },
      { value: "+6", label: home.statCities },
    ],
    vision: { title: about.visionTitle, text: fallback.visionText },
    mission: { title: about.missionTitle, text: fallback.missionText },
    values: { title: about.valuesBlockTitle, text: fallback.valuesText },
    processSteps: [
      { step: "01", title: fallback.process1Title, text: fallback.process1Text },
      { step: "02", title: fallback.process2Title, text: fallback.process2Text },
      { step: "03", title: fallback.process3Title, text: fallback.process3Text },
      { step: "04", title: fallback.process4Title, text: fallback.process4Text },
    ],
    sectionCopy: {
      products: {
        title: home.productsTitle,
        subtitle: home.productsSubtitle,
        ctaLabel: home.exploreMore || home.exploreInteriors,
        itemCtaLabel: home.exploreInteriors,
      },
      featured: {
        title: home.featuredTitle,
        subtitle: home.featuredSubtitle,
        ctaLabel: home.exploreMore,
      },
      partners: { title: home.partnersTitle, subtitle: home.partnersSubtitle },
      coreStrengths: { title: home.strengthsTitle, subtitle: home.strengthsSubtitle },
      catalogue: {
        title: home.catalogueTitle,
        subtitle: home.catalogueSubtitle,
        ctaLabel: home.catalogueDownload,
      },
      testimonials: { title: home.testimonialsTitle, subtitle: home.testimonialsSubtitle },
      contact: { title: home.contactTitle, subtitle: home.contactSubtitle },
    },
    teamPage: {
      heroTitle: team.heroTitle,
      heroSubtitle: team.heroSubtitle,
      intro: team.intro,
      designTitle: team.designTitle,
      designEyebrow: team.designEyebrow,
      designBody: team.designBody,
      architectTitle: team.architectTitle,
      architectEyebrow: team.architectEyebrow,
      architectBody: team.architectBody,
      toolsTitle: team.toolsTitle,
      toolsBody: team.toolsBody,
      stats: [
        { value: team.statProjectsValue, label: team.statProjectsLabel },
        { value: team.statYearsValue, label: team.statYearsLabel },
      ],
    },
    qualitySale: {
      heroTitle: quality.heroTitle,
      heroSubtitle: quality.heroSubtitle,
      heroBody: quality.heroBody,
      feature1Title: quality.feature1Title,
      feature2Title: quality.feature2Title,
      feature3Title: quality.feature3Title,
      feature4Title: quality.feature4Title,
      supportTitle: quality.supportTitle,
      supportSubtitle: quality.supportSubtitle,
      faqTitle: quality.faqTitle,
      faqSubtitle: quality.faqSubtitle,
      step1Title: quality.step1Title,
      step1Desc: quality.step1Desc,
      step2Title: quality.step2Title,
      step2Desc: quality.step2Desc,
      step3Title: quality.step3Title,
      step3Desc: quality.step3Desc,
      step4Title: quality.step4Title,
      step4Desc: quality.step4Desc,
      faq1Q: quality.faq1Q,
      faq1A: quality.faq1A,
      faq2Q: quality.faq2Q,
      faq2A: quality.faq2A,
      faq3Q: quality.faq3Q,
      faq3A: quality.faq3A,
      faq4Q: quality.faq4Q,
      faq4A: quality.faq4A,
    },
    projectsPage: {
      metaTitle: showcase.heroTitle || pageMeta.showcaseTitle,
      metaDescription: pageMeta.showcaseDescription,
      heroTitle: showcase.categoryMeta?.all?.title || showcase.heroTitle,
      heroSubtitle: showcase.categoryMeta?.all?.subtitle || showcase.heroSubtitle,
      navSectionLabel: showcase.navByRegion,
    },
    aboutPageSettings: {
      metaTitle: pageMeta.aboutTitle,
      metaDescription: pageMeta.aboutDescription,
      heroTitle: about.heroTitle,
    },
    faqPage: {
      metaTitle: search.faqTitle || faq.heroTitle,
      metaDescription: search.faqDesc,
      heroTitle: faq.heroTitle,
      heroSubtitle: faq.heroSubtitle,
    },
    cataloguePage: {
      metaTitle: pageMeta.catalogueTitle,
      metaDescription: pageMeta.catalogueDescription,
      heroTitle: catalogue.heroTitle,
      heroSubtitle: catalogue.heroSubtitle,
    },
    contactPage: {
      metaTitle: pageMeta.contactTitle,
      metaDescription: pageMeta.contactDescription,
      heroTitle: contactPage.heroTitle,
      heroSubtitle: contactPage.heroSubtitle,
      locationTitle: contact.ourLocationTitle,
      locationSubtitle: contact.ourLocationSubtitle,
      mapAriaLabel: contact.mapAriaLabel,
    },
    legalPages: legalOverlay(legal),
    mainNavigation: navOverlay(m, locale),
    footerNavigation: footerOverlay(m, locale),
    inquiryForm: inquiryOverlay(m),
    searchPages: [
      { href: "/", title: search.homeTitle, description: search.homeDesc },
      { href: "/interior-design", title: search.interiorTitle, description: search.interiorDesc },
      { href: "/about", title: search.aboutTitle, description: search.aboutDesc },
      { href: "/team", title: search.teamTitle, description: search.teamDesc },
      { href: "/journal", title: search.blogTitle, description: search.blogDesc },
      { href: "/catalogue", title: search.catalogueTitle, description: search.catalogueDesc },
      { href: "/contact", title: search.contactTitle, description: search.contactDesc },
      { href: "/faq", title: search.faqTitle, description: search.faqDesc },
      { href: "/projects", title: search.showcaseTitle, description: search.showcaseDesc },
      { href: "/quality-sale", title: search.qualityTitle, description: search.qualityDesc },
    ],
    showcaseMeta: [
      { tabKey: "All", title: showcase.categoryMeta?.all?.title, subtitle: showcase.categoryMeta?.all?.subtitle },
      { tabKey: "Home case", title: showcase.categoryMeta?.homeCase?.title, subtitle: showcase.categoryMeta?.homeCase?.subtitle },
      { tabKey: "North America", title: showcase.categoryMeta?.northAmerica?.title, subtitle: showcase.categoryMeta?.northAmerica?.subtitle },
      { tabKey: "South America", title: showcase.categoryMeta?.southAmerica?.title, subtitle: showcase.categoryMeta?.southAmerica?.subtitle },
      { tabKey: "Africa", title: showcase.categoryMeta?.africa?.title, subtitle: showcase.categoryMeta?.africa?.subtitle },
      { tabKey: "Commercial Project", title: showcase.categoryMeta?.commercialProject?.title, subtitle: showcase.categoryMeta?.commercialProject?.subtitle },
      { tabKey: "Europe", title: showcase.categoryMeta?.europe?.title, subtitle: showcase.categoryMeta?.europe?.subtitle },
      { tabKey: "Australia", title: showcase.categoryMeta?.australia?.title, subtitle: showcase.categoryMeta?.australia?.subtitle },
      { tabKey: "Middle East", title: showcase.categoryMeta?.middleEast?.title, subtitle: showcase.categoryMeta?.middleEast?.subtitle },
      { tabKey: "Asia", title: showcase.categoryMeta?.asia?.title, subtitle: showcase.categoryMeta?.asia?.subtitle },
    ],
    pages: iaOverlayFromSeed(LIVE_IA_PAGES, locale),
  };
}

export function buildVarsoviaLiveOverlays(): { th: Dict; pl: Dict } {
  return {
    th: siteOverlayFromMessages(messagesFor("th"), "th"),
    pl: siteOverlayFromMessages(messagesFor("pl"), "pl"),
  };
}

export function journalLocalePack(seedKey: string): { th?: Dict; pl?: Dict } {
  const th = (blogTh as Dict)[seedKey] as Dict | undefined;
  const pl = (blogPl as Dict)[seedKey] as Dict | undefined;
  return { th, pl };
}

type FaqPack = Record<string, Array<{ question?: string; answer?: string }>>;

export function faqTranslatedRow(
  categoryEn: string,
  index: number,
  locale: "th" | "pl"
): { question: string; answer: string } | null {
  const pack = (locale === "th" ? faqTh : faqPl) as FaqPack;
  const aliases: Record<string, string> = {
    kitchen: "Kitchen Interior",
    "kitchen interior": "Kitchen Interior",
    bedroom: "Bedroom Interior",
    "bedroom interior": "Bedroom Interior",
    "living room": "Living Room",
    bathroom: "Bathroom Interior",
    "bathroom interior": "Bathroom Interior",
    "doors & windows": "Doors & Windows",
    "door & windows": "Doors & Windows",
    furniture: "Furniture",
    "whole home": "Whole Home",
    "whole house": "Whole Home",
  };
  const key =
    pack[categoryEn] != null
      ? categoryEn
      : aliases[categoryEn.trim().toLowerCase()] ||
        Object.keys(pack).find((k) => k.toLowerCase() === categoryEn.trim().toLowerCase());
  if (!key) return null;
  const row = pack[key]?.[index];
  if (!row?.question && !row?.answer) return null;
  return { question: String(row.question || ""), answer: String(row.answer || "") };
}
