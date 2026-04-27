jest.mock("../../api/client", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const client = require("../../api/client").default;
const {
  fetchSubscriptionPlans,
  checkSubscriptionStatus,
} = require("../../api/subscription");

describe("API: subscription.js", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // fetchSubscriptionPlans
  // ---------------------------------------------------------------------------
  describe("fetchSubscriptionPlans", () => {
    it("passes platform as query param", async () => {
      client.get.mockResolvedValue({ data: [] });

      await fetchSubscriptionPlans("ios");
      expect(client.get).toHaveBeenCalledWith("/subscription/plans", {
        params: { platform: "ios" },
      });
    });

    it("returns plans from top-level array response", async () => {
      const plans = [
        { id: 1, name: "Monthly", price: 9.99, currency: "GHS", billing_period: "monthly" },
        { id: 2, name: "Yearly", price: 79.99, currency: "GHS", billing_period: "yearly" },
      ];
      client.get.mockResolvedValue({ data: plans });

      const result = await fetchSubscriptionPlans("web");
      expect(result).toEqual(plans);
    });

    it("unwraps nested data.data array", async () => {
      const plans = [{ id: 1, name: "Weekly" }];
      client.get.mockResolvedValue({ data: { data: plans } });

      const result = await fetchSubscriptionPlans("android");
      expect(result).toEqual(plans);
    });

    it("unwraps data.plans array", async () => {
      const plans = [{ id: 1, name: "Premium" }];
      client.get.mockResolvedValue({ data: { plans } });

      const result = await fetchSubscriptionPlans("web");
      expect(result).toEqual(plans);
    });

    it("returns empty array for non-array response (the Array.isArray guard)", async () => {
      client.get.mockResolvedValue({ data: { success: true, message: "ok" } });

      const result = await fetchSubscriptionPlans("web");
      expect(result).toEqual([]);
    });

    it("returns empty array when data is null", async () => {
      client.get.mockResolvedValue({ data: null });

      const result = await fetchSubscriptionPlans("web");
      expect(result).toEqual([]);
    });

    it("returns empty array when data is a string", async () => {
      client.get.mockResolvedValue({ data: "unexpected" });

      const result = await fetchSubscriptionPlans("web");
      expect(result).toEqual([]);
    });

    it("prefers top-level array over nested data.data", async () => {
      // If data itself is an array, that takes priority
      const topLevel = [{ id: 1, name: "Top" }];
      client.get.mockResolvedValue({ data: topLevel });

      const result = await fetchSubscriptionPlans("web");
      expect(result).toEqual(topLevel);
    });

    it("propagates API errors", async () => {
      client.get.mockRejectedValue(new Error("Network error"));

      await expect(fetchSubscriptionPlans("web")).rejects.toThrow("Network error");
    });
  });

  // ---------------------------------------------------------------------------
  // checkSubscriptionStatus
  // ---------------------------------------------------------------------------
  describe("checkSubscriptionStatus", () => {
    it("returns subscription status from direct response", async () => {
      client.get.mockResolvedValue({
        data: {
          status: "active",
          expires_at: "2026-12-31T00:00:00Z",
        },
      });

      const result = await checkSubscriptionStatus();
      expect(client.get).toHaveBeenCalledWith("/subscription/status");
      expect(result).toEqual({
        status: "active",
        expires_at: "2026-12-31T00:00:00Z",
      });
    });

    it("unwraps nested data.data", async () => {
      client.get.mockResolvedValue({
        data: {
          data: {
            status: "expired",
            expires_at: "2025-01-01T00:00:00Z",
          },
        },
      });

      const result = await checkSubscriptionStatus();
      expect(result.status).toBe("expired");
    });

    it("returns raw data when no nested data.data exists", async () => {
      client.get.mockResolvedValue({
        data: { status: "inactive" },
      });

      const result = await checkSubscriptionStatus();
      expect(result.status).toBe("inactive");
    });

    it("propagates API errors", async () => {
      client.get.mockRejectedValue(new Error("Unauthorized"));

      await expect(checkSubscriptionStatus()).rejects.toThrow("Unauthorized");
    });
  });
});
