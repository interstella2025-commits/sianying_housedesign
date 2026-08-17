export function isDirectExternalHref(href: string) {
  try {
    const { hostname } = new URL(href);
    return hostname === "line.me" || hostname.endsWith(".line.me");
  } catch {
    return false;
  }
}

export function openDirectExternalHref(href: string) {
  window.open(href, "_blank", "noopener,noreferrer");
}
