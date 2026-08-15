import assert from "node:assert/strict";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${pathname}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

function assertHeadingsHaveNoTerminalPunctuation(html, pathname) {
  const headings = [...html.matchAll(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi)];
  for (const heading of headings) {
    const plainText = heading[1].replace(/<[^>]+>/g, "").trim();
    assert.doesNotMatch(plainText, /[。？！!?：；:]$/, `${pathname}: ${plainText}`);
  }
}

test("server-renders the finished home page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>翔胤室內設計/);
  assert.match(html, /把繁複思維/);
  assert.match(html, /精選完工作品/);
  assert.match(html, /光域未來/);
  assert.match(html, /project-archive-grid/);
  assert.match(html, /線上預約丈量/);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|Your site is taking shape/);
  assertHeadingsHaveNoTerminalPunctuation(html, "/");
  assert.doesNotMatch(html, /下一個空間，從一次對話開始。/);
});

const preservedRoutes = [
  "/works",
  "/press",
  "/22283385552951838917.html",
  "/234602083935373353363328735037204622591036027653723272432996234602083935373.html",
  "/38364260442510520497.html",
  "/3857731169274022591931574.html",
];

test("preserves every public legacy route", async () => {
  for (const pathname of preservedRoutes) {
    const response = await render(pathname);
    assert.equal(response.status, 200, pathname);
    const html = await response.text();
    assert.match(html, /翔胤室內設計/, pathname);
    assertHeadingsHaveNoTerminalPunctuation(html, pathname);
    assert.doesNotMatch(html, /下一個空間，從一次對話開始。/, pathname);
  }
});
