"use client";

import { useRef, useState } from "react";
import styles from "./MediaUploadField.module.css";

type MediaUploadFieldProps = {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  accept?: string;
};

export function MediaUploadField({
  value = "",
  onChange,
  label = "媒體網址",
  accept = "image/*,video/*",
}: MediaUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleUpload(file: File) {
    setUploading(true);
    setStatus(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as {
        error?: string;
        item?: { url: string };
      };
      if (!response.ok) {
        throw new Error(payload.error ?? "上傳失敗");
      }
      onChange(payload.item?.url ?? "");
      setStatus("已上傳");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "上傳失敗");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className={styles.root}>
      <label className={styles.label}>{label}</label>
      <input
        className={styles.input}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="貼上網址，或上傳檔案"
      />
      <div className={styles.actions}>
        <button
          className={styles.button}
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? "上傳中…" : "上傳檔案"}
        </button>
        {value ? (
          <a className={styles.previewLink} href={value} target="_blank" rel="noreferrer">
            預覽
          </a>
        ) : null}
      </div>
      <input
        ref={inputRef}
        className={styles.hidden}
        type="file"
        accept={accept}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleUpload(file);
          event.currentTarget.value = "";
        }}
      />
      {status ? <p className={styles.status}>{status}</p> : null}
      {value && /\.(png|jpe?g|webp|gif|avif)$/i.test(value) ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className={styles.thumb} src={value} alt="" />
      ) : null}
    </div>
  );
}
