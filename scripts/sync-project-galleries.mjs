import { cpSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import imageSize from "image-size";

const root = fileURLToPath(new URL("..", import.meta.url));
const casesRoot = join(root, "..", "cases");
const galleryRoot = join(root, "public", "images", "projects");
const manifestPath = join(root, "app", "project-gallery-assets.json");

const imageExt = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);

function naturalCompare(a, b) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

function parseCaseFolder(name) {
  const match = name.match(/^(\d+)-(.+?)__/);
  if (!match) return null;
  return { order: Number(match[1]), slug: match[2] };
}

const caseFolders = readdirSync(casesRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => {
    const parsed = parseCaseFolder(entry.name);
    if (!parsed) throw new Error(`無法解析案例資料夾：${entry.name}`);
    return { ...parsed, dirName: entry.name };
  })
  .sort((a, b) => a.order - b.order);

if (caseFolders.length !== 12) {
  throw new Error(`預期 12 個案例，實際找到 ${caseFolders.length} 個`);
}

mkdirSync(galleryRoot, { recursive: true });

let previousCovers = {};
try {
  const previous = JSON.parse(readFileSync(manifestPath, "utf8"));
  for (const item of previous) {
    if (item.cover) previousCovers[item.slug] = item.cover;
  }
} catch {
  // ignore missing or invalid manifest
}

function findPanoramaFile(sourceDir, files) {
  const execFile = files.find((file) => /^exec-/i.test(file) || /panorama|pano|360|sphere/i.test(file));
  if (execFile) return execFile;

  for (const file of files) {
    const dimensions = imageSize(join(sourceDir, file));
    if (!dimensions.width || !dimensions.height) continue;
    const ratio = dimensions.width / dimensions.height;
    if (ratio >= 1.85 && ratio <= 2.15) return file;
  }

  return undefined;
}

const manifest = caseFolders.map(({ slug, dirName, order }) => {
  const sourceDir = join(casesRoot, dirName);
  const targetDir = join(galleryRoot, slug);

  rmSync(targetDir, { recursive: true, force: true });
  mkdirSync(targetDir, { recursive: true });

  const files = readdirSync(sourceDir)
    .filter((file) => imageExt.has(extname(file).toLowerCase()))
    .sort(naturalCompare);

  if (!files.length) {
    throw new Error(`${dirName} 沒有找到圖片`);
  }

  const panoramaFile = findPanoramaFile(sourceDir, files);
  const galleryFiles = panoramaFile ? files.filter((file) => file !== panoramaFile) : files;

  for (const file of galleryFiles) {
    cpSync(join(sourceDir, file), join(targetDir, file));
  }

  if (panoramaFile) {
    cpSync(join(sourceDir, panoramaFile), join(targetDir, "panorama.png"));
  }

  const images = galleryFiles.map((file) => `/images/projects/${slug}/${file}`);
  const cover = previousCovers[slug];

  return {
    slug,
    order,
    ...(panoramaFile ? { panorama: `/images/projects/${slug}/panorama.png` } : {}),
    ...(cover && images.includes(cover) ? { cover } : {}),
    images,
  };
});

writeFileSync(`${manifestPath}`, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

const totalImages = manifest.reduce((sum, item) => sum + item.images.length, 0);
console.log(`已同步 ${manifest.length} 個案例、共 ${totalImages} 張照片`);
for (const item of manifest) {
  console.log(`  ${String(item.order).padStart(2, "0")}. ${item.slug}: ${item.images.length} 張`);
}
