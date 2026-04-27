import api from "./client";

/**
 * Fetch available subscription plans for a given platform.
 * GET /subscription/plans?platform={platform}
 *
 * @param {string} platform - e.g. "ios", "android", "web"
 * @returns {Promise<Array>} list of plan objects
 */
export async function fetchSubscriptionPlans(platform) {
  const { data } = await api.get("/subscription/plans", {
    params: { platform },
  });
  const raw = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.plans)
        ? data.plans
        : [];
  return raw;
}

/**
 * Check the current user's subscription status.
 * GET /subscription/status
 *
 * @returns {Promise<Object>} subscription status payload
 */
export async function checkSubscriptionStatus() {
  const { data } = await api.get("/subscription/status");
  return data?.data ?? data;
}
