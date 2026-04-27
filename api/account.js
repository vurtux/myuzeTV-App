import api from "./client";

/**
 * Fetch the authenticated user's profile and stats.
 * GET /auth/me
 *
 * Expected response shape:
 * {
 *   user: { id, name, email, phone, profile_image, subscription_status, subscription_expires_at },
 *   watchlist_count: number,
 *   completed_dramas_count: number,
 *   total_watch_seconds: number,
 * }
 */
export async function fetchMe() {
  const { data } = await api.get("/auth/me");
  const user = data?.data ?? data;
  if (!user) return null;
  return user;
}

/**
 * Delete the authenticated user's account.
 * DELETE /auth/account
 *
 * @returns {Promise<Object>} API response confirming deletion
 */
export async function deleteAccount() {
  const { data } = await api.delete("/auth/account");
  return data;
}
