import api from "./client";
import { resolveImageUrl, placeholderFor } from "./mappers";

/**
 * Map a raw drama item from the API to the frontend Drama shape.
 */
function mapDramaItem(item) {
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
    episode: item.episode,
    progress: item.progress,
    watching: item.watching,
    releasedAgo: item.released_ago ?? item.releasedAgo,
    isNew: item.is_new ?? item.isNew,
  };
}

/**
 * Fetch dramas from GET /dramas.
 * Maps API response to Drama format (id, title, image, genre, etc).
 */
export async function fetchDramas() {
  const { data } = await api.get("/dramas");
  const raw = Array.isArray(data) ? data : data?.data ?? data?.dramas ?? [];
  return raw.map(mapDramaItem);
}

// ---------------------------------------------------------------------------
// US-005: Watch progress & continue-watching
// ---------------------------------------------------------------------------

/**
 * Save watch progress for an episode. Fire-and-forget — errors are caught
 * silently so playback is never interrupted.
 *
 * @param {string|number} episodeId
 * @param {number} progressSeconds - current playback position in seconds
 * @param {boolean} isCompleted - whether the episode finished
 */
export function saveProgress(episodeId, progressSeconds, isCompleted) {
  if (!episodeId) throw new Error("episodeId is required");
  api
    .post(`/episodes/${episodeId}/progress`, {
      progress_seconds: progressSeconds,
      is_completed: isCompleted,
    })
    .catch((err) => {
      console.warn('[saveProgress] Failed to save progress:', err?.message || err);
    });
}

/**
 * Fetch the "continue watching" list for the authenticated user.
 * GET /continue-watching → array of dramas with progress info.
 */
export async function fetchContinueWatching() {
  const { data } = await api.get("/continue-watching");
  const raw = Array.isArray(data) ? data : data?.data ?? [];
  return raw.map(mapDramaItem);
}

// ---------------------------------------------------------------------------
// US-007: Like / unlike a drama
// ---------------------------------------------------------------------------

/**
 * Toggle like on a drama.
 * POST /dramas/{dramaId}/like → returns API response (e.g. { liked, total_likes }).
 *
 * @param {string|number} dramaId
 */
export async function likeDrama(dramaId) {
  if (!dramaId) throw new Error("dramaId is required");
  const { data } = await api.post(`/dramas/${dramaId}/like`);
  return data;
}

// ---------------------------------------------------------------------------
// US-008: Fetch drama detail
// ---------------------------------------------------------------------------

/**
 * Derive episode status based on position relative to free_episodes count.
 *
 * @param {number} index - zero-based episode index
 * @param {number} freeCount - number of free episodes for this drama
 * @returns {"free"|"locked"}
 */
function deriveEpisodeStatus(index, freeCount) {
  return index < freeCount ? "free" : "locked";
}

/**
 * Format seconds into a "M:SS" duration string.
 *
 * @param {number|null|undefined} seconds
 * @returns {string}
 */
function formatDuration(seconds) {
  if (!seconds && seconds !== 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Extract a four-digit year from a date string (ISO or similar).
 *
 * @param {string|null|undefined} dateStr
 * @returns {string}
 */
function extractYear(dateStr) {
  if (!dateStr) return "";
  const match = String(dateStr).match(/\d{4}/);
  return match ? match[0] : "";
}

/**
 * Format a large number into a compact display string (e.g. 5100 → "5.1K").
 *
 * @param {number|null|undefined} n
 * @returns {string}
 */
function formatCompact(n) {
  if (n == null) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}

/**
 * Fetch full drama detail by slug.
 * GET /dramas/{slug} → maps to DramaDetail interface used by DramaDetailScreen.
 *
 * @param {string} slug
 */
export async function fetchDramaDetail(slug) {
  if (!slug) throw new Error("dramaId is required");
  const { data } = await api.get(`/dramas/${slug}`);
  const item = data?.data ?? data;
  if (!item) return null;

  const title = item.title ?? item.name ?? "";
  const bannerRaw =
    item.banner_url ??
    item.thumbnail_url ??
    item.thumbnail ??
    item.image ??
    item.poster ??
    item.poster_url ??
    item.cover ??
    item.cover_image ??
    item.cover_url ??
    item.media?.banner_url ??
    item.media?.thumbnail_url;
  const banner = resolveImageUrl(bannerRaw) || placeholderFor(title);

  const genreRaw = item.genre ?? item.category ?? "";
  const genre = Array.isArray(genreRaw)
    ? genreRaw
    : genreRaw
      ? genreRaw.split(",").map((g) => g.trim())
      : [];

  const freeCount = item.free_episodes ?? 0;
  const rawEpisodes = Array.isArray(item.episodes) ? item.episodes : [];

  const episodes = [...rawEpisodes]
    .sort((a, b) => (a.episode_number ?? 0) - (b.episode_number ?? 0))
    .map((ep, index) => {
      const epTitle = ep.title ?? `Episode ${ep.episode_number ?? index + 1}`;
      const epImageRaw =
        ep.thumbnail_url ?? ep.banner_url ?? ep.image ?? ep.thumbnail;
      const epImage = resolveImageUrl(epImageRaw) || banner;

      return {
        id: String(ep.id ?? ep.episode_id ?? `e${index + 1}`),
        number: ep.episode_number ?? index + 1,
        title: epTitle,
        image: epImage,
        duration: ep.duration
          ? typeof ep.duration === "number"
            ? formatDuration(ep.duration)
            : String(ep.duration)
          : "0:00",
        status: deriveEpisodeStatus(index, freeCount),
        watchedAgo: ep.watched_ago ?? ep.watchedAgo,
        progress: ep.progress,
      };
    });

  return {
    id: String(item.slug ?? item.id ?? ""),
    title,
    banner,
    genre,
    episodeCount: item.total_episodes ?? episodes.length,
    year: extractYear(item.release_date),
    country: item.country ?? "",
    rating: item.rating ?? 0,
    reviewCount: formatCompact(item.review_count ?? item.total_reviews),
    watchingNow: formatCompact(item.total_views),
    likes: formatCompact(item.total_likes),
    description: item.description ?? item.synopsis ?? "",
    trailerThumbnail: resolveImageUrl(item.trailer_thumbnail) || banner,
    trailerDuration: item.trailer_duration
      ? typeof item.trailer_duration === "number"
        ? formatDuration(item.trailer_duration)
        : String(item.trailer_duration)
      : "",
    episodes,
  };
}
