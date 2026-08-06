/**
 * Seed TH/PL blog translations for Thailand Kitchen CMS posts.
 * Matches known static slugs; fills empty translation fields only.
 *
 * Usage: node src/scripts/seedBlogTranslations.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const { Blog } = require("../model/cmsModels");

const SITE_ID = "thailand-kitchen";

const BY_SLUG = {
  "the-art-of-teak": {
    th: {
      title:
        "ศิลปะแห่งไม้สัก: ทำไมไม้สืบทอดยังเป็นสุดยอดความหรูของครัว",
      excerpt:
        "จากลายไม้ถึงการเคลือบ ไม้สักมอบความอบอุ่น ความแข็งแรง และเอกลักษณ์ที่คงทนให้ทุกครัวที่เรารังสรรค์—รากจากมรดกไทยและการใช้ชีวิตสมัยใหม่",
      category: "งานฝีมือ",
      subsectionTitle: "มรดกแห่งความทนทาน",
      quote:
        "ไม้สักมีชีวิต แม้จะถูกแกะเป็นตู้ครัวแล้ว มันยังหายใจไปกับห้อง งานของเราคือฟังลายไม้และให้มันนำพาสิ่ว",
      quoteAuthor: "ช่างฝีมือหลัก",
      content: [
        "ไม้สักได้รับการยกย่องทั่วประเทศไทยด้วยน้ำมันธรรมชาติ ลายไม้ที่งดงาม และความทนทานต่อความชื้น ในครัว—ที่ความร้อน ไอน้ำ และการใช้งานประจำวันทดสอบวัสดุ—ไม้มรดกนี้ยังคงเป็นหนึ่งในตัวเลือกที่ประณีตที่สุด",
        "ทุกแผ่นที่เราคัดเลือกจะถูกประเมินทิศทางลายไม้ ความลึกของสี และความแข็งแรงของโครงสร้าง เป้าหมายไม่ใช่แค่ความสวย แต่ประสิทธิภาพที่งดงามไปตามกาลเวลาหลายทศวรรษ",
        "ช่างของเรารวมเทคนิคการต่อไม้แบบดั้งเดิมเข้ากับวิศวกรรมครัวสมัยใหม่ สร้างตู้ครัวที่รู้สึกถึงมรดกไทยและรองรับชีวิตปัจจุบัน",
        "ไม่ว่าคุณจะชอบโทนมรดกอบอุ่นหรือผิวสีอ่อนเรียบสงบ ไม้สักยังคงยกระดับประสบการณ์ครัวทั้งหมด—สัมผัสได้ คงทน และหรูหราอย่างชัดเจน",
      ],
    },
    pl: {
      title:
        "Sztuka teku: dlaczego dziedziczne drewno pozostaje szczytem luksusu kuchennego",
      excerpt:
        "Od usłojenia po wykończenie tek wnosi ciepło, wytrzymałość i charakter do każdej kuchni, którą tworzymy — zakorzenionej w tajskim dziedzictwie i nowoczesnym życiu.",
      category: "Rzemiosło",
      subsectionTitle: "Dziedzictwo odporności",
      quote:
        "Tek żyje. Nawet po wyrzeźbieniu w zabudowę oddycha z pomieszczeniem. Nasza praca to słuchać usłojenia i pozwolić mu prowadzić dłuto.",
      quoteAuthor: "Mistrz rzemiosła, główny artysta",
      content: [
        "Tek od dawna jest ceniony w Tajlandii za naturalne oleje, bogate usłojenie i odporność na wilgoć. W kuchni — gdzie ciepło, para i codzienne użytkowanie testują materiały — to dziedziczne drewno pozostaje jednym z najbardziej wyrafinowanych wyborów.",
        "Każdą deskę oceniamy pod kątem kierunku usłojenia, głębi koloru i integralności strukturalnej. Celem nie jest tylko piękno, lecz trwałość, która z wdziękiem dojrzewa przez dekady.",
        "Nasi rzemieślnicy łączą tradycyjne techniki łączenia z nowoczesną inżynierią kuchenną, tworząc zabudowę zakorzenioną w tajskim dziedzictwie i służącą współczesnemu życiu.",
        "Niezależnie od tego, czy wolisz ciepłą, dziedziczną paletę, czy spokojniejsze, jasne wykończenie, tek nadal podnosi całe doświadczenie kuchenne — dotykowe, trwałe i wyraźnie premium.",
      ],
    },
  },
  "open-concept-kitchen-design": {
    th: {
      title: "การใช้ชีวิตแบบโอเพ่น: ออกแบบครัวที่เชื่อมทั้งบ้าน",
      excerpt:
        "ครัวเปิดสามารถเป็นหัวใจของชีวิตครอบครัว นี่คือวิธีที่เลย์เอาต์และสัดส่วนสร้างการไหลโดยไม่เสียฟังก์ชัน",
      category: "เลย์เอาต์และพื้นที่",
      subsectionTitle: "ออกแบบเพื่อการเชื่อมต่อ",
      quote:
        "ครัวควรเชิญผู้คนเข้ามา—ไม่ผลักพวกเขาไปขอบห้อง",
      quoteAuthor: "สตูดิโอออกแบบ Thailand Kitchens",
      content: [
        "ครัวโอเพ่นสำเร็จเมื่อสมดุลความต้องการทำอาหารกับการเชื่อมต่อทางสังคม เส้นสายตา ตำแหน่งเกาะกลาง และจังหวะเพดานล้วนกำหนดความรู้สึกของห้อง",
        "เราเริ่มจากการวางแผนการเคลื่อนไหว: โซนเตรียม โซนทำอาหาร และพื้นที่เก็บของต้องรองรับนิสัยประจำวันโดยไม่ขวางพื้นที่สนทนา",
        "ความต่อเนื่องของวัสดุระหว่างครัวและพื้นที่นั่งเล่นช่วยให้บ้านอ่านเป็นองค์ประกอบเดียว ในขณะที่พื้นผิวที่ต่างเล็กน้อยทำให้แต่ละโซนชัดเจน",
        "ผลลัพธ์คือครัวที่ต้อนรับ ทำอาหาร และใช้ชีวิตได้ดีเท่ากัน—ออกแบบตามวิธีที่คุณใช้บ้านจริงๆ",
      ],
    },
    pl: {
      title:
        "Otwarta przestrzeń: projektowanie kuchni, która łączy cały dom",
      excerpt:
        "Otwarta kuchnia może stać się sercem życia rodzinnego. Oto jak przemyślany układ i proporcje tworzą przepływ bez utraty funkcji.",
      category: "Układ i przestrzeń",
      subsectionTitle: "Projektowanie dla połączenia",
      quote:
        "Kuchnia powinna zapraszać ludzi — nie spychać ich na skraj pomieszczenia.",
      quoteAuthor: "Studio projektowe Thailand Kitchens",
      content: [
        "Otwarte kuchnie sprawdzają się, gdy równoważą potrzeby gotowania z kontaktem społecznym. Linie wzroku, wyspa i rytm sufitu kształtują odczucie przestrzeni.",
        "Zaczynamy od mapowania ruchu: strefa przygotowania, gotowania i przechowywania muszą wspierać codzienne nawyki bez blokowania rozmów.",
        "Ciągłość materiałów między kuchnią a salonem sprawia, że dom czyta się jako jedną kompozycję, a subtelne zmiany faktury zachowują odrębność stref.",
        "Efektem jest kuchnia, która gości, gotuje i żyje równie dobrze — zaprojektowana wokół tego, jak naprawdę używasz domu.",
      ],
    },
  },
  "the-marble-masterclass": {
    th: {
      title: "คลาสเตอร์หินอ่อน: เลือกแผ่นที่ใช่",
      excerpt:
        "การเลือกหินอ่อนคือทั้งสุนทรียะและความปฏิบัติได้ เรียนรู้วิธีเลือกแผ่นที่เหมาะกับสไตล์ทำอาหาร แสง และการดูแลระยะยาว",
      category: "คู่มือวัสดุ",
      subsectionTitle: "อ่านหิน",
      quote:
        "ทุกแผ่นเล่าเรื่องผ่านลายเส้น—เลือกแผ่นที่สงบภายใต้แสงของคุณ",
      quoteAuthor: "ผู้เชี่ยวชาญวัสดุ",
      content: [
        "หินอ่อนมอบความหรูสงบให้พื้นผิวครัว—ลายเส้นนุ่ม สัมผัสเย็น และความคลาสสิก การเลือกแผ่นที่ใช่เริ่มจากเข้าใจวิธีทำอาหารและทำความสะอาดของคุณ",
        "ดูการไหลของลายและความต่างของสีทั้งในแสงกลางวันและแสงเย็น แผ่นที่สงบในโชว์รูมควรยังสมดุลในบ้านของคุณ",
        "การเคลือบและการดูแลสำคัญ ด้วยการดูแลที่ถูกต้อง หินอ่อนคงสวยได้นานหลายปีและเป็นลายเซ็นของดีไซน์ครัวคุณ",
      ],
    },
    pl: {
      title: "Mistrzowska klasa marmuru: wybór idealnej płyty",
      excerpt:
        "Wybór marmuru to estetyka i praktyczność. Dowiedz się, jak wybrać płytę dopasowaną do stylu gotowania, światła i długoterminowej pielęgnacji.",
      category: "Przewodniki materiałowe",
      subsectionTitle: "Czytanie kamienia",
      quote:
        "Każda płyta opowiada historię w żyłach — wybierz tę, która uspokaja w Twoim świetle.",
      quoteAuthor: "Specjalista materiałowy",
      content: [
        "Marmur wnosi spokojny luksus na powierzchnie kuchenne — miękkie żyłkowanie, chłodny dotyk i ponadczasową obecność. Wybór właściwej płyty zaczyna się od zrozumienia sposobu gotowania i czyszczenia.",
        "Uważnie obserwuj ruch żył i zmienność koloru w świetle dziennym i wieczornym. Płyta spokojna w showroomie powinna pozostać zrównoważona w domu.",
        "Impregnacja i konserwacja mają znaczenie. Przy właściwej pielęgnacji marmur pozostaje piękny przez lata, dodając charakterystyczny akcent projektowi kuchni.",
      ],
    },
  },
  "living-in-the-heart-of-the-home": {
    th: {
      title: "ใช้ชีวิตที่หัวใจของบ้าน: ครัวในฐานะศูนย์กลาง",
      excerpt:
        "นอกจากการทำอาหาร ครัวคือที่รวมชีวิตประจำวัน การออกแบบที่ต้อนรับผู้คนทำให้พื้นที่มีชีวิตตลอดวัน",
      category: "ไลฟ์สไตล์",
      subsectionTitle: "ชีวิตรอบเกาะกลาง",
      quote:
        "ครัวที่ดีเก็บมากกว่ามื้ออาหาร—มันเก็บจังหวะของวัน",
      quoteAuthor: "Thailand Kitchens",
      content: [
        "ครัวกลายเป็นหัวใจของบ้านเมื่อเชิญให้หยุดค้าง—กาแฟเช้า การบ้านที่เกาะกลาง และการสนทนาเย็นหลังอาหาร",
        "ที่นั่งสบาย แสงนุ่ม และผิวสัมผัสทนทานให้ครัวรองรับหลายอารมณ์โดยไม่รู้สึกเปราะบาง",
        "เมื่อดีไซน์คาดการณ์ชีวิตจริง ครัวยังคงอบอุ่นต้อนรับทุกชั่วโมงของวัน",
      ],
    },
    pl: {
      title: "Życie w sercu domu: kuchnia jako hub",
      excerpt:
        "Poza gotowaniem kuchnia zbiera codzienne życie. Wybory projektowe, które zapraszają ludzi, sprawiają, że przestrzeń żyje przez cały dzień.",
      category: "Styl życia",
      subsectionTitle: "Życie wokół wyspy",
      quote:
        "Najlepsze kuchnie trzymają więcej niż posiłki — trzymają rytm dnia.",
      quoteAuthor: "Thailand Kitchens",
      content: [
        "Kuchnia staje się sercem domu, gdy zaprasza do zatrzymania — poranna kawa, nauka przy wyspie i wieczorna rozmowa po kolacji.",
        "Wygodne siedziska, miękkie światło i trwałe wykończenia pozwalają kuchni wspierać wiele nastrojów bez wrażenia kruchości.",
        "Gdy projekt przewiduje prawdziwe życie, kuchnia pozostaje gościnna o każdej godzinie dnia.",
      ],
    },
  },
  "functional-flow-ergonomics": {
    th: {
      title: "การไหลที่ใช้งานได้: หลักสรีรศาสตร์ในครัวสมัยใหม่",
      excerpt:
        "ครัวที่ดีรู้สึกง่ายเพราะระยะเอื้อม ความสูง และการเคลื่อนไหวถูกวางแผนอย่างตั้งใจ—ลดความเมื่อยและเพิ่มประสิทธิภาพ",
      category: "เทรนด์ดีไซน์",
      subsectionTitle: "การเคลื่อนไหวไร้แรงเสียดทาน",
      quote:
        "เมื่อระยะเอื้อมและความสูงถูกต้อง การทำอาหารรู้สึกเป็นธรรมชาติ—ไม่เหมือนงานหนัก",
      quoteAuthor: "สตูดิโอออกแบบ",
      content: [
        "หลักสรีรศาสตร์เปลี่ยนการทำอาหารประจำวัน ความสูงท็อป การเข้าถึงลิ้นชัก และการวางเครื่องใช้กำหนดว่าแต่ละงานรู้สึกเป็นธรรมชาติแค่ไหน",
        "เราออกแบบตามส่วนสูง นิสัย และเครื่องมือที่ใช้บ่อยที่สุด เพื่อให้ครัวสนับสนุนคุณแทนที่จะให้คุณปรับตัว",
        "การปรับเล็กๆ—เช่นที่เก็บแบบดึงออกใกล้โซนเตรียม—สร้างการไหลที่คุณสังเกตได้ทุกวัน",
      ],
    },
    pl: {
      title: "Funkcjonalny przepływ: ergonomia w nowoczesnej kuchni",
      excerpt:
        "Dobre kuchnie wydają się bez wysiłku, bo zasięg, wysokość i ruch są zaplanowane z intencją — mniej obciążenia, więcej efektywności.",
      category: "Trendy projektowe",
      subsectionTitle: "Ruch bez tarcia",
      quote:
        "Gdy zasięg i wysokość są właściwe, gotowanie jest naturalne — nie jak praca.",
      quoteAuthor: "Studio projektowe",
      content: [
        "Ergonomia zmienia codzienne gotowanie. Wysokość blatu, dostęp do szuflad i rozmieszczenie AGD decydują, jak naturalnie czuje się każde zadanie.",
        "Projektujemy wokół Twojego wzrostu, nawyków i najczęściej używanych narzędzi, by kuchnia Cię wspierała, a nie wymagała dostosowania.",
        "Małe korekty — jak wysuwane przechowywanie przy strefie przygotowania — tworzą przepływ, który zauważasz każdego dnia.",
      ],
    },
  },
  "modern-kitchen-transformation": {
    th: {
      title: "คู่มือครบ: เปลี่ยนครัวสมัยใหม่ในประเทศไทย",
      excerpt:
        "จากวางแผนเลย์เอาต์ถึงเลือกผิวสัมผัส สำรวจว่าครัวโมดูลาร์สมัยใหม่เปลี่ยนการใช้ชีวิตประจำวันในบ้านไทยได้อย่างไร",
      category: "การดูแลครัว",
      subsectionTitle: "เริ่มจากไลฟ์สไตล์",
      content: [
        "ครัวที่ดีที่สุดเริ่มจากวิธีทำอาหาร ต้อนรับแขก และเคลื่อนไหวในบ้าน เราแผนที่นิสัยเหล่านั้นก่อนเลือกเลย์เอาต์และวัสดุ",
        "ครัวโมดูลาร์สมัยใหม่ผสานพื้นที่เก็บของที่ฉลาด ฮาร์ดแวร์พรีเมียม และผิวสัมผัสที่ทนต่อสภาพอากาศร้อนชื้นของไทย",
        "ผลลัพธ์คือการเปลี่ยนผ่านที่รู้สึกเป็นระเบียบ สวยงาม และพร้อมใช้งานทุกวัน—ไม่ใช่แค่เปลี่ยนหน้าตา",
      ],
    },
    pl: {
      title: "Kompletny przewodnik: nowoczesna transformacja kuchni w Tajlandii",
      excerpt:
        "Od planowania układu po wybór wykończeń — zobacz, jak nowoczesna kuchnia modułowa zmienia codzienne życie w tajskich domach.",
      category: "Pielęgnacja kuchni",
      subsectionTitle: "Zacznij od stylu życia",
      content: [
        "Najlepsze kuchnie zaczynają się od tego, jak gotujesz, gościsz i poruszasz się po domu. Mapujemy te nawyki przed wyborem układów i materiałów.",
        "Nowoczesna kuchnia modułowa łączy inteligentne przechowywanie, premium okucia i wykończenia odporne na gorący, wilgotny klimat Tajlandii.",
        "Efektem jest transformacja uporządkowana, piękna i gotowa na każdy dzień — nie tylko zmiana wyglądu.",
      ],
    },
  },
};

function isEmptyTranslation(tr) {
  if (!tr || typeof tr !== "object") return true;
  const hasBody =
    (Array.isArray(tr.bodySections) &&
      tr.bodySections.some((s) => String(s?.content || "").trim())) ||
    (Array.isArray(tr.content) &&
      tr.content.some((p) => String(p || "").trim()));
  return !(
    String(tr.title || "").trim() ||
    String(tr.excerpt || "").trim() ||
    hasBody
  );
}

function needsBodySeed(tr) {
  if (!tr || typeof tr !== "object") return true;
  const hasBody =
    (Array.isArray(tr.bodySections) &&
      tr.bodySections.some((s) => String(s?.content || "").trim())) ||
    (Array.isArray(tr.content) &&
      tr.content.some((p) => String(p || "").trim()));
  return !hasBody;
}

async function main() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.error("Missing MONGO_URI / MONGODB_URI");
    process.exit(1);
  }
  await mongoose.connect(uri);
  const blogs = await Blog.find({ siteId: SITE_ID });
  let updated = 0;
  for (const blog of blogs) {
    const pack = BY_SLUG[blog.slug];
    if (!pack) {
      // Generic category-only fill when body translations are empty
      const categoryMap = {
        Craftsmanship: { th: "งานฝีมือ", pl: "Rzemiosło" },
        "Layout & Space": { th: "เลย์เอาต์และพื้นที่", pl: "Układ i przestrzeń" },
        "Material Guides": { th: "คู่มือวัสดุ", pl: "Przewodniki materiałowe" },
        Lifestyle: { th: "ไลฟ์สไตล์", pl: "Styl życia" },
        "Design Trends": { th: "เทรนด์ดีไซน์", pl: "Trendy projektowe" },
        Journal: { th: "วารสาร", pl: "Dziennik" },
        "Kitchen Care": { th: "การดูแลครัว", pl: "Pielęgnacja kuchni" },
        Home: { th: "บ้าน", pl: "Dom" },
      };
      const cat = categoryMap[blog.category];
      if (!cat) continue;
      const th = blog.translations?.th || {};
      const pl = blog.translations?.pl || {};
      let dirty = false;
      if (isEmptyTranslation(th) && !String(th.category || "").trim()) {
        blog.translations = blog.translations || {};
        blog.translations.th = { ...th, category: cat.th };
        dirty = true;
      }
      if (isEmptyTranslation(pl) && !String(pl.category || "").trim()) {
        blog.translations = blog.translations || {};
        blog.translations.pl = { ...pl, category: cat.pl };
        dirty = true;
      }
      if (dirty) {
        blog.markModified("translations");
        await blog.save();
        updated += 1;
        console.log("category-only:", blog.slug);
      }
      continue;
    }

    const thEmpty = needsBodySeed(blog.translations?.th);
    const plEmpty = needsBodySeed(blog.translations?.pl);
    if (!thEmpty && !plEmpty) {
      console.log("skip (already filled):", blog.slug);
      continue;
    }
    blog.translations = blog.translations || {};
    if (thEmpty) blog.translations.th = pack.th;
    if (plEmpty) blog.translations.pl = pack.pl;
    blog.markModified("translations");
    await blog.save();
    updated += 1;
    console.log("seeded:", blog.slug, {
      th: thEmpty,
      pl: plEmpty,
    });
  }
  console.log(`Done. Updated ${updated} / ${blogs.length} blogs.`);
  await mongoose.disconnect();
}

module.exports = { BY_SLUG, isEmptyTranslation, needsBodySeed };

if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
