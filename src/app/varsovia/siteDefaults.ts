import { isLocaleMap, mergeLocaleMapsFillLive } from "@/lib/localized";
import { DEFAULT_IA_PAGES } from "./iaPagesDefaults";
import pageCmsDefaults from "./pageCmsDefaults.json";

type SiteRecord = Record<string, unknown>;

const en = (value: string) => ({ en: value, th: "", pl: "" });
const loc = (english: string, th = "", pl = "") => ({
  en: english,
  th: th || english,
  pl: pl || english,
});

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
  aboutStoryImages: [
    "/home/featured-project/feature-1.jpg",
    "/home/featured-project/feature-2.jpg",
    "/home/about-3.jpg",
    "/home/featured-project/feature-4.jpg",
  ],

  localeFlags: {
    en: "/en.png",
    th: "/th.png",
    pl: "/pl.png",
  },

  designTools: [
    { name: en("CAXA"), image: "/team/design-tools/caxa.svg", order: 1 },
    { name: en("AUTO CAD"), image: "/team/design-tools/autocad.svg", order: 2 },
    { name: en("3D MAX"), image: "/team/design-tools/3dmax.svg", order: 3 },
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
  projectsCtaHref: "/interior-design",
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
  sectionCopy: {
    products: {
      title: en("Our Products"),
      subtitle: en("Interiors made for the way you actually live"),
      ctaLabel: en("Explore More"),
      ctaHref: "/interior-design",
      itemCtaLabel: en("Explore interiors"),
    },
    partners: {
      title: en("Our Global Partners"),
      subtitle: en("Powered by trusted brands from around the world"),
    },
    coreStrengths: {
      title: en("Core Strengths"),
      subtitle: en("Transforming data into intelligent, real-world solutions"),
    },
    catalogue: {
      title: en("Free Catalogue"),
      subtitle: en("Inspiration for Your Dream Kitchen"),
    },
    testimonials: {
      title: en("Real Stories. Real Spaces."),
      subtitle: en("Hear how we've transformed houses into dream homes"),
    },
    featured: {
      title: en("Featured Projects"),
      subtitle: en("Designed to inspire. Built to last"),
      ctaLabel: en("Explore More"),
      ctaHref: "/projects",
    },
    contact: {
      title: en("Get In touch"),
      subtitle: en("Your dream space begins with a simple conversation"),
    },
  },
  inquiryForm: {
    version: 1,
    submitLabel: { en: "Submit", th: "ส่ง", pl: "Wyślij" },
    compactTitle: { en: "GET IN TOUCH", th: "ติดต่อเรา", pl: "SKONTAKTUJ SIĘ" },
    compactSubtitle: {
      en: "YOUR DREAM SPACE BEGINS WITH A SIMPLE CONVERSATION",
      th: "พื้นที่ในฝันเริ่มต้นจากการพูดคุยสั้น ๆ",
      pl: "TWOJA WYMARZONA PRZESTRZEŃ ZACZYNA SIĘ OD PROSTEJ ROZMOWY",
    },
    compactSubmitLabel: { en: "Send Inquiry", th: "ส่งข้อความ", pl: "Wyślij zapytanie" },
    compactPrivacy: {
      en: "Your data is safe. We do not share it with third parties.",
      th: "ข้อมูลของคุณปลอดภัย เราไม่แชร์กับบุคคลที่สาม",
      pl: "Twoje dane są bezpieczne. Nie udostępniamy ich osobom trzecim.",
    },
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
            value: "under_5k",
            label: {
              en: "Under $5,000",
              th: "ต่ำกว่า $5,000",
              pl: "Poniżej $5,000",
            },
          },
          {
            value: "5k_15k",
            label: {
              en: "$5,000 – $15,000",
              th: "$5,000 – $15,000",
              pl: "$5,000 – $15,000",
            },
          },
          {
            value: "15k_30k",
            label: {
              en: "$15,000 – $30,000",
              th: "$15,000 – $30,000",
              pl: "$15,000 – $30,000",
            },
          },
          {
            value: "30k_75k",
            label: {
              en: "$30,000 – $75,000",
              th: "$30,000 – $75,000",
              pl: "$30,000 – $75,000",
            },
          },
          {
            value: "above_75k",
            label: {
              en: "Above $75,000",
              th: "มากกว่า $75,000",
              pl: "Powyżej $75,000",
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

  footerBio: loc(
    "Transforming homes with thoughtfully designed interiors tailored to your lifestyle and vision.",
    "เปลี่ยนบ้านของคุณด้วยอินทีเรียที่ออกแบบอย่างพิถีพิถันให้เข้ากับไลฟ์สไตล์และวิสัยทัศน์ของคุณ",
    "Przekształcamy domy dzięki przemyślanym wnętrzom dopasowanym do Twojego stylu życia i wizji."
  ),
  socialLinks: {
    whatsapp: "",
    instagram: "",
    x: "",
    facebook: "",
  },

  teamPage: {
    indexable: false,
    metaTitle: loc(
      "Our Team | Varsovia Design",
      "ทีมของเรา | Varsovia Design",
      "Nasz zespół | Varsovia Design"
    ),
    metaDescription: loc(
      "Meet the designers, architects, and craftspeople behind Varsovia Design — Italian design collaboration and technical teams for homes across Thailand.",
      "พบนักออกแบบ สถาปนิก และช่างฝีมือเบื้องหลัง Varsovia Design — ทีมออกแบบอิตาลีและทีมเทคนิคสำหรับบ้านทั่วไทย",
      "Poznaj projektantów, architektów i rzemieślników Varsovia Design — współpraca z Włochami i zespoły techniczne dla domów w Tajlandii."
    ),
    heroTitle: en("Our Team"),
    heroSubtitle: en("THE CREATIVE MINDS BEHIND EVERY BEAUTIFUL SPACE"),
    intro: en(
      "We have 3 sales teams respectively serving retail customers, commercial project contractors and franchisers. Inside each team, different sales representatives are responsible for different countries and regions. We are experts in our respective fields in order to meet different type customers' needs. 3 sales teams come together in a collaborative effort to provide an excellent experience for our customer."
    ),
    designTitle: en("Professional Design Team"),
    designEyebrow: en("Italian design team"),
    designBody: en(
      "Varsovia Design collaborates with Italian designers and suppliers to enhance our global competency. We combine updated aesthetics with functionality to create exciting spaces tailored to our clients' wishes and bring lasting living pleasure."
    ),
    architectTitle: en("Architect / Engineers"),
    architectEyebrow: en("Technical & structural team"),
    architectBody: en(
      "Our architect and engineering team ensures structural integrity, precise technical drawings, and seamless coordination between design intent and on-site execution."
    ),
    toolsTitle: en("Professional design tool"),
    toolsBody: en(
      "Professional design tools are adopted to assist for perfect art effect, including CAXA, CAD, 3D MAX, KD MAX, etc."
    ),
    stats: [
      { value: en("100+"), label: en("Successful Projects Completed") },
      {
        value: en("03"),
        label: en("Years of Excellence in Interior Solutions"),
      },
    ],
  },

  qualitySale: {
    indexable: false,
    metaTitle: loc(
      "Quality After Sales | Varsovia Design",
      "บริการหลังการขาย | Varsovia Design",
      "Serwis posprzedażowy | Varsovia Design"
    ),
    metaDescription: loc(
      "Warranty, maintenance, and after-sales care for Varsovia kitchens and interiors — from first contact through assessment, scheduling, and resolution.",
      "การรับประกัน การดูแลรักษา และบริการหลังการขายสำหรับครัวและอินทีเรีย Varsovia — ตั้งแต่ติดต่อครั้งแรกถึงประเมิน นัดหมาย และแก้ไข",
      "Gwarancja, konserwacja i opieka posprzedażowa kuchni i wnętrz Varsovia — od pierwszego kontaktu przez ocenę, umówienie wizyty i rozwiązanie."
    ),
    heroTitle: en("Quality After Sales"),
    heroSubtitle: en(
      "Committed to your satisfaction beyond project completion"
    ),
    heroBody: en(
      "We believe exceptional interior design extends well beyond project completion. Varsovia offers reliable after-sales support, maintenance guidance, and prompt assistance — keeping your interiors looking and performing at their best for years to come."
    ),
    feature1Title: en("95.1% Efficiency of Formaldehyde Purification"),
    feature2Title: en("82.4% Purification Effect of Formaldehyde Lasting"),
    feature3Title: en("Long-Lasting Mold Resistance Level 0"),
    feature4Title: en("24 Hours Continuous Air Purification"),
    supportTitle: en("Support Process"),
    supportSubtitle: en("HOW IT'S WORK"),
    step1Title: en("Contact Us"),
    step1Desc: en("Reach out through phone, email, or our support form."),
    step2Title: en("Issue Assessment"),
    step2Desc: en("Our team reviews your request and identifies the best solution."),
    step3Title: en("Service Scheduling"),
    step3Desc: en("A convenient service appointment is arranged."),
    step4Title: en("Resolution"),
    step4Desc: en("Our experts complete the required service efficiently and professionally."),
    faqTitle: en("FAQ"),
    faqSubtitle: en("QUESTIONS & ANSWER"),
    faq1Q: en("Is my project covered under warranty?"),
    faq1A: en(
      "Yes. Warranty coverage depends on the products and materials used. Our team will explain all warranty details during project handover."
    ),
    faq2Q: en("How can I request after-sales support?"),
    faq2A: en(
      "Reach us through the contact page, email, or phone. Our team will log your request and schedule a visit at the earliest convenience."
    ),
    faq3Q: en("Do you provide maintenance services?"),
    faq3A: en(
      "We offer scheduled maintenance and check-ups for modular kitchens, wardrobes, and fitted furniture to keep everything in top condition."
    ),
    faq4Q: en("Can I request upgrades after project completion?"),
    faq4A: en(
      "Yes — we can help you plan upgrades and refreshes after your project is complete, from hardware swaps to layout enhancements."
    ),
    support1Image: "/quality-sale/support-illustration-1.png",
    support2Image: "/quality-sale/support-illustration-2.png",
    support3Image: "/quality-sale/support-illustration-3.png",
    support4Image: "/quality-sale/support-illustration-4.png",
    feature1Image: "/home/featured-project/feature-1.jpg",
    feature1ImageAlt: en("Premium kitchen cabinetry detail"),
    feature2Image: "/home/featured-project/feature-2.jpg",
    feature2ImageAlt: en("Living room finish and texture"),
    feature3Image: "/home/featured-project/feature-3.jpg",
    feature3ImageAlt: en("Bedroom wardrobe craftsmanship"),
    feature4Image: "/home/featured-project/feature-4.jpg",
    feature4ImageAlt: en("Bathroom vanity and stone surface"),
  },

  showcaseMeta: [
    {
      tabKey: "All",
      title: en("Our Showcase"),
      subtitle: en("Every space, every story"),
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

  projectsPage: {
    indexable: false,
    metaTitle: en("Our Showcase | Varsovia Design"),
    metaDescription: en(
      "Varsovia Design showcase — homes and projects by region and type."
    ),
    heroTitle: en("Our Showcase"),
    heroSubtitle: en("Every space, every story"),
    navSectionLabel: en("By Region & Type"),
  },

  phone: "+66 64 683 9777",
  email: "hi@thailandkitchens.com",
  address: en("Route 4169, Mae Nam, Amphoe Ko Samui, Surat Thani 84330"),

  contactPhone: "+66 64 683 9777",
  mobileWhatsapp: "+66 99 359 6916",
  whatsappUrl: "https://wa.me/66993596916",
  facebookUrl: "https://www.facebook.com/ThailandKitchens/",
  footerOffices: [
    {
      label: loc("Samui Office", "สำนักงานสมุย", "Biuro Samui"),
      address: "Route 4169, Mae Nam, Amphoe Ko Samui, Surat Thani 84330",
    },
    {
      label: loc("Phuket Office", "สำนักงานภูเก็ต", "Biuro Phuket"),
      address: "Royal Phuket Marina, Building MS2, Ko Kaeo, Mueang, Phuket 83000",
    },
    {
      label: loc("Pattaya Office", "สำนักงานพัทยา", "Biuro Pattaya"),
      address:
        "82, 48-49 Chaiyaphruek 2 Rd, Pattaya City, Bang Lamung District, Chon Buri 20150",
    },
  ],

  interiorCatalogMode: "hybrid",

  footerNavigation: {
    version: 3,
    linkColumns: [
      {
        id: "primary",
        order: 1,
        enabled: true,
        links: [
          { label: loc("Journal", "วารสาร", "Journal"), href: "/journal", enabled: true },
          { label: loc("About Us", "เกี่ยวกับเรา", "O nas"), href: "/about", enabled: true },
          { label: loc("Contact Us", "ติดต่อเรา", "Kontakt"), href: "/contact", enabled: true },
          { label: loc("FAQ", "คำถามที่พบบ่อย", "Najczęstsze pytania"), href: "/faq", enabled: true },
          { label: loc("Catalogue", "แคตตาล็อก", "Katalog"), href: "/catalogue", enabled: true },
        ],
      },
      {
        id: "products",
        order: 2,
        enabled: true,
        links: [
          { label: loc("Kitchen", "ครัว", "Kuchnia"), href: "/interior-design?category=Kitchen", enabled: true },
          { label: loc("Bedroom", "ห้องนอน", "Sypialnia"), href: "/interior-design?category=Bedroom", enabled: true },
          { label: loc("Bathroom", "ห้องน้ำ", "Łazienka"), href: "/interior-design?category=Bathroom", enabled: true },
          { label: loc("Furniture", "เฟอร์นิเจอร์", "Meble"), href: "/furniture", enabled: true },
          {
            label: loc("Door & Windows", "ประตูและหน้าต่าง", "Drzwi i okna"),
            href: "/interior-design?category=Door%20%26%20Windows",
            enabled: true,
          },
          {
            label: loc("Whole House Solutions", "โซลูชันทั้งบ้าน", "Rozwiązania dla całego domu"),
            href: "/interior-design?category=Whole%20House%20Solutions",
            enabled: true,
          },
        ],
      },
    ],
    legalLinks: [
      { label: loc("Privacy", "ความเป็นส่วนตัว", "Prywatność"), href: "/privacy", enabled: true },
      { label: loc("Terms", "ข้อกำหนด", "Regulamin"), href: "/terms", enabled: true },
      { label: loc("Sitemap", "แผนผังเว็บไซต์", "Mapa witryny"), href: "/sitemap.xml", enabled: true },
    ],
    contactHeading: loc("Contact Us", "ติดต่อเรา", "Kontakt"),
    contactLabels: {
      email: loc("Email", "อีเมล", "E-mail"),
      mobileWhatsapp: loc("Mobile / WhatsApp", "มือถือ / WhatsApp", "Telefon / WhatsApp"),
      contactNumber: loc("Contact Number", "เบอร์ติดต่อ", "Numer kontaktowy"),
    },
    socialLabels: {
      whatsapp: loc("WhatsApp"),
      facebook: loc("Facebook"),
      instagram: loc("Instagram"),
      x: loc("X"),
    },
    copyright: loc("©{year} Varsovia Design"),
  },

  pages: DEFAULT_IA_PAGES as unknown as SiteRecord,

  ...(pageCmsDefaults as SiteRecord),
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
  /** Nested CMS blobs — fill only when blank; never deep-merge (avoids corrupting form field arrays). */
  const atomicKeys = new Set([
    "inquiryForm",
    "mainNavigation",
    "footerNavigation",
    "showcaseMeta",
    "projectsPage",
    "aboutPageSettings",
    "homeSeo",
    "faqPage",
    "cataloguePage",
    "contactPage",
    "legalPages",
    "pages",
  ]);

  for (const [key, defaultValue] of Object.entries(defaults)) {
    const currentValue = merged[key];

    if (isBlank(currentValue)) {
      merged[key] = structuredClone(defaultValue);
      continue;
    }

    if (
      typeof currentValue === "string" &&
      currentValue.trim() &&
      isLocaleMap(defaultValue)
    ) {
      merged[key] = mergeLocaleMapsFillLive(currentValue, defaultValue);
      continue;
    }

    if (atomicKeys.has(key)) {
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

/**
 * Overwrite Showcase listing + Google copy from the live seed.
 * Keeps the editor’s indexable flag so Sync does not silently un-index /projects.
 */
export function replaceShowcaseFromLiveSeed(site: SiteRecord): SiteRecord {
  const current =
    site.projectsPage && typeof site.projectsPage === "object" && !Array.isArray(site.projectsPage)
      ? (site.projectsPage as SiteRecord)
      : {};
  const defaults = VARSOVIA_SITE_DEFAULTS.projectsPage as SiteRecord;
  return {
    ...site,
    showcaseMeta: structuredClone(VARSOVIA_SITE_DEFAULTS.showcaseMeta),
    projectsPage: {
      ...structuredClone(defaults),
      indexable: current.indexable === true,
    },
  };
}

/**
 * Overwrite Free Catalogue banner + Google copy from the live seed.
 * Keeps the editor’s indexable flag so Sync does not silently un-index /catalogue.
 */
export function replaceCatalogueFromLiveSeed(site: SiteRecord): SiteRecord {
  const current =
    site.cataloguePage && typeof site.cataloguePage === "object" && !Array.isArray(site.cataloguePage)
      ? (site.cataloguePage as SiteRecord)
      : {};
  const defaults = VARSOVIA_SITE_DEFAULTS.cataloguePage as SiteRecord;
  return {
    ...site,
    cataloguePage: {
      ...structuredClone(defaults),
      indexable: current.indexable === true,
    },
  };
}

/**
 * Overwrite Our Team banner, grids, tools, and Google copy from the live seed.
 * Keeps the editor’s indexable flag so Sync does not silently un-index /team.
 */
export function replaceTeamFromLiveSeed(site: SiteRecord): SiteRecord {
  const current =
    site.teamPage && typeof site.teamPage === "object" && !Array.isArray(site.teamPage)
      ? (site.teamPage as SiteRecord)
      : {};
  const defaults = VARSOVIA_SITE_DEFAULTS.teamPage as SiteRecord;
  return {
    ...site,
    designTools: structuredClone(VARSOVIA_SITE_DEFAULTS.designTools),
    teamPage: {
      ...structuredClone(defaults),
      indexable: current.indexable === true,
    },
  };
}

const QUALITY_IMAGE_KEYS = [
  "feature1Image",
  "feature2Image",
  "feature3Image",
  "feature4Image",
  "support1Image",
  "support2Image",
  "support3Image",
  "support4Image",
] as const;

function keepUploadedImages(current: SiteRecord, keys: readonly string[]): SiteRecord {
  const kept: SiteRecord = {};
  for (const key of keys) {
    const value = current[key];
    if (typeof value === "string" && value.trim()) kept[key] = value;
  }
  return kept;
}

/**
 * Overwrite Quality After Sales copy + Google from the live seed.
 * Keeps uploaded feature/support images and the editor’s indexable flag.
 */
export function replaceQualityFromLiveSeed(site: SiteRecord): SiteRecord {
  const current =
    site.qualitySale && typeof site.qualitySale === "object" && !Array.isArray(site.qualitySale)
      ? (site.qualitySale as SiteRecord)
      : {};
  const defaults = VARSOVIA_SITE_DEFAULTS.qualitySale as SiteRecord;
  return {
    ...site,
    qualitySale: {
      ...structuredClone(defaults),
      ...keepUploadedImages(current, QUALITY_IMAGE_KEYS),
      indexable: current.indexable === true,
    },
  };
}

/**
 * Overwrite Contact banner, map, showroom headings, form fields, and Google from the live seed.
 * Keeps collage photos and the editor’s indexable flag.
 */
export function replaceContactFromLiveSeed(site: SiteRecord): SiteRecord {
  const current =
    site.contactPage && typeof site.contactPage === "object" && !Array.isArray(site.contactPage)
      ? (site.contactPage as SiteRecord)
      : {};
  const defaults = VARSOVIA_SITE_DEFAULTS.contactPage as SiteRecord;
  const currentImages = Array.isArray(site.contactImages)
    ? (site.contactImages as unknown[]).filter((item) => typeof item === "string" && item.trim())
    : [];
  return {
    ...site,
    contactImages:
      currentImages.length > 0
        ? currentImages
        : structuredClone(VARSOVIA_SITE_DEFAULTS.contactImages),
    inquiryForm: structuredClone(VARSOVIA_SITE_DEFAULTS.inquiryForm),
    contactPage: {
      ...structuredClone(defaults),
      indexable: current.indexable === true,
    },
  };
}

/**
 * Overwrite footer bio, offices, contact details, and nav from the live seed.
 * Keeps Instagram / X URLs if the editor already set them.
 */
export function replaceFooterFromLiveSeed(site: SiteRecord): SiteRecord {
  const keepUrl = (key: string) => {
    const value = site[key];
    return typeof value === "string" && value.trim() ? value.trim() : "";
  };
  return {
    ...site,
    footerBio: structuredClone(VARSOVIA_SITE_DEFAULTS.footerBio),
    email: VARSOVIA_SITE_DEFAULTS.email,
    contactPhone: VARSOVIA_SITE_DEFAULTS.contactPhone,
    mobileWhatsapp: VARSOVIA_SITE_DEFAULTS.mobileWhatsapp,
    whatsappUrl: VARSOVIA_SITE_DEFAULTS.whatsappUrl,
    facebookUrl: VARSOVIA_SITE_DEFAULTS.facebookUrl,
    instagramUrl: keepUrl("instagramUrl") || VARSOVIA_SITE_DEFAULTS.instagramUrl || "",
    xUrl: keepUrl("xUrl") || VARSOVIA_SITE_DEFAULTS.xUrl || "",
    footerOffices: structuredClone(VARSOVIA_SITE_DEFAULTS.footerOffices),
    footerNavigation: structuredClone(VARSOVIA_SITE_DEFAULTS.footerNavigation),
  };
}

/**
 * Overwrite FAQ banner + Google from the live seed.
 * Does not recreate deleted Q&A. Keeps the editor’s indexable flag.
 */
export function replaceFaqFromLiveSeed(site: SiteRecord): SiteRecord {
  const current =
    site.faqPage && typeof site.faqPage === "object" && !Array.isArray(site.faqPage)
      ? (site.faqPage as SiteRecord)
      : {};
  const defaults = VARSOVIA_SITE_DEFAULTS.faqPage as SiteRecord;
  return {
    ...site,
    faqPage: {
      ...structuredClone(defaults),
      indexable: current.indexable === true,
    },
  };
}
