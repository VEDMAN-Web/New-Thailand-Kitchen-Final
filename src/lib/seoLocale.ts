import { getUrlLocale } from "./urlLocale";

type Pair = [title: string, description: string];

/** Polish and Thai titles/descriptions for pages whose English SEO text is hard-coded. */
const STATIC_SEO: Record<string, { PL: Pair; TH: Pair }> = {
  "/": {
    PL: ["Kuchnie na wymiar w Tajlandii | Thailand Kitchens", "Nowoczesne kuchnie na wymiar w Tajlandii: projekt, produkcja i montaż. Układy z wyspą, w L i w U, szafki z teku i blaty z kamienia. Bezpłatna konsultacja."],
    TH: ["ครัวสั่งทำในประเทศไทย | Thailand Kitchens", "ครัวสั่งทำสไตล์โมเดิร์นในประเทศไทย ครบตั้งแต่ออกแบบ ผลิต และติดตั้ง ทั้งครัวไอส์แลนด์ ตัวแอล ตัวยู ตู้ไม้สัก และท็อปหิน ปรึกษาฟรี"],
  },
  "/guides": {
    PL: ["Blog o kuchniach: pomysły i porady | Thailand Kitchens", "Porady ekspertów o układach kuchni, materiałach, blatach i pielęgnacji kuchni w tajskim klimacie."],
    TH: ["บล็อกครัว: ไอเดียและคู่มือ | Thailand Kitchens", "บทความจากผู้เชี่ยวชาญเรื่องผังครัว วัสดุ ท็อปครัว และการดูแลครัวในสภาพอากาศของไทย"],
  },
  "/products": {
    PL: ["Kuchnie i produkty | Thailand Kitchens", "Poznaj nasze kuchnie: nowoczesne, z wyspą, w L, w U i jednorzędowe. Szafki, blaty i wykończenia dopasowane do domów w Tajlandii."],
    TH: ["ครัวและผลิตภัณฑ์ | Thailand Kitchens", "ชมครัวของเรา ทั้งครัวโมเดิร์น ไอส์แลนด์ ตัวแอล ตัวยู และแนวเดียว พร้อมตู้ ท็อป และวัสดุที่เหมาะกับบ้านในประเทศไทย"],
  },
  "/gallery": {
    PL: ["Galeria kuchni | Thailand Kitchens", "Galeria kuchni i inspiracji: układy, style, materiały i wykończenia dla domów w Tajlandii."],
    TH: ["แกลเลอรีครัว | Thailand Kitchens", "รวมภาพครัวและแรงบันดาลใจ ทั้งผังครัว สไตล์ วัสดุ และงานตกแต่งสำหรับบ้านในประเทศไทย"],
  },
  "/contact": {
    PL: ["Kontakt i bezpłatna konsultacja | Thailand Kitchens", "Opowiedz nam o swojej kuchni. Prześlij wymiary i zdjęcia, a przygotujemy projekt i wycenę kuchni na wymiar w Tajlandii."],
    TH: ["ติดต่อและปรึกษาฟรี | Thailand Kitchens", "เล่าเรื่องครัวของคุณให้เราฟัง ส่งขนาดและรูปถ่ายมา เราจะเตรียมแบบและใบเสนอราคาครัวสั่งทำในประเทศไทยให้"],
  },
  "/faq": {
    PL: ["Najczęstsze pytania | Thailand Kitchens", "Odpowiedzi na pytania o projekt, ceny, terminy, materiały i montaż kuchni na wymiar w Tajlandii."],
    TH: ["คำถามที่พบบ่อย | Thailand Kitchens", "คำตอบเรื่องการออกแบบ ราคา ระยะเวลา วัสดุ และการติดตั้งครัวสั่งทำในประเทศไทย"],
  },
  "/catalogue": {
    PL: ["Katalog kuchni | Thailand Kitchens", "Przeglądaj katalog kuchni Thailand Kitchens: układy, style, fronty, blaty i wykończenia."],
    TH: ["แคตตาล็อกครัว | Thailand Kitchens", "ดูแคตตาล็อกครัวของ Thailand Kitchens ทั้งผังครัว สไตล์ หน้าบาน ท็อป และวัสดุ"],
  },
  "/privacy": {
    PL: ["Polityka prywatności | Thailand Kitchens", "Jak Thailand Kitchens zbiera, wykorzystuje i chroni Twoje dane osobowe."],
    TH: ["นโยบายความเป็นส่วนตัว | Thailand Kitchens", "วิธีที่ Thailand Kitchens เก็บ ใช้ และปกป้องข้อมูลส่วนบุคคลของคุณ"],
  },
  "/kitchens": {
    PL: ["Kuchnie na wymiar w Tajlandii | Układy i style", "Kuchnie na wymiar w Tajlandii według układu, stylu i rodzaju nieruchomości: z wyspą, w L, w U, jednorzędowe i w kształcie T."],
    TH: ["ครัวสั่งทำในประเทศไทย | ผังครัวและสไตล์", "ครัวสั่งทำในประเทศไทย เลือกตามผังครัว สไตล์ และประเภทบ้าน ทั้งไอส์แลนด์ ตัวแอล ตัวยู แนวเดียว และตัวที"],
  },
  "/kitchens/layouts": {
    PL: ["Układy kuchni | Thailand Kitchens", "Kuchnie z wyspą, w U, w L, dwurzędowe i jednorzędowe, zaprojektowane dla domów w Tajlandii."],
    TH: ["ผังครัว | Thailand Kitchens", "ครัวไอส์แลนด์ ตัวยู ตัวแอล สองแถว และแนวเดียว ออกแบบมาเพื่อบ้านในประเทศไทย"],
  },
  "/kitchens/styles": {
    PL: ["Style kuchni | Thailand Kitchens", "Nowoczesne, tropikalne, minimalistyczne i klasyczne style kuchni o ponadczasowym charakterze."],
    TH: ["สไตล์ครัว | Thailand Kitchens", "ครัวสไตล์โมเดิร์น ทรอปิคอล มินิมอล และดั้งเดิม ที่มีเอกลักษณ์ยาวนาน"],
  },
  "/kitchens/by-property": {
    PL: ["Kuchnie według nieruchomości | Thailand Kitchens", "Kuchnie do willi, condo, hoteli i inwestycji deweloperskich w całej Tajlandii."],
    TH: ["ครัวตามประเภทที่อยู่อาศัย | Thailand Kitchens", "ครัวสำหรับวิลล่า คอนโด โรงแรม และโครงการของผู้พัฒนาทั่วประเทศไทย"],
  },
  "/built-in-furniture": {
    PL: ["Meble na wymiar w Tajlandii | Szafy i zabudowy", "Meble na wymiar w Tajlandii: szafy do sufitu i zabudowy dopasowane do Twojego domu."],
    TH: ["เฟอร์นิเจอร์บิลท์อินในประเทศไทย | ตู้เสื้อผ้าและที่จัดเก็บ", "เฟอร์นิเจอร์บิลท์อินในประเทศไทย ตู้เสื้อผ้าสูงจรดเพดานและที่จัดเก็บที่ออกแบบให้พอดีกับบ้านของคุณ"],
  },
  "/services": {
    PL: ["Usługi kuchenne w Tajlandii | Projekt, remont i montaż", "Projekt kuchni, remont, montaż i szafy na wymiar w całej Tajlandii – kompleksowo od Thailand Kitchens."],
    TH: ["บริการครัวในประเทศไทย | ออกแบบ ปรับปรุง และติดตั้ง", "ออกแบบครัว ปรับปรุงครัว ติดตั้ง และตู้เสื้อผ้าบิลท์อินทั่วประเทศไทย ครบวงจรโดย Thailand Kitchens"],
  },
  "/materials": {
    PL: ["Materiały kuchenne w Tajlandii | Tek, kamień, lakier i mosiądz", "Materiały do kuchni w Tajlandii: drewno tekowe, marmur i kwarc, matowy lakier i mosiężne okucia, wybrane z myślą o tropikalnym klimacie."],
    TH: ["วัสดุครัวในประเทศไทย | ไม้สัก หิน แล็กเกอร์ และทองเหลือง", "วัสดุครัวในประเทศไทย ทั้งไม้สัก หินอ่อนและควอตซ์ แล็กเกอร์ผิวด้าน และอุปกรณ์ทองเหลือง คัดมาให้ทนทานในบ้านเขตร้อน"],
  },
  "/locations": {
    PL: ["Kuchnie w całej Tajlandii | Bangkok, Phuket, Samui i więcej", "Thailand Kitchens projektuje, dostarcza i montuje kuchnie na wymiar w Bangkoku, na Phuket, Koh Samui, w Pattayi i Chiang Mai."],
    TH: ["ครัวทั่วประเทศไทย | กรุงเทพฯ ภูเก็ต สมุย และอื่น ๆ", "Thailand Kitchens ให้บริการออกแบบ จัดหา และติดตั้งครัวสั่งทำในกรุงเทพฯ ภูเก็ต เกาะสมุย พัทยา และเชียงใหม่"],
  },
  "/built-in-furniture/walk-in-closets": {
    PL: ["Garderoby w Tajlandii | Zabudowane garderoby", "Garderoby w Tajlandii: układ dopasowany do Twoich rzeczy, wentylacja na wilgoć, światło o wiernych barwach i trwałe okucia."],
    TH: ["ห้องแต่งตัวในประเทศไทย | วอล์กอินโคลเซ็ตบิลท์อิน", "ห้องแต่งตัวในประเทศไทย จัดวางตามของที่คุณมี ระบายอากาศกันความชื้น แสงที่ให้สีจริง และอุปกรณ์ที่ทนทาน"],
  },
  "/built-in-furniture/entertainment-units": {
    PL: ["Zabudowy RTV w Tajlandii | Ściany multimedialne", "Zabudowane ściany TV i multimedialne w Tajlandii: ukryte kable, wentylowane schowki na sprzęt i wykończenia pasujące do reszty domu."],
    TH: ["ผนังทีวีบิลท์อินในประเทศไทย | ผนังมัลติมีเดีย", "ผนังทีวีและมัลติมีเดียบิลท์อินในประเทศไทย ซ่อนสายไฟ มีช่องเก็บอุปกรณ์ที่ระบายอากาศ และวัสดุที่เข้ากับทั้งบ้าน"],
  },
  "/built-in-furniture/wardrobes": {
    PL: ["Szafy na wymiar w Tajlandii | Zabudowa do sufitu", "Szafy wnękowe do sufitu w Tajlandii: przemyślane przechowywanie, wysokiej jakości wykończenia i idealne dopasowanie do każdego pokoju."],
    TH: ["ตู้เสื้อผ้าบิลท์อินในประเทศไทย | สูงจรดเพดาน", "ตู้เสื้อผ้าบิลท์อินสูงจรดเพดานในประเทศไทย ที่จัดเก็บที่ออกแบบเฉพาะ วัสดุคุณภาพ และพอดีกับทุกห้อง"],
  },
  "/materials/brass-hardware": {
    PL: ["Mosiężne okucia kuchenne w Tajlandii | Uchwyty", "Rzemieślnicze mosiężne uchwyty, gałki i zawiasy do kuchni w Tajlandii – eleganckie okucia, które nadają szafkom ciepły charakter."],
    TH: ["อุปกรณ์ทองเหลืองสำหรับครัวในประเทศไทย | มือจับ", "มือจับ ปุ่มจับ และบานพับทองเหลืองงานฝีมือสำหรับครัวในประเทศไทย เพิ่มความอบอุ่นและความประณีตให้ตู้ครัว"],
  },
  "/materials/matte-lacquer": {
    PL: ["Matowe lakierowane fronty kuchenne w Tajlandii", "Matowe lakierowane szafki kuchenne w Tajlandii, odporne na odciski palców: gładkie, nowoczesne wykończenie, które długo pięknie wygląda w tropikach."],
    TH: ["ตู้ครัวแล็กเกอร์ผิวด้านในประเทศไทย | ผิวพรีเมียม", "ตู้ครัวแล็กเกอร์ผิวด้านในประเทศไทย ไม่ทิ้งรอยนิ้วมือ ผิวเรียบสมัยใหม่ที่สวยทนในสภาพอากาศเขตร้อน"],
  },
  "/materials/marble-quartz": {
    PL: ["Blaty z marmuru i kwarcu w Tajlandii | Kamień do kuchni", "Blaty kuchenne z marmuru i kwarcu w Tajlandii: trwałe, eleganckie powierzchnie kamienne wykonane i zamontowane w Twojej nowej kuchni."],
    TH: ["ท็อปหินอ่อนและควอตซ์ในประเทศไทย | หินสำหรับครัว", "ท็อปครัวหินอ่อนและควอตซ์ในประเทศไทย พื้นผิวหินที่ทนทานและสวยงาม ผลิตและติดตั้งให้ครัวใหม่ของคุณ"],
  },
  "/materials/teak-wood": {
    PL: ["Kuchnie z drewna tekowego w Tajlandii | Szafki z teku", "Szafki kuchenne z drewna tekowego w Tajlandii: trwałe, ciepłe fronty z litego drewna stworzone do tropikalnych domów. Umów bezpłatną konsultację."],
    TH: ["ครัวไม้สักในประเทศไทย | ตู้ครัวไม้สักพรีเมียม", "ตู้ครัวไม้สักพรีเมียมในประเทศไทย หน้าบานไม้จริงที่อบอุ่นและทนทาน ออกแบบสำหรับบ้านเขตร้อน นัดปรึกษาฟรี"],
  },
  "/services/kitchen-renovation": {
    PL: ["Remont kuchni w Tajlandii | Projekt, dostawa i montaż", "Kompleksowy remont kuchni w Tajlandii: projekt, dostawa i montaż – od demontażu po ostatnie wykończenia."],
    TH: ["ปรับปรุงครัวในประเทศไทย | ออกแบบ จัดหา และติดตั้ง", "ปรับปรุงครัวครบวงจรในประเทศไทย ทั้งออกแบบ จัดหา และติดตั้ง ตั้งแต่รื้อถอนจนถึงงานเก็บรายละเอียด"],
  },
  "/services/kitchen-installation": {
    PL: ["Montaż kuchni w Tajlandii | Profesjonalny montaż", "Profesjonalny montaż szafek kuchennych w Tajlandii: precyzyjne dopasowanie, staranne wykończenie i porządne przekazanie kuchni."],
    TH: ["ติดตั้งครัวในประเทศไทย | ทีมติดตั้งมืออาชีพ", "ติดตั้งตู้ครัวโดยมืออาชีพในประเทศไทย ติดตั้งแม่นยำ เก็บงานเรียบร้อย และส่งมอบอย่างเป็นระเบียบ"],
  },
  "/services/kitchen-design": {
    PL: ["Projekt kuchni w Tajlandii | Projekt na wymiar i 3D", "Kompleksowy projekt kuchni w Tajlandii: konsultacja, wizualizacje 3D i układy dopasowane do mieszkań, condo i willi. Umów bezpłatną konsultację."],
    TH: ["ออกแบบครัวในประเทศไทย | ออกแบบเฉพาะและภาพ 3D", "ออกแบบครัวครบวงจรในประเทศไทย ปรึกษา วางแผนด้วยภาพ 3D และผังครัวเฉพาะสำหรับอพาร์ตเมนต์ คอนโด และวิลล่า นัดปรึกษาฟรี"],
  },
  "/locations/koh-samui": {
    PL: ["Kuchnie na Koh Samui | Projekt i montaż na wymiar", "Kuchnie na wymiar na Koh Samui: projekt, dostawa i montaż w willach i domach na wyspie."],
    TH: ["ครัวบนเกาะสมุย | ออกแบบและติดตั้งครัวสั่งทำ", "ครัวสั่งทำบนเกาะสมุย ออกแบบ จัดหา และติดตั้งสำหรับวิลล่าและบ้านบนเกาะ"],
  },
  "/locations/chiang-mai": {
    PL: ["Kuchnie w Chiang Mai | Kuchnie na wymiar", "Kuchnie na wymiar w Chiang Mai: indywidualny projekt, solidne szafki i profesjonalny montaż w domach północnej Tajlandii."],
    TH: ["ครัวในเชียงใหม่ | ครัวสั่งทำ", "ครัวสั่งทำในเชียงใหม่ ออกแบบเฉพาะ ตู้ครัวคุณภาพ และติดตั้งโดยมืออาชีพสำหรับบ้านในภาคเหนือ"],
  },
  "/locations/phuket": {
    PL: ["Kuchnie na Phuket | Projekt i montaż kuchni", "Projekt i montaż kuchni na Phuket: szafki i wykończenia na wymiar, stworzone do życia na tropikalnej wyspie."],
    TH: ["ครัวในภูเก็ต | ออกแบบและติดตั้งครัว", "ออกแบบและติดตั้งครัวในภูเก็ต ตู้และวัสดุสั่งทำที่เหมาะกับชีวิตบนเกาะเขตร้อน"],
  },
  "/locations/bangkok": {
    PL: ["Kuchnie w Bangkoku | Kuchnie i zabudowy na wymiar", "Kuchnie i meble na wymiar w całym Bangkoku: projekt, dostawa i montaż w condo, szeregowcach i willach."],
    TH: ["ครัวในกรุงเทพฯ | ครัวและบิลท์อินสั่งทำ", "ครัวและเฟอร์นิเจอร์บิลท์อินสั่งทำทั่วกรุงเทพฯ ออกแบบ จัดหา และติดตั้งสำหรับคอนโด ทาวน์เฮาส์ และวิลล่า"],
  },
  "/locations/pattaya": {
    PL: ["Kuchnie w Pattayi | Projekt i montaż kuchni", "Kuchnie na wymiar w Pattayi: projekt, dostawa i montaż w condo, domach i willach nad morzem."],
    TH: ["ครัวในพัทยา | ออกแบบและติดตั้งครัว", "ครัวสั่งทำในพัทยา ออกแบบ จัดหา และติดตั้งสำหรับคอนโด บ้าน และวิลล่าริมทะเล"],
  },
  "/kitchens/by-property/townhouse": {
    PL: ["Kuchnie do szeregowców w Tajlandii | Oszczędne układy", "Kuchnie do szeregowców w Tajlandii: przemyślane układy i przechowywanie dla wąskich działek i domów wielopiętrowych."],
    TH: ["ครัวทาวน์เฮาส์ในประเทศไทย | ผังครัวประหยัดพื้นที่", "ครัวทาวน์เฮาส์ในประเทศไทย ผังและที่จัดเก็บที่คิดมาอย่างดีสำหรับที่ดินแคบและบ้านหลายชั้น"],
  },
  "/kitchens/by-property/villa": {
    PL: ["Kuchnie do willi w Tajlandii | Projekty na wymiar", "Kuchnie do willi w Tajlandii: przestronne projekty z wyspą i otwarte, stworzone dla domów wolnostojących i tropikalnego życia."],
    TH: ["ครัววิลล่าในประเทศไทย | ออกแบบครัววิลล่าเฉพาะ", "ครัววิลล่าในประเทศไทย ครัวไอส์แลนด์และครัวเปิดโล่งที่กว้างขวาง ออกแบบสำหรับบ้านเดี่ยวและชีวิตเขตร้อน"],
  },
  "/kitchens/by-property/condo": {
    PL: ["Kuchnie do condo w Tajlandii | Projekt kuchni do mieszkań", "Kuchnie do condo w Tajlandii: funkcjonalne układy i trwałe wykończenia zaprojektowane do życia w wieżowcach."],
    TH: ["ครัวคอนโดในประเทศไทย | ออกแบบครัวสำหรับคอนโด", "ครัวสำหรับคอนโดในประเทศไทย ผังครัวที่ใช้พื้นที่คุ้มค่าและวัสดุทนทาน ออกแบบสำหรับชีวิตบนตึกสูง"],
  },
  "/kitchens/styles/traditional-thai": {
    PL: ["Tradycyjne kuchnie tajskie | Projekty inspirowane tekiem", "Tradycyjne tajskie kuchnie: szafki z drewna tekowego i ciepłe, ręcznie wykończone detale inspirowane tajskim rzemiosłem."],
    TH: ["ครัวไทยดั้งเดิม | ครัวแรงบันดาลใจจากไม้สัก", "ครัวสไตล์ไทยดั้งเดิม ตู้ไม้สักและรายละเอียดงานมือที่อบอุ่น ได้แรงบันดาลใจจากงานช่างไทย"],
  },
  "/kitchens/styles/minimalist": {
    PL: ["Kuchnie minimalistyczne w Tajlandii | Fronty bez uchwytów", "Minimalistyczne kuchnie w Tajlandii: szafki bez uchwytów, ukryte przechowywanie i spokojne, uporządkowane wnętrza."],
    TH: ["ครัวมินิมอลในประเทศไทย | ครัวไร้มือจับ", "ครัวมินิมอลในประเทศไทย ตู้ไร้มือจับ ที่เก็บของแบบซ่อน และดีไซน์ที่สงบเรียบร้อยสำหรับชีวิตสมัยใหม่"],
  },
  "/kitchens/styles/contemporary": {
    PL: ["Kuchnie współczesne w Tajlandii | Ciepłe projekty", "Współczesne kuchnie w Tajlandii łączące ciepłe drewno, kamień i staranne wykończenia w stylowych domach i willach."],
    TH: ["ครัวร่วมสมัยในประเทศไทย | ครัวโทนอบอุ่น", "ครัวร่วมสมัยในประเทศไทย ผสานไม้โทนอุ่น หิน และงานตกแต่งที่ประณีต สำหรับบ้านและวิลล่าที่มีสไตล์"],
  },
  "/kitchens/styles/modern": {
    PL: ["Nowoczesne kuchnie w Tajlandii | Projekty kuchni", "Nowoczesne kuchnie w Tajlandii: modułowe projekty o czystych liniach z przemyślanym przechowywaniem, dopasowane do domu lub willi."],
    TH: ["ครัวโมเดิร์นในประเทศไทย | ดีไซน์ครัวสมัยใหม่", "ครัวโมเดิร์นในประเทศไทย ครัวโมดูลาร์เส้นสายเรียบพร้อมที่จัดเก็บอัจฉริยะ ออกแบบให้เข้ากับบ้านหรือวิลล่าของคุณ"],
  },
  "/kitchens/layouts/islands": {
    PL: ["Kuchnie z wyspą w Tajlandii | Nowoczesne projekty", "Kuchnie z wyspą w Tajlandii: nowoczesne projekty, pomysły i układy do otwartych domów i willi. Umów bezpłatną konsultację."],
    TH: ["ครัวไอส์แลนด์ในประเทศไทย | ดีไซน์ครัวไอส์แลนด์", "ครัวไอส์แลนด์ในประเทศไทย ไอเดียและผังครัวไอส์แลนด์สมัยใหม่สำหรับบ้านแบบเปิดโล่งและวิลล่า ปรึกษาฟรี"],
  },
  "/kitchens/layouts/straight": {
    PL: ["Kuchnie jednorzędowe w Tajlandii | Projekty", "Kuchnie jednorzędowe w Tajlandii: projekty i układy oszczędzające miejsce do mieszkań, condo i kompaktowych domów."],
    TH: ["ครัวแนวเดียวในประเทศไทย | ดีไซน์ครัวแนวตรง", "ครัวแนวเดียวในประเทศไทย ดีไซน์และผังครัวประหยัดพื้นที่สำหรับอพาร์ตเมนต์ คอนโด และบ้านขนาดกะทัดรัด"],
  },
  "/kitchens/layouts/t-shape": {
    PL: ["Kuchnie w kształcie T w Tajlandii | Projekty", "Kuchnie w kształcie T w Tajlandii: układy z półwyspem i miejscami do siedzenia, łączące gotowanie, jadalnię i przechowywanie."],
    TH: ["ครัวตัวทีในประเทศไทย | ดีไซน์ครัวตัวที", "ครัวตัวทีในประเทศไทย ผังครัวพร้อมเพนนินซูล่าและที่นั่ง รวมการทำอาหาร การรับประทาน และที่จัดเก็บไว้ในพื้นที่เดียว"],
  },
  "/kitchens/layouts/l-shape": {
    PL: ["Kuchnie w kształcie L w Tajlandii | Projekty", "Kuchnie w kształcie L w Tajlandii: przemyślane projekty i układy, które najlepiej wykorzystują narożniki w domach i willach."],
    TH: ["ครัวตัวแอลในประเทศไทย | ดีไซน์ครัวตัวแอล", "ครัวตัวแอลในประเทศไทย ดีไซน์และผังครัวที่ใช้มุมห้องได้คุ้มค่าที่สุดสำหรับบ้านและวิลล่า"],
  },
  "/kitchens/layouts/u-shape": {
    PL: ["Kuchnie w kształcie U w Tajlandii | Projekty", "Kuchnie w kształcie U w Tajlandii: funkcjonalne projekty i układy z dużą ilością miejsca na przechowywanie i wygodnym trójkątem roboczym."],
    TH: ["ครัวตัวยูในประเทศไทย | ดีไซน์ครัวตัวยู", "ครัวตัวยูในประเทศไทย ดีไซน์และผังครัวที่ใช้งานได้ดี มีที่จัดเก็บมากมายและสามเหลี่ยมการทำงานที่สะดวก"],
  },
  "/terms": {
    PL: ["Regulamin | Thailand Kitchens", "Warunki korzystania ze strony i usług Thailand Kitchens."],
    TH: ["ข้อกำหนดและเงื่อนไข | Thailand Kitchens", "ข้อกำหนดการใช้เว็บไซต์และบริการของ Thailand Kitchens"],
  },
};

/** Shorten text to a search-snippet length, ending on a sentence or word boundary. */
export function clipDescription(text: string, max = 158): string {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const stop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("。"));
  if (stop > 80) return cut.slice(0, stop + 1);
  const space = cut.lastIndexOf(" ");
  return `${cut.slice(0, space > 60 ? space : max)}…`;
}

/** Polish/Thai title and description for a path, when we have them. */
export function translatedSeo(path: string, locale: "PL" | "TH" | null) {
  const t = locale ? STATIC_SEO[path]?.[locale] : undefined;
  return t ? { title: t[0], description: t[1] } : undefined;
}

/** The page's title/description in the URL's language (/pl, /th), or the English ones. */
export async function localizedStatic(path: string, title: string, description: string) {
  const locale = await getUrlLocale();
  const t = locale ? STATIC_SEO[path]?.[locale] : undefined;
  return t ? { title: t[0], description: t[1] } : { title, description };
}
