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
