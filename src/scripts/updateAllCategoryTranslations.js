/**
 * Update ALL category title, description, and eyebrow fields with proper TH/PL translations
 */
require("dotenv").config();
const connectDB = require("../config/db");
const { Category } = require("../model/cmsModels");
const { L } = require("../utils/localized");

const categoryUpdates = [
  // Layouts
  {
    slug: "u-shape",
    title: L("U Shape", "รูปตัว U", "Kształt U"),
    description: L(
      "U-shaped kitchen layouts for efficient work triangles.",
      "เลย์เอาต์ครัวรูปตัว U สำหรับสามเหลี่ยมการทำงานที่มีประสิทธิภาพ",
      "Układy kuchni w kształcie U dla wydajnych trójkątów roboczych."
    ),
    eyebrow: L("Layout", "เลย์เอาต์", "Układ"),
  },
  {
    slug: "l-shape",
    title: L("L Shape", "รูปตัว L", "Kształt L"),
    description: L(
      "L-shaped kitchen layouts for corner spaces.",
      "เลย์เอาต์ครัวรูปตัว L สำหรับพื้นที่มุม",
      "Układy kuchni w kształcie L dla przestrzeni narożnych."
    ),
    eyebrow: L("Layout", "เลย์เอาต์", "Układ"),
  },
  {
    slug: "t-shape",
    title: L("T Shape", "รูปตัว T", "Kształt T"),
    description: L(
      "T-shaped kitchen layouts with peninsula seating.",
      "เลย์เอาต์ครัวรูปตัว T พร้อมที่นั่งแบบคาบสมุทร",
      "Układy kuchni w kształcie T z półwyspem."
    ),
    eyebrow: L("Layout", "เลย์เอาต์", "Układ"),
  },
  {
    slug: "straight",
    title: L("Straight", "ตรง", "Prosty"),
    description: L(
      "Straight-run galley kitchens for compact homes.",
      "ครัวทางเดินแคบแนวตรงสำหรับบ้านขนาดกะทัดรัด",
      "Proste kuchnie galeryjne dla kompaktowych domów."
    ),
    eyebrow: L("Layout", "เลย์เอาต์", "Układ"),
  },
  {
    slug: "islands",
    title: L("Islands", "ไอส์แลนด์", "Wyspy"),
    description: L(
      "Island kitchen layouts for open-plan living.",
      "เลย์เอาต์ครัวแบบเกาะสำหรับการใช้ชีวิตแบบเปิดโล่ง",
      "Układy kuchni z wyspą do życia na otwartej przestrzeni."
    ),
    eyebrow: L("Layout", "เลย์เอาต์", "Układ"),
  },

  // Styles
  {
    slug: "modern",
    title: L("Modern", "โมเดิร์น", "Nowoczesny"),
    description: L(
      "Contemporary modular kitchens with clean lines.",
      "ครัวโมดูลาร์สมัยใหม่ด้วยเส้นสายที่สะอาด",
      "Współczesne kuchnie modułowe z czystymi liniami."
    ),
    eyebrow: L("Style", "สไตล์", "Styl"),
  },
  {
    slug: "contemporary",
    title: L("Contemporary", "ร่วมสมัย", "Współczesny"),
    description: L(
      "Warm contemporary kitchens blending wood and stone.",
      "ครัวร่วมสมัยอบอุ่นผสมผสานไม้และหิน",
      "Ciepłe współczesne kuchnie łączące drewno i kamień."
    ),
    eyebrow: L("Style", "สไตล์", "Styl"),
  },
  {
    slug: "minimalist",
    title: L("Minimalist", "มินิมอล", "Minimalistyczny"),
    description: L(
      "Handleless minimalist kitchens with hidden storage.",
      "ครัวมินิมอลไร้มือจับพร้อมพื้นที่จัดเก็บที่ซ่อนอยู่",
      "Minimalistyczne kuchnie bez uchwytów z ukrytym przechowywaniem."
    ),
    eyebrow: L("Style", "สไตล์", "Styl"),
  },
  {
    slug: "traditional-thai",
    title: L("Traditional Thai", "ไทยดั้งเดิม", "Tradycyjny tajski"),
    description: L(
      "Teak-forward kitchens inspired by Thai craft.",
      "ครัวที่เน้นไม้สักได้รับแรงบันดาลใจจากงานฝีมือไทย",
      "Kuchnie z dominacją teku inspirowane tajskim rzemiosłem."
    ),
    eyebrow: L("Style", "สไตล์", "Styl"),
  },

  // Property Types
  {
    slug: "condo",
    title: L("Condo", "คอนโด", "Apartamentowiec"),
    description: L(
      "Kitchen solutions for condominiums and high-rises.",
      "โซลูชันครัวสำหรับคอนโดมิเนียมและตึกสูง",
      "Rozwiązania kuchenne dla apartamentowców i wieżowców."
    ),
    eyebrow: L("Property", "ประเภทที่อยู่อาศัย", "Nieruchomość"),
  },
  {
    slug: "villa",
    title: L("Villa", "วิลล่า", "Willa"),
    description: L(
      "Custom kitchens for villas and detached homes.",
      "ครัวสั่งทำสำหรับวิลล่าและบ้านเดี่ยว",
      "Kuchnie na wymiar dla willi i domów wolnostojących."
    ),
    eyebrow: L("Property", "ประเภทที่อยู่อาศัย", "Nieruchomość"),
  },
  {
    slug: "townhouse",
    title: L("Townhouse", "ทาวน์เฮาส์", "Szeregowiec"),
    description: L(
      "Space-efficient kitchens for townhouses.",
      "ครัวประหยัดพื้นที่สำหรับทาวน์เฮาส์",
      "Efektywne przestrzennie kuchnie dla szeregowców."
    ),
    eyebrow: L("Property", "ประเภทที่อยู่อาศัย", "Nieruchomość"),
  },
  {
    slug: "apartment",
    title: L("Apartment", "อพาร์ตเมนต์", "Apartament"),
    description: L(
      "Compact kitchen designs for apartments.",
      "ดีไซน์ครัวกะทัดรัดสำหรับอพาร์ตเมนต์",
      "Kompaktowe projekty kuchni dla apartamentów."
    ),
    eyebrow: L("Property", "ประเภทที่อยู่อาศัย", "Nieruchomość"),
  },

  // Locations
  {
    slug: "bangkok",
    title: L("Bangkok", "กรุงเทพฯ", "Bangkok"),
    description: L(
      "Custom kitchens and built-ins across Bangkok.",
      "ครัวสั่งทำและบิวท์อินทั่วกรุงเทพฯ",
      "Kuchnie na wymiar i zabudowy w całym Bangkoku."
    ),
    eyebrow: L("Location", "สถานที่", "Lokalizacja"),
  },
  {
    slug: "phuket",
    title: L("Phuket", "ภูเก็ต", "Phuket"),
    description: L(
      "Kitchen design and installation in Phuket.",
      "การออกแบบและติดตั้งครัวในภูเก็ต",
      "Projektowanie i montaż kuchni na Phuket."
    ),
    eyebrow: L("Location", "สถานที่", "Lokalizacja"),
  },
  {
    slug: "chiang-mai",
    title: L("Chiang Mai", "เชียงใหม่", "Chiang Mai"),
    description: L(
      "Bespoke kitchens in Chiang Mai.",
      "ครัวสั่งทำในเชียงใหม่",
      "Kuchnie na wymiar w Chiang Mai."
    ),
    eyebrow: L("Location", "สถานที่", "Lokalizacja"),
  },
  {
    slug: "pattaya",
    title: L("Pattaya", "พัทยา", "Pattaya"),
    description: L(
      "Kitchen projects in Pattaya and Chonburi.",
      "โปรเจกต์ครัวในพัทยาและชลบุรี",
      "Projekty kuchni w Pattaya i Chonburi."
    ),
    eyebrow: L("Location", "สถานที่", "Lokalizacja"),
  },
  {
    slug: "koh-samui",
    title: L("Koh Samui", "เกาะสมุย", "Koh Samui"),
    description: L(
      "Island kitchens crafted in our Samui atelier.",
      "ครัวเกาะที่รังสรรค์ในสตูดิโอสมุยของเรา",
      "Kuchnie wyspowe tworzone w naszym atelier na Samui."
    ),
    eyebrow: L("Location", "สถานที่", "Lokalizacja"),
  },

  // Services
  {
    slug: "kitchen-design",
    title: L("Kitchen Design", "ออกแบบครัว", "Projekt kuchni"),
    description: L(
      "End-to-end kitchen design consultations and 3D planning.",
      "การปรึกษาและวางแผน 3D ครบวงจร",
      "Kompleksowe konsultacje projektowe i planowanie 3D."
    ),
    eyebrow: L("Service", "บริการ", "Usługa"),
  },
  {
    slug: "kitchen-installation",
    title: L("Kitchen Installation", "ติดตั้งครัว", "Montaż kuchni"),
    description: L(
      "Professional kitchen cabinet installation and finishing.",
      "การติดตั้งและตกแต่งตู้ครัวอย่างมืออาชีพ",
      "Profesjonalny montaż szafek kuchennych i wykończenie."
    ),
    eyebrow: L("Service", "บริการ", "Usługa"),
  },
  {
    slug: "kitchen-renovation",
    title: L("Kitchen Renovation", "ปรับปรุงครัว", "Renowacja kuchni"),
    description: L(
      "Full kitchen renovation — design, supply and install.",
      "การปรับปรุงครัวเต็มรูปแบบ — ออกแบบ จัดหา และติดตั้ง",
      "Pełna renowacja kuchni — projekt, dostawa i montaż."
    ),
    eyebrow: L("Service", "บริการ", "Usługa"),
  },
  {
    slug: "built-in-wardrobes",
    title: L("Built-In Wardrobes", "ตู้เสื้อผ้าบิวท์อิน", "Szafy na wymiar"),
    description: L(
      "Custom wardrobes and closet systems.",
      "ตู้เสื้อผ้าและระบบตู้เสื้อผ้าสั่งทำ",
      "Szafy i systemy garderobiane na wymiar."
    ),
    eyebrow: L("Service", "บริการ", "Usługa"),
  },

  // Materials
  {
    slug: "teak-wood",
    title: L("Teak Wood", "ไม้สัก", "Drewno tekowe"),
    description: L(
      "Premium teak cabinetry and solid wood fronts.",
      "ตู้ไม้สักพรีเมียมและหน้าบานไม้แท้",
      "Premium szafki z teku i fronty z litego drewna."
    ),
    eyebrow: L("Material", "วัสดุ", "Materiał"),
  },
  {
    slug: "marble-quartz",
    title: L("Marble & Quartz", "หินอ่อนและควอตซ์", "Marmur i kwarc"),
    description: L(
      "Stone worktops and quartz surfaces.",
      "เคาน์เตอร์หินและพื้นผิวควอตซ์",
      "Kamienne blaty robocze i powierzchnie kwarcowe."
    ),
    eyebrow: L("Material", "วัสดุ", "Materiał"),
  },
  {
    slug: "matte-lacquer",
    title: L("Matte Lacquer", "แล็กเกอร์ด้าน", "Lakier matowy"),
    description: L(
      "Fingerprint-resistant matte lacquer finishes.",
      "ผิวแล็กเกอร์ด้านกันรอยนิ้วมือ",
      "Matowe lakiery odporne na odciski palców."
    ),
    eyebrow: L("Material", "วัสดุ", "Materiał"),
  },
  {
    slug: "brass-hardware",
    title: L("Brass Hardware", "ฮาร์ดแวร์ทองเหลือง", "Mosiężne okucia"),
    description: L(
      "Artisanal brass pulls and hinges.",
      "มือจับและบานพับทองเหลืองงานฝีมือ",
      "Rzemieślnicze mosiężne uchwyty i zawiasy."
    ),
    eyebrow: L("Material", "วัสดุ", "Materiał"),
  },

  // Built-in Furniture
  {
    slug: "wardrobes",
    title: L("Wardrobes", "ตู้เสื้อผ้า", "Szafy"),
    description: L(
      "Floor-to-ceiling built-in wardrobes.",
      "ตู้เสื้อผ้าบิวท์อินสูงเต็มฝา",
      "Szafy wnękowe od podłogi do sufitu."
    ),
    eyebrow: L("Built-In Furniture", "เฟอร์นิเจอร์บิวท์อิน", "Meble na wymiar"),
  },
  {
    slug: "vanities",
    title: L("Vanities", "เคาน์เตอร์ห้องน้ำ", "Szafki łazienkowe"),
    description: L(
      "Bathroom vanities and storage.",
      "เคาน์เตอร์และที่เก็บของห้องน้ำ",
      "Szafki łazienkowe i przechowywanie."
    ),
    eyebrow: L("Built-In Furniture", "เฟอร์นิเจอร์บิวท์อิน", "Meble na wymiar"),
  },
  {
    slug: "entertainment-units",
    title: L("Entertainment Units", "ชุดทีวีบิวท์อิน", "Zabudowy RTV"),
    description: L(
      "Media walls and entertainment cabinetry.",
      "ชุดทีวีและตู้บันเทิง",
      "Ściany multimedialne i szafki rozrywkowe."
    ),
    eyebrow: L("Built-In Furniture", "เฟอร์นิเจอร์บิวท์อิน", "Meble na wymiar"),
  },
];

async function main() {
  await connectDB();

  let updated = 0;
  let notFound = 0;

  for (const update of categoryUpdates) {
    const result = await Category.updateOne(
      { slug: update.slug, siteId: "thailand-kitchen" },
      {
        $set: {
          title: update.title,
          description: update.description,
          eyebrow: update.eyebrow,
        },
      }
    );

    if (result.matchedCount > 0) {
      console.log(`✓ Updated ${update.slug}`);
      updated++;
    } else {
      console.log(`✗ Not found: ${update.slug}`);
      notFound++;
    }
  }

  console.log(`\n✅ Updated ${updated} categories`);
  if (notFound > 0) {
    console.log(`⚠️  Not found: ${notFound} categories`);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
