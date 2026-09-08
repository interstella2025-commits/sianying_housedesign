"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BK_PROJECT_STATUSES } from "@/lib/bookkeeping/types";
import type { BkProjectStatus } from "@/lib/bookkeeping/types";

const tabs = [
  { href: "/admin/bookkeeping", label: "案件列表", match: (path: string) => path === "/admin/bookkeeping" || path.startsWith("/admin/bookkeeping/projects/") },
  { href: "/admin/bookkeeping/vendors", label: "廠商列表", match: (path: string) => path.startsWith("/admin/bookkeeping/vendors") },
] as const;

export function BookkeepingNav() {
  const pathname = usePathname();

  return (
    <nav className="bk-nav bk-no-print" aria-label="記帳功能導覽">
      {tabs.map((tab) => {
        const active = tab.match(pathname);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`bk-nav-link${active ? " is-active" : ""}`}
            aria-current={active ? "page" : undefined}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function BkStatusBadge({ status }: { status: string }) {
  return <span className={`bk-status bk-status-${status}`}>{status}</span>;
}

export function BkProjectStatusSelect({
  status,
  disabled,
  onChange,
}: {
  status: BkProjectStatus;
  disabled?: boolean;
  onChange: (status: BkProjectStatus) => void;
}) {
  return (
    <select
      className={`bk-status-select bk-status bk-status-${status}`}
      value={status}
      disabled={disabled}
      aria-label="案件狀態"
      onChange={(event) => onChange(event.target.value as BkProjectStatus)}
    >
      {BK_PROJECT_STATUSES.map((item) => (
        <option key={item} value={item}>
          {item}
        </option>
      ))}
    </select>
  );
}

export async function bkFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const payload = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error(payload.error ?? "操作失敗");
  }
  return payload;
}
