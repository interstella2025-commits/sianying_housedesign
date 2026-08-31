export const assetRoot =
  "/sites/senjin-design-com-dd40b413/root-8a5edab2";

export const navigation = [
  { label: "首頁", english: "TOP", href: "#top" },
  { label: "關於翔胤", english: "ABOUT", href: "#about" },
  { label: "精選作品", english: "WORKS", href: "#works" },
  { label: "得獎紀錄", english: "AWARDS", href: "#awards" },
  { label: "聯絡我們", english: "CONTACT", href: "#contact" },
] as const;

export const company = {
  name: "翔胤室內設計",
  englishName: "SIANG YIN INTERIOR DESIGN",
  founded: "2010",
  founder: "Chou Su Zung",
  experience: "20+",
  philosophy: "讓室內空間與生活密不可分",
  about:
    "翔胤室內設計成立於 2010 年，由擁有二十年以上實務經驗的設計團隊，從格局、動線、材質與工程細節出發，讓美感回到每一天的生活。",
  phone: "02-2288-8123",
  line: "0926-160-880",
  email: "c.lon@yahoo.com.tw",
  companyId: "42720348",
  headquarters: "新北市蘆洲區中山一路 114-1 號 10 樓",
  designCenter: "新北市五股區西雲路 189 號 1 樓",
  map: "https://maps.app.goo.gl/JzYePnLogpdygDYk7",
  facebook: "https://www.facebook.com/Wanna.Ju.design/",
  instagram: "https://www.instagram.com/su_zung/",
  youtube: "https://www.youtube.com/@Wanna_Ju",
  lineUrl: "https://line.me/ti/p/mhHUoVQz_Z",
} as const;

export const editorialStories = [
  {
    title: "2022 A’ Design Award 國際設計大獎",
    english: "INTERNATIONAL AWARD",
    image: `${assetRoot}/editorial/award-certificate.png`,
    href: "https://competition.adesignaward.com/design.php?ID=136768",
    alt: "翔胤室內設計 A' Design Award 得獎證書",
  },
  {
    title: "100室內設計｜設計師專訪",
    english: "MEDIA FEATURE",
    image: `${assetRoot}/editorial/award-trophy.png`,
    href: "https://www.100.com.tw/5193",
    alt: "翔胤室內設計 A' Design Award 獎座",
  },
] as const;

export const serviceGroups = [
  {
    title: "設計規劃",
    items: ["舊屋翻新", "新成屋", "商業空間", "店面規劃", "預售屋客變"],
  },
  {
    title: "工程施工",
    items: ["木作與系統櫃", "水電與空調", "油漆與泥作", "石材、玻璃與鐵件", "軟裝規劃"],
  },
] as const;

export type Project = {
  number: string;
  title: string;
  english: string;
  description: string;
  image: string;
};

export const projects: Project[] = [
  { number: "01", title: "光域未來", english: "Luminous Future", description: "以光作為空間的建構語言，透過線性燈帶、弧形天花與半穿透材質，重新定義居住空間的界線與層次。", image: `${assetRoot}/projects/project-01.webp` },
  { number: "02", title: "御光境", english: "Realm of Light", description: "以間接照明與自然採光區分空間層次，搭配木質與灰階材料，讓客餐廳與走道維持連續而清楚的動線。", image: `${assetRoot}/projects/project-02.webp` },
  { number: "03", title: "鉑金石韻", english: "Platinum and Stone Sentiment", description: "依屋主需求重新調整格局與動線，放大餐廚核心並打開視覺面寬，創造更合理而開放的生活場景。", image: `${assetRoot}/projects/project-03.webp` },
  { number: "04", title: "心如境", english: "Serenity Within", description: "以簡潔、安靜且易於使用為方向，利用開放格局與低彩度配色，降低視覺干擾並保留充足收納。", image: `${assetRoot}/projects/project-04.webp` },
  { number: "05", title: "金鈺閤", english: "A Home for Connection", description: "重新調整格局，將廚房設為公共空間核心，並以木作整合收納、設備與視覺線條。", image: `${assetRoot}/projects/project-05.webp` },
  { number: "06", title: "拾光", english: "Gathering Light", description: "入口以金屬屏風界定玄關與公共區域，主牆結合作品展示與照明，形成清楚的進門視線。", image: `${assetRoot}/projects/project-06.webp` },
  { number: "07", title: "佐岸伴月", english: "Moon by the Left Bank", description: "灰階、金屬線條與低彩度材料建立一致基調，大面景觀窗將左岸河景納入日常。", image: `${assetRoot}/projects/project-07.webp` },
  { number: "08", title: "濢山雅舍", english: "Mountain Residence", description: "依各區使用頻率安排動線、量體與收納，並利用間接照明與自然光改善採光和空間感。", image: `${assetRoot}/projects/project-08.webp` },
  { number: "09", title: "湖畔衫色", english: "Lakeside Hues", description: "暖白中間調佐以大面積普魯士藍主牆，木作線條簡潔，讓空間明亮舒適而不流俗。", image: `${assetRoot}/projects/project-09.webp` },
  { number: "10", title: "貳次空間", english: "Second Order of Space", description: "以垂直解構與水平留白的對比操作，將高密度住宅轉化為具有呼吸感的複層生活場景。", image: `${assetRoot}/projects/project-10.webp` },
  { number: "11", title: "棲於石境", english: "Dwelling in Stone", description: "依既有建築條件調整開口、材質與動線，讓空間尺度符合日常，同時兼顧採光、收納與維護。", image: `${assetRoot}/projects/project-11.webp` },
  { number: "12", title: "疊層光序", english: "Layered Light", description: "老屋危老整建後以深色輪廓與清水模複合材質重新被看見，讓新秩序與舊街廓並存。", image: `${assetRoot}/projects/project-12.webp` },
];
