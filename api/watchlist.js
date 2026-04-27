import api from "./client";
import { resolveImageUrl, placeholderFor } from "./mappers";

/**
 * Fetch user's watchlist from GET /watchlist.
 */
export async function fetchWatchlist() {
  const { data } = await api.get("/watchlist");
  const raw = Array.isArray(data) ? data : data?.data ?? [];
  
  return raw.map((item) => {
    const title = item.title ?? item.name ?? "";
    const rawImage =
      item.thumbnail_url ??
      item.banner_url ??
      item.thumbnail ??
      item.image ??
      item.poster ??
      item.poster_url ??
      item.cover ??
      item.cover_image ??
      item.cover_url ??
      item.media?.thumbnail_url ??
      item.media?.banner_url;
    const resolved = resolveImageUrl(rawImage);
    
    return {
      id: String(item.slug ?? item.id ?? item.drama_id ?? ""),
      title,
      image: resolved || placeholderFor(title),
      genre: item.genre ?? item.category ?? "",
      episodeCount: item.total_episodes ?? item.episode,
      progress: item.progress,
      watching: item.watching,
      releasedAgo: item.released_ago ?? item.releasedAgo,
      isNew: item.is_new ?? item.isNew,
    };
  });
}

/**
 * Add drama to watchlist.
 * @param {string|number} dramaId 
 */
export async function addToWatchlist(dramaId) {
  const { data } = await api.post("/watchlist", { drama_id: dramaId });
  return data;
}

/**
 * Remove drama from watchlist.
 * @param {string|number} dramaId 
 */
export async function removeFromWatchlist(dramaId) {
  if (!dramaId) throw new Error("dramaId is required");
  const { data } = await api.delete(`/watchlist/${dramaId}`);
  return data;
}
