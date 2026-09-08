import type { CustomField } from "@puckeditor/core";
import { MediaUploadField } from "@/components/admin/puck/MediaUploadField";

export function createMediaField(label: string, accept = "image/*,video/*"): CustomField<string> {
  return {
    type: "custom",
    label,
    render: ({ value, onChange, field }) => (
      <MediaUploadField
        value={value ?? ""}
        onChange={onChange}
        label={field.label}
        accept={accept}
      />
    ),
  };
}

export const imageField = createMediaField("圖片", "image/*");
