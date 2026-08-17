export const routes = {
  home: "/",
  works: "/works",
  press: "/press",
  awards: "/awards",
  services: "/services",
  about: "/about",
  privacy: "/privacy",
} as const;

export const navItems = [
  { label: "完工作品集", href: routes.works, external: false },
  { label: "設計及收費", href: routes.services, external: false },
  { label: "關於我們", href: routes.about, external: false },
  { label: "國際獎項", href: routes.awards, external: false },
  { label: "媒體採訪", href: routes.press, external: false },
] as const;

export type Project = {
  number: string;
  title: string;
  english?: string;
  paragraphs: string[];
  landscape: string;
  portrait: string;
};

export const projects: Project[] = [
  {
    number: "01",
    title: "光域未來",
    english: "Luminous Future",
    paragraphs: [
      "本案以「光」作為空間的主要建構語言，透過線性燈帶、弧形天花與半穿透材質，重新定義居住空間的界線與層次。光不僅承擔照明功能，更成為引導動線、劃分場域與塑造情緒的核心元素。",
      "設計融合現代極簡語彙與科技感表現，藉由秩序化的構成手法，使空間在理性結構中保有溫度，呈現兼具未來感與日常舒適的當代居住樣貌。",
    ],
    landscape: "/projects/project-01-1.png",
    portrait: "/projects/project-01-2.png",
  },
  {
    number: "02",
    title: "御光境",
    english: "Realm of Light",
    paragraphs: [
      "本案以間接照明與自然採光區分空間層次，搭配木質與灰階材料，讓客廳、餐廳與走道維持連續而清楚的動線。",
      "燈光同時負責照明與區域界定，減少不必要的隔間與裝飾，使住宅保有開放感與日常使用的舒適度。",
    ],
    landscape: "/projects/project-02-1.png",
    portrait: "/projects/project-02-2.png",
  },
  {
    number: "03",
    title: "鉑金石韻",
    english: "Platinum and Stone Sentiment",
    paragraphs: [
      "本案為單層住宅規劃，實際面積約 120 平方米。規劃第一步係根據屋主需求，從調整室內格局與動線開始著手，包括將廚房加大，並結合中島、餐桌與餐區軸線，以利愛烘焙、善繪畫的女主人日常起居操作。",
      "四房之一的書房移除臨走道隔間牆，順勢截短廊道、打開視覺面寬，賦予空間更合理的運用與開放感。",
    ],
    landscape: "/projects/project-03-1.png",
    portrait: "/projects/project-03-2.png",
  },
  {
    number: "04",
    title: "心如境",
    english: "Serenity Within",
    paragraphs: [
      "本案以簡潔、安靜且易於使用為主要方向，利用開放格局與低彩度配色，降低視覺干擾並保留充足收納。",
      "自然採光、柔和色調與簡化的材質種類，讓公共空間明亮，私人空間則維持放鬆與安定的使用感受。",
    ],
    landscape: "/projects/project-04-1.jpg",
    portrait: "/projects/project-04-2.jpg",
  },
  {
    number: "05",
    title: "金鈺閤",
    english: "A Home for Connection",
    paragraphs: [
      "本案重新調整原有格局，將廚房設為公共空間核心，並以木作整合收納、設備與視覺線條。",
      "餐區串連客廳與廚房動線，各區保有明確用途，同時維持家人互動與空間通透感。",
    ],
    landscape: "/projects/project-05-1.png",
    portrait: "/projects/project-05-2.png",
  },
  {
    number: "06",
    title: "拾光",
    english: "Gathering Light",
    paragraphs: [
      "入口以金屬屏風界定玄關與公共區域，接待區主牆結合作品展示與照明，形成清楚的進門視線。",
      "私人空間使用白梣木與金屬細節，控制材質數量並整合收納，使整體風格一致且方便維護。",
    ],
    landscape: "/projects/project-06-1.png",
    portrait: "/projects/project-06-2.png",
  },
  {
    number: "07",
    title: "佐岸伴月",
    english: "Moon by the Left Bank",
    paragraphs: [
      "本案以灰階、金屬線條與低彩度材料建立一致的空間基調，並依照屋主需求調整格局與收納配置。",
      "幾何灰階色域與貴金屬線條雕刻住宅空間，粉彩白、紫藕灰塗料和黑曜岩板交錯搭配，讓家俐落又不失溫暖。大面積景觀窗與實木地板露臺，將左岸河景納入日常。",
    ],
    landscape: "/projects/project-07-1.png",
    portrait: "/projects/project-07-2.png",
  },
  {
    number: "08",
    title: "濢山雅舍",
    english: "Mountain Residence",
    paragraphs: [
      "本案依照各區的使用頻率安排動線、量體與收納，並利用間接照明與自然光改善採光和空間感。",
      "公共區域與臥室採取不同的動線與收納配置，在機能、視覺整潔與空間延伸之間取得平衡。",
    ],
    landscape: "/projects/project-08-1.png",
    portrait: "/projects/project-08-2.png",
  },
  {
    number: "09",
    title: "湖畔衫色",
    english: "Lakeside Hues",
    paragraphs: [
      "本案以暖白氛圍的中間調為主，佐以大面積普魯士藍主牆，襯托女主人心中不合流俗的美形居所。",
      "木作線條簡潔，以白色基底搭配北歐風家具與家飾，讓空間明亮、舒適且容易維持整潔。",
    ],
    landscape: "/projects/project-09-1.png",
    portrait: "/projects/project-09-2.png",
  },
  {
    number: "10",
    title: "貳次空間",
    english: "Second Order of Space",
    paragraphs: [
      "本案將原有五口家庭的高密度配置，轉化為單一使用者的複層生活場景，透過「垂直解構」與「水平留白」的對比操作，建立具有呼吸感的二次空間。",
      "一樓公共域以開放式配置整合客廳與餐廚機能，低彩度白搭配黑色結構線條，使空間在極簡之中仍保有清晰的結構語彙。夾層以懸浮盒體概念處理，透過玻璃展示櫃與封閉收納牆體的虛實對比，弱化樓板壓迫並延伸垂直視野。",
    ],
    landscape: "/projects/project-10-1.png",
    portrait: "/projects/project-10-2.png",
  },
  {
    number: "11",
    title: "棲於石境",
    english: "Dwelling in Stone",
    paragraphs: [
      "本案依既有建築條件與周邊環境調整開口、材質與動線，讓空間尺度符合日常使用，並兼顧採光、收納與維護需求。",
    ],
    landscape: "/projects/project-11-1.png",
    portrait: "/projects/project-11-2.png",
  },
  {
    number: "12",
    title: "疊層光序",
    english: "Layered Light",
    paragraphs: [
      "隱居在台北市的老舊巷弄裡，一間輪廓鮮明的房子與周圍環境形成對比。簡約深色輪廓與清水模複合材質彰顯其中不凡。",
      "在傳統房屋進行危老整建的再造與設計後，它在現代都市中重新被看見，讓新秩序與舊街廓並存。",
    ],
    landscape: "/projects/project-12-1.png",
    portrait: "/projects/project-12-2.png",
  },
];

export const serviceGroups = [
  {
    english: "Drafting",
    title: "圖面繪製",
    items: [
      { label: "舊屋翻新", english: "Old House Renovation" },
      { label: "新成屋", english: "New House" },
      { label: "商業空間", english: "Commercial Space" },
      { label: "店面規劃", english: "Storefront Planning" },
      { label: "預售屋客變", english: "Pre-sale Customization" },
    ],
  },
  {
    english: "Construction",
    title: "工程施工",
    items: [
      { label: "木作與系統櫃", english: "Woodwork & Cabinetry" },
      { label: "水電與空調", english: "MEP & HVAC" },
      { label: "油漆與泥作", english: "Painting & Masonry" },
      { label: "燈飾與窗飾", english: "Lighting & Treatments" },
      { label: "鋁窗與木地板", english: "Windows & Flooring" },
      { label: "拆除與清潔", english: "Demolition & Cleaning" },
      { label: "石材、玻璃與鐵件", english: "Stone, Glass & Metal" },
      { label: "居家軟裝規劃", english: "Soft Furnishing" },
      { label: "包租代管", english: "Lease Management" },
    ],
  },
] as const;

export const processItems = [
  {
    number: "01",
    title: "來電或線上諮詢",
    text: "服務專線 02 2288 8123，LINE ID 0926 160 880。",
  },
  {
    number: "02",
    title: "現場丈量",
    text: "現場實際丈量、拍攝工地照片與施工動線會勘，同步討論需求及預算分析。",
  },
  {
    number: "03",
    title: "圖面討論",
    text: "繪製平面設計圖，針對格局動線規劃及空間配置進行討論。",
  },
  {
    number: "04",
    title: "報價",
    text: "依確認內容提供報價明細；簽約前圖面不提供攜回。",
  },
  {
    number: "05",
    title: "簽訂設計合約",
    text: "繪製立面、水電、燈具與空調等完整施工圖面，討論材質並修改至定案。",
  },
  {
    number: "06",
    title: "簽訂工程合約",
    text: "簽約款 10%、開工款 20%、期中款 30%、期末款 30%、驗收款 10%。",
  },
  {
    number: "07",
    title: "進場施工",
    text: "圖面與材質確認後依序施作，控管工程品質並掌握進度。",
  },
  {
    number: "08",
    title: "完工驗收及交屋",
    text: "工程竣工後，偕同業主於現場完成驗收。",
  },
  {
    number: "09",
    title: "維修與保固",
    text: "自交屋日起提供一年工程品質保固。",
  },
] as const;

export const siteMusic = {
  src: "/audio/disco-of-the-70s.mp3",
  credit: "Disco Of The 70's - Frank Schröter",
  defaultVolume: 0.45,
} as const;

export const contact = {
  phone: "02-2288-8123",
  line: "0926-160-880",
  email: "c.lon@yahoo.com.tw",
  companyId: "42720348",
  headquarters: "新北市蘆洲區中山一路 114-1 號 10 樓",
  designCenter: "新北市五股區西雲路 189 號 1 樓",
  facebook: "https://www.facebook.com/Wanna.Ju.design/",
  instagram: "https://www.instagram.com/su_zung/",
  youtube: "https://www.youtube.com/@Wanna_Ju",
  featuredVideoId: "EXDQRrQ3f0M",
  featuredVideoPoster: "/images/projects/serenity-within/sjd-0060_orig.jpg",
  lineUrl: "https://line.me/ti/p/mhHUoVQz_Z",
} as const;
