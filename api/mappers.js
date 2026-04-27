export const API_BASE =
  (typeof process !== "undefined" && process.env?.EXPO_PUBLIC_API_URL) ||
  "https://tv.myuze.app/api";
const DEFAULT_CDN = "https://tv.myuze.app";
export const CDN_BASE =
  (typeof process !== "undefined" && process.env?.EXPO_PUBLIC_CDN_URL) ||
  API_BASE.replace(/\/api\/?$/, "") ||
  DEFAULT_CDN;

export function resolveImageUrl(url) {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }
  if (trimmed.startsWith("/")) {
    return `${CDN_BASE}${trimmed}`;
  }
  return `${CDN_BASE}/${trimmed}`;
}

export function placeholderFor(title) {
  const text = encodeURIComponent((title || "Poster").slice(0, 18));
  return `https://placehold.co/200x356/1a1a2e/8b5cf6?text=${text}`;
}
