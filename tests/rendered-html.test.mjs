import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render(pathname = "/") {
  const outputName = pathname === "/" ? "index.html" : `${pathname.slice(1)}.html`;
  const outputUrl = new URL(`../.next/server/app/${outputName}`, import.meta.url);

  try {
    const html = await readFile(outputUrl, "utf8");
    return new Response(html, {
      status: 200,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return new Response("Not found", { status: 404 });
    }
    throw error;
  }
}

function assertHeadingsHaveNoTerminalPunctuation(html, pathname) {
  const headings = [...html.matchAll(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi)];
  for (const heading of headings) {
    const plainText = heading[1].replace(/<[^>]+>/g, "").trim();
    assert.doesNotMatch(plainText, /[。？！!?：；:]$/, `${pathname}: ${plainText}`);
  }
}

test("statically renders the finished home page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>翔胤室內設計/);
  assert.match(html, /讓空間與生活/);
  assert.match(html, /精選完工作品/);
  assert.match(html, /光域未來/);
  assert.match(html, /project-archive-grid/);
  assert.match(html, /線上預約丈量/);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|Your site is taking shape/);
  assertHeadingsHaveNoTerminalPunctuation(html, "/");
  assert.doesNotMatch(html, /下一個空間，從一次對話開始。/);
});

const publicRoutes = [
  "/new",
  "/works",
  "/press",
  "/awards",
  "/services",
  "/about",
  "/privacy",
];

test("preserves every public route", async () => {
  for (const pathname of publicRoutes) {
    const response = await render(pathname);
    assert.equal(response.status, 200, pathname);
    const html = await response.text();
    assert.match(html, /翔胤室內設計/, pathname);
    assertHeadingsHaveNoTerminalPunctuation(html, pathname);
    assert.doesNotMatch(html, /下一個空間，從一次對話開始。/, pathname);
  }
});

test("renders the complete redesigned portfolio at /new", async () => {
  const response = await render("/new");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /<title>新版空間作品集/);
  assert.match(html, /翔胤室內設計｜讓室內空間與生活密不可分/);
  assert.match(html, /News/);
  assert.match(html, /New Projects/);
  assert.match(html, /CONNECTION/);

  const projectTitles = [
    "光域未來",
    "御光境",
    "鉑金石韻",
    "心如境",
    "金鈺閤",
    "拾光",
    "佐岸伴月",
    "濢山雅舍",
    "湖畔衫色",
    "貳次空間",
    "棲於石境",
    "疊層光序",
  ];

  for (const title of projectTitles) {
    assert.match(html, new RegExp(title), title);
  }

  assert.equal((html.match(/PROJECT <!-- -->\d{2}/g) ?? []).length, 12);
  assert.equal((html.match(/data-panorama="true"/g) ?? []).length, 9);
  assert.doesNotMatch(html, /href=["']#["']/);
  assertHeadingsHaveNoTerminalPunctuation(html, "/new");
});

const newArchitectureRoutes = [
  ["/new/about", "Design Team"],
  ["/new/blog", "消息文章"],
  ["/new/contact", "Connection"],
  ["/new/projects/new", "最新設計"],
  ["/new/projects/all", "全部作品"],
  ["/new/projects/residential", "住宅空間"],
  ["/new/projects/commercial", "商業與特殊空間"],
  ["/new/projects/panorama", "3D 全景作品"],
];

test("renders every page in the redesigned site architecture", async () => {
  for (const [pathname, marker] of newArchitectureRoutes) {
    const response = await render(pathname);
    assert.equal(response.status, 200, pathname);

    const html = await response.text();
    assert.match(html, new RegExp(marker), pathname);
    assert.match(html, /site-menu-project-list/, pathname);
    assert.equal((html.match(/<h1\b/g) ?? []).length, 1, pathname);
    assertHeadingsHaveNoTerminalPunctuation(html, pathname);
  }
});

const newProjectSlugs = [
  "light-future",
  "realm-of-light",
  "platinum-stone",
  "serenity-within",
  "golden-residence",
  "gathered-light",
  "moonlit-bank",
  "mountain-retreat",
  "lakeside-hues",
  "second-order-space",
  "stone-habitat",
  "layered-light",
];

test("statically renders every redesigned project detail page", async () => {
  for (const slug of newProjectSlugs) {
    const pathname = `/new/projects/${slug}`;
    const response = await render(pathname);
    assert.equal(response.status, 200, pathname);

    const html = await response.text();
    assert.match(html, /INFORMATION/, pathname);
    assert.match(html, /Back To Index/, pathname);
    assert.match(html, /project-gallery-images/, pathname);
    assert.match(html, /project-detail-pagination/, pathname);
    assert.equal((html.match(/<h1\b/g) ?? []).length, 1, pathname);
    assertHeadingsHaveNoTerminalPunctuation(html, pathname);
  }
});
