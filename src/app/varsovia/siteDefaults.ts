type SiteRecord = Record<string, unknown>;

const en = (value: string) => ({ en: value, th: "", pl: "" });

export const VARSOVIA_SITE_DEFAULTS: SiteRecord = {
  heroEyebrow: en("VARSOVIA DESIGN"),
  heroHeadline: en("CHOOSE FROM A RANGE OF HIGH-QUALITY MODULAR KITCHENS."),
  heroSubtitle: en("Premium interiors, thoughtfully designed for everyday living."),
  heroImage: "/home/home-front-page.png",
  heroPrimaryCtaLabel: en("Explore Kitchens"),
  heroPrimaryCtaHref: "#products",
  heroSecondaryCtaLabel: en("Free Consultation"),
  heroSecondaryCtaHref: "#contact",

  aboutTitle: en("ABOUT VARSOVIA"),
  aboutSubtitle: en("Twelve years of rooms built to last"),
  aboutCtaLabel: en("Learn More"),
  aboutCtaHref: "#projects",
  aboutPageTitle: en("About Us"),
  aboutValuesSectionTitle: en("Vision. Mission. Value."),
  aboutValuesSectionSubtitle: en("The foundation of everything we create"),
  aboutStoryTitle: en("Our Story"),
  aboutProcessTitle: en("Our Process"),
  aboutProcessSubtitle: en("A seamless journey from vision to reality"),
  aboutText: en(
    "At Varsovia, we craft modular kitchens that blend timeless design with everyday ease. From thoughtful layouts to premium finishes, every space is tailored to how you cook, gather, and live — elevating your home with quiet luxury and lasting craftsmanship."
  ),
  aboutIntro: en(
    "At Varsovia Design, we believe every space tells a story. We specialize in creating elegant, functional, and personalized interiors that reflect your lifestyle. From modular kitchens to complete home and commercial interiors, we combine creativity, craftsmanship, and premium materials to deliver spaces that stand the test of time."
  ),
  aboutStory: en(
    "Founded with a passion for thoughtful design and exceptional craftsmanship, Varsovia Design has grown into a trusted name in premium interior solutions. Every project begins with understanding our clients' vision and ends with beautifully crafted spaces that balance aesthetics, comfort, and functionality."
  ),
  aboutHeroSubtitle: en("TWELVE YEARS OF ROOMS BUILT TO LAST"),
  aboutImages: [
    "/home/about-1.jpg",
    "/home/about-2.jpg",
    "/home/about-3.jpg",
    "/home/featured-project/feature-5.jpg",
  ],

  stats: [
    { value: en("+12"), label: en("Years Experience") },
    { value: en("+140"), label: en("Projects Completed") },
    { value: en("+6"), label: en("Cities Served") },
  ],
  statsImage: "/home/counting.png",
  vision: {
    title: en("Our Vision"),
    text: en(
      "To become a leading interior design brand known for creating inspiring spaces that enrich everyday living through innovation, quality, and timeless design."
    ),
  },
  mission: {
    title: en("Our Mission"),
    text: en(
      "To deliver personalized interior solutions with exceptional craftsmanship, premium materials, and a seamless customer experience from concept to completion."
    ),
  },
  values: {
    title: en("Our Values"),
    text: en(
      "Great interiors begin with quality, creativity, trust, and innovation. We design and craft spaces tailored to your lifestyle, blending elegance, functionality, and lasting value."
    ),
  },
  processSteps: [
    {
      step: "01",
      title: en("Consultation"),
      text: en("Understanding your lifestyle, needs, and design preferences."),
    },
    {
      step: "02",
      title: en("Product Design"),
      text: en(
        "Creating layouts, concepts, material selections, and realistic 3D visualizations."
      ),
    },
    {
      step: "03",
      title: en("Develop"),
      text: en(
        "Refining designs, coordinating production, and preparing for flawless execution."
      ),
    },
    {
      step: "04",
      title: en("Execution"),
      text: en(
        "Expert craftsmanship, timely delivery, and professional installation."
      ),
    },
  ],
  contactImages: [
    "/home/contact/contact-1.jpg",
    "/home/contact/contact-2.jpg",
    "/home/contact/contact-3.jpg",
    "/home/contact/contact-4.jpg",
    "/home/contact/contact-5.jpg",
    "/home/contact/contact-6.jpg",
    "/home/contact/contact-7.jpg",
  ],

  productsTitle: en("Our Products"),
  productsSubtitle: en("Interiors made for the way you actually live"),
  productsItemCtaLabel: en("Explore Interiors"),
  productsCtaLabel: en("Explore More"),
  productsCtaHref: "/interior",
  catalogueTitle: en("Free Catalogue"),
  catalogueSubtitle: en("Inspiration for Your Dream Kitchen"),
  catalogueYear: en("2026"),
  catalogueCoverTitle: en("EXPLORE\nKITCHEN\nDESIGN"),
  catalogueDownloadLabel: en("Download"),
  projectsTitle: en("Featured Projects"),
  projectsSubtitle: en("Designed to inspire. Built to last"),
  projectsCtaLabel: en("Explore More"),
  projectsCtaHref: "/interior",
  testimonialsTitle: en("Real Stories. Real Spaces."),
  testimonialsSubtitle: en(
    "Hear how we've transformed houses into dream homes"
  ),

  coreStrengthsTitle: en("Core Strengths"),
  coreStrengthsSubtitle: en(
    "Transforming data into intelligent, real-world solutions"
  ),
  coreStrengths: [
    {
      title: en("Reveals hidden construction"),
      description: en("Shows material layering that plan views cannot capture."),
      image: "/home/core/core-1.jpg",
      icon: "eye",
    },
    {
      title: en("Accurate height and clearance planning"),
      description: en(
        "Confirms ceiling, counter, door, and window heights align correctly."
      ),
      image: "/home/core/core-2.jpg",
      icon: "ruler",
    },
    {
      title: en("Coordinates trades"),
      description: en(
        "Helps electricians, HVAC, plumbers, and carpenters identify clashes before construction."
      ),
      image: "/home/core/core-3.jpg",
      icon: "users",
    },
    {
      title: en("Precise material specification"),
      description: en(
        "Documents exact materials and thicknesses for every custom detail."
      ),
      image: "/home/core/core-4.jpg",
      icon: "box",
    },
    {
      title: en("Reduces on-site errors and rework"),
      description: en(
        "Removes ambiguity that causes delays and budget overruns."
      ),
      image: "/home/core/core-5.jpg",
      icon: "shield",
    },
    {
      title: en("Communicates custom details clearly"),
      description: en(
        "Clarifies bespoke elements that standard drawings may miss."
      ),
      image: "/home/core/core-6.jpg",
      icon: "pen",
    },
  ],

  partnersTitle: en("Our Global Partners"),
  partnersSubtitle: en("Powered by trusted brands from around the world"),
  contactTitle: en("Get In touch"),
  contactSubtitle: en(
    "Your dream space begins with a simple conversation"
  ),
  inquiryForm: {
    version: 1,
    submitLabel: { en: "Submit", th: "ส่ง", pl: "Wyślij" },
    fields: [
      {
        key: "name",
        type: "name",
        label: { en: "Full Name", th: "ชื่อ-นามสกุล", pl: "Imię i nazwisko" },
        placeholder: {
          en: "Enter Your Full Name",
          th: "กรอกชื่อ-นามสกุล",
          pl: "Wpisz imię i nazwisko",
        },
        required: true,
        width: "full",
        order: 1,
        enabled: true,
      },
      {
        key: "email",
        type: "email",
        label: { en: "Email Address", th: "อีเมล", pl: "Adres e-mail" },
        placeholder: {
          en: "Enter Your Email Address",
          th: "กรอกอีเมล",
          pl: "Wpisz adres e-mail",
        },
        required: true,
        width: "full",
        order: 2,
        enabled: true,
      },
      {
        key: "whatsapp",
        type: "whatsapp",
        label: { en: "WhatsApp Number", th: "WhatsApp", pl: "Numer WhatsApp" },
        placeholder: {
          en: "Enter Your WhatsApp Number",
          th: "กรอก WhatsApp",
          pl: "Wpisz numer WhatsApp",
        },
        required: false,
        width: "half",
        order: 3,
        enabled: true,
      },
      {
        key: "phone",
        type: "phone",
        label: { en: "Phone Number", th: "เบอร์โทร", pl: "Numer telefonu" },
        placeholder: {
          en: "7123456789",
          th: "812345678",
          pl: "512345678",
        },
        required: true,
        width: "half",
        order: 4,
        enabled: true,
        useLocaleDialCode: true,
      },
      {
        key: "city",
        type: "place",
        label: { en: "City Name", th: "เมือง", pl: "Miasto" },
        placeholder: {
          en: "Enter Your City Name",
          th: "กรอกเมือง",
          pl: "Wpisz miasto",
        },
        required: false,
        width: "half",
        order: 5,
        enabled: true,
      },
      {
        key: "country",
        type: "place",
        label: { en: "Country Name", th: "ประเทศ", pl: "Kraj" },
        placeholder: {
          en: "Enter Your Country Name",
          th: "กรอกประเทศ",
          pl: "Wpisz kraj",
        },
        required: false,
        width: "half",
        order: 6,
        enabled: true,
      },
      {
        key: "projectType",
        type: "select",
        label: { en: "Project Type", th: "ประเภทโปรเจกต์", pl: "Typ projektu" },
        placeholder: {
          en: "Select Your Project Type",
          th: "เลือกประเภทโปรเจกต์",
          pl: "Wybierz typ projektu",
        },
        required: false,
        width: "half",
        order: 7,
        enabled: true,
        options: [
          {
            value: "Modular Kitchen",
            label: {
              en: "Modular Kitchen",
              th: "ครัวโมดูลาร์",
              pl: "Kuchnia modułowa",
            },
          },
          {
            value: "Wardrobe",
            label: { en: "Wardrobe", th: "ตู้เสื้อผ้า", pl: "Garderoba" },
          },
          {
            value: "TV Unit",
            label: { en: "TV Unit", th: "ชั้นวาง TV", pl: "Stolik RTV" },
          },
          {
            value: "Interior Design",
            label: {
              en: "Interior Design",
              th: "ออกแบบภายใน",
              pl: "Projekt wnętrz",
            },
          },
          {
            value: "Other",
            label: { en: "Other", th: "อื่นๆ", pl: "Inne" },
          },
        ],
      },
      {
        key: "budget",
        type: "select",
        label: { en: "Budget Range", th: "งบประมาณ", pl: "Zakres budżetu" },
        placeholder: {
          en: "Select Your Budget Range",
          th: "เลือกงบประมาณ",
          pl: "Wybierz budżet",
        },
        required: false,
        width: "half",
        order: 8,
        enabled: true,
        options: [
          {
            value: "under_5l",
            label: {
              en: "Under ₹5 Lakh",
              th: "ต่ำกว่า ₹5 ลakh",
              pl: "Poniżej ₹5 lakh",
            },
          },
          {
            value: "5l_10l",
            label: { en: "₹5L – ₹10L", th: "₹5L – ₹10L", pl: "₹5L – ₹10L" },
          },
          {
            value: "10l_20l",
            label: { en: "₹10L – ₹20L", th: "₹10L – ₹20L", pl: "₹10L – ₹20L" },
          },
          {
            value: "20l_50l",
            label: { en: "₹20L – ₹50L", th: "₹20L – ₹50L", pl: "₹20L – ₹50L" },
          },
          {
            value: "above_50l",
            label: {
              en: "Above ₹50 Lakh",
              th: "มากกว่า ₹50 ลakh",
              pl: "Powyżej ₹50 lakh",
            },
          },
        ],
      },
      {
        key: "message",
        type: "textarea",
        label: { en: "Message", th: "ข้อความ", pl: "Wiadomość" },
        placeholder: {
          en: "Tell us about your project",
          th: "บอกเราเกี่ยวกับโปรเจกต์",
          pl: "Opisz swój projekt",
        },
        required: false,
        width: "full",
        order: 9,
        enabled: true,
        maxLength: 2000,
      },
    ],
  },
  sectionVisibility: {
    hero: true,
    about: true,
    stats: true,
    products: true,
    catalogues: true,
    projects: true,
    testimonials: true,
    coreStrengths: true,
    partners: true,
    contact: true,
  },

  footerBio: en(
    "Varsovia Kitchen designs and builds premium modular kitchens with precision, warmth, and lasting quality."
  ),
  socialLinks: {
    whatsapp: "",
    instagram: "",
    x: "",
    facebook: "",
  },

  teamPage: {
    heroTitle: en("Our Team"),
    heroSubtitle: en("The creative minds behind every beautiful space"),
    intro: en(
      "We have dedicated teams serving retail customers, commercial project contractors, and whole-house clients. Each group brings deep expertise in its field, working together to deliver an excellent experience from first consultation through final installation."
    ),
    designTitle: en("Professional Design Team"),
    designBody: en(
      "Our design team combines international aesthetics with practical functionality — researching global trends, refining every layout, and creating visualizations that help you see your space before installation begins."
    ),
    architectTitle: en("Architect / Engineers"),
    architectBody: en(
      "Our architect and engineering team ensures structural integrity, precise technical drawings, and seamless coordination between design intent and on-site execution."
    ),
    toolsTitle: en("Professional Design Tools"),
    toolsBody: en(
      "Industry-leading software supports every stage of our design process — from technical drawings and spatial planning to photorealistic 3D renders."
    ),
    stats: [
      { value: en("100+"), label: en("Successful Projects Completed") },
      {
        value: en("03"),
        label: en("Years of Excellence in Interior Solutions"),
      },
    ],
    tools: [
      { name: en("CAXA"), icon: "compass" },
      { name: en("AUTOCAD"), icon: "cpu" },
      { name: en("3D MAX"), icon: "layers" },
      { name: en("KD MAX"), icon: "box" },
    ],
  },

  qualitySale: {
    heroTitle: en("Quality After Sales"),
    heroSubtitle: en(
      "Committed to your satisfaction beyond project completion"
    ),
    heroBody: en(
      "We believe exceptional interior design extends well beyond project completion. Varsovia offers reliable after-sales support, maintenance guidance, and prompt assistance — keeping your interiors looking and performing at their best for years to come."
    ),
    supportTitle: en("Support Process"),
    supportSubtitle: en("How it works"),
    faqTitle: en("FAQ"),
    faqSubtitle: en("Questions & answers"),
    gallery: [
      "/quality-sale/support-1.jpg",
      "/quality-sale/support-2.jpg",
      "/quality-sale/support-3.jpg",
      "/quality-sale/support-4.jpg",
    ],
    steps: [
      {
        step: "01",
        title: en("Book Appointment"),
        text: en(
          "Schedule a visit with our after-sales team at your convenience."
        ),
        image: "/quality-sale/support-1.jpg",
      },
      {
        step: "02",
        title: en("Checking"),
        text: en(
          "Our specialists inspect the issue and assess the best course of action."
        ),
        image: "/quality-sale/support-2.jpg",
      },
      {
        step: "03",
        title: en("Repair & Cleaning"),
        text: en(
          "We carry out repairs, adjustments, or deep cleaning as needed."
        ),
        image: "/quality-sale/support-3.jpg",
      },
      {
        step: "04",
        title: en("Finish"),
        text: en(
          "Final quality check ensures your space is restored to perfect condition."
        ),
        image: "/quality-sale/support-4.jpg",
      },
    ],
    faqs: [
      {
        question: en("Is my project covered under warranty?"),
        answer: en(
          "Yes — Varsovia Design provides warranty coverage on materials and workmanship. Specific terms depend on your project scope and will be shared in your project agreement."
        ),
      },
      {
        question: en("How can I request after-sales support?"),
        answer: en(
          "Reach us through the contact page, email, or phone. Our team will log your request and schedule a visit at the earliest convenience."
        ),
      },
      {
        question: en("Do you provide maintenance services?"),
        answer: en(
          "We offer scheduled maintenance and check-ups for modular kitchens, wardrobes, and fitted furniture to keep everything in top condition."
        ),
      },
      {
        question: en("What happens if my warranty period has expired?"),
        answer: en(
          "We still provide full support — our team can assist with paid service visits, spare parts, and upgrade recommendations."
        ),
      },
    ],
  },

  showcaseMeta: [
    {
      tabKey: "All",
      title: en("Our Showcase"),
      subtitle: en("Every Space, Every Story"),
      order: 0,
    },
    {
      tabKey: "Home case",
      title: en("Home case"),
      subtitle: en("Spaces Designed to Inspire"),
      order: 1,
    },
    {
      tabKey: "North America",
      title: en("North America"),
      subtitle: en("Bold Design, Modern Living"),
      order: 2,
    },
    {
      tabKey: "South America",
      title: en("South America"),
      subtitle: en("Vibrant Spaces, Warm Character"),
      order: 3,
    },
    {
      tabKey: "Africa",
      title: en("Africa"),
      subtitle: en("Rooted in Culture, Rich in Design"),
      order: 4,
    },
    {
      tabKey: "Commercial Project",
      title: en("Commercial Project"),
      subtitle: en("Where Function Meets Vision"),
      order: 5,
    },
    {
      tabKey: "Europe",
      title: en("Europe"),
      subtitle: en("Timeless Elegance, Refined Living"),
      order: 6,
    },
    {
      tabKey: "Australia",
      title: en("Australia"),
      subtitle: en("Light-Filled Spaces, Effortless Style"),
      order: 7,
    },
    {
      tabKey: "Middle East",
      title: en("Middle East"),
      subtitle: en("Luxury Rooted in Tradition"),
      order: 8,
    },
    {
      tabKey: "Asia",
      title: en("Asia"),
      subtitle: en("Harmony of Space and Serenity"),
      order: 9,
    },
  ],

  phone: "+66 64 683 9777",
  email: "hi@thailandkitchens.com",
  address: en("Route 4169, Mae Nam, Amphoe Ko Samui, Surat Thani 84330"),

  contactPhone: "+66 64 683 9777",
  mobileWhatsapp: "+66 99 359 6916",
  whatsappUrl: "https://wa.me/66993596916",
  facebookUrl: "https://www.facebook.com/ThailandKitchens/",
  footerOffices: [
    {
      label: en("Samui Office"),
      address: "Route 4169, Mae Nam, Amphoe Ko Samui, Surat Thani 84330",
    },
    {
      label: en("Phuket Office"),
      address: "Royal Phuket Marina, Building MS2, Ko Kaeo, Mueang, Phuket 83000",
    },
    {
      label: en("Pattaya Office"),
      address:
        "82, 48-49 Chaiyaphruek 2 Rd, Pattaya City, Bang Lamung District, Chon Buri 20150",
    },
  ],

  interiorCatalogMode: "hybrid",

  footerNavigation: {
    version: 1,
    linkColumns: [
      {
        id: "primary",
        order: 1,
        enabled: true,
        links: [
          { label: en("Blog"), href: "/blog", enabled: true },
          { label: en("About Us"), href: "/about", enabled: true },
          { label: en("Contact Us"), href: "/contact", enabled: true },
          { label: en("FAQ"), href: "/faq", enabled: true },
          { label: en("Catalogue"), href: "/catalogue", enabled: true },
        ],
      },
      {
        id: "products",
        order: 2,
        enabled: true,
        links: [
          { label: en("Kitchen"), href: "/interior?category=Kitchen", enabled: true },
          { label: en("Bedroom"), href: "/interior?category=Bedroom", enabled: true },
          { label: en("Bathroom"), href: "/interior?category=Bathroom", enabled: true },
          { label: en("Furniture"), href: "/interior?category=Furniture", enabled: true },
          {
            label: en("Door & Windows"),
            href: "/interior?category=Door%20%26%20Windows",
            enabled: true,
          },
          {
            label: en("Whole House Solutions"),
            href: "/interior?category=Whole%20House%20Solutions",
            enabled: true,
          },
        ],
      },
    ],
    legalLinks: [
      { label: en("Privacy"), href: "/privacy", enabled: true },
      { label: en("Terms"), href: "/terms", enabled: true },
      { label: en("Sitemap"), href: "/sitemap.xml", enabled: true },
    ],
    contactHeading: en("Contact Us"),
    contactLabels: {
      email: en("Email"),
      mobileWhatsapp: en("Mobile / WhatsApp"),
      contactNumber: en("Contact Number"),
    },
    socialLabels: {
      whatsapp: en("WhatsApp"),
      facebook: en("Facebook"),
    },
    copyright: en("©{year} Varsovia Design"),
  },
};

function isBlank(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") {
    const values = Object.values(value as SiteRecord);
    return values.length === 0 || values.every(isBlank);
  }
  return false;
}

export function mergeVarsoviaSiteDefaults(
  current: SiteRecord,
  defaults: SiteRecord = VARSOVIA_SITE_DEFAULTS
): SiteRecord {
  const merged = structuredClone(current);

  for (const [key, defaultValue] of Object.entries(defaults)) {
    const currentValue = merged[key];

    if (isBlank(currentValue)) {
      merged[key] = structuredClone(defaultValue);
      continue;
    }

    if (
      currentValue &&
      defaultValue &&
      typeof currentValue === "object" &&
      typeof defaultValue === "object" &&
      !Array.isArray(currentValue) &&
      !Array.isArray(defaultValue)
    ) {
      merged[key] = mergeVarsoviaSiteDefaults(
        currentValue as SiteRecord,
        defaultValue as SiteRecord
      );
    }
  }

  return merged;
}
