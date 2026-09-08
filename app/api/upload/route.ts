import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminAuthenticated } from "@/lib/admin-auth.server";
import { addMedia, detectMediaType } from "@/lib/cms/media";
import { storeUploadedFile } from "@/lib/cms/upload";
import { getYouTubePosterUrl, parseYouTubeId, toVideoEmbedUrl } from "@/lib/video-embed";

type YouTubePayload = {
  kind: "youtube";
  url: string;
  name?: string;
};

export const runtime = "nodejs";
export const maxDuration = 60;

function revalidateYouTubePages() {
  revalidatePath("/stories");
  revalidatePath("/");
}

export async function POST(request: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "未授權" }, { status: 401 });
    }

    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      const payload = (await request.json()) as YouTubePayload;
      if (payload.kind !== "youtube") {
        return NextResponse.json({ error: "不支援的請求格式" }, { status: 400 });
      }

      const watchUrl = payload.url.trim();
      const videoId = parseYouTubeId(watchUrl);
      const embedUrl = toVideoEmbedUrl(watchUrl);

      if (!videoId || !embedUrl) {
        return NextResponse.json({ error: "請貼上有效的 YouTube 連結" }, { status: 400 });
      }

      const item = {
        id: crypto.randomUUID(),
        url: watchUrl.includes("youtube.com") || watchUrl.includes("youtu.be")
          ? watchUrl
          : embedUrl,
        name: payload.name?.trim() || `YouTube / ${videoId}`,
        type: "youtube" as const,
        size: 0,
        createdAt: new Date().toISOString(),
        poster: getYouTubePosterUrl(
          videoId,
          watchUrl.includes("/shorts/") ? "portrait" : "landscape",
        ),
        source: "youtube" as const,
      };

      const items = await addMedia(item);
      revalidateYouTubePages();
      return NextResponse.json({ ok: true, item, items });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const catalog = new URL(request.url).searchParams.get("catalog") !== "0";

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "請選擇檔案" }, { status: 400 });
    }

    if (file.size > 4.5 * 1024 * 1024) {
      return NextResponse.json({ error: "單檔請小於 4.5MB" }, { status: 413 });
    }

    const stored = await storeUploadedFile(file);
    const item = {
      id: crypto.randomUUID(),
      url: stored.url,
      name: file.name,
      type: detectMediaType(file.type || "application/octet-stream"),
      size: file.size,
      createdAt: new Date().toISOString(),
      source: "upload" as const,
    };

    const items = catalog ? await addMedia(item) : undefined;

    return NextResponse.json({
      ok: true,
      item,
      items,
      storage: stored.storage,
    });
  } catch (error) {
    console.error("[upload]", error);
    const message = error instanceof Error ? error.message : "上傳失敗，請稍後再試";
    const friendly = /ENOENT|read-only file system/i.test(message)
      ? "正式環境無法寫入本機資料夾，請改用 Blob 或 Supabase Storage。"
      : message;
    return NextResponse.json({ error: friendly }, { status: 500 });
  }
}

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "未授權" }, { status: 401 });
  }

  const { listMedia } = await import("@/lib/cms/media");
  const items = await listMedia();
  return NextResponse.json({ items });
}

export async function DELETE(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "未授權" }, { status: 401 });
  }

  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "缺少 id" }, { status: 400 });
  }

  const { removeMedia } = await import("@/lib/cms/media");
  const items = await removeMedia(id);
  return NextResponse.json({ ok: true, items });
}

type UpdateMediaPayload = {
  id: string;
  name: string;
  url: string;
};

type ReorderYouTubePayload = {
  youtubeOrder: string[];
};

export async function PATCH(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "未授權" }, { status: 401 });
  }

  const payload = (await request.json()) as UpdateMediaPayload;
  if (!payload.id || !payload.name?.trim() || !payload.url?.trim()) {
    return NextResponse.json({ error: "缺少必要欄位" }, { status: 400 });
  }

  const watchUrl = payload.url.trim();
  const videoId = parseYouTubeId(watchUrl);
  if (!videoId) {
    return NextResponse.json({ error: "請貼上有效的 YouTube 連結" }, { status: 400 });
  }

  const { listMedia, upsertMedia } = await import("@/lib/cms/media");
  const existing = (await listMedia()).find((item) => item.id === payload.id);
  if (!existing || existing.type !== "youtube") {
    return NextResponse.json({ error: "找不到影片" }, { status: 404 });
  }

  const item = {
    ...existing,
    url: watchUrl.includes("youtube.com") || watchUrl.includes("youtu.be")
      ? watchUrl
      : (toVideoEmbedUrl(watchUrl) ?? watchUrl),
    name: payload.name.trim(),
    poster: getYouTubePosterUrl(videoId, watchUrl.includes("/shorts/") ? "portrait" : "landscape"),
    source: "youtube" as const,
    createdAt: existing.createdAt || new Date().toISOString(),
  };

  const items = await upsertMedia(item);
  revalidateYouTubePages();
  return NextResponse.json({ ok: true, item, items });
}

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "未授權" }, { status: 401 });
  }

  const payload = (await request.json()) as ReorderYouTubePayload;
  if (!Array.isArray(payload.youtubeOrder)) {
    return NextResponse.json({ error: "缺少 youtubeOrder" }, { status: 400 });
  }

  const { saveYouTubeOrder, listMedia } = await import("@/lib/cms/media");
  await saveYouTubeOrder(payload.youtubeOrder);
  const items = await listMedia();
  revalidateYouTubePages();
  return NextResponse.json({ ok: true, items });
}
