"use client";

import { useState } from "react";

type ProjectGalleryEditorProps = {
  images: string[];
  cover: string;
  onChange: (images: string[]) => void;
  onCoverChange: (cover: string) => void;
  onUpload: (files: FileList) => Promise<void>;
  status?: string | null;
};

function isUploadErrorStatus(message: string) {
  return /失敗|ENOENT|尚未|Error|error/i.test(message) && !/上傳中|已上傳|儲存中/.test(message);
}

export function ProjectGalleryEditor({
  images,
  cover,
  onChange,
  onCoverChange,
  onUpload,
  status = null,
}: ProjectGalleryEditorProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  function moveImage(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex) return;
    const next = [...images];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    onChange(next);
  }

  function removeImage(index: number) {
    onChange(images.filter((_, itemIndex) => itemIndex !== index));
  }

  return (
    <div className="admin-gallery-editor">
      <div className="admin-toolbar admin-gallery-toolbar">
        <label className="admin-button secondary admin-file-button">
          上傳案例照片
          <input
            hidden
            type="file"
            accept="image/*"
            multiple
            onChange={(event) => {
              const files = event.target.files;
              if (files?.length) void onUpload(files);
              event.currentTarget.value = "";
            }}
          />
        </label>
        {status ? (
          <p
            className={`admin-note admin-inline-status${
              isUploadErrorStatus(status) ? " is-error" : ""
            }`}
          >
            {status}
          </p>
        ) : null}
      </div>

      {images.length ? (
        <div className="admin-gallery-grid">
          {images.map((url, index) => (
            <figure
              className={`admin-gallery-item${dragIndex === index ? " is-dragging" : ""}${
                cover === url ? " is-cover" : ""
              }`}
              draggable
              key={`${url}-${index}`}
              onDragStart={() => setDragIndex(index)}
              onDragEnd={() => setDragIndex(null)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => {
                if (dragIndex !== null) moveImage(dragIndex, index);
                setDragIndex(null);
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`案例照片 ${index + 1}`} draggable={false} />
              <figcaption>
                <span>{index + 1}</span>
                <div className="admin-gallery-actions">
                  <button
                    className="admin-button secondary"
                    type="button"
                    onClick={() => onCoverChange(url)}
                  >
                    {cover === url ? "封面" : "設封面"}
                  </button>
                  <button
                    className="admin-button secondary"
                    type="button"
                    onClick={() => removeImage(index)}
                  >
                    移除
                  </button>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      ) : (
        <p className="admin-note">尚無案例照片，請上傳或從媒體庫貼上網址。</p>
      )}
    </div>
  );
}
