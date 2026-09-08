"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BookkeepingExportBar } from "@/components/admin/bookkeeping/BookkeepingExportBar";
import {
  BookkeepingNav,
  BkProjectStatusSelect,
  bkFetch,
} from "@/components/admin/bookkeeping/BookkeepingNav";
import { exportProjectsCsv } from "@/lib/bookkeeping/csv-export";
import { formatCurrency } from "@/lib/bookkeeping/format";
import { BK_PROJECT_STATUSES } from "@/lib/bookkeeping/types";
import type { BkProjectListItem, BkProjectStatus } from "@/lib/bookkeeping/types";

type ProjectsResponse = { projects: BkProjectListItem[] };

export function BookkeepingProjectsManager() {
  const [projects, setProjects] = useState<BkProjectListItem[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<BkProjectStatus | "全部">("全部");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updatingProjectId, setUpdatingProjectId] = useState<string | null>(null);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (status !== "全部") params.set("status", status);
    const suffix = params.toString();
    return suffix ? `?${suffix}` : "";
  }, [q, status]);

  async function loadProjects() {
    setError(null);
    try {
      const payload = await bkFetch<ProjectsResponse>(`/api/bookkeeping/projects${query}`);
      setProjects(payload.projects);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "載入失敗");
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- admin list fetch
    void loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- query is the complete request dependency
  }, [query]);

  async function updateProjectStatus(projectId: string, nextStatus: BkProjectStatus) {
    let previousStatus: BkProjectStatus | undefined;
    setProjects((current) => {
      previousStatus = current.find((item) => item.id === projectId)?.status;
      return current.map((item) =>
        item.id === projectId ? { ...item, status: nextStatus } : item,
      );
    });

    setUpdatingProjectId(projectId);
    setError(null);
    setStatusMessage(null);
    try {
      await bkFetch(`/api/bookkeeping/projects/${projectId}`, {
        method: "PUT",
        body: JSON.stringify({ status: nextStatus }),
      });
      setStatusMessage(`已更新狀態為「${nextStatus}」`);
    } catch (updateError) {
      if (previousStatus) {
        setProjects((current) =>
          current.map((item) =>
            item.id === projectId ? { ...item, status: previousStatus! } : item,
          ),
        );
      }
      setError(updateError instanceof Error ? updateError.message : "更新狀態失敗");
    } finally {
      setUpdatingProjectId(null);
    }
  }

  async function deleteProject(project: BkProjectListItem) {
    const confirmed = window.confirm(
      `確定刪除案件「${project.name}」？\n\n此案件的收款、支出與付款紀錄都會一併刪除，且無法復原。`,
    );
    if (!confirmed) return;

    setDeletingProjectId(project.id);
    setError(null);
    setStatusMessage(null);
    try {
      await bkFetch(`/api/bookkeeping/projects/${project.id}`, { method: "DELETE" });
      setProjects((current) => current.filter((item) => item.id !== project.id));
      setStatusMessage(`已刪除案件「${project.name}」`);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "刪除案件失敗");
    } finally {
      setDeletingProjectId(null);
    }
  }

  async function seedDemo() {
    if (!window.confirm("載入驗收示範資料？若已有案件將略過。")) return;
    setError(null);
    try {
      const result = await bkFetch<{ seeded: boolean; projectId?: string }>("/api/bookkeeping/projects", {
        method: "POST",
        body: JSON.stringify({ action: "seed-demo" }),
      });
      setStatusMessage(result.seeded ? "已載入示範資料" : "已有案件，未載入示範資料");
      await loadProjects();
    } catch (seedError) {
      setError(seedError instanceof Error ? seedError.message : "載入示範資料失敗");
    }
  }

  return (
    <>
      <BookkeepingNav />

      <div className="admin-toolbar bk-toolbar bk-no-print">
        <input
          className="bk-search"
          type="search"
          placeholder="搜尋案名或客戶"
          value={q}
          onChange={(event) => setQ(event.target.value)}
        />
        <select value={status} onChange={(event) => setStatus(event.target.value as BkProjectStatus | "全部")}>
          <option value="全部">全部狀態</option>
          {BK_PROJECT_STATUSES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <Link className="admin-button" href="/admin/bookkeeping/projects/new">
          新增案件
        </Link>
        <button className="admin-button secondary" type="button" onClick={() => void seedDemo()}>
          載入示範資料
        </button>
        <BookkeepingExportBar
          onExportCsv={() => exportProjectsCsv(projects)}
          disabled={!projects.length}
        />
      </div>

      {statusMessage ? <p className="admin-inline-status">{statusMessage}</p> : null}
      {error ? <p className="admin-inline-status is-error">{error}</p> : null}

      <div className="admin-table-wrap bk-table-wrap bk-print-area">
        <table className="admin-table bk-table">
          <thead>
            <tr>
              <th>案名</th>
              <th>客戶</th>
              <th>收款合計</th>
              <th>工程支出</th>
              <th>已付款</th>
              <th>目前應付</th>
              <th>狀態</th>
              <th className="bk-no-print">操作</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id}>
                <td>
                  <Link className="bk-link" href={`/admin/bookkeeping/projects/${project.id}`}>
                    {project.name}
                  </Link>
                </td>
                <td>{project.client_name || "—"}</td>
                <td>{formatCurrency(project.income_total)}</td>
                <td>{formatCurrency(project.expense_payable_total)}</td>
                <td>{formatCurrency(project.expense_paid_total)}</td>
                <td>{formatCurrency(project.payable_now)}</td>
                <td>
                  <BkProjectStatusSelect
                    status={project.status}
                    disabled={
                      updatingProjectId === project.id || deletingProjectId === project.id
                    }
                    onChange={(nextStatus) => void updateProjectStatus(project.id, nextStatus)}
                  />
                </td>
                <td className="bk-no-print">
                  <button
                    className="admin-button danger small"
                    type="button"
                    disabled={deletingProjectId !== null}
                    aria-label={`刪除案件 ${project.name}`}
                    onClick={() => void deleteProject(project)}
                  >
                    {deletingProjectId === project.id ? "刪除中…" : "刪除"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!projects.length ? <p className="admin-note">目前沒有案件。</p> : null}
      </div>

    </>
  );
}
