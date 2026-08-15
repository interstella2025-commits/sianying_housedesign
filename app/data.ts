export const routes = {
  home: "/",
  works: "/works",
  press: "/press",
  awards: "/22283385552951838917.html",
  services:
    "/234602083935373353363328735037204622591036027653723272432996234602083935373.html",
  about: "/38364260442510520497.html",
  privacy: "/3857731169274022591931574.html",
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
      "「光」不是照明，是界線未曾言說的語氣。在靜默之中，光緩緩落下，像晨曦穿越林間，不喧嘩，卻自成秩序。木質承載時間，灰階收納塵囂。留白不是空，而是讓心有歸處的距離。",
      "我們以光為筆，在空間中畫下一道無形結界。不是阻隔，而是守護；不是裝飾，而是靜定。《御光境》是一處被光溫柔包覆的場域，讓日常生活在無聲之中回到本質。",
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
      "「心如境」取意自東方禪學思想，主張空間即是心靈的映照。設計以「靜、簡、明、澄」為精神主軸，融合現代極簡美學與東方哲思，營造一個能讓居者身心安然、靜觀內在的生活居所。",
      "空間不僅承載功能，更成為一種生活修行。透過自然光影的流動、柔和色調的層疊與材質的留白，讓居住者在繁雜生活中找到一處屬於自己的靜謐之境。",
    ],
    landscape: "/projects/project-04-1.jpg",
    portrait: "/projects/project-04-2.jpg",
  },
  {
    number: "05",
    title: "金鈺閤",
    english: "A Home for Connection",
    paragraphs: [
      "木作刻劃出不同的點、線、面，組構豐富視感，讓空間不落俗套。為串連家庭成員之間的情感連繫，我們打破原有房屋格局，將廚房作為整個居室空間的核心。",
      "餐區連通整個公領域動線，使各區獨立卻保有整體通透感。空間不僅是棲身之所，更是裝載家族溫情的容器，讓家的故事在其中持續發生。",
    ],
    landscape: "/projects/project-05-1.png",
    portrait: "/projects/project-05-2.png",
  },
  {
    number: "06",
    title: "拾光",
    english: "Gathering Light",
    paragraphs: [
      "隨著鉑金色的華麗屏風走入空間，像聽到一陣悅耳動人的音樂。順著裊裊餘音前行，接待區主牆上的畫作與絢麗光影，展現一個藝術的當代世界。",
      "轉入私領域，彷彿進入知識的殿堂。白梣與貴金屬營造優雅、現代的氛圍，隔絕界外紛擾，讓住宅與家庭成員彼此依存。",
    ],
    landscape: "/projects/project-06-1.png",
    portrait: "/projects/project-06-2.png",
  },
  {
    number: "07",
    title: "佐岸伴月",
    english: "Moon by the Left Bank",
    paragraphs: [
      "翔胤設計師將近年接案的設計風格、各項元素與選材創新融入本案，使作品突破過往框架，持續追求更卓越的設計思維。",
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
      "本案將各場域的生活動線融入建築空間的設計與執行策略，產生多樣量體與形構，使居住空間真正屬於使用者。反間照與自然光，成為實現空間氛圍的重要線索。",
      "團隊反覆研究「多」與「必要」之間的界限，使公領域與私人臥室各自形成內外循環，達成視覺涵養、動線功能和空間延伸的平衡。",
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
      "木作線條簡約流暢，以白色基底搭配北歐風家具及家飾，讓人在空間中感到舒適、恬靜自在，得到身心靈的釋放。",
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
      "本案設計導向基於建構物本體的性質，與四周環境相互呼應。藉由差異性媒材技術和設計操作，創造兼具人文尺度與合理動線的建築空間，回應人們對想像環境及現實生活的需求。",
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
    title: "圖面繪製",
    items: ["舊屋翻新", "新成屋", "商業空間", "店面規劃", "預售屋客變"],
  },
  {
    title: "工程施工",
    items: [
      "木作與系統櫃",
      "水電與空調",
      "油漆與泥作",
      "燈飾與窗飾",
      "鋁窗與木地板",
      "拆除與清潔",
      "石材、玻璃與鐵件",
      "居家軟裝規劃",
      "包租代管",
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
    text: "提供清楚明瞭的報價。簽約前無法提供圖面攜回。",
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
  lineUrl: "http://line.me/ti/p/mhHUoVQz_Z",
} as const;
