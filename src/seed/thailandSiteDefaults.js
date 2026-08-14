/**
 * Canonical Thailand Kitchen public-site content mirrored into CMS defaults.
 * Text fields use Varsovia-style { en, th, pl }. Media/URLs stay plain strings.
 */
const { L } = require("../utils/localized");

const DEFAULT_FEATURE_HIGHLIGHTS = [
  {
    title: L(
      "Matte Obsidian Finish",
      "ผิวด้าน Obsidian",
      "Matowe wykończenie Obsidian"
    ),
    description: L(
      "A deep, light-absorbing lacquer that keeps surfaces calm and fingerprints discreet in daily living.",
      "แล็กเกอร์ด้านดูดซับแสง ผิวเรียบสงบ ลายนิ้วมือไม่เด่นในชีวิตประจำวัน",
      "Głęboki, matowy lakier pochłaniający światło — spokojne powierzchnie i dyskretne odciski palców."
    ),
  },
  {
    title: L(
      "Artisanal Gold Hardware",
      "ฮาร์ดแวร์ทองงานฝีมือ",
      "Rzemieślnicze złote okucia"
    ),
    description: L(
      "Hand-finished pulls and hinges that catch soft light and complete the dark timber silhouette.",
      "มือจับและบานพับขัดมือ รับแสงนุ่ม เติมเต็มเงาไม้โทนเข้ม",
      "Ręcznie wykończone uchwyty i zawiasy, które łapią miękkie światło i dopełniają ciemną sylwetkę drewna."
    ),
  },
  {
    title: L(
      "Imperial Marble Worktops",
      "เคาน์เตอร์หินอ่อน Imperial",
      "Blaty z marmuru Imperial"
    ),
    description: L(
      "Thick stone slabs with natural veining, sealed for lasting kitchen use and a quiet luxury feel.",
      "แผ่นหินหนาลายธรรมชาติ เคลือบทนทาน สัมผัสหรูหราแบบสงบ",
      "Grube płyty kamienne z naturalnym żyłkowaniem, zabezpieczone do codziennego użytku."
    ),
  },
];

const DEFAULT_HOME_SECTIONS = {
  hero: {
    subtitle: {"en":"Fineline of kitchen","th":"เส้นบางของครัว","pl":"Fine line kuchni"},
    title: {"en":"Timeless craft of Thai kitchen","th":"งานฝีมือครัวไทยที่เหนือกาลเวลา","pl":"Ponadczasowe rzemiosło kuchni tajskiej"},
    description: {"en":"From custom cabinetry to complete kitchen transformations, we bring decades of Thai craftsmanship to every home we design.","th":"ตั้งแต่ตู้ครัวสั่งทำไปจนถึงการเปลี่ยนโฉมครัวทั้งหลัง เรานำทศวรรษแห่งงานฝีมือไทยมาสู่ทุกบ้านที่เราออกแบบ","pl":"Od zabudowy na wymiar po kompleksowe metamorfozy kuchni — od dekad wnosimy tajskie rzemiosło do każdego domu, który projektujemy."},
    buttonText: {"en":"Explore","th":"สำรวจ","pl":"Odkryj"},
    image: "/products/Kitchen2.png",
    videoUrl: "",
  },
  statistics: {
    items: [
      { label: {"en":"Years Of Experience","th":"ปีแห่งประสบการณ์","pl":"Lat doświadczenia"}, value: "15", suffix: "+" },
      { label: {"en":"Cities Across Thailand","th":"เมืองทั่วประเทศไทย","pl":"Miast w Tajlandii"}, value: "12", suffix: "" },
      { label: {"en":"Kitchen Completed","th":"ครัวที่เสร็จสมบูรณ์","pl":"Ukończonych kuchni"}, value: "800", suffix: "+" },
    ],
  },
  advantages: {
    eyebrow: {"en":"Premium Features","th":"คุณสมบัติพรีเมียม","pl":"Funkcje premium"},
    title: {"en":"Why Choose US","th":"ทำไมต้องเลือกเรา","pl":"Dlaczego my"},
    items: [
      {
        title: {"en":"Premium Material Selection","th":"คัดสรรวัสดุพรีเมียม","pl":"Staranny dobór materiałów"},
        description: {"en":"Certified suppliers and carefully chosen finishes built for lasting beauty.","th":"ซัพพลายเออร์ที่ผ่านการรับรองและผิวสำเร็จที่คัดสรรเพื่อความงามที่ยั่งยืน","pl":"Certyfikowani dostawcy i wykończenia wybrane pod trwałe piękno."},
        icon: "",
      },
      {
        title: {"en":"Fast Delivery Time","th":"จัดส่งรวดเร็ว","pl":"Szybka realizacja"},
        description: {"en":"Clear timelines and reliable scheduling so your kitchen arrives as promised.","th":"ไทม์ไลน์ชัดเจนและการนัดหมายที่เชื่อถือได้ เพื่อให้ครัวของคุณมาถึงตามสัญญา","pl":"Jasne harmonogramy i niezawodne terminy, by kuchnia była gotowa na czas."},
        icon: "",
      },
      {
        title: {"en":"End-to-End Service","th":"บริการครบวงจร","pl":"Kompleksowa obsługa"},
        description: {"en":"One passionate team from the first sketch through final installation.","th":"ทีมเดียวที่หลงใหลในงาน ตั้งแต่ร่างแรกจนติดตั้งเสร็จสมบูรณ์","pl":"Jeden zaangażowany zespół od pierwszego szkicu po finalny montaż."},
        icon: "",
      },
    ],
  },
  story: {
    title: {"en":"Crafted With Passion","th":"รังสรรค์ด้วยความหลงใหล","pl":"Stworzone z pasją"},
    subtitle: {"en":"Our Story","th":"เรื่องราวของเรา","pl":"Nasza historia"},
    description: {"en":"Over the years, we have designed hundreds of kitchens across Thailand. Each project has taught us something new about space, about people, and about what it means to feel at home.","th":"ตลอดหลายปีที่ผ่านมา เราได้ออกแบบครัวหลายร้อยหลังทั่วประเทศไทย แต่ละโปรเจกต์สอนเราเกี่ยวกับพื้นที่ ผู้คน และความหมายของการรู้สึกเหมือนบ้าน","pl":"Przez lata zaprojektowaliśmy setki kuchni w całej Tajlandii. Każdy projekt uczył nas czegoś nowego o przestrzeni, ludziach i tym, co znaczy czuć się jak w domu."},
    image: "/slider/crafted-with-passion.png",
  },
  transition: {
    pillars: [
      {
        title: L("Local Craftsmanship", "งานฝีมือท้องถิ่น", "Lokalne rzemiosło"),
        description: L(
          "Handmade by skilled artisans rooted in Thai tradition.",
          "ทำด้วยมือโดยช่างฝีมือที่รากฐานในประเพณีไทย",
          "Ręcznie tworzone przez rzemieślników zakorzenionych w tajskiej tradycji."
        ),
        icon: "",
      },
      {
        title: L("Tailored Design", "ออกแบบเฉพาะคุณ", "Dopasowany projekt"),
        description: L(
          "Every layout shaped around how you actually live.",
          "ทุกเลย์เอาต์ออกแบบตามชีวิตจริงของคุณ",
          "Każdy układ dopasowany do tego, jak naprawdę żyjesz."
        ),
        icon: "",
      },
      {
        title: L("End-to-End Service", "บริการครบวงจร", "Kompleksowa obsługa"),
        description: L(
          "From first sketch to final install, one dedicated team.",
          "จากสเก็ตช์แรกถึงติดตั้งสุดท้าย ทีมเดียวดูแล",
          "Od pierwszego szkicu do montażu — jeden zaangażowany zespół."
        ),
        icon: "",
      },
      {
        title: L("Lasting Quality", "คุณภาพที่ยั่งยืน", "Trwała jakość"),
        description: L(
          "Materials and finishes chosen to age with grace.",
          "วัสดุและผิวสำเร็จคัดให้สวยงามตามกาลเวลา",
          "Materiały i wykończenia wybrane, by pięknie się starzeć."
        ),
        icon: "",
      },
    ],
  },
  testimonials: {
    eyebrow: {"en":"Build On Trust","th":"สร้างบนความไว้วางใจ","pl":"Zbudowane na zaufaniu"},
    title: {"en":"What Our Client Says","th":"ลูกค้าของเราพูดถึง","pl":"Co mówią nasi klienci"},
    items: [
      {
        name: L("Brooklyn Simmons", "Brooklyn Simmons", "Brooklyn Simmons"),
        role: {"en":"Homeowner, Bangkok","th":"เจ้าของบ้าน กรุงเทพฯ","pl":"Właściciel domu, Bangkok"},
        quote: {"en":"We had a small kitchen with eleven years of accumulated clutter and no real system. The team came in, listened to how we actually cook, and redesigned everything around our habits. The pull-out pantry and the corner unit with rotating shelves changed everything. It feels twice the size now.","th":"ครัวเล็กของเรามีของสะสมสิบเอ็ดปีและไม่มีระบบเลย ทีมงานเข้ามา ฟังว่าเราทำอาหารอย่างไร แล้วออกแบบใหม่ตามนิสัยของเรา ตู้พัลเอาท์และมุมหมุนเปลี่ยนทุกอย่าง รู้สึกกว้างขึ้นเป็นสองเท่า","pl":"Mieliśmy małą kuchnię z jedenastoma latami nagromadzonego bałaganu i bez systemu. Zespół wysłuchał, jak naprawdę gotujemy, i przeprojektował wszystko wokół naszych nawyków. Wysuwana spiżarnia i narożnik z obrotowymi półkami zmieniły wszystko. Teraz wydaje się dwa razy większa."},
        image: "/testimonial/image1.png",
        rating: 5,
      },
      {
        name: L("Sarah Johnson", "Sarah Johnson", "Sarah Johnson"),
        role: {"en":"Homeowner, Phuket","th":"เจ้าของบ้าน ภูเก็ต","pl":"Właścicielka domu, Phuket"},
        quote: {"en":"Excellent craftsmanship and premium finishing. Every cabinet is perfectly installed and the design looks luxurious. The team guided us through every material choice and the result is beyond what we imagined.","th":"งานฝีมือยอดเยี่ยมและผิวสำเร็จพรีเมียม ตู้ทุกใบติดตั้งอย่างสมบูรณ์แบบ ดีไซน์หรูหรามาก ทีมงานแนะนำทุกการเลือกวัสดุ ผลลัพธ์เกินความคาดหมาย","pl":"Doskonałe rzemiosło i premium wykończenie. Każda szafka jest idealnie zamontowana, a projekt wygląda luksusowo. Zespół poprowadził nas przez każdy wybór materiałów — efekt przerósł wyobrażenia."},
        image: "/testimonial/image1.png",
        rating: 5,
      },
      {
        name: L("Michael Brown", "Michael Brown", "Michael Brown"),
        role: {"en":"Homeowner, Chiang Mai","th":"เจ้าของบ้าน เชียงใหม่","pl":"Właściciel domu, Chiang Mai"},
        quote: {"en":"Professional team from consultation to installation. Highly recommended for anyone looking for a modern kitchen. They respected our timeline and the finish quality is exceptional throughout.","th":"ทีมงานมืออาชีพตั้งแต่ปรึกษาจนติดตั้ง แนะนำอย่างยิ่งสำหรับใครที่ต้องการครัวทันสมัย พวกเขารักษาไทม์ไลน์และคุณภาพผิวสำเร็จยอดเยี่ยมตลอด","pl":"Profesjonalny zespół od konsultacji po montaż. Gorąco polecam każdemu, kto szuka nowoczesnej kuchni. Dotrzymali terminów, a jakość wykończenia jest wyjątkowa."},
        image: "/testimonial/image1.png",
        rating: 5,
      },
    ],
  },
  catalogue: {
    eyebrow: L("Design Inspiration", "แรงบันดาลใจการออกแบบ", "Inspiracje projektowe"),
    title: L("Our Latest Catalogue", "แคตตาล็อกล่าสุดของเรา", "Nasz najnowszy katalog"),
    pageEyebrow: L("Free Download", "ดาวน์โหลดฟรี", "Darmowe pobieranie"),
    pageTitle: L("Catalogue", "แคตตาล็อก", "Katalog"),
    pageDescription: L(
      "Download our latest kitchen catalogue — layouts, materials, and finishes crafted for Thailand.",
      "ดาวน์โหลดแคตตาล็อกครัวล่าสุด — เลย์เอาต์ วัสดุ และผิวสำเร็จที่ออกแบบสำหรับประเทศไทย",
      "Pobierz nasz najnowszy katalog kuchni — układy, materiały i wykończenia stworzone dla Tajlandii."
    ),
    items: [
      {
        title: L("2026 EDITION", "ฉบับ 2026", "EDYCJA 2026"),
        category: L("Minimal", "มินิมอล", "Minimal"),
        image: "/catlog/catlog.png",
        pdfUrl: "",
        fileName: "catalogue-minimal.pdf",
        downloadName: "Thailand-Kitchens-Catalogue-Minimal.pdf",
      },
      {
        title: L("2026 EDITION", "ฉบับ 2026", "EDYCJA 2026"),
        category: L("Classic", "คลาสสิก", "Klasyczny"),
        image: "/catlog/catlog (1).png",
        pdfUrl: "",
        fileName: "catalogue-classic.pdf",
        downloadName: "Thailand-Kitchens-Catalogue-Classic.pdf",
      },
      {
        title: L("2026 EDITION", "ฉบับ 2026", "EDYCJA 2026"),
        category: L("Modern", "โมเดิร์น", "Nowoczesny"),
        image: "/catlog/catlog (2).png",
        pdfUrl: "",
        fileName: "catalogue-modern.pdf",
        downloadName: "Thailand-Kitchens-Catalogue-Modern.pdf",
      },
      {
        title: L("2026 EDITION", "ฉบับ 2026", "EDYCJA 2026"),
        category: L("Modern", "โมเดิร์น", "Nowoczesny"),
        image: "/catlog/catlog.png",
        pdfUrl: "",
        fileName: "catalogue.pdf",
        downloadName: "Thailand-Kitchens-Catalogue.pdf",
      },
    ],
  },
  partners: {
    logos: [
      { name: "Partner 1", image: "/brandLogo/first (1).png" },
      { name: "Partner 2", image: "/brandLogo/first (2).png" },
      { name: "Partner 3", image: "/brandLogo/first (3).png" },
      { name: "Partner 4", image: "/brandLogo/first (4).png" },
      { name: "Partner 5", image: "/brandLogo/first (5).png" },
      { name: "Partner 6", image: "/brandLogo/first (6).png" },
    ],
  },
  faq: {
    eyebrow: {"en":"Common Questions","th":"คำถามที่พบบ่อย","pl":"Częste pytania"},
    title: {"en":"Frequently Asked Questions","th":"คำถามที่พบบ่อย","pl":"Najczęściej zadawane pytania"},
    items: [
      { question: {"en":"How much does a modular kitchen in Thai?","th":"ครัวโมดูลาร์ในไทยราคาเท่าไหร่?","pl":"Ile kosztuje kuchnia modułowa w Tajlandii?"}, answer: {"en":"Pricing depends on layout, materials, and finishes. Most modular kitchens start from a custom quote after a free consultation, where we assess your space and preferences.","th":"ราคาขึ้นอยู่กับเลย์เอาต์ วัสดุ และผิวสำเร็จ ครัวโมดูลาร์ส่วนใหญ่เริ่มจากใบเสนอราคาที่ปรับตามความต้องการหลังการปรึกษาฟรี ซึ่งเราจะประเมินพื้นที่และความชอบของคุณ","pl":"Cena zależy od układu, materiałów i wykończeń. Większość kuchni modułowych zaczyna się od indywidualnej wyceny po bezpłatnej konsultacji, podczas której oceniamy przestrzeń i preferencje."} },
      { question: {"en":"How does the kitchen process work from start to finish?","th":"ขั้นตอนทำครัวตั้งแต่ต้นจนจบเป็นอย่างไร?","pl":"Jak wygląda proces realizacji kuchni od początku do końca?"}, answer: {"en":"We begin with a design consultation, move into planning and material selection, then handle manufacturing, delivery, and full installation with one dedicated team.","th":"เราเริ่มจากการปรึกษาออกแบบ ไปสู่การวางแผนและการเลือกวัสดุ จากนั้นดูแลการผลิต การจัดส่ง และการติดตั้งเต็มรูปแบบด้วยทีมเดียว","pl":"Zaczynamy od konsultacji projektowej, przechodzimy do planowania i wyboru materiałów, a następnie zajmujemy się produkcją, dostawą i pełnym montażem jednym zespołem."} },
      { question: {"en":"How long does a full kitchen installation take?","th":"การติดตั้งครัวทั้งหลังใช้เวลานานแค่ไหน?","pl":"Ile trwa pełny montaż kuchni?"}, answer: {"en":"A typical project takes 6–10 weeks from design approval to installation, depending on customisation, material availability, and site readiness.","th":"โปรเจกต์ทั่วไปใช้เวลา 6–10 สัปดาห์ ตั้งแต่การอนุมัติแบบจนถึงติดตั้ง ขึ้นอยู่กับการปรับแต่ง ความพร้อมของวัสดุ และความพร้อมของหน้างาน","pl":"Typowy projekt trwa 6–10 tygodni od zatwierdzenia projektu do montażu, w zależności od personalizacji, dostępności materiałów i gotowości miejsca."} },
      { question: {"en":"Do you offer free design consultations?","th":"มีบริการปรึกษาออกแบบฟรีหรือไม่?","pl":"Czy oferujecie bezpłatne konsultacje projektowe?"}, answer: {"en":"Yes. We offer a complimentary design consultation to understand your needs, measure your space, and share initial layout concepts before you commit.","th":"มีครับ/ค่ะ เรามีบริการปรึกษาออกแบบฟรีเพื่อทำความเข้าใจความต้องการ วัดพื้นที่ และแชร์แนวคิดเลย์เอาต์เบื้องต้นก่อนที่คุณจะตัดสินใจ","pl":"Tak. Oferujemy bezpłatną konsultację, aby poznać Twoje potrzeby, zmierzyć przestrzeń i przedstawić wstępne koncepcje układu przed podjęciem decyzji."} },
      { question: {"en":"What materials do you use in your kitchens?","th":"คุณใช้วัสดุอะไรในครัว?","pl":"Jakich materiałów używacie w kuchniach?"}, answer: {"en":"We work with premium teak, engineered wood, laminates, and carefully selected hardware. Every material is chosen for durability, beauty, and Thai craftsmanship standards.","th":"เราทำงานกับไม้สักพรีเมียม ไม้เอ็นจิเนียร์ ลามิเนต และฮาร์ดแวร์ที่คัดสรรอย่างพิถีพิถัน ทุกวัสดุถูกเลือกเพื่อความทนทาน ความงาม และมาตรฐานงานฝีมือไทย","pl":"Pracujemy z premium teką, drewnem konstrukcyjnym, laminatami i starannie dobranym osprzętem. Każdy materiał jest wybrany pod kątem trwałości, piękna i standardów tajskiego rzemiosła."} },
      { question: {"en":"Can you customise an existing kitchen layout?","th":"ปรับแต่งเลย์เอาต์ครัวที่มีอยู่แล้วได้ไหม?","pl":"Czy możecie dostosować istniejący układ kuchni?"}, answer: {"en":"Absolutely. We can redesign and upgrade existing kitchens, adapting cabinetry, storage, and finishes to better suit your lifestyle.","th":"ได้แน่นอน เราสามารถออกแบบใหม่และอัปเกรดครัวเดิม ปรับตู้ การจัดเก็บ และผิวสำเร็จให้เหมาะกับไลฟ์สไตล์ของคุณมากขึ้น","pl":"Oczywiście. Możemy przeprojektować i ulepszyć istniejące kuchnie, dopasowując zabudowę, przechowywanie i wykończenia do Twojego stylu życia."} },
      { question: {"en":"Do you provide after-sales support?","th":"มีการดูแลหลังการขายหรือไม่?","pl":"Czy zapewniacie wsparcie posprzedażowe?"}, answer: {"en":"Yes. We provide after-sales support for adjustments, maintenance guidance, and warranty-covered workmanship.","th":"มีครับ/ค่ะ เรามีการดูแลหลังการขายสำหรับการปรับแต่ง คำแนะนำการบำรุงรักษา และงานฝีมือที่อยู่ในประกัน","pl":"Tak. Zapewniamy wsparcie posprzedażowe w zakresie regulacji, konserwacji i prac objętych gwarancją."} },
      { question: {"en":"Where do you install kitchens?","th":"คุณติดตั้งครัวที่ไหนบ้าง?","pl":"Gdzie montujecie kuchnie?"}, answer: {"en":"We install across Thailand and selected international projects, with dedicated teams for measurement, delivery, and on-site installation.","th":"เราติดตั้งทั่วประเทศไทยและโปรเจกต์ต่างประเทศบางแห่ง พร้อมทีมเฉพาะสำหรับวัดพื้นที่ จัดส่ง และติดตั้งหน้างาน","pl":"Montujemy w całej Tajlandii oraz w wybranych projektach międzynarodowych, z dedykowanymi zespołami do pomiarów, dostawy i montażu na miejscu."} },
    ],
  },
  footer: {
    email: "hello@Thaikitchen.in",
    phone: "+91 98765 43210",
    address: {"en":"Pattaya & Samui, Thailand","th":"พัทยา และ เกาะสมุย ประเทศไทย","pl":"Pattaya i Samui, Tajlandia"},
    facebook: "https://www.facebook.com/ThailandKitchens/",
    instagram: "https://www.facebook.com/ThailandKitchens/",
    line: "https://web.whatsapp.com/",
    logoUrl: "/footer/logo.png",
    tagline: {"en":"Designing kitchens that feel like home. From concept to installation, we build spaces you'll love for years.","th":"ออกแบบครัวที่ให้ความรู้สึกเหมือนบ้าน ตั้งแต่แนวคิดจนถึงการติดตั้ง เราสร้างพื้นที่ที่คุณจะรักไปอีกนานหลายปี","pl":"Projektujemy kuchnie, które czują się jak dom. Od koncepcji po montaż tworzymy przestrzenie, które pokochasz na lata."},
    homeColumnTitle: {"en":"Home","th":"หน้าแรก","pl":"Strona główna"},
    productColumnTitle: {"en":"Product","th":"ผลิตภัณฑ์","pl":"Produkt"},
    homeLinks: [
      { label: {"en":"Our Story","th":"เรื่องราวของเรา","pl":"Nasza historia"}, href: "/#our-service" },
      { label: {"en":"Free Catalogue","th":"แคตตาล็อกฟรี","pl":"Darmowy katalog"}, href: "/catalogue" },
      { label: {"en":"Co-partnered","th":"โคพาร์ทเนอร์","pl":"Co-partnered"}, href: "/#brands" },
      { label: {"en":"Contact","th":"ติดต่อ","pl":"Kontakt"}, href: "/contact" },
    ],
    productLinks: [
      { label: {"en":"Best Seller","th":"สินค้าขายดี","pl":"Bestseller"}, href: "/products?tab=best-seller" },
      { label: {"en":"Our Products","th":"ผลิตภัณฑ์ของเรา","pl":"Nasze produkty"}, href: "/products" },
    ],
  },
  nav: {
    logoUrl: "/logo1.svg",
    consultationLabel: {"en":"Free Consultation","th":"ปรึกษาฟรี","pl":"Bezpłatna konsultacja"},
    searchPlaceholder: {"en":"Search...","th":"ค้นหา...","pl":"Szukaj..."},
    links: [
      { label: {"en":"Home","th":"หน้าแรก","pl":"Strona główna"}, href: "/" },
      { label: {"en":"Kitchens","th":"ครัว","pl":"Kuchnie"}, href: "/kitchens" },
      { label: {"en":"Products","th":"ผลิตภัณฑ์","pl":"Produkty"}, href: "/products" },
      { label: {"en":"Services","th":"บริการ","pl":"Usługi"}, href: "/services" },
      { label: {"en":"Materials","th":"วัสดุ","pl":"Materiały"}, href: "/materials" },
      { label: {"en":"Locations","th":"พื้นที่บริการ","pl":"Lokalizacje"}, href: "/locations" },
      { label: {"en":"Gallery","th":"แกลเลอรี","pl":"Galeria"}, href: "/gallery" },
      { label: {"en":"Guides","th":"คู่มือ","pl":"Poradniki"}, href: "/guides" },
      { label: {"en":"Contact","th":"ติดต่อ","pl":"Kontakt"}, href: "/contact" },
      { label: {"en":"FAQ","th":"คำถามที่พบบ่อย","pl":"FAQ"}, href: "/faq" },
    ],
  },
  seo: {
    title: L("Thailand Kitchens", "Thailand Kitchens", "Thailand Kitchens"),
    description: L(
      "Thailand Kitchens Website",
      "เว็บไซต์ Thailand Kitchens",
      "Strona Thailand Kitchens"
    ),
    ogImage: "",
    ga4MeasurementId: "",
  },
  galleryPage: {
    eyebrow: {"en":"The Gallery · Vol. 04","th":"แกลเลอรี · ฉบับที่ 04","pl":"Galeria · Wyd. 04"},
    title: {"en":"Kitchens of the island, moments of everyday luxury.","th":"ครัวแห่งเกาะ ช่วงเวลาแห่งความหรูหราในทุกวัน","pl":"Kuchnie wyspy, chwile codziennego luksusu."},
    description: {"en":"A curated inspiration library of tropical, modern and minimal kitchens crafted by our Samui atelier — filter by style, layout, palette or material and discover your next design.","th":"คลังแรงบันดาลใจของครัวทรอปิคอล สมัยใหม่ และมินิมอลจากห้องทำงานสมุยของเรา — กรองตามสไตล์ เลย์เอาต์ พาเลต หรือวัสดุ เพื่อค้นหาดีไซน์ถัดไปของคุณ","pl":"Starannie wyselekcjonowana biblioteca inspiracji tropikalnych, nowoczesnych i minimalistycznych kuchni z naszego atelier na Samui — filtruj według stylu, układu, palety lub materiału."},
    collage: [
      "/products/Kitchen2.png",
      "/products/Kitchen3.png",
      "/features/image2.png",
      "/products/Kitchen1.png",
    ],
    filters: [
      { id: "All", label: {"en":"All","th":"ทั้งหมด","pl":"Wszystkie"} },
      { id: "Layout & Space", label: {"en":"Layout & Space","th":"เลย์เอาต์และพื้นที่","pl":"Układ i przestrzeń"} },
      { id: "Storage", label: {"en":"Storage","th":"การจัดเก็บ","pl":"Przechowywanie"} },
      { id: "Style & Color", label: {"en":"Style & Color","th":"สไตล์และสี","pl":"Styl i kolor"} },
      { id: "Materials", label: {"en":"Materials","th":"วัสดุ","pl":"Materiały"} },
    ],
  },
  productsPage: {
    label: {"en":"Collection","th":"คอลเลกชัน","pl":"Kolekcja"},
    title: {"en":"Products","th":"ผลิตภัณฑ์","pl":"Produkty"},
    videoUrl: "/product/productVideo.mp4",
    homeEyebrow: {"en":"Best Seller","th":"สินค้าขายดี","pl":"Bestseller"},
    homeTitle: {"en":"Our Products","th":"ผลิตภัณฑ์ของเรา","pl":"Nasze produkty"},
    homeCta: {"en":"View Collection","th":"ดูคอลเลกชัน","pl":"Zobacz kolekcję"},
  },
  blogPage: {
    eyebrow: {"en":"The Journal","th":"วารสาร","pl":"Dziennik"},
    title: {"en":"Blogs","th":"บล็อก","pl":"Blog"},
    videoUrl: "/product/productVideo.mp4",
    relatedTitle: {"en":"Related Journal Entries","th":"บทความที่เกี่ยวข้อง","pl":"Powiązane wpisy"},
    shareLinks: [
      { label: L("Facebook", "Facebook", "Facebook"), href: "https://www.facebook.com/ThailandKitchens/" },
      { label: L("Instagram", "Instagram", "Instagram"), href: "#" },
      { label: L("X", "X", "X"), href: "#" },
      { label: L("WhatsApp", "WhatsApp", "WhatsApp"), href: "#" },
    ],
  },
  faqPage: {
    eyebrow: {"en":"FAQ","th":"คำถามที่พบบ่อย","pl":"FAQ"},
    title: {"en":"Most Frequent Questions","th":"คำถามที่พบบ่อยที่สุด","pl":"Najczęściej zadawane pytania"},
    videoUrl: "/video/faq-autoplay.mp4",
  },
  homeContact: {
    eyebrow: L("Free Design Consultation", "ปรึกษาออกแบบฟรี", "Bezpłatna konsultacja projektowa"),
    title: L("Get in Touch", "ติดต่อเรา", "Skontaktuj się"),
    formTitle: L(
      "Let's design a kitchen worthy of your island",
      "มาออกแบบครัวที่คู่ควรกับเกาะของคุณ",
      "Zaprojektujmy kuchnię godną Twojej wyspy"
    ),
    image: "/contactUs/contact.png",
  },
  contactPage: {
    title: {"en":"Connect","th":"เชื่อมต่อ","pl":"Połącz się"},
    titleAccent: {"en":"With Us","th":"กับเรา","pl":"z nami"},
    description: {"en":"We believe in the soul of teak wood and the precision of ancient joining techniques. Every kitchen we craft is a bridge between Thai heritage and modern living.","th":"เราเชื่อในจิตวิญญาณของไม้สักและความแม่นยำของเทคนิคการต่อไม้โบราณ ทุกครัวที่เรารังสรรค์คือสะพานเชื่อมมรดกไทยกับการใช้ชีวิตสมัยใหม่","pl":"Wierzymy w duszę drewna tekowego i precyzję starożytnych technik łączenia. Każda kuchnia, którą tworzymy, łączy tajskie dziedzictwo z nowoczesnym życiem."},
    videoUrl: "/video/contact.mp4?v=2",
    craftImage: "/contactUs/contact.png",
    email: "hi@thailandkitchens.com",
    phone: "+66 64 683 9777",
    locations: [
      {
        title: L("Pattaya Office:", "สำนักงานพัทยา:", "Biuro Pattaya:"),
        address: L(
          "82, 48-49 Chaiyaphruek 2 Rd, Pattaya City, Bang Lamung District, Chon Buri 20150",
          "82, 48-49 ถนนไชยพฤกษ์ 2 เมืองพัทยา อำเภอบางละมุง ชลบุรี 20150",
          "82, 48-49 Chaiyaphruek 2 Rd, Pattaya City, Bang Lamung District, Chon Buri 20150"
        ),
      },
      {
        title: L("Samui Office:", "สำนักงานสมุย:", "Biuro Samui:"),
        address: L(
          "Route 4169, Mae Nam, Amphoe Ko Samui, Surat Thani 84330",
          "เส้นทาง 4169 แม่น้ำ อำเภอเกาะสมุย สุราษฎร์ธานี 84330",
          "Route 4169, Mae Nam, Amphoe Ko Samui, Surat Thani 84330"
        ),
      },
    ],
  },
  hubPages: {
    kitchens: {
      title: L("Kitchens", "ครัว", "Kuchnie"),
      description: L(
        "Explore kitchen layouts, styles, and solutions by property type.",
        "สำรวจเลย์เอาต์ สไตล์ และโซลูชันครัวตามประเภทที่อยู่อาศัย",
        "Poznaj układy, style i rozwiązania kuchni według typu nieruchomości."
      ),
      eyebrow: L("Kitchen Design", "การออกแบบครัว", "Projektowanie kuchni"),
      heroImage: "/products/Kitchen1.png",
      ctaLabel: L("Book a free consultation", "จองปรึกษาฟรี", "Umów bezpłatną konsultację"),
      ctaHref: "/contact",
      sections: [
        {
          heading: L("Crafted for how you live", "ออกแบบตามวิถีชีวิตของคุณ", "Stworzone pod Twój styl życia"),
          body: L(
            "From island layouts to villa-scale kitchens, every project starts with your space, light, and daily routines.",
            "ตั้งแต่ครัวเกาะไปจนถึงครัวในวิลล่า ทุกโปรเจกต์เริ่มจากพื้นที่ แสง และกิจวัตรประจำวันของคุณ",
            "Od wysp kuchennych po kuchnie w willach — każdy projekt zaczyna się od Twojej przestrzeni i codziennych nawyków."
          ),
          image: "/products/Kitchen2.png",
          layout: "image-left",
        },
        {
          heading: L("Design, make, install", "ออกแบบ ผลิต ติดตั้ง", "Projekt, produkcja, montaż"),
          body: L(
            "One team takes you from concept drawings through manufacturing and on-site installation.",
            "ทีมเดียวดูแลตั้งแต่แบบร่าง การผลิต ไปจนถึงติดตั้งหน้างาน",
            "Jeden zespół prowadzi Cię od szkiców przez produkcję aż po montaż na miejscu."
          ),
          image: "/products/Kitchen4.png",
          layout: "image-right",
        },
      ],
      subsections: {
        layouts: {
          title: L("Kitchen Layouts", "เลย์เอาต์ครัว", "Układy kuchni"),
          description: L(
            "Island, U-shape, L-shape, galley, and other kitchen layouts.",
            "ครัวเกาะ รูปตัว U รูปตัว L ทางเดินแคบ และเลย์เอาต์อื่นๆ",
            "Wyspy, kształt U, kształt L, galeryjne i inne układy kuchni."
          ),
          sections: [
            {
              heading: L("Layouts that work for your space", "เลย์เอาต์ที่เหมาะกับพื้นที่ของคุณ", "Układy dopasowane do przestrzeni"),
              body: L(
                "Island, L-shape, U-shape, galley, and straight runs planned around how you cook and live.",
                "ครัวเกาะ รูปตัว L รูปตัว U ทางเดินแคบ และแนวตรง ออกแบบตามวิถีการใช้ชีวิต",
                "Wyspy, L, U, galeria i proste ciągi zaplanowane pod Twój sposób gotowania."
              ),
              image: "/products/Kitchen2.png",
              layout: "image-left",
            },
            {
              heading: L("Measured for Thai homes", "วัดเพื่อบ้านไทย", "Dopasowane do tajskich domów"),
              body: L(
                "Every layout accounts for humidity, ventilation, and daily kitchen use in Thailand.",
                "ทุกเลย์เอาต์คำนึงถึงความชื้น การระบายอากาศ และการใช้งานครัวในไทย",
                "Każdy układ uwzględnia wilgoć, wentylację i codzienne użytkowanie w Tajlandii."
              ),
              image: "/products/Kitchen4.png",
              layout: "image-right",
            },
          ],
        },
        styles: {
          title: L("Kitchen Styles", "สไตล์ครัว", "Style kuchni"),
          description: L(
            "Modern, tropical, minimal, and heritage kitchen styles.",
            "สไตล์ครัวโมเดิร์น ทรอปิคอล มินิมอล และมรดก",
            "Nowoczesne, tropikalne, minimalistyczne i klasyczne style kuchni."
          ),
          sections: [
            {
              heading: L("Styles with lasting character", "สไตล์ที่มีเอกลักษณ์ยาวนาน", "Style z charakterem"),
              body: L(
                "Modern, minimal, contemporary, and traditional Thai — calm, warm, and timeless.",
                "โมเดิร์น มินิมอล คอนเทมโพแรรี และไทยดั้งเดิม — อบอุ่นและเหนือกาลเวลา",
                "Nowoczesny, minimal, contemporary i tradycyjny tajski — spokojny i ponadczasowy."
              ),
              image: "/products/Kitchen5.png",
              layout: "image-left",
            },
            {
              heading: L("Detail that carries the look", "รายละเอียดที่สร้างลุค", "Detal, który buduje styl"),
              body: L(
                "Hardware, profiles, and materials specified together for a coherent finish.",
                "ฮาร์ดแวร์ โปรไฟล์ และวัสดุเลือกให้สอดคล้องกันทั้งชุด",
                "Okucia, profile i materiały dobrane w spójną całość."
              ),
              image: "/products/Kitchen3.png",
              layout: "image-right",
            },
          ],
        },
        byProperty: {
          title: L("Kitchens by Property", "ครัวตามประเภทที่อยู่อาศัย", "Kuchnie według typu nieruchomości"),
          description: L(
            "Kitchen solutions for villas, condos, hotels, and developers.",
            "โซลูชันครัวสำหรับวิลล่า คอนโด โรงแรม และโครงการพัฒนา",
            "Rozwiązania kuchenne dla willi, apartamentów, hoteli i deweloperów."
          ),
          sections: [
            {
              heading: L("Solutions by property type", "โซลูชันตามประเภทที่อยู่อาศัย", "Rozwiązania według typu nieruchomości"),
              body: L(
                "Villas, condos, apartments, and townhouses each need a different balance of storage and scale.",
                "วิลล่า คอนโด อพาร์ตเมนต์ และทาวน์เฮาส์ต้องการสัดส่วนพื้นที่เก็บของและขนาดที่ต่างกัน",
                "Wille, condo, apartamenty i szeregowce wymagają innego balansu przechowywania i skali."
              ),
              image: "/products/Kitchen1.png",
              layout: "image-left",
            },
            {
              heading: L("Built for developers and hotels", "สำหรับดีเวลลอปเปอร์และโรงแรม", "Dla deweloperów i hoteli"),
              body: L(
                "Repeatable modules and durable finishes that scale across units.",
                "โมดูลที่ทำซ้ำได้และผิวสำเร็จทนทาน ขยายได้หลายยูนิต",
                "Powtarzalne moduły i trwałe wykończenia skalowane na wiele jednostek."
              ),
              image: "/products/Kitchen6.png",
              layout: "image-right",
            },
          ],
        },
      },
    },
    services: {
      title: L("Services", "บริการ", "Usługi"),
      description: L(
        "Kitchen design, installation, renovation, and related services.",
        "ออกแบบ ติดตั้ง ปรับปรุงครัว และบริการที่เกี่ยวข้อง",
        "Projektowanie, montaż, renowacja kuchni i powiązane usługi."
      ),
      eyebrow: L("Our Services", "บริการของเรา", "Nasze usługi"),
      heroImage: "/products/Kitchen3.png",
      ctaLabel: L("Book a free consultation", "จองปรึกษาฟรี", "Umów bezpłatną konsultację"),
      ctaHref: "/contact",
      sections: [
        {
          heading: L("End-to-end kitchen delivery", "บริการครัวครบวงจร", "Kompleksowa realizacja kuchni"),
          body: L(
            "Design, manufacturing, delivery, and installation — one team from first sketch to final handover.",
            "ออกแบบ ผลิต จัดส่ง และติดตั้ง — ทีมเดียวตั้งแต่ร่างแรกจนส่งมอบ",
            "Projekt, produkcja, dostawa i montaż — jeden zespół od pierwszego szkicu do odbioru."
          ),
          image: "/products/Kitchen4.png",
          layout: "image-left",
        },
        {
          heading: L("Renovation without the chaos", "ปรับปรุงโดยไม่ยุ่งเหยิง", "Remont bez chaosu"),
          body: L(
            "Phased installs and protected living areas so your home stays livable while we work.",
            "ติดตั้งเป็นระยะและกันพื้นที่อยู่อาศัย เพื่อให้บ้านยังใช้ชีวิตได้ระหว่างงาน",
            "Etapowy montaż i ochrona stref mieszkalnych, by dom pozostał funkcjonalny."
          ),
          image: "/products/Kitchen3.png",
          layout: "image-right",
        },
      ],
    },
    materials: {
      title: L("Materials", "วัสดุ", "Materiały"),
      description: L(
        "Cabinet materials, finishes, worktops, and hardware.",
        "วัสดุตู้ ผิวสำเร็จ เคาน์เตอร์ และฮาร์ดแวร์",
        "Materiały szafek, wykończenia, blaty i okucia."
      ),
      eyebrow: L("Materials & Finishes", "วัสดุและผิวสำเร็จ", "Materiały i wykończenia"),
      heroImage: "/products/Kitchen5.png",
      ctaLabel: L("Book a free consultation", "จองปรึกษาฟรี", "Umów bezpłatną konsultację"),
      ctaHref: "/contact",
      sections: [
        {
          heading: L("Materials you can trust", "วัสดุที่ไว้วางใจได้", "Materiały, którym możesz zaufać"),
          body: L(
            "We specify finishes and worktops for Thailand's climate — humidity, heat, and daily use.",
            "เราเลือกผิวสำเร็จและเคาน์เตอร์ให้เหมาะกับอากาศไทย — ความชื้น ความร้อน และการใช้งานจริง",
            "Dobieramy wykończenia i blaty pod klimat Tajlandii — wilgoć, ciepło i codzienne użytkowanie."
          ),
          image: "/features/image2.png",
          layout: "image-left",
        },
        {
          heading: L("Hardware and surfaces that last", "ฮาร์ดแวร์และพื้นผิวที่ทนทาน", "Okucia i powierzchnie na lata"),
          body: L(
            "Brass, lacquer, teak, marble, and quartz — selected for touch, durability, and how they age.",
            "ทองเหลือง แลคเกอร์ ไม้สัก หินอ่อน และควอตซ์ — เลือกเพื่อสัมผัส ความทนทาน และการเปลี่ยนตามกาลเวลา",
            "Mosiądz, lakier, tek, marmur i kwarc — dobrane pod dotyk, trwałość i starzenie."
          ),
          image: "/products/Kitchen5.png",
          layout: "image-right",
        },
      ],
    },
    locations: {
      title: L("Locations", "พื้นที่ให้บริการ", "Lokalizacje"),
      description: L(
        "Kitchen projects and services across Thailand.",
        "โปรเจกต์และบริการครัวทั่วประเทศไทย",
        "Projekty i usługi kuchenne w całej Tajlandii."
      ),
      eyebrow: L("Across Thailand", "ทั่วประเทศไทย", "W całej Tajlandii"),
      heroImage: "/product/product.png",
      ctaLabel: L("Book a free consultation", "จองปรึกษาฟรี", "Umów bezpłatną konsultację"),
      ctaHref: "/contact",
      sections: [
        {
          heading: L("Local teams across Thailand", "ทีมท้องถิ่นทั่วไทย", "Lokalne zespoły w Tajlandii"),
          body: L(
            "From Bangkok to Phuket, Samui, Pattaya, and Chiang Mai — surveys, fabrication, and install close to your project.",
            "จากกรุงเทพฯ ถึงภูเก็ต สมุย พัทยา และเชียงใหม่ — สำรวจ ผลิต และติดตั้งใกล้โปรเจกต์ของคุณ",
            "Od Bangkoku po Phuket, Samui, Pattayę i Chiang Mai — pomiary, produkcja i montaż blisko projektu."
          ),
          image: "/products/Kitchen1.png",
          layout: "image-left",
        },
        {
          heading: L("Service where you live", "บริการใกล้บ้านคุณ", "Obsługa tam, gdzie mieszkasz"),
          body: L(
            "Consultation, design, and aftercare with people who know local standards and climate.",
            "ปรึกษา ออกแบบ และดูแลหลังการขายโดยทีมที่เข้าใจมาตรฐานท้องถิ่นและสภาพอากาศ",
            "Konsultacje, projekt i serwis z ludźmi, którzy znają lokalne standardy i klimat."
          ),
          image: "/products/Kitchen6.png",
          layout: "image-right",
        },
      ],
    },
    builtInFurniture: {
      title: L("Built-In Furniture", "เฟอร์นิเจอร์บิวท์อิน", "Meble na wymiar"),
      description: L(
        "Wardrobes, closets, vanities, and other built-in furniture pages.",
        "ตู้เสื้อผ้า ตู้บิวท์อิน เคาน์เตอร์ห้องน้ำ และเฟอร์นิเจอร์บิวท์อินอื่นๆ",
        "Szafy, zabudowy, blaty łazienkowe i inne meble na wymiar."
      ),
      eyebrow: L("Built-In Furniture", "เฟอร์นิเจอร์บิวท์อิน", "Meble na wymiar"),
      heroImage: "/products/Kitchen2.png",
      ctaLabel: L("Book a free consultation", "จองปรึกษาฟรี", "Umów bezpłatną konsultację"),
      ctaHref: "/contact",
      sections: [
        {
          heading: L("Built-ins that fit the architecture", "บิวท์อินที่เข้ากับสถาปัตยกรรม", "Zabudowy dopasowane do architektury"),
          body: L(
            "Wardrobes, vanities, and entertainment units planned to the millimetre.",
            "ตู้เสื้อผ้า เคาน์เตอร์ห้องน้ำ และตู้ทีวี วางแผนละเอียดระดับมิลลิเมตร",
            "Szafy, toaletki i szafki RTV planowane z dokładnością do milimetra."
          ),
          image: "/products/Kitchen2.png",
          layout: "image-left",
        },
        {
          heading: L("Same craft as our kitchens", "งานคราฟต์เดียวกับครัวของเรา", "Ten sam kunszt co nasze kuchnie"),
          body: L(
            "Shared materials and finishing so built-ins feel like one interior language.",
            "วัสดุและผิวสำเร็จร่วมกัน ทำให้บิวท์อินดูเป็นภาษาเดียวกันทั้งบ้าน",
            "Wspólne materiały i wykończenia, by zabudowa tworzyła jeden język wnętrza."
          ),
          image: "/products/Kitchen5.png",
          layout: "image-right",
        },
      ],
    },
  },
};

const DEFAULT_FAQS = DEFAULT_HOME_SECTIONS.faq.items.map((item, index) => ({
  question: item.question,
  answer: item.answer,
  sortOrder: index + 1,
}));

const DEFAULT_CATEGORIES = [
  {
    title: L("Modern", "โมเดิร์น", "Nowoczesny"),
    description: L("Contemporary modular layouts", "เลย์เอาต์โมดูลาร์ร่วมสมัย", "Współczesne układy modułowe"),
    image: "/products/Kitchen5.png",
  },
  {
    title: L("Islands", "ไอส์แลนด์", "Wyspy"),
    description: L("Island kitchen collections", "คอลเลกชันครัวแบบเกาะ", "Kolekcje kuchni z wyspą"),
    image: "/products/Kitchen1.png",
  },
  {
    title: L("U Shape", "รูปตัว U", "Kształt U"),
    description: L("U-shaped kitchen layouts", "เลย์เอาต์ครัวรูปตัว U", "Układy kuchni w kształcie U"),
    image: "/products/Kitchen4.png",
  },
  {
    title: L("L Shape", "รูปตัว L", "Kształt L"),
    description: L("L-shaped kitchen layouts", "เลย์เอาต์ครัวรูปตัว L", "Układy kuchni w kształcie L"),
    image: "/products/Kitchen3.png",
  },
  {
    title: L("Straight", "ตรง", "Prosty"),
    description: L("Straight-run kitchen layouts", "เลย์เอาต์ครัวแนวตรง", "Proste układy kuchni"),
    image: "/products/Kitchen2.png",
  },
  {
    title: L("T Shape", "รูปตัว T", "Kształt T"),
    description: L("T-shaped kitchen layouts", "เลย์เอาต์ครัวรูปตัว T", "Układy kuchni w kształcie T"),
    image: "/products/Kitchen6.png",
  },
];

module.exports = {
  DEFAULT_FEATURE_HIGHLIGHTS,
  DEFAULT_HOME_SECTIONS,
  DEFAULT_FAQS,
  DEFAULT_CATEGORIES,
};
