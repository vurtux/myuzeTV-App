import api from "./client";

/**
 * Fetch HLS stream URL for an episode.
 * GET /episodes/{id}/stream
 * Returns the HLS URL to play.
 */
export async function fetchEpisodeStream(episodeId) {
  if (!episodeId) throw new Error("episodeId is required");
  const { data } = await api.get(`/episodes/${episodeId}/stream`);
  if (typeof data === "string") return data;
  return data?.url ?? data?.hls_url ?? data?.hls ?? data?.stream_url ?? null;
}
