/**
 * Per-model feature copy derived from each product's own CMS narrative
 * (layout + unique description). Do not reuse the generic Obsidian/Gold/Marble pack.
 */
const { L } = require("../utils/localized");

function H(titleEn, titleTh, titlePl, descEn, descTh, descPl) {
  return {
    title: L(titleEn, titleTh, titlePl),
    description: L(descEn, descTh, descPl),
  };
}

const PRODUCT_MODEL_FACTS = {
  "obsidian-bay": {
    featureHighlights: [
      H(
        "Island entertaining plan",
        "แผนเกาะสำหรับต้อนรับ",
        "Wyspa do gościnnych spotkań",
        "Open-plan island layout designed for cooking and gathering in the same volume.",
        "เลย์เอาต์เกาะแบบโอเพนแพลน สำหรับทำอาหารและรวมตัวในพื้นที่เดียวกัน",
        "Otwarty układ z wyspą — gotowanie i spotkania w jednej przestrzeni."
      ),
      H(
        "Matte dark cabinetry",
        "ตู้โทนเข้มผิวด้าน",
        "Ciemna zabudowa matowa",
        "Quiet, gallery-like dark fronts with warm timber undertones as specified for this model.",
        "บานตู้โทนเข้มแบบแกลเลอรี พร้อมไม้โทนอุ่นตามสเปกของรุ่นนี้",
        "Ciemne, galeryjne fronty z ciepłym drewnianym podtonem — zgodnie ze specyfikacją modelu."
      ),
      H(
        "Open-plan presence",
        "ตัวตนในพื้นที่เปิด",
        "Obecność w otwartym planie",
        "Proportions set for living spaces that look through to the kitchen rather than a closed cook room.",
        "สัดส่วนสำหรับพื้นที่นั่งที่มองทะลุเข้าครัว ไม่ใช่ห้องครัวปิด",
        "Proporcje dla salonów z widokiem na kuchnię, nie dla zamkniętego pomieszczenia kuchennego."
      ),
    ],
  },
  "pearl-harbor": {
    featureHighlights: [
      H(
        "Straight-run efficiency",
        "ประสิทธิภาพแนวตรง",
        "Efektywny układ prosty",
        "A single working wall that keeps cooking, prep and clean-up in a compact sequence.",
        "ผนังทำงานเดียวที่จัดทำอาหาร เตรียม และล้างในลำดับกะทัดรัด",
        "Jedna ściana robocza — gotowanie, przygotowanie i zmywanie w zwartym ciągu."
      ),
      H(
        "Teak warmth on the run",
        "ความอบอุ่นของไม้สัก",
        "Ciepło teku na ciągu",
        "Teak surfaces specified for this straight layout, ageing with grain rather than a painted finish.",
        "พื้นผิวไม้สักสำหรับเลย์เอาต์ตรง แก่ตามลายไม้ ไม่ใช่สีทา",
        "Powierzchnie z teku w układzie prostym — starzeją się z usłojeniem, nie jak farba."
      ),
      H(
        "Quiet daily workflow",
        "การใช้งานประจำวันที่สงบ",
        "Spokojny codzienny układ",
        "Storage and appliance zones sit on one elevation so the opposite wall can stay open.",
        "โซนเก็บของและเครื่องใช้บนผนังเดียว ให้อีกฝั่งโล่ง",
        "Przechowywanie i AGD na jednej elewacji — przeciwległa ściana zostaje otwarta."
      ),
    ],
  },
  "teak-atelier": {
    featureHighlights: [
      H(
        "L-shaped working corner",
        "มุมทำงานรูปตัวแอล",
        "Narożnik roboczy w kształcie L",
        "Two runs meet in a measured corner so prep and cooking share a short triangle.",
        "สองแนวมาบรรจบที่มุมที่วัดแล้ว ให้เตรียมและทำอาหารอยู่ในสามเหลี่ยมสั้น",
        "Dwa ciągi schodzą się w zmierzonym narożniku — krótki trójkąt pracy."
      ),
      H(
        "Teak as the primary material",
        "ไม้สักเป็นวัสดุหลัก",
        "Tek jako materiał wiodący",
        "This model is specified around teak’s warmth and structural character, not a generic stone pack.",
        "รุ่นนี้ระบุรอบความอบอุ่นและโครงสร้างของไม้สัก ไม่ใช่ชุดหินทั่วไป",
        "Model oparty na cieple i charakterze teku, nie na ogólnym pakiecie kamienia."
      ),
      H(
        "Heirloom joinery",
        "งานต่อไม้ที่อยู่ได้นาน",
        "Stolarstwo na pokolenia",
        "Cabinetry intended to age with the room rather than be replaced with the next finish trend.",
        "ตู้ที่ตั้งใจให้แก่ไปกับห้อง ไม่ใช่เปลี่ยนตามเทรนด์ผิวสำเร็จ",
        "Zabudowa, która ma starzeć się z wnętrzem, a nie ustępować kolejnej modzie."
      ),
    ],
  },
  "midnight-gallery": {
    featureHighlights: [
      H(
        "U-shaped enclosure",
        "การโอบรูปตัวยู",
        "Obudowa w kształcie U",
        "Three connected runs give layered storage and a generous inner worktop.",
        "สามแนวเชื่อมกัน ให้ที่เก็บแบบชั้นและเคาน์เตอร์ด้านในที่กว้าง",
        "Trzy połączone ciągi — warstwowe przechowywanie i szeroki blat wewnątrz."
      ),
      H(
        "Deep-tone composition",
        "องค์ประกอบโทนเข้ม",
        "Kompozycja w głębokich tonach",
        "Dark gallery-style surfaces as described for this model — not a pale classic card image.",
        "พื้นผิวโทนเข้มแบบแกลเลอรีตามที่ระบุในรุ่นนี้ ไม่ใช่ภาพการ์ดสีอ่อน",
        "Ciemne, galeryjne powierzchnie zgodne z opisem modelu — nie jasna, klasyczna karta."
      ),
      H(
        "Layered storage on three walls",
        "ที่เก็บแบบชั้นบนสามผนัง",
        "Warstwowe szafki na trzech ścianach",
        "Tall and base units wrap the cook so tools stay inside the U, not on an island.",
        "ตู้สูงและตู้ล่างโอบคนทำอาหาร ของอยู่ในตัวยู ไม่ใช่บนเกาะ",
        "Szafki wysokie i dolne otaczają kucharza — sprzęt zostaje w U, nie na wyspie."
      ),
    ],
  },
  "soft-horizon": {
    featureHighlights: [
      H(
        "Contemporary island plan",
        "แผนเกาะร่วมสมัย",
        "Współczesny plan z wyspą",
        "Light, open proportions for an island that reads as furniture in the living space.",
        "สัดส่วนสว่างและเปิด สำหรับเกาะที่ดูเหมือนเฟอร์นิเจอร์ในพื้นที่นั่ง",
        "Jasne, otwarte proporcje — wyspa czytelna jak mebel w strefie dziennej."
      ),
      H(
        "Light finish palette",
        "พาเลตผิวสำเร็จโทนสว่าง",
        "Jasna paleta wykończeń",
        "Pale fronts and open sight-lines as specified for this modern island model.",
        "บานโทนสว่างและสายตาระยะเปิด ตามสเปกรุ่นเกาะโมเดิร์นนี้",
        "Jasne fronty i otwarte osie widokowe — zgodnie ze specyfikacją tego modelu."
      ),
      H(
        "Open living connection",
        "การเชื่อมกับพื้นที่นั่ง",
        "Połączenie ze strefą dzienną",
        "The island is the social edge; the back run holds the working appliances.",
        "เกาะเป็นขอบสังคม แนวหลังเก็บเครื่องใช้ทำงาน",
        "Wyspa jest krawędzią towarzyską; ciąg tylny trzyma AGD."
      ),
    ],
  },
  "coastal-line": {
    featureHighlights: [
      H(
        "T-plan with peninsula seating",
        "แผนตัวทีพร้อมที่นั่งคาบสมุทร",
        "Układ T z siedziskami na półwyspie",
        "A peninsula connection for casual dining, distinct from a free-standing island.",
        "คาบสมุทรสำหรับนั่งกินแบบสบาย ไม่ใช่เกาะลอย",
        "Półwysep do swobodnego jedzenia — inny niż wolnostojąca wyspa."
      ),
      H(
        "Seating on the return",
        "ที่นั่งบนช่วงพับกลับ",
        "Siedziska na załamaniu",
        "The return run is specified for stools, not a second bank of tall ovens.",
        "ช่วงพับกลับสำหรับเก้าอี้ ไม่ใช่เตาอบสูงแถวที่สอง",
        "Załamanie pod stołki, nie pod drugi rząd wysokich piekarników."
      ),
      H(
        "Casual dining connection",
        "การเชื่อมมื้ออาหารแบบสบาย",
        "Swobodne połączenie jadalniane",
        "Layout for rooms that need a breakfast edge without a separate dining table.",
        "เลย์เอาต์สำหรับห้องที่ต้องการขอบอาหารเช้า โดยไม่มีโต๊ะทานข้าวแยก",
        "Układ dla wnętrz, które potrzebują krawędzi śniadaniowej bez osobnego stołu."
      ),
    ],
  },
  "amber-court": {
    featureHighlights: [
      H(
        "Warm island composition",
        "องค์ประกอบเกาะโทนอุ่น",
        "Ciepła kompozycja z wyspą",
        "Amber-toned island plan as named for this model — not a reused Obsidian Bay feature list.",
        "แผนเกาะโทนอำพันตามชื่อรุ่นนี้ ไม่ใช่รายการฟีเจอร์ของ Obsidian Bay",
        "Ciepły plan z wyspą zgodny z nazwą modelu — nie skopiowana lista Obsidian Bay."
      ),
      H(
        "Brass and stone accents",
        "จุดเน้นทองเหลืองและหิน",
        "Akcenty mosiądzu i kamienia",
        "Warm metal and marble accents as described for Amber Court only.",
        "โลหะโทนอุ่นและหินอ่อนตามที่ระบุเฉพาะ Amber Court",
        "Ciepły metal i akcenty marmuru — opis wyłącznie dla Amber Court."
      ),
      H(
        "Island as the centre line",
        "เกาะเป็นเส้นกลาง",
        "Wyspa jako oś środkowa",
        "The island carries the visual weight; perimeter runs stay quieter.",
        "เกาะรับน้ำหนักทางสายตา แนวรอบนอกสงบกว่า",
        "Wyspa niesie ciężar wizualny; biegi obwodowe zostają spokojniejsze."
      ),
    ],
  },
  "nova-kitchen": {
    featureHighlights: [
      H(
        "Bright straight-run",
        "แนวตรงโทนสว่าง",
        "Jasny układ prosty",
        "Clean lines and a single elevation for a modern straight kitchen.",
        "เส้นสะอาดและผนังเดียวสำหรับครัวตรงโมเดิร์น",
        "Czyste linie i jedna elewacja — nowoczesna kuchnia prosta."
      ),
      H(
        "Integrated storage",
        "ที่เก็บแบบบูรณาการ",
        "Zintegrowane przechowywanie",
        "Smart storage along the run so the opposite wall can stay clear.",
        "ที่เก็บชาญฉลาดตามแนว ให้ผนังตรงข้ามโล่ง",
        "Przechowywanie wzdłuż ciągu — przeciwległa ściana zostaje wolna."
      ),
      H(
        "Daylight-facing fronts",
        "บานหันเข้าแสง",
        "Fronty od strony światła",
        "Pale contemporary surfaces specified for this straight modern model.",
        "ผิวร่วมสมัยโทนสว่างสำหรับรุ่นตรงโมเดิร์นนี้",
        "Jasne, współczesne powierzchnie w tym prostym modelu."
      ),
    ],
  },
  "heritage-wing": {
    featureHighlights: [
      H(
        "Classic U-plan",
        "แผนตัวยูคลาสสิก",
        "Klasyczny układ U",
        "Traditional three-sided enclosure updated with contemporary materials.",
        "การโอบสามด้านแบบดั้งเดิม ที่อัปเดตด้วยวัสดุร่วมสมัย",
        "Tradycyjne trójstronne obudowanie ze współczesnymi materiałami."
      ),
      H(
        "Balanced classic proportions",
        "สัดส่วนคลาสสิกที่สมดุล",
        "Zrównoważone klasyczne proporcje",
        "Cornice lines and panel rhythm as a heritage composition, not a handleless slab kitchen.",
        "เส้นบัวและจังหวะบานแบบมรดก ไม่ใช่ครัวแผ่นไร้มือจับ",
        "Gzymsy i rytm paneli jako kompozycja heritage, nie kuchnia płytowa bez uchwytów."
      ),
      H(
        "Worktop on three sides",
        "เคาน์เตอร์สามด้าน",
        "Blat z trzech stron",
        "Prep, cook and clean-up each take a side of the U.",
        "เตรียม ทำอาหาร และล้าง คนละด้านของตัวยู",
        "Przygotowanie, gotowanie i zmywanie — każdy na innym boku U."
      ),
    ],
  },
  "calm-studio": {
    featureHighlights: [
      H(
        "Quiet L-shaped studio",
        "สตูดิโอปรับตัวแอลที่สงบ",
        "Spokojne studio w kształcie L",
        "A compact L for smaller rooms where the kitchen must stay visually calm.",
        "ตัวแอลกะทัดรัดสำหรับห้องเล็ก ที่ครัวต้องดูสงบ",
        "Zwarte L do mniejszych wnętrz, w których kuchnia ma pozostać wizualnie spokojna."
      ),
      H(
        "Integrated appliances",
        "เครื่องใช้แบบบูรณาการ",
        "Zintegrowane AGD",
        "Appliances sit behind the same fronts so the two runs read as furniture.",
        "เครื่องใช้อยู่หลังบานเดียวกัน ให้สองแนวอ่านเป็นเฟอร์นิเจอร์",
        "AGD za tymi samymi frontami — dwa ciągi czytelne jak meble."
      ),
      H(
        "Seamless storage",
        "ที่เก็บแบบไร้รอยต่อ",
        "Płynne przechowywanie",
        "Handle-light storage along both legs of the L.",
        "ที่เก็บแบบมือจับบางตามทั้งสองขาของตัวแอล",
        "Przechowywanie z dyskretnymi uchwytami na obu ramionach L."
      ),
    ],
  },
  "shadow-ridge": {
    featureHighlights: [
      H(
        "Charcoal island statement",
        "เกาะโทนถ่านที่เป็นจุดเด่น",
        "Wyspa w kolorze węgla",
        "Deep charcoal cabinetry with the island as the primary volume.",
        "ตู้โทนถ่านเข้ม โดยเกาะเป็นปริมาตรหลัก",
        "Głęboka, grafitowa zabudowa — wyspa jako główna bryła."
      ),
      H(
        "Waterfall island edge",
        "ขอบเกาะแบบน้ำตก",
        "Wyspa z krawędzią waterfall",
        "A waterfall end as specified for this island model.",
        "ปลายแบบน้ำตกตามสเปกรุ่นเกาะนี้",
        "Zakończenie waterfall zgodnie ze specyfikacją tego modelu."
      ),
      H(
        "Dark open-plan silhouette",
        "เงาโทนเข้มในพื้นที่เปิด",
        "Ciemna sylwetka w otwartym planie",
        "The kitchen reads as one dark piece in the living space rather than a pale classic.",
        "ครัวอ่านเป็นชิ้นโทนเข้มชิ้นเดียวในพื้นที่นั่ง ไม่ใช่คลาสสิกสีอ่อน",
        "Kuchnia jako jedna ciemna bryła w salonie, nie jasna klasyka."
      ),
    ],
  },
  "linen-bay": {
    featureHighlights: [
      H(
        "Straight linen run",
        "แนวตรงโทนลินิน",
        "Prosty ciąg w odcieniu lnu",
        "Warm linen fronts on a straight elevation — a separate narrative from Coastal Line.",
        "บานโทนลินินอุ่นบนผนังตรง — เรื่องแยกจาก Coastal Line",
        "Ciepłe, lniane fronty na prostej elewacji — inna opowieść niż Coastal Line."
      ),
      H(
        "Handle-less profile",
        "โปรไฟล์ไร้มือจับ",
        "Profil bezuchwytowy",
        "Push-to-open or channel pulls so the linen plane stays uninterrupted.",
        "ดันเปิดหรือร่องมือจับ ให้ระนาบลินินไม่ขาด",
        "Otwieranie push-to-open lub uchwyty kanałowe — płaszczyzna lnu bez przerw."
      ),
      H(
        "Soft lighting along the run",
        "แสงนุ่มตามแนว",
        "Miękkie światło wzdłuż ciągu",
        "Under-cabinet and toe-kick light specified to keep the pale fronts even.",
        "ไฟใต้ตู้และเชิงชาย เพื่อให้บานโทนสว่างสม่ำเสมอ",
        "Światło pod szafkami i przy cokole — równe, jasne fronty."
      ),
    ],
  },
};

function factsForSlug(slug) {
  return PRODUCT_MODEL_FACTS[String(slug || "").trim().toLowerCase()] || null;
}

/** First model that may use each Kitchen*.png. Later models must upload their own photos. */
const KITCHEN_IMAGE_OWNERS = {
  "/products/Kitchen1.png": "obsidian-bay",
  "/products/Kitchen2.png": "pearl-harbor",
  "/products/Kitchen3.png": "teak-atelier",
  "/products/Kitchen4.png": "midnight-gallery",
  "/products/Kitchen5.png": "soft-horizon",
  "/products/Kitchen6.png": "coastal-line",
};

function normalizeKitchenImagePath(url) {
  const raw = String(url || "").trim();
  if (!raw) return "";
  try {
    const path = raw.startsWith("http") ? new URL(raw).pathname : raw.split("?")[0];
    const match = path.match(/\/products\/Kitchen\d+\.png$/i);
    return match ? match[0].replace(/\\/g, "/") : "";
  } catch {
    return "";
  }
}

module.exports = {
  PRODUCT_MODEL_FACTS,
  factsForSlug,
  KITCHEN_IMAGE_OWNERS,
  normalizeKitchenImagePath,
};
