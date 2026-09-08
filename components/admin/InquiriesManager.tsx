"use client";

import { useEffect, useState } from "react";

type Inquiry = {
  id: string;
  created_at: string;
  form_type: "consultation" | "reservation";
  name: string;
  phone: string;
  email: string | null;
  house_age: string | null;
  location: string | null;
  budget: string | null;
  project_type: string | null;
  message: string | null;
  line_id: string | null;
  source_path: string;
  status: "new" | "contacted" | "closed";
};

const statusLabels = { new: "新詢問", contacted: "已聯絡", closed: "已結案" } as const;

export function InquiriesManager() {
  const [items, setItems] = useState<Inquiry[]>([]);
  const [status, setStatus] = useState("讀取中…");

  async function load() {
    const response = await fetch("/api/admin/inquiries", { cache: "no-store" });
    const payload = (await response.json()) as { inquiries?: Inquiry[]; error?: string };
    setItems(payload.inquiries ?? []);
    setStatus(response.ok ? "" : payload.error ?? "讀取失敗");
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial admin data fetch
    void load();
  }, []);

  async function update(id: string, nextStatus: Inquiry["status"]) {
    setItems((current) => current.map((item) => item.id === id ? { ...item, status: nextStatus } : item));
    const response = await fetch("/api/admin/inquiries", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: nextStatus }),
    });
    if (!response.ok) {
      setStatus("狀態更新失敗");
      await load();
    }
  }

  async function remove(item: Inquiry) {
    if (!window.confirm(`確定刪除 ${item.name} 的詢問紀錄？`)) return;
    const response = await fetch(`/api/admin/inquiries?id=${encodeURIComponent(item.id)}`, { method: "DELETE" });
    if (response.ok) setItems((current) => current.filter((entry) => entry.id !== item.id));
    else setStatus("刪除失敗");
  }

  return (
    <div>
      {status ? <p className="admin-note">{status}</p> : null}
      {!status && !items.length ? <p className="admin-note">目前沒有詢問紀錄。</p> : null}
      <div className="admin-inquiries-list">
        {items.map((item) => (
          <article className="admin-inquiry-card" key={item.id}>
            <header>
              <div>
                <strong>{item.name}</strong>
                <span>{new Date(item.created_at).toLocaleString("zh-TW")}</span>
              </div>
              <select value={item.status} onChange={(event) => void update(item.id, event.target.value as Inquiry["status"])}>
                {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </header>
            <dl>
              <div><dt>電話</dt><dd><a href={`tel:${item.phone}`}>{item.phone}</a></dd></div>
              <div><dt>Email</dt><dd>{item.email ? <a href={`mailto:${item.email}`}>{item.email}</a> : "—"}</dd></div>
              <div><dt>地區</dt><dd>{item.location || "—"}</dd></div>
              <div><dt>屋齡</dt><dd>{item.house_age || "—"}</dd></div>
              <div><dt>預算</dt><dd>{item.budget || "—"}</dd></div>
              <div><dt>類型</dt><dd>{item.project_type || item.form_type}</dd></div>
              <div className="is-wide"><dt>留言</dt><dd>{item.message || "—"}</dd></div>
            </dl>
            <button className="admin-button secondary" type="button" onClick={() => void remove(item)}>刪除</button>
          </article>
        ))}
      </div>
    </div>
  );
}
