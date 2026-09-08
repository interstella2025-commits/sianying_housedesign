import { prepareImageForUpload } from "@/lib/client/prepare-upload-image";
import { preparePanoramaForUpload } from "@/lib/client/prepare-panorama-image";

const UPLOAD_CONCURRENCY = 2;

type UploadAdminFilesOptions = {
  catalog?: boolean;
  panorama?: boolean;
  onProgress?: (completed: number, total: number) => void;
};

type UploadResponse = {
  item?: { url: string };
  error?: string;
};

async function readUploadResponse(response: Response): Promise<UploadResponse> {
  const text = await response.text();
  if (!text) {
    return {
      error:
        response.status === 413
          ? "檔案太大，請改用較小的照片"
          : `上傳失敗（${response.status}）`,
    };
  }

  try {
    return JSON.parse(text) as UploadResponse;
  } catch {
    return { error: `上傳失敗（${response.status}）` };
  }
}

async function uploadOne(file: File, catalog: boolean) {
  const formData = new FormData();
  formData.append("file", file);

  const query = catalog ? "" : "?catalog=0";
  const response = await fetch(`/api/upload${query}`, {
    method: "POST",
    body: formData,
  });
  const payload = await readUploadResponse(response);

  if (!response.ok) {
    throw new Error(payload.error ?? "上傳失敗");
  }

  return payload.item?.url ?? null;
}

export async function uploadAdminFiles(
  files: FileList | File[],
  options: UploadAdminFilesOptions = {},
): Promise<string[]> {
  const catalog = options.catalog !== false;
  const list = Array.from(files);
  if (!list.length) return [];

  const prepare = options.panorama ? preparePanoramaForUpload : prepareImageForUpload;
  const prepared = await Promise.all(list.map((file) => prepare(file)));
  const uploaded: string[] = [];
  let completed = 0;

  for (let index = 0; index < prepared.length; index += UPLOAD_CONCURRENCY) {
    const batch = prepared.slice(index, index + UPLOAD_CONCURRENCY);
    const batchUrls = await Promise.all(batch.map((file) => uploadOne(file, catalog)));

    for (const url of batchUrls) {
      if (url) uploaded.push(url);
    }

    completed += batch.length;
    options.onProgress?.(completed, prepared.length);
  }

  return uploaded;
}
