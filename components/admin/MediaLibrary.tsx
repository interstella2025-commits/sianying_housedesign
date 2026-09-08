"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { MediaItem } from "@/lib/cms/media";
import { getYouTubePosterUrl, parseYouTubeId } from "@/lib/video-embed";

type EditDraft = {
  id: string;
  name: string;
  url: string;
};

function youtubePoster(item: MediaItem) {
  const id = parseYouTubeId(item.url);
  if (!id) {
    return item.poster ?? "/sites/senjin-design-com-dd40b413/root-8a5edab2/brand/logo.png";
  }
  return getYouTubePosterUrl(id, item.url.includes("/shorts/") ? "portrait" : "landscape");
}

function youtubePlacement(index: number, url: string) {
  if (index === 0) return "影音集主視覺";
  if (url.includes("/shorts/")) return "Shorts 區";
  return "案例片";
}

export function MediaLibrary() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [youtubeItems, setYoutubeItems] = useState<MediaItem[]>([]);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [youtubeName, setYoutubeName] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<EditDraft | null>(null);

  async function loadItems() {
    const response = await fetch("/api/upload");
    const payload = (await response.json()) as { items?: MediaItem[] };
    const nextItems = payload.items ?? [];
    setItems(nextItems);
    setYoutubeItems(nextItems.filter((item) => item.type === "youtube"));
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial admin data fetch
    void loadItems();
  }, []);

  useEffect(() => {
    if (editingItem === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setEditingItem(null);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [editingItem]);

  async function handleAddYouTube(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!parseYouTubeId(youtubeUrl)) {
      setStatus("請貼上有效的 YouTube 連結");
      return;
    }

    setStatus("加入中…");
    const response = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: "youtube",
        url: youtubeUrl.trim(),
        name: youtubeName.trim() || undefined,
      }),
    });
    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      setStatus(payload.error ?? "加入失敗");
      return;
    }

    setYoutubeUrl("");
    setYoutubeName("");
    setStatus("已加入 YouTube");
    await loadItems();
  }

  async function saveYouTubeOrder(next: MediaItem[]) {
    setStatus("儲存排序中…");
    const response = await fetch("/api/upload", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ youtubeOrder: next.map((item) => item.id) }),
    });
    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      setStatus(payload.error ?? "排序儲存失敗");
      await loadItems();
      return;
    }
    setYoutubeItems(next);
    setStatus("排序已更新");
    await loadItems();
  }

  function reorderYouTube(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex) return;
    const next = [...youtubeItems];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    void saveYouTubeOrder(next);
  }

  function openEditor(item: MediaItem) {
    setEditingItem({
      id: item.id,
      name: item.name,
      url: item.url,
    });
    setStatus(null);
  }

  async function saveEditor(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingItem) return;

    setStatus("儲存中…");
    const response = await fetch("/api/upload", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingItem),
    });
    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      setStatus(payload.error ?? "儲存失敗");
      return;
    }

    setEditingItem(null);
    setStatus("已儲存");
    await loadItems();
  }

  async function removeItem(item: MediaItem) {
    if (item.source === "site") {
      setStatus("內建影片無法移除");
      return;
    }

    if (!window.confirm(`確定移除「${item.name}」？`)) return;
    const response = await fetch(`/api/upload?id=${encodeURIComponent(item.id)}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      setStatus("移除失敗");
      return;
    }
    setStatus("已移除");
    await loadItems();
  }

  const videoItems = items.filter((item) => item.type === "video");

  const editorModal =
    editingItem !== null ? (
      <div
        className="admin-modal-overlay"
        onClick={(event) => {
          if (event.target === event.currentTarget) setEditingItem(null);
        }}
      >
        <div className="admin-modal admin-modal-compact" role="dialog" aria-modal="true">
          <div className="admin-editor-panel-head">
            <h2>編輯 YouTube</h2>
            <button className="admin-button secondary" type="button" onClick={() => setEditingItem(null)}>
              關閉
            </button>
          </div>

          <form className="admin-form admin-form-wide" onSubmit={(event) => void saveEditor(event)}>
            <label>
              名稱
              <input
                value={editingItem.name}
                onChange={(event) =>
                  setEditingItem({ ...editingItem, name: event.target.value })
                }
                required
              />
            </label>
            <label>
              連結
              <input
                value={editingItem.url}
                onChange={(event) =>
                  setEditingItem({ ...editingItem, url: event.target.value })
                }
                required
              />
            </label>
            <div className="admin-toolbar">
              <button className="admin-button" type="submit">
                儲存
              </button>
              <button
                className="admin-button secondary"
                type="button"
                onClick={() => setEditingItem(null)}
              >
                取消
              </button>
            </div>
          </form>
        </div>
      </div>
    ) : null;

  return (
    <div className="admin-media-library">
      {typeof document !== "undefined" && editorModal
        ? createPortal(editorModal, document.body)
        : null}

      {status ? <p className="admin-media-status">{status}</p> : null}
      {loading ? <p className="admin-media-status">載入中…</p> : null}

      <section className="admin-media-section">
        <div className="admin-media-section-head">
          <h2>YouTube</h2>
          <span>{youtubeItems.length} 支</span>
        </div>
        <p className="admin-media-hint">第 1 支 → 影音集大圖；中間 → 案例片；Shorts → 下方短影片區</p>

        <form className="admin-media-add-form" onSubmit={handleAddYouTube}>
          <label>
            <span>連結</span>
            <input
              value={youtubeUrl}
              onChange={(event) => setYoutubeUrl(event.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              required
            />
          </label>
          <label>
            <span>名稱</span>
            <input
              value={youtubeName}
              onChange={(event) => setYoutubeName(event.target.value)}
              placeholder="選填"
            />
          </label>
          <button className="admin-button" type="submit">
            加入
          </button>
        </form>

        {!loading && youtubeItems.length === 0 ? (
          <p className="admin-media-empty">目前沒有 YouTube 影片。</p>
        ) : (
          <ul className="admin-media-list">
            {youtubeItems.map((item, index) => (
              <li
                className={[
                  "admin-media-row",
                  dragIndex === index ? "is-dragging" : "",
                  dragIndex !== null && dragIndex !== index ? "is-drop-target" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                key={item.id}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => {
                  if (dragIndex !== null) reorderYouTube(dragIndex, index);
                  setDragIndex(null);
                }}
              >
                <span
                  className="admin-table-drag-handle"
                  role="button"
                  tabIndex={0}
                  aria-label={`拖曳 ${item.name} 調整順序`}
                  draggable
                  onDragStart={() => setDragIndex(index)}
                  onDragEnd={() => setDragIndex(null)}
                >
                  ⠿
                </span>
                <div className="admin-media-row-preview admin-media-row-preview-square">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={youtubePoster(item)} alt="" />
                </div>
                <div className="admin-media-row-copy">
                  <strong>{item.name}</strong>
                  <span className="admin-media-row-tag">{youtubePlacement(index, item.url)}</span>
                  <span>{item.url}</span>
                </div>
                <div className="admin-media-row-actions">
                  <button
                    className="admin-button secondary"
                    type="button"
                    onClick={() => openEditor(item)}
                  >
                    編輯
                  </button>
                  {item.source !== "site" ? (
                    <button
                      className="admin-button secondary"
                      type="button"
                      onClick={() => void removeItem(item)}
                    >
                      移除
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="admin-media-section">
        <div className="admin-media-section-head">
          <h2>影片檔</h2>
          <span>{videoItems.length} 支</span>
        </div>

        {!loading && videoItems.length === 0 ? (
          <p className="admin-media-empty">目前沒有本機影片檔。</p>
        ) : (
          <ul className="admin-media-list">
            {videoItems.map((item) => (
              <li className="admin-media-row admin-media-row-video" key={item.id}>
                <div className="admin-media-row-preview admin-media-row-preview-square admin-media-row-preview-video">
                  <video src={item.url} muted preload="metadata" />
                </div>
                <div className="admin-media-row-copy">
                  <strong>{item.name}</strong>
                  <span>{item.url}</span>
                </div>
                <div className="admin-media-row-actions">
                  {item.source !== "site" ? (
                    <button
                      className="admin-button secondary"
                      type="button"
                      onClick={() => void removeItem(item)}
                    >
                      移除
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
