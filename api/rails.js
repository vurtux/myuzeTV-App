import api from "./client";
import { resolveImageUrl, placeholderFor } from "./mappers";

export async function fetchRails() {
  const { data } = await api.get("/rails");
  const raw = Array.isArray(data) ? data : data?.data ?? [];

  const rails = raw
    .filter((rail) => Array.isArray(rail.dramas) && rail.dramas.length > 0)
    .filter((rail) => rail.rail_type !== "hero")
    .map((rail) => {
      const dramas = rail.dramas.map((item) => {
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
      });

      return {
        id: rail.id,
        title: rail.title || rail.slug || "",
        slug: rail.slug,
        rail_type: rail.rail_type,
        display_order: rail.display_order ?? 0,
        dramas,
      };
    });

  // sort by display_order ascending
  rails.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  return rails;
}

