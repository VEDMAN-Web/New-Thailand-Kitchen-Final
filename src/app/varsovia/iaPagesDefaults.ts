/** Mirrors Varsovia-Backend/src/data/iaPagesDefaults.js for admin defaults. */

type Loc = { en: string; th: string; pl: string };

const L = (en: string, th = "", pl = ""): Loc => ({ en, th, pl });

function hero(titleEn: string) {
  return {
    eyebrow: L(""),
    title: L(titleEn),
    subtitle: L(""),
    image: "",
    ctaLabel: L("Get a consultation"),
    ctaHref: "/contact",
  };
}

function child(slug: string, titleEn: string, order = 0) {
  return {
    slug,
    title: L(titleEn),
    metaTitle: L(""),
    metaDescription: L(""),
    hero: hero(titleEn),
    body: L(""),
    indexable: false,
    order,
  };
}

function hub(slug: string, titleEn: string, children: ReturnType<typeof child>[] = []) {
  return {
    slug,
    indexable: false,
    metaTitle: L(""),
    metaDescription: L(""),
    hero: hero(titleEn),
    body: L(""),
    children,
  };
}

export const IA_HUB_PATHS: Record<string, string> = {
  furniture: "/furniture",
  interiorDesign: "/interior-design",
  completeInteriors: "/complete-interiors",
  services: "/services",
  locations: "/locations",
  forDevelopers: "/for-developers",
  journal: "/journal",
  aboutBrand: "/about",
};

const ADMIN_PATH_TO_HUB: Record<string, string> = {
  "/varsovia/furniture": "furniture",
  "/varsovia/interior-design": "interiorDesign",
  "/varsovia/complete-interiors": "completeInteriors",
  "/varsovia/services": "services",
  "/varsovia/locations": "locations",
  "/varsovia/for-developers": "forDevelopers",
  "/varsovia/journal": "journal",
  "/varsovia/about-brand": "aboutBrand",
};

/** Hub key for the Varsovia admin page currently open, if any. */
export function varsoviaHubKeyFromPath(pathname: string): string | undefined {
  const path = String(pathname || "").replace(/\/+$/, "") || "/";
  return ADMIN_PATH_TO_HUB[path];
}

export const SHOWCASE_LIVE_PATH = "/projects";
export const CATALOGUE_LIVE_PATH = "/catalogue";
export const TEAM_LIVE_PATH = "/team";
export const QUALITY_LIVE_PATH = "/quality-sale";
export const CONTACT_LIVE_PATH = "/contact";
export const FAQ_LIVE_PATH = "/faq";
export const FOOTER_LIVE_PATH = "/";

/** Showcase is listing + mega-menu copy, not an IA hub. */
export function isShowcaseAdminPath(pathname: string): boolean {
  const path = String(pathname || "").replace(/\/+$/, "") || "/";
  return path === "/varsovia/showcase";
}

/** Free Catalogue is a site section on `/varsovia?section=cataloguePage`. */
export function isCatalogueAdminSection(section: string | null | undefined): boolean {
  return section === "cataloguePage";
}

export function isTeamAdminSection(section: string | null | undefined): boolean {
  return section === "teamPage";
}

export function isQualityAdminSection(section: string | null | undefined): boolean {
  return section === "qualitySale";
}

export function isContactAdminSection(section: string | null | undefined): boolean {
  return section === "contactPage" || section === "contact";
}

export function isFaqAdminSection(section: string | null | undefined): boolean {
  return section === "faqPage";
}

export function isFooterAdminSection(section: string | null | undefined): boolean {
  return section === "footer";
}

export const DEFAULT_IA_PAGES = {
  furniture: hub("furniture", "Furniture", [
    child("kitchens", "Kitchens", 0),
    child("wardrobes", "Wardrobes", 1),
    child("living-room", "Living Room", 2),
    child("bedrooms", "Bedrooms", 3),
    child("bathroom", "Bathroom", 4),
    child("dining", "Dining", 5),
    child("doors", "Doors", 6),
    child("whole-house", "Whole House", 7),
  ]),
  interiorDesign: hub("interior-design", "Interior Design", []),
  completeInteriors: hub("complete-interiors", "Complete Interiors", [
    child("villas", "Villas", 0),
    child("condos", "Condos", 1),
    child("hotels-resorts", "Hotels & Resorts", 2),
    child("developers", "Developers", 3),
  ]),
  services: hub("services", "Services", [
    child("custom-furniture", "Custom Furniture", 0),
    child("interior-design", "Interior Design", 1),
    child("furniture-packages", "Furniture Packages", 2),
    child("installation", "Installation", 3),
    child("renovation", "Renovation", 4),
  ]),
  locations: hub("locations", "Locations", [
    child("koh-samui", "Koh Samui", 0),
    child("phuket", "Phuket", 1),
    child("bangkok", "Bangkok", 2),
    child("pattaya", "Pattaya", 3),
    child("hua-hin", "Hua Hin", 4),
    child("chiang-mai", "Chiang Mai", 5),
  ]),
  forDevelopers: {
    slug: "for-developers",
    indexable: false,
    metaTitle: L(
      "For Developers | Varsovia Design",
      "สำหรับนักพัฒนา | Varsovia Design",
      "Dla deweloperów | Varsovia Design"
    ),
    metaDescription: L(
      "Partner with Varsovia Design for developer interior packages, show units, and scalable FF&E across Thailand. Specs, timelines, and installation in every phase.",
      "ร่วมงานกับ Varsovia Design สำหรับแพ็กเกจอินทีเรียนักพัฒนา ยูนิตตัวอย่าง และ FF&E ที่ขยายได้ทั่วไทย พร้อมสเปก ไทม์ไลน์ และการติดตั้งในทุกเฟส",
      "Współpracuj z Varsovia Design przy pakietach wnętrz deweloperskich, show unitach i FF&E w Tajlandii. Specyfikacje, harmonogram i montaż na każdym etapie."
    ),
    hero: {
      eyebrow: L(""),
      title: L("For Developers", "สำหรับนักพัฒนา", "Dla deweloperów"),
      subtitle: L(
        "Interior partners for show units, standard packages, and amenity spaces.",
        "พาร์ทเนอร์อินทีเรียสำหรับยูนิตตัวอย่าง แพ็กเกจมาตรฐาน และพื้นที่ส่วนกลาง",
        "Partnerzy wnętrzarscy do mieszkań show, pakietów standardowych i przestrzeni wspólnych."
      ),
      image: "/home/core/core-4.jpg",
      ctaLabel: L("Get a consultation", "ปรึกษาฟรี", "Bezpłatna konsultacja"),
      ctaHref: "/contact",
    },
    body: L(
      "Developers need interiors that sell and scale. We deliver show-unit storytelling, repeatable apartment packages, and amenity design with clear specs, timelines, and installation support — so every phase stays on brand and on schedule.",
      "นักพัฒนาต้องการอินทีเรียที่ขายได้และขยายได้ เราส่งมอบเรื่องราวยูนิตตัวอย่าง แพ็กเกจอพาร์ตเมนต์ที่ทำซ้ำได้ และการออกแบบพื้นที่ส่วนกลาง พร้อมสเปก ไทม์ไลน์ และการติดตั้งที่ชัดเจน ให้ทุกเฟสคงแบรนด์และตรงเวลา",
      "Deweloperzy potrzebują wnętrz, które sprzedają i skalują się. Dostarczamy storytelling mieszkań show, powtarzalne pakiety apartamentów i projekt przestrzeni wspólnych z jasnymi specyfikacjami, harmonogramem i wsparciem montażu — żeby każdy etap zostawał w zgodzie z marką i terminem."
    ),
    sections: [
      {
        heading: L(
          "Show units that sell the vision",
          "ยูนิตตัวอย่างที่ขายวิสัยทัศน์",
          "Mieszkania show, które sprzedają wizję"
        ),
        text: L(
          "Launch interiors with storytelling that buyers remember — then convert to packages that roll out cleanly across phases.",
          "เปิดตัวอินทีเรียด้วยเรื่องราวที่ผู้ซื้อจำได้ แล้วแปลงเป็นแพ็กเกจที่ขยายได้ทุกเฟสอย่างเรียบร้อย",
          "Wprowadzaj wnętrza z opowieścią, którą kupujący zapamiętają — a potem zamieniaj je w pakiety wdrażane czysto w kolejnych etapach."
        ),
        image: "/home/core/core-4.jpg",
        imagePosition: "left",
        layout: "editorial",
      },
      {
        heading: L(
          "Packages, amenities, installation",
          "แพ็กเกจ พื้นที่ส่วนกลาง และการติดตั้ง",
          "Pakiety, udogodnienia, montaż"
        ),
        text: L(
          "Standard apartment packages and amenity spaces with clear specs, timelines, and installation support so every phase stays on brand.",
          "แพ็กเกจอพาร์ตเมนต์มาตรฐานและพื้นที่ส่วนกลาง พร้อมสเปก ไทม์ไลน์ และการติดตั้งที่ชัดเจน ให้ทุกเฟสคงแบรนด์",
          "Standardowe pakiety mieszkań i przestrzenie wspólne z jasnymi specyfikacjami, harmonogramem i wsparciem montażu, żeby każdy etap zostawał w zgodzie z marką."
        ),
        image: "/home/product/product-3.jpg",
        imagePosition: "right",
        layout: "overlay",
      },
    ],
    children: [],
  },
  journal: {
    slug: "journal",
    indexable: false,
    metaTitle: L("Journal | Varsovia Design"),
    metaDescription: L(
      "Varsovia Journal — guides on kitchens, furniture, materials, interior design, villas, and Thailand living."
    ),
    hero: {
      eyebrow: L(""),
      title: L("Journal"),
      subtitle: L(
        "Ideas on kitchens, materials, villas, and living in Thailand."
      ),
      image: "/blog/blog1.jpg",
      ctaLabel: L("Get a consultation"),
      ctaHref: "/contact",
    },
    body: L(
      "Our journal collects practical design notes and project stories — written to help homeowners and partners make clearer decisions."
    ),
    sections: [
      {
        heading: L("Practical design notes"),
        text: L(
          "Guides on kitchens, materials, and villas — written to help you make clearer decisions."
        ),
        image: "/blog/blog1.jpg",
        imagePosition: "left",
        layout: "editorial",
      },
      {
        heading: L("Stories from real projects"),
        text: L(
          "Project notes and Thailand living ideas drawn from homes we design and install."
        ),
        image: "/home/stories/story-2.jpg",
        imagePosition: "right",
        layout: "editorial",
      },
    ],
    exploreTitle: L("Explore topics"),
    exploreSubtitle: L("Kitchens, furniture, materials, and living in Thailand."),
    articleContact: {
      title: L("CONTACT VARSOVIA"),
      subtitle: L(
        "HAVE A QUESTION, NEED EXPERT ADVICE, OR PLANNING YOUR DREAM KITCHEN? OUR TEAM IS READY TO ASSIST YOU."
      ),
      ctaLabel: L("Contact Us"),
      ctaHref: "/contact",
    },
    articleOffer: {
      eyebrow: L("DESIGNED AROUND YOU"),
      title: L("YOUR KITCHEN, DESIGNED YOUR WAY"),
      text: L(
        "Tell us about your space, style, and needs. Our kitchen specialists will help you create a solution that feels beautiful, functional, and uniquely yours."
      ),
      points: [
        L("Tailored kitchen design based on your space"),
        L("Expert guidance on materials, finishes & layouts"),
        L("Personalized consultation with our kitchen specialists"),
      ],
      ctaLabel: L("Get Offers"),
      ctaHref: "/contact",
      image: "/Interior-kitchen/kitchen1.jpg",
      imageAlt: L("Varsovia designed kitchen interior"),
    },
    children: [
      child("kitchens", "Kitchens", 0),
      child("furniture", "Furniture", 1),
      child("materials", "Materials", 2),
      child("interior-design", "Interior Design", 3),
      child("villa-guides", "Villa Guides", 4),
      child("thailand-living", "Thailand Living", 5),
    ],
  },
  aboutBrand: hub("about", "Varsovia", [
    child("varsovia", "Varsovia", 0),
    child("livo", "Livo", 1),
    child("oppolia", "Oppolia", 2),
  ]),
};

export type IaChild = (typeof DEFAULT_IA_PAGES.furniture.children)[number];
