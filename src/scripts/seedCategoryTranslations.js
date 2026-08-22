/**
 * Seed Thai and Polish translations into all category landing page sections
 */
require("dotenv").config();
const connectDB = require("../config/db");
const { Category } = require("../model/cmsModels");
const { L } = require("../utils/localized");

const translations = {
  // Common phrases
  "planning principles": ["หลักการวางแผน", "Zasady planowania"],
  "Work triangle|Storage depth|Appliance zones|Traffic clearance": ["สามเหลี่ยมการทำงาน|ความลึกพื้นที่จัดเก็บ|โซนเครื่องใช้|พื้นที่สัญจร", "Trójkąt roboczy|Głębokość przechowywania|Strefy AGD|Przestrzeń komunikacji"],
  "right for your room": ["เหมาะกับห้องของคุณหรือไม่", "pasuje do Twojego pokoju"],
  "to your walls": ["ให้เข้ากับผนังของคุณ", "do Twoich ścian"],
  "Every run is measured on site — corners, columns, and window reveals decide the final module sizes.": [
    "ทุกครั้งวัดหน้างาน — มุม เสา และช่องหน้าต่างเป็นตัวกำหนดขนาดโมดูลสุดท้าย",
    "Każdy wymiar mierzony na miejscu — narożniki, słupy i ościeżnice okienne decydują o ostatecznych rozmiarach modułów."
  ],
  "Signature moves": ["จุดเด่นเฉพาะ", "Charakterystyczne cechy"],
  "Colour & tone|Door profile|Hardware language|Worktop contrast": ["สีและโทน|โปรไฟล์บานประตู|ภาษาฮาร์ดแวร์|คอนทราสต์เคาน์เตอร์", "Kolor i ton|Profil drzwi|Język okuć|Kontrast blatu"],
  "feels effortless": ["รู้สึกง่ายดาย", "jest bezproblemowe"],
  "Client notes from style-focused kitchen projects.": ["บันทึกจากลูกค้าโปรเจกต์ครัวที่เน้นสไตล์", "Notatki klientów z projektów kuchni skoncentrowanych na stylu."],
  "Kitchens for": ["ครัวสำหรับ", "Kuchnie dla"],
  "living": ["", ""],
  "owners usually need": ["เจ้าของมักต้องการ", "właściciele zwykle potrzebują"],
  "Storage strategy|Island vs peninsula|Service access|Guest-ready hosting": ["กลยุทธ์การจัดเก็บ|เกาะหรือคาบสมุทร|การเข้าถึงบริการ|พร้อมรับแขก", "Strategia przechowywania|Wyspa czy półwysep|Dostęp serwisowy|Gotowość na gości"],
  "Designed for how": ["ออกแบบตามวิธีการทำงาน", "Zaprojektowane pod"],
  "homes work": ["บ้าน", "domy"],
  "We plan around your floor plate, ceiling height, and how guests move through the space.": [
    "เราวางแผนรอบพื้นที่ ความสูงเพดาน และการเคลื่อนไหวของแขกในพื้นที่",
    "Planujemy wokół rzutu, wysokości sufitu i tego, jak goście poruszają się po przestrzeni."
  ],
  "Working with": ["การทำงานกับ", "Praca z"],
  "Finish character|Climate performance|Maintenance|Pairing with cabinetry": ["ลักษณะผิวสำเร็จ|ประสิทธิภาพต่อสภาพอากาศ|การบำรุงรักษา|การจับคู่กับตู้", "Charakter wykończenia|Wydajność klimatyczna|Konserwacja|Łączenie z zabudową"],
  "See and feel": ["ดูและสัมผัส", "Zobacz i poczuj"],
  "in context — we sample finishes against your lighting and existing materials before production.": [
    "ในบริบท — เราทดสอบผิวสำเร็จกับแสงและวัสดุที่มีอยู่ก่อนผลิต",
    "w kontekście — testujemy wykończenia w Twoim oświetleniu i istniejących materiałach przed produkcją."
  ],
  "changed how the whole kitchen feels": ["เปลี่ยนความรู้สึกของครัวทั้งหมด", "zmieniło odczucie całej kuchni"],
  "From recent material-led projects across Thailand.": ["จากโปรเจกต์ที่เน้นวัสดุล่าสุดทั่วประเทศไทย", "Z ostatnich projektów materiałowych w całej Tajlandii."],
  "How": ["วิธีการ", "Jak działa"],
  "works": ["ทำงาน", ""],
  "Brief & site visit|Design proposal|Approve materials|Fabrication|Install & handover": ["สรุปและเยี่ยมชมสถานที่|ข้อเสนอการออกแบบ|อนุมัติวัสดุ|การผลิต|ติดตั้งและส่งมอบ", "Brief i wizyta|Propozycja projektu|Zatwierdzenie materiałów|Produkcja|Montaż i odbiór"],
  "What's included": ["รวมอะไรบ้าง", "Co zawiera"],
  "Dedicated project lead|Measured drawings|Factory quality control|On-site install team|Aftercare guidance": [
    "หัวหน้าโปรเจกต์เฉพาะ|แบบวาดที่วัด|ควบคุมคุณภาพในโรงงาน|ทีมติดตั้งหน้างาน|คำแนะนำหลังการขาย",
    "Dedykowany lider projektu|Rysunki pomiarowe|Kontrola jakości w fabryce|Zespół montażowy|Wsparcie posprzedażowe"
  ],
  "Ready when you are": ["พร้อมเมื่อคุณพร้อม", "Gotowi, gdy Ty"],
  "Talk to us about": ["พูดคุยกับเราเกี่ยว", "Porozmawiaj z nami o"],
  "for your home or project — timelines, budget ranges, and next steps.": [
    "สำหรับบ้านหรือโปรเจกต์ของคุณ — ไทม์ไลน์ งบประมาณ และขั้นตอนถัดไป",
    "dla Twojego domu lub projektu — harmonogramy, zakresy budżetowe i kolejne kroki."
  ],
  "How we deliver": ["วิธีที่เราส่งมอบ", "Jak realizujemy"],
  "Measure & brief|Design proposal|Material selection|Fabrication|Install & handover": ["วัดและสรุป|ข้อเสนอการออกแบบ|เลือกวัสดุ|การผลิต|ติดตั้งและส่งมอบ", "Pomiar i brief|Propozycja projektu|Dobór materiałów|Produkcja|Montaż i odbiór"],
  "Built around your rooms": ["สร้างรอบห้องของคุณ", "Zbudowane wokół Twoich pomieszczeń"],
  "Ready to plan storage that lasts": ["พร้อมวางแผนพื้นที่จัดเก็บที่ยั่งยืน", "Gotowi zaplanować trwałe przechowywanie"],
  "Book a consultation — we design wardrobes and built-ins to your walls, lifestyle, and finishes.": [
    "จองการปรึกษา — เราออกแบบตู้เสื้อผ้าและบิวท์อินตามผนัง ไลฟ์สไตล์ และผิวสำเร็จของคุณ",
    "Umów konsultację — projektujemy szafy i zabudowy dopasowane do Twoich ścian, stylu życia i wykończeń."
  ],
  "Kitchen projects in": ["โปรเจกต์ครัวใน", "Projekty kuchni w"],
  "Local delivery for": ["การส่งมอบท้องถิ่นสำหรับ", "Lokalna realizacja dla"],
  "Site survey|Local install crew|Climate-aware materials|Aftercare nearby": ["สำรวจสถานที่|ทีมติดตั้งท้องถิ่น|วัสดุที่คำนึงถึงสภาพอากาศ|ดูแลหลังการขายในบริเวณใกล้เคียง", "Pomiar terenu|Lokalna ekipa montażowa|Materiały dostosowane do klimatu|Serwis w pobliżu"],
  "Building in": ["กำลังสร้างใน", "Budujesz w"],
  "Book a consultation — we'll map timelines and logistics for your address.": [
    "จองการปรึกษา — เราจะวางแผนไทม์ไลน์และโลจิสติกส์สำหรับที่อยู่ของคุณ",
    "Umów konsultację — zmapujemy harmonogramy i logistykę dla Twojego adresu."
  ],
  // Category descriptions (from taxonomy)
  "Contemporary modular kitchens with clean lines.": ["ครัวโมดูลาร์สมัยใหม่ด้วยเส้นสายที่สะอาด", "Współczesne kuchnie modułowe z czystymi liniami."],
  "U-shaped kitchen layouts for efficient work triangles.": ["เลย์เอาต์ครัวรูปตัว U สำหรับสามเหลี่ยมการทำงานที่มีประสิทธิภาพ", "Układy kuchni w kształcie U dla wydajnych trójkątów roboczych."],
  "L-shaped kitchen layouts for corner spaces.": ["เลย์เอาต์ครัวรูปตัว L สำหรับพื้นที่มุม", "Układy kuchni w kształcie L dla przestrzeni narożnych."],
  "T-shaped kitchen layouts with peninsula seating.": ["เลย์เอาต์ครัวรูปตัว T พร้อมที่นั่งแบบคาบสมุทร", "Układy kuchni w kształcie T z półwyspem."],
  "Straight-run galley kitchens for compact homes.": ["ครัวทางเดินแคบแนวตรงสำหรับบ้านขนาดกะทัดรัด", "Proste kuchnie galeryjne dla kompaktowych domów."],
  "Island kitchen layouts for open-plan living.": ["เลย์เอาต์ครัวแบบเกาะสำหรับการใช้ชีวิตแบบเปิดโล่ง", "Układy kuchni z wyspą do życia na otwartej przestrzeni."],
  "Warm contemporary kitchens blending wood and stone.": ["ครัวร่วมสมัยอบอุ่นผสมผสานไม้และหิน", "Ciepłe współczesne kuchnie łączące drewno i kamień."],
  "Handleless minimalist kitchens with hidden storage.": ["ครัวมินิมอลไร้มือจับพร้อมพื้นที่จัดเก็บที่ซ่อนอยู่", "Minimalistyczne kuchnie bez uchwytów z ukrytym przechowywaniem."],
  "Teak-forward kitchens inspired by Thai craft.": ["ครัวที่เน้นไม้สักได้รับแรงบันดาลใจจากงานฝีมือไทย", "Kuchnie z dominacją teku inspirowane tajskim rzemiosłem."],
  "Kitchen solutions for condominiums and high-rises.": ["โซลูชันครัวสำหรับคอนโดมิเนียมและตึกสูง", "Rozwiązania kuchenne dla apartamentowców i wieżowców."],
  "Custom kitchens for villas and detached homes.": ["ครัวสั่งทำสำหรับวิลล่าและบ้านเดี่ยว", "Kuchnie na wymiar dla willi i domów wolnostojących."],
  "Space-efficient kitchens for townhouses.": ["ครัวประหยัดพื้นที่สำหรับทาวน์เฮาส์", "Efektywne przestrzennie kuchnie dla szeregowców."],
  "Compact kitchen designs for apartments.": ["ดีไซน์ครัวกะทัดรัดสำหรับอพาร์ตเมนต์", "Kompaktowe projekty kuchni dla apartamentów."],
};

function translateHeading(heading) {
  const en = heading.en || "";
  
  // Try direct translation first
  for (const [key, [th, pl]] of Object.entries(translations)) {
    if (en === key) {
      return L(en, th, pl);
    }
  }
  
  // Try pattern matching for dynamic content
  if (en.includes("planning principles")) {
    const match = en.match(/^(.+?)\s+planning principles$/);
    if (match) {
      return L(en, `หลักการวางแผน${match[1]}`, `Zasady planowania ${match[1]}`);
    }
  }
  
  if (en.includes("right for your room")) {
    const match = en.match(/^Is\s+(.+?)\s+right for your room\?$/);
    if (match) {
      return L(en, `${match[1]}เหมาะกับห้องของคุณหรือไม่?`, `Czy ${match[1]} pasuje do Twojego pokoju?`);
    }
  }
  
  if (en.includes("to your walls")) {
    const match = en.match(/^We refine\s+(.+?)\s+to your walls$/);
    if (match) {
      return L(en, `เราปรับแต่ง${match[1]}ให้เข้ากับผนังของคุณ`, `Dopasowujemy ${match[1]} do Twoich ścian`);
    }
  }
  
  if (en.includes("The") && en.includes("look")) {
    const match = en.match(/^The\s+(.+?)\s+look$/);
    if (match) {
      return L(en, `ลุค${match[1]}`, `Wygląd ${match[1]}`);
    }
  }
  
  if (en.includes("Living with") && en.includes("feels effortless")) {
    const match = en.match(/^"Living with\s+(.+?)\s+feels effortless\."$/);
    if (match) {
      return L(en, `"การใช้ชีวิตกับ${match[1]}รู้สึกง่ายดาย"`, `"Życie z ${match[1]} jest bezproblemowe."`);
    }
  }
  
  if (en.includes("Kitchens for") && en.includes("living")) {
    const match = en.match(/^Kitchens for\s+(.+?)\s+living$/);
    if (match) {
      return L(en, `ครัวสำหรับ${match[1]}`, `Kuchnie dla ${match[1]}`);
    }
  }
  
  if (en.includes("What") && en.includes("owners usually need")) {
    const match = en.match(/^What\s+(.+?)\s+owners usually need$/);
    if (match) {
      return L(en, `${match[1]}เจ้าของมักต้องการ`, `${match[1]} właściciele zwykle potrzebują`);
    }
  }
  
  if (en.includes("Designed for how") && en.includes("homes work")) {
    const match = en.match(/^Designed for how\s+(.+?)\s+homes work$/);
    if (match) {
      return L(en, `ออกแบบตามวิธีการทำงานของบ้าน${match[1]}`, `Zaprojektowane pod domy ${match[1]}`);
    }
  }
  
  if (en.includes("Working with")) {
    const match = en.match(/^Working with\s+(.+?)$/);
    if (match) {
      return L(en, `การทำงานกับ${match[1]}`, `Praca z ${match[1]}`);
    }
  }
  
  if (en.includes("changed how the whole kitchen feels")) {
    const match = en.match(/^"(.+?)\s+changed how the whole kitchen feels\."$/);
    if (match) {
      return L(en, `"${match[1]}เปลี่ยนความรู้สึกของครัวทั้งหมด"`, `"${match[1]} zmieniło odczucie całej kuchni."`);
    }
  }
  
  if (en.includes("How") && en.includes("works")) {
    const match = en.match(/^How\s+(.+?)\s+works$/);
    if (match) {
      return L(en, `วิธีการ${match[1]}ทำงาน`, `Jak działa ${match[1]}`);
    }
  }
  
  if (en.includes("How we deliver")) {
    const match = en.match(/^How we deliver\s+(.+?)$/);
    if (match) {
      return L(en, `วิธีที่เราส่งมอบ${match[1]}`, `Jak realizujemy ${match[1]}`);
    }
  }
  
  if (en.includes("Kitchen projects in")) {
    const match = en.match(/^Kitchen projects in\s+(.+?)$/);
    if (match) {
      return L(en, `โปรเจกต์ครัวใน${match[1]}`, `Projekty kuchni w ${match[1]}`);
    }
  }
  
  if (en.includes("Local delivery for")) {
    const match = en.match(/^Local delivery for\s+(.+?)$/);
    if (match) {
      return L(en, `การส่งมอบท้องถิ่นสำหรับ${match[1]}`, `Lokalna realizacja dla ${match[1]}`);
    }
  }
  
  if (en.includes("Building in")) {
    const match = en.match(/^Building in\s+(.+?)\?$/);
    if (match) {
      return L(en, `กำลังสร้างใน${match[1]}?`, `Budujesz w ${match[1]}?`);
    }
  }
  
  // Fallback: keep English, leave th/pl empty
  return L(en, "", "");
}

function translateBody(body) {
  const en = body.en || "";
  
  // Check direct translations
  for (const [key, [th, pl]] of Object.entries(translations)) {
    if (en === key) {
      return L(en, th, pl);
    }
  }
  
  // Pattern matching for dynamic content
  if (en.includes("See and feel") && en.includes("in context")) {
    const match = en.match(/^See and feel\s+(.+?)\s+in context — we sample finishes against your lighting and existing materials before production\.$/);
    if (match) {
      return L(en, `ดูและสัมผัส${match[1]}ในบริบท — เราทดสอบผิวสำเร็จกับแสงและวัสดุที่มีอยู่ก่อนผลิต`, `Zobacz i poczuj ${match[1]} w kontekście — testujemy wykończenia w Twoim oświetleniu i istniejących materiałach przed produkcją.`);
    }
  }
  
  if (en.includes("Talk to us about") && en.includes("for your home or project")) {
    const match = en.match(/^Talk to us about\s+(.+?)\s+for your home or project — timelines, budget ranges, and next steps\.$/);
    if (match) {
      return L(en, `พูดคุยกับเราเกี่ยว${match[1]}สำหรับบ้านหรือโปรเจกต์ของคุณ — ไทม์ไลน์ งบประมาณ และขั้นตอนถัดไป`, `Porozmawiaj z nami o ${match[1]} dla Twojego domu lub projektu — harmonogramy, zakresy budżetowe i kolejne kroki.`);
    }
  }
  
  // Fallback: keep English
  return L(en, "", "");
}

async function main() {
  await connectDB();
  
  const categories = await Category.find({
    siteId: "thailand-kitchen",
    sections: { $exists: true, $ne: [] }
  });
  
  console.log(`Found ${categories.length} categories with sections`);
  
  let updated = 0;
  
  for (const cat of categories) {
    let dirty = false;
    
    if (Array.isArray(cat.sections)) {
      for (let i = 0; i < cat.sections.length; i++) {
        const section = cat.sections[i];
        
        // Translate heading
        if (section.heading) {
          const currentHeading = section.heading;
          const needsTranslation = !currentHeading.th || !currentHeading.pl || 
                                   currentHeading.th === currentHeading.en || 
                                   currentHeading.pl === currentHeading.en;
          
          if (needsTranslation && currentHeading.en) {
            const translated = translateHeading(currentHeading);
            if (translated.th || translated.pl) {
              cat.sections[i].heading = translated;
              dirty = true;
            }
          }
        }
        
        // Translate body
        if (section.body) {
          const currentBody = section.body;
          const needsTranslation = !currentBody.th || !currentBody.pl || 
                                   currentBody.th === currentBody.en || 
                                   currentBody.pl === currentBody.en;
          
          if (needsTranslation && currentBody.en) {
            const translated = translateBody(currentBody);
            if (translated.th || translated.pl) {
              cat.sections[i].body = translated;
              dirty = true;
            }
          }
        }
      }
    }
    
    if (dirty) {
      cat.markModified("sections");
      await cat.save();
      updated++;
      console.log(`✓ Updated ${cat.slug} (${cat.categoryType})`);
    }
  }
  
  console.log(`\nUpdated ${updated} categories with translations`);
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
