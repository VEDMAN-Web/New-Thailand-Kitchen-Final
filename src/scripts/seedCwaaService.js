/**
 * Seed the complete cwaa service landing page.
 * Usage: node src/scripts/seedCwaaService.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const ConnectDB = require("../config/db");
const { Category } = require("../model/cmsModels");
const { L } = require("../utils/localized");

const SITE_ID = "thailand-kitchen";
const SERVICE_SLUG = "cwaa";

const SERVICE_CONTENT = {
  title: L("cwaa", "cwaa", "cwaa"),
  description: L(
    "A considered kitchen service from first brief through installation and handover.",
    "บริการครัวครบถ้วนตั้งแต่การพูดคุยครั้งแรกจนถึงการติดตั้งและส่งมอบ",
    "Kompleksowa usługa kuchenna od pierwszej rozmowy po montaż i odbiór."
  ),
  image: "/products/Kitchen5.png",
  icon: "",
  slug: SERVICE_SLUG,
  categoryType: "service",
  parentId: null,
  metaTitle: "cwaa Kitchen Service | Thailand Kitchens",
  metaDescription:
    "A complete kitchen service covering design, materials, fabrication, installation and handover.",
  canonicalUrl: "",
  indexable: true,
  eyebrow: L("Service", "บริการ", "Usługa"),
  ctaLabel: L("Request a consultation", "ขอคำปรึกษา", "Poproś o konsultację"),
  ctaHref: "/contact",
  footerCtaHeading: L(
    "Ready to plan your cwaa service?",
    "พร้อมวางแผนบริการ cwaa ของคุณหรือยัง?",
    "Gotowi zaplanować usługę cwaa?"
  ),
  footerCtaBody: L(
    "Speak with our design team for a tailored plan and quote.",
    "พูดคุยกับทีมออกแบบของเราเพื่อวางแผนและรับใบเสนอราคาที่เหมาะกับคุณ",
    "Porozmawiaj z naszym zespołem projektowym o dopasowanym planie i wycenie."
  ),
  sections: [
    {
      heading: L("How cwaa works", "วิธีการทำงานของ cwaa", "Jak działa cwaa"),
      body: L(
        "Brief & site visit|Design proposal|Approve materials|Fabrication|Install & handover",
        "สรุปความต้องการและเยี่ยมชมสถานที่|ข้อเสนอการออกแบบ|อนุมัติวัสดุ|การผลิต|ติดตั้งและส่งมอบ",
        "Brief i wizyta|Propozycja projektu|Zatwierdzenie materiałów|Produkcja|Montaż i odbiór"
      ),
      image: "/products/Kitchen5.png",
      layout: "steps",
    },
    {
      heading: L("What's included", "สิ่งที่รวมอยู่", "Co zawiera usługa"),
      body: L(
        "Dedicated project lead|Measured drawings|Factory quality control|On-site install team|Aftercare guidance",
        "หัวหน้าโครงการเฉพาะ|แบบวัดหน้างาน|ควบคุมคุณภาพจากโรงงาน|ทีมติดตั้งหน้างาน|คำแนะนำหลังการขาย",
        "Dedykowany lider projektu|Rysunki pomiarowe|Kontrola jakości w fabryce|Zespół montażowy|Wsparcie posprzedażowe"
      ),
      image: "",
      layout: "cards",
    },
    {
      heading: L("Ready when you are", "พร้อมเมื่อคุณพร้อม", "Gotowi, gdy Ty"),
      body: L(
        "Talk to us about cwaa for your home or project — timelines, budget ranges, and next steps.",
        "พูดคุยกับเราเกี่ยวกับ cwaa สำหรับบ้านหรือโครงการของคุณ — ระยะเวลา งบประมาณ และขั้นตอนถัดไป",
        "Porozmawiaj z nami o cwaa dla Twojego domu lub projektu — harmonogramie, budżecie i kolejnych krokach."
      ),
      image: "",
      layout: "band",
    },
  ],
};

async function main() {
  await ConnectDB();

  const item = await Category.findOneAndUpdate(
    {
      siteId: SITE_ID,
      categoryType: "service",
      slug: SERVICE_SLUG,
      parentId: null,
    },
    { $set: SERVICE_CONTENT },
    { upsert: true, new: true, runValidators: true }
  );

  console.log(`Seeded ${item.categoryType} ${item.slug}: ${item._id}`);
  console.log(`Sections: ${item.sections.length}`);
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
