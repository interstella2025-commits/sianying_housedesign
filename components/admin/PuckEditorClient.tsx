"use client";

import { Puck } from "@puckeditor/core";
import type { Data } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import "@/app/globals.css";
import { useMemo, useState } from "react";
import Link from "next/link";
import type { Project } from "@/lib/project-types";
import { createPuckEditorConfig } from "@/puck.config";

type PuckEditorClientProps = {
  path: string;
  initialData: Data;
  headerTitle?: string;
  previewProjects: Project[];
};

export function PuckEditorClient({
  path,
  initialData,
  headerTitle = "翔胤頁面編輯",
  previewProjects,
}: PuckEditorClientProps) {
  const [status, setStatus] = useState<string | null>(null);
  const config = useMemo(
    () => createPuckEditorConfig(path, previewProjects),
    [path, previewProjects],
  );

  return (
    <Puck
      config={config}
      data={initialData}
      headerTitle={headerTitle}
      iframe={{ enabled: false }}
      overrides={{
        headerActions: ({ children }) => (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link href="/new/admin" style={{ fontSize: 13, marginRight: 8 }}>
              返回新版後台
            </Link>
            {status ? <span style={{ fontSize: 13, color: "#666" }}>{status}</span> : null}
            {children}
          </div>
        ),
      }}
      onPublish={async (data) => {
        setStatus("發布中…");
        const response = await fetch("/api/puck", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path, data }),
        });
        if (!response.ok) {
          const payload = (await response.json()) as { error?: string };
          setStatus(payload.error ?? "發布失敗");
          return;
        }
        setStatus("已發布");
      }}
    />
  );
}
