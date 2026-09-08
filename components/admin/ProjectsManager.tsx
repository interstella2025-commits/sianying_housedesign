"use client";

import { useEffect, useState } from "react";
import { ProjectGalleryEditor } from "@/components/admin/ProjectGalleryEditor";
import { uploadAdminFiles } from "@/lib/client/upload-admin-files";
import {
  PROJECT_CATEGORIES,
  type Project,
} from "@/lib/project-types";

const emptyProject = (): Project => ({
  slug: `project-${Date.now()}`,
  number: "01",
  title: "",
  english: "",
  paragraphs: ["", ""],
  landscape: "",
  portrait: "",
  cover: "",
  gallery: [],
  panorama: "",
  category: "residential",
  published: true,
});

export function ProjectsManager() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [draft, setDraft] = useState<Project>(emptyProject());
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  async function loadProjects() {
    const response = await fetch("/api/projects", { cache: "no-store" });
    const payload = (await response.json()) as { projects?: Project[]; error?: string };
    if (!response.ok) {
      setStatus(payload.error ?? "作品讀取失敗");
      return;
    }
    setProjects(payload.projects ?? []);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial admin data fetch
    void loadProjects();
  }, []);

  function openEditor(project?: Project) {
    const next = project ? structuredClone(project) : emptyProject();
    if (next.paragraphs.length < 2) next.paragraphs = [...next.paragraphs, ""];
    setDraft(next);
    setEditingSlug(project?.slug ?? "");
    setStatus(null);
    setUploadStatus(null);
  }

  function closeEditor() {
    setEditingSlug(null);
    setDraft(emptyProject());
    setUploadStatus(null);
  }

  async function saveProject() {
    setStatus("儲存中…");
    const cover = draft.cover || draft.gallery[0] || "";
    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...draft,
        cover,
        landscape: draft.landscape || cover,
        portrait: draft.portrait || cover,
      }),
    });
    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      setStatus(payload.error ?? "儲存失敗");
      return;
    }
    closeEditor();
    setStatus("作品已儲存");
    await loadProjects();
  }

  async function removeProject(project: Project) {
    if (!window.confirm(`確定刪除「${project.title}」？此動作不會刪除媒體庫原始檔。`)) return;
    const response = await fetch(`/api/projects?slug=${encodeURIComponent(project.slug)}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      setStatus("刪除失敗");
      return;
    }
    setStatus("作品已刪除");
    await loadProjects();
  }

  async function saveOrder(next: Project[]) {
    setProjects(next);
    setStatus("儲存排序中…");
    const response = await fetch("/api/projects", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    });
    setStatus(response.ok ? "排序已儲存" : "排序儲存失敗");
    if (!response.ok) await loadProjects();
  }

  function moveProject(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= projects.length) return;
    const next = [...projects];
    [next[index], next[target]] = [next[target], next[index]];
    void saveOrder(next);
  }

  async function uploadGallery(files: FileList) {
    setUploadStatus(`上傳中 0/${files.length}…`);
    try {
      const uploaded = await uploadAdminFiles(files, {
        catalog: true,
        onProgress: (done, total) => setUploadStatus(`上傳中 ${done}/${total}…`),
      });
      setDraft((current) => ({
        ...current,
        cover: current.cover || uploaded[0] || "",
        gallery: [...current.gallery, ...uploaded],
      }));
      setUploadStatus(`已上傳 ${uploaded.length} 張`);
    } catch (error) {
      setUploadStatus(error instanceof Error ? error.message : "上傳失敗");
    }
  }

  async function uploadPanorama(files: FileList) {
    const file = files.item(0);
    if (!file) return;
    setUploadStatus("全景圖上傳中…");
    try {
      const [url] = await uploadAdminFiles([file], { catalog: true, panorama: true });
      if (url) setDraft((current) => ({ ...current, panorama: url }));
      setUploadStatus(url ? "3D 全景圖已上傳" : "未取得上傳網址");
    } catch (error) {
      setUploadStatus(error instanceof Error ? error.message : "全景圖上傳失敗");
    }
  }

  return (
    <div>
      <div className="admin-toolbar">
        <button className="admin-button" type="button" onClick={() => openEditor()}>
          新增作品
        </button>
        {status ? <p className="admin-note admin-inline-status">{status}</p> : null}
      </div>

      <p className="admin-media-hint">
        可調整前台排序、上下架、作品文字、封面、完整相簿與 3D 全景展開圖。
      </p>

      <ul className="admin-project-list">
        {projects.map((project, index) => (
          <li className="admin-project-row" key={project.slug}>
            <div className="admin-table-sort">
              <button className="admin-button secondary admin-sort-button" type="button" disabled={index === 0} onClick={() => moveProject(index, -1)}>↑</button>
              <button className="admin-button secondary admin-sort-button" type="button" disabled={index === projects.length - 1} onClick={() => moveProject(index, 1)}>↓</button>
            </div>
            <div className="admin-table-cover-button" aria-hidden="true">
              {project.cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="admin-table-thumb" src={project.cover} alt="" />
              ) : <span className="admin-table-cover-empty">無封面</span>}
            </div>
            <div className="admin-project-row-copy">
              <div className="admin-project-row-head">
                <strong>{project.title}</strong>
                {project.panorama ? <span className="admin-media-row-tag">360°</span> : null}
              </div>
              <span className="admin-project-row-meta-line">
                PROJECT {project.number} · {project.category === "commercial" ? "商業空間" : "住宅空間"} · /new/projects/{project.slug}
              </span>
            </div>
            <div className="admin-project-row-stats">
              <span>{project.gallery.length} 張</span>
              <span>{project.published ? "公開" : "下架"}</span>
            </div>
            <div className="admin-media-row-actions">
              <button className="admin-button secondary" type="button" onClick={() => openEditor(project)}>編輯</button>
              <button className="admin-button secondary" type="button" onClick={() => void removeProject(project)}>刪除</button>
            </div>
          </li>
        ))}
      </ul>

      {editingSlug !== null ? (
        <div className="admin-modal-overlay" onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeEditor();
        }}>
          <div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="project-editor-title">
            <div className="admin-editor-panel-head">
              <h2 id="project-editor-title">{editingSlug ? `編輯：${draft.title}` : "新增作品"}</h2>
              <button className="admin-button secondary" type="button" onClick={closeEditor}>關閉</button>
            </div>

            <form className="admin-form admin-form-wide" onSubmit={(event) => { event.preventDefault(); void saveProject(); }}>
              <div className="admin-form-grid">
                <label>作品網址代稱
                  <input value={draft.slug} readOnly={Boolean(editingSlug)} onChange={(event) => setDraft({ ...draft, slug: event.target.value })} required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" />
                </label>
                <label>作品編號
                  <input value={draft.number} onChange={(event) => setDraft({ ...draft, number: event.target.value })} required />
                </label>
                <label>中文案名
                  <input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} required />
                </label>
                <label>英文案名
                  <input value={draft.english} onChange={(event) => setDraft({ ...draft, english: event.target.value })} />
                </label>
                <label>作品分類
                  <select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value as Project["category"] })}>
                    {PROJECT_CATEGORIES.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}
                  </select>
                </label>
                <label className="admin-checkbox">
                  <input type="checkbox" checked={draft.published} onChange={(event) => setDraft({ ...draft, published: event.target.checked })} />公開顯示
                </label>
              </div>

              <label>作品說明第一段
                <textarea rows={4} value={draft.paragraphs[0] ?? ""} onChange={(event) => setDraft({ ...draft, paragraphs: [event.target.value, draft.paragraphs[1] ?? ""] })} />
              </label>
              <label>作品說明第二段
                <textarea rows={4} value={draft.paragraphs[1] ?? ""} onChange={(event) => setDraft({ ...draft, paragraphs: [draft.paragraphs[0] ?? "", event.target.value] })} />
              </label>

              <section className="admin-section admin-panorama-editor">
                <div className="admin-editor-panel-head">
                  <div>
                    <h3>3D 全景展開圖</h3>
                    <p className="admin-note">請上傳 2:1 等距柱狀投影圖；前台會自動顯示可拖曳的 360° 檢視器。</p>
                  </div>
                  <label className="admin-button secondary admin-file-button">上傳全景圖
                    <input hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => {
                      const files = event.currentTarget.files;
                      if (files?.length) void uploadPanorama(files);
                      event.currentTarget.value = "";
                    }} />
                  </label>
                </div>
                {draft.panorama ? (
                  <div className="admin-panorama-preview">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={draft.panorama} alt="目前的 3D 全景展開圖" />
                    <button className="admin-button secondary" type="button" onClick={() => setDraft({ ...draft, panorama: "" })}>移除全景圖</button>
                  </div>
                ) : <p className="admin-note">尚未設定全景圖</p>}
              </section>

              <ProjectGalleryEditor
                images={draft.gallery}
                cover={draft.cover}
                onChange={(gallery) => setDraft({ ...draft, gallery })}
                onCoverChange={(cover) => setDraft({ ...draft, cover })}
                onUpload={uploadGallery}
                status={uploadStatus}
              />

              <div className="admin-toolbar admin-toolbar-sticky-actions">
                <button className="admin-button" type="submit">儲存作品</button>
                <button className="admin-button secondary" type="button" onClick={closeEditor}>取消</button>
                {status ? <p className="admin-note admin-inline-status">{status}</p> : null}
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
