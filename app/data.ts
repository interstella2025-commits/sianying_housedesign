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
      "本案以線性燈帶、弧形天花與半透明材質區分不同使用區域。燈光除了提供照明，也具有引導動線與劃分區域的功能。整體採用俐落線條與簡潔材質，呈現明亮、現代的住宅風格。",
    ],
    landscape: "/projects/project-01-1.png",
    portrait: "/projects/project-01-2.png",
  },
  {
    number: "02",
    title: "御光境",
    english: "Realm of Light",
    paragraphs: [
      "本案以木質、灰階色調及間接照明為主。燈光用來區分不同區域，並維持開放空間的通透感。整體氛圍柔和、安定，適合日常居住。",
    ],
    landscape: "/projects/project-02-1.png",
    portrait: "/projects/project-02-2.png",
  },
  {
    number: "03",
    title: "鉑金石韻",
    english: "Platinum and Stone Sentiment",
    paragraphs: [
      "本案為約 120 平方公尺的單層住宅。依屋主需求放大廚房，並將中島、餐桌與餐區安排在同一條動線上，方便烘焙與日常使用。書房臨走道的隔間拆除後，廊道縮短，公共區域也更加開放。",
    ],
    landscape: "/projects/project-03-1.png",
    portrait: "/projects/project-03-2.png",
  },
  {
    number: "04",
    title: "心如境",
    english: "Serenity Within",
    paragraphs: [
      "本案以自然採光與柔和色調為主，減少不必要的裝飾，讓材質與線條保持一致，營造舒適、安定的居住環境。",
    ],
    landscape: "/projects/project-04-1.jpg",
    portrait: "/projects/project-04-2.jpg",
  },
  {
    number: "05",
    title: "金鈺閤",
    english: "A Home for Connection",
    paragraphs: [
      "本案重新調整原有格局，並以廚房作為公共區域的核心。廚房、餐區與客廳形成連續的公共空間，方便家人共處與互動。木作透過線條與面材的變化增加層次，各區保有獨立功能，也維持整體通透感。",
    ],
    landscape: "/projects/project-05-1.png",
    portrait: "/projects/project-05-2.png",
  },
  {
    number: "06",
    title: "拾光",
    english: "Gathering Light",
    paragraphs: [
      "接待區以鉑金色屏風、藝術畫作與燈光作為視覺重點；閱讀區則使用白梣木與金屬材質，維持安靜、明亮的環境。不同材質用來區分各區功能，整體風格保持一致。",
    ],
    landscape: "/projects/project-06-1.png",
    portrait: "/projects/project-06-2.png",
  },
  {
    number: "07",
    title: "佐岸伴月",
    english: "Moon by the Left Bank",
    paragraphs: [
      "本案使用灰階、金屬線條、粉彩白、紫藕灰與黑曜岩板，呈現俐落但不冷硬的住宅風格。客廳設有大面景觀窗，並連接實木地板露台，從室內即可看見河景。各區維持開放感，也有明確的功能劃分。",
    ],
    landscape: "/projects/project-07-1.png",
    portrait: "/projects/project-07-2.png",
  },
  {
    number: "08",
    title: "濢山雅舍",
    english: "Mountain Residence",
    paragraphs: [
      "本案依各區的使用方式重新配置動線，並搭配間接照明與自然採光。公共區域與臥室各有完整機能，再以一致的材質與色調維持整體感。",
    ],
    landscape: "/projects/project-08-1.png",
    portrait: "/projects/project-08-2.png",
  },
  {
    number: "09",
    title: "湖畔衫色",
    english: "Lakeside Hues",
    paragraphs: [
      "本案以暖白色為基調，搭配普魯士藍主牆、簡潔木作與北歐家具。整體色彩鮮明但不繁複，室內明亮且舒適。",
    ],
    landscape: "/projects/project-09-1.png",
    portrait: "/projects/project-09-2.png",
  },
  {
    number: "10",
    title: "貳次空間",
    english: "Second Order of Space",
    paragraphs: [
      "本案將原本供五口之家使用的複層住宅，改造為適合單人居住的空間。一樓整合客廳與餐廚區，使用白色基底與黑色結構線條。夾層使用玻璃展示櫃與收納牆，從一樓仍可看見夾層，減少樓板帶來的壓迫感。",
    ],
    landscape: "/projects/project-10-1.png",
    portrait: "/projects/project-10-2.png",
  },
  {
    number: "11",
    title: "棲於石境",
    english: "Dwelling in Stone",
    paragraphs: [
      "本案依建築原有條件重新配置格局與動線，並使用不同材質區分各區功能，讓空間更符合實際居住需求。",
    ],
    landscape: "/projects/project-11-1.png",
    portrait: "/projects/project-11-2.png",
  },
  {
    number: "12",
    title: "疊層光序",
    english: "Layered Light",
    paragraphs: [
      "這是一棟位於台北老巷的危老重建住宅。外觀採用深色線條與清水模質感材料，室內則依現代住宅需求重新規劃。",
    ],
    landscape: "/projects/project-12-1.png",
    portrait: "/projects/project-12-2.png",
  },
];

export const serviceGroups = [
  {
    title: "圖面與規劃",
    items: ["舊屋翻新", "新成屋", "商業空間", "店面規劃", "預售屋客變"],
  },
  {
    title: "工程施工",
    items: [
      "木作與系統櫃",
      "水電與空調",
      "油漆與泥作",
      "燈具與窗飾",
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
    title: "電話或線上諮詢",
    text: "請透過電話或 LINE 與我們聯絡，簡單說明物件位置、屋況與裝修需求。",
  },
  {
    number: "02",
    title: "現場丈量",
    text: "現場丈量並拍攝空間現況，確認施工動線，同時討論需求與預算。",
  },
  {
    number: "03",
    title: "平面配置討論",
    text: "依丈量結果繪製平面配置圖，討論格局、動線與空間安排。",
  },
  {
    number: "04",
    title: "工程報價",
    text: "依確認後的設計內容提供工程報價。簽約前，圖面不提供攜回。",
  },
  {
    number: "05",
    title: "簽訂設計合約",
    text: "簽約後繪製立面、水電、燈具與空調等施工圖，並依討論結果確認材質與細節。",
  },
  {
    number: "06",
    title: "簽訂工程合約",
    text: "工程款分五期支付：簽約款 10%、開工款 20%、期中款 30%、期末款 30%、驗收款 10%。",
  },
  {
    number: "07",
    title: "進場施工",
    text: "圖面與材質確認後進場施工，並依工程進度安排各工種、檢查施工品質。",
  },
  {
    number: "08",
    title: "驗收與交屋",
    text: "工程完成後，與屋主在現場逐項驗收並辦理交屋。",
  },
  {
    number: "09",
    title: "保固",
    text: "自交屋日起提供一年工程保固。",
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
  lineUrl: "http://line.me/ti/p/mhHUoVQz_Z",
} as const;
