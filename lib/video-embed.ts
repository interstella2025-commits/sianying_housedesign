export function toVideoEmbedUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (trimmed.includes("youtube.com/embed/")) return trimmed;
  if (trimmed.includes("youtu.be/")) {
    const id = trimmed.split("youtu.be/")[1]?.split(/[?&#]/)[0];
    return id ? `https://www.youtube.com/embed/${id}` : null;
  }
  const watchMatch = trimmed.match(/[?&]v=([^&]+)/);
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
  const shortsMatch = trimmed.match(/shorts\/([^/?&#]+)/);
  if (shortsMatch) return `https://www.youtube.com/embed/${shortsMatch[1]}`;
  return null;
}

export function parseYouTubeId(url: string): string | null {
  const embed = toVideoEmbedUrl(url);
  if (!embed) return null;
  return embed.split("/embed/")[1]?.split(/[?&#]/)[0] ?? null;
}

export function getYouTubePosterUrl(
  videoId: string,
  format: "landscape" | "portrait" = "landscape",
) {
  const variant = format === "portrait" ? "oardefault" : "maxresdefault";
  return `https://i.ytimg.com/vi/${videoId}/${variant}.jpg`;
}

export function getYouTubePosterFallback(posterUrl: string) {
  if (posterUrl.includes("maxresdefault")) {
    return posterUrl.replace("maxresdefault", "sddefault");
  }
  if (posterUrl.includes("oardefault")) {
    return posterUrl.replace("oardefault", "hqdefault");
  }
  if (posterUrl.includes("sddefault")) {
    return posterUrl.replace("sddefault", "hqdefault");
  }
  return posterUrl;
}
