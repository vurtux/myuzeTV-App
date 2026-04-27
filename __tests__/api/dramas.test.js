jest.mock("../../api/client", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

const client = require("../../api/client").default;
const {
  fetchDramas,
  fetchDramaDetail,
  likeDrama,
  saveProgress,
  fetchContinueWatching,
} = require("../../api/dramas");

describe("API: dramas.js", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // fetchDramas
  // ---------------------------------------------------------------------------
  describe("fetchDramas", () => {
    it("returns mapped array when data is a top-level array", async () => {
      client.get.mockResolvedValue({
        data: [
          { slug: "love-in-accra", title: "Love in Accra", thumbnail_url: "https://cdn.test/img.jpg", genre: "romance" },
        ],
      });

      const result = await fetchDramas();
      expect(client.get).toHaveBeenCalledWith("/dramas");
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(
        expect.objectContaining({
          id: "love-in-accra",
          title: "Love in Accra",
          image: "https://cdn.test/img.jpg",
          genre: "romance",
        })
      );
    });

    it("unwraps nested data.data array", async () => {
      client.get.mockResolvedValue({
        data: {
          data: [
            { id: 1, title: "Drama A", genre: "thriller" },
            { id: 2, name: "Drama B", category: "comedy" },
          ],
        },
      });

      const result = await fetchDramas();
      expect(result).toHaveLength(2);
      expect(result[0].title).toBe("Drama A");
      expect(result[1].title).toBe("Drama B");
      expect(result[1].genre).toBe("comedy");
    });

    it("unwraps nested data.dramas array", async () => {
      client.get.mockResolvedValue({
        data: { dramas: [{ id: 10, title: "From Dramas" }] },
      });

      const result = await fetchDramas();
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("From Dramas");
    });

    it("returns empty array when data is not an array", async () => {
      client.get.mockResolvedValue({ data: { success: true } });

      const result = await fetchDramas();
      expect(result).toEqual([]);
    });

    it("returns empty array when data is null", async () => {
      client.get.mockResolvedValue({ data: null });

      const result = await fetchDramas();
      expect(result).toEqual([]);
    });

    it("maps id from slug, then id, then drama_id", async () => {
      client.get.mockResolvedValue({
        data: [
          { slug: "my-slug", id: 5, drama_id: 99, title: "T" },
          { id: 5, drama_id: 99, title: "T2" },
          { drama_id: 99, title: "T3" },
          { title: "T4" },
        ],
      });

      const result = await fetchDramas();
      expect(result[0].id).toBe("my-slug");
      expect(result[1].id).toBe("5");
      expect(result[2].id).toBe("99");
      expect(result[3].id).toBe("");
    });

    it("resolves image through fallback chain", async () => {
      client.get.mockResolvedValue({
        data: [{ id: 1, title: "T", banner_url: "https://cdn.test/banner.jpg" }],
      });

      const result = await fetchDramas();
      expect(result[0].image).toBe("https://cdn.test/banner.jpg");
    });

    it("uses placeholder when no image URL exists", async () => {
      client.get.mockResolvedValue({
        data: [{ id: 1, title: "No Image" }],
      });

      const result = await fetchDramas();
      expect(result[0].image).toContain("placehold.co");
      expect(result[0].image).toContain("No%20Image");
    });

    it("resolves relative image URLs using CDN base", async () => {
      client.get.mockResolvedValue({
        data: [{ id: 1, title: "T", thumbnail_url: "/uploads/img.jpg" }],
      });

      const result = await fetchDramas();
      expect(result[0].image).toContain("/uploads/img.jpg");
      expect(result[0].image).toMatch(/^https?:\/\//);
    });

    it("resolves protocol-relative image URLs", async () => {
      client.get.mockResolvedValue({
        data: [{ id: 1, title: "T", thumbnail_url: "//cdn.test/img.jpg" }],
      });

      const result = await fetchDramas();
      expect(result[0].image).toBe("https://cdn.test/img.jpg");
    });

    it("maps optional fields (episode, progress, watching, releasedAgo, isNew)", async () => {
      client.get.mockResolvedValue({
        data: [
          {
            id: 1,
            title: "T",
            episode: "Ep 5 of 20",
            progress: 0.5,
            watching: "3K",
            released_ago: "2 days ago",
            is_new: true,
          },
        ],
      });

      const result = await fetchDramas();
      expect(result[0]).toEqual(
        expect.objectContaining({
          episode: "Ep 5 of 20",
          progress: 0.5,
          watching: "3K",
          releasedAgo: "2 days ago",
          isNew: true,
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // fetchDramaDetail
  // ---------------------------------------------------------------------------
  describe("fetchDramaDetail", () => {
    const makeDetailResponse = (overrides = {}) => ({
      data: {
        data: {
          slug: "test-drama",
          title: "Test Drama",
          banner_url: "https://cdn.test/banner.jpg",
          genre: "romance,thriller",
          total_episodes: 5,
          free_episodes: 2,
          release_date: "2025-06-15",
          country: "GH",
          rating: 4.5,
          review_count: 1200,
          total_views: 5100,
          total_likes: 320,
          description: "A test drama description",
          episodes: [
            { id: 1, episode_number: 1, title: "Pilot", duration: 120 },
            { id: 2, episode_number: 2, title: "Second", duration: 90 },
            { id: 3, episode_number: 3, title: "Third", duration: 150 },
          ],
          ...overrides,
        },
      },
    });

    it("returns DramaDetail shape with all fields", async () => {
      client.get.mockResolvedValue(makeDetailResponse());

      const result = await fetchDramaDetail("test-drama");
      expect(client.get).toHaveBeenCalledWith("/dramas/test-drama");
      expect(result).toEqual(
        expect.objectContaining({
          id: "test-drama",
          title: "Test Drama",
          banner: "https://cdn.test/banner.jpg",
          genre: ["romance", "thriller"],
          episodeCount: 5,
          year: "2025",
          country: "GH",
          rating: 4.5,
          description: "A test drama description",
        })
      );
    });

    it("sorts episodes by episode_number ascending", async () => {
      client.get.mockResolvedValue(
        makeDetailResponse({
          episodes: [
            { id: 3, episode_number: 3, title: "Third" },
            { id: 1, episode_number: 1, title: "First" },
            { id: 2, episode_number: 2, title: "Second" },
          ],
        })
      );

      const result = await fetchDramaDetail("test-drama");
      expect(result.episodes[0].number).toBe(1);
      expect(result.episodes[1].number).toBe(2);
      expect(result.episodes[2].number).toBe(3);
    });

    it("derives episode status based on free_episodes count", async () => {
      client.get.mockResolvedValue(
        makeDetailResponse({ free_episodes: 2 })
      );

      const result = await fetchDramaDetail("test-drama");
      expect(result.episodes[0].status).toBe("free");
      expect(result.episodes[1].status).toBe("free");
      expect(result.episodes[2].status).toBe("locked");
    });

    it("formats episode duration from seconds to M:SS", async () => {
      client.get.mockResolvedValue(
        makeDetailResponse({
          episodes: [{ id: 1, episode_number: 1, title: "Ep", duration: 125 }],
        })
      );

      const result = await fetchDramaDetail("test-drama");
      expect(result.episodes[0].duration).toBe("2:05");
    });

    it("passes through string durations as-is", async () => {
      client.get.mockResolvedValue(
        makeDetailResponse({
          episodes: [{ id: 1, episode_number: 1, title: "Ep", duration: "3:45" }],
        })
      );

      const result = await fetchDramaDetail("test-drama");
      expect(result.episodes[0].duration).toBe("3:45");
    });

    it("defaults duration to 0:00 when missing", async () => {
      client.get.mockResolvedValue(
        makeDetailResponse({
          episodes: [{ id: 1, episode_number: 1, title: "Ep" }],
        })
      );

      const result = await fetchDramaDetail("test-drama");
      expect(result.episodes[0].duration).toBe("0:00");
    });

    it("handles missing fields with graceful defaults", async () => {
      client.get.mockResolvedValue({
        data: { data: {} },
      });

      const result = await fetchDramaDetail("empty");
      expect(result.title).toBe("");
      expect(result.genre).toEqual([]);
      expect(result.episodes).toEqual([]);
      expect(result.description).toBe("");
      expect(result.year).toBe("");
      expect(result.country).toBe("");
      expect(result.rating).toBe(0);
      expect(result.banner).toContain("placehold.co");
    });

    it("unwraps data when not nested in data.data", async () => {
      client.get.mockResolvedValue({
        data: {
          slug: "flat",
          title: "Flat Response",
          genre: "comedy",
          episodes: [],
        },
      });

      const result = await fetchDramaDetail("flat");
      expect(result.id).toBe("flat");
      expect(result.title).toBe("Flat Response");
    });

    it("formats compact numbers for reviewCount, watchingNow, likes", async () => {
      client.get.mockResolvedValue(
        makeDetailResponse({
          review_count: 5100,
          total_views: 1200000,
          total_likes: 800,
        })
      );

      const result = await fetchDramaDetail("test-drama");
      expect(result.reviewCount).toBe("5.1K");
      expect(result.watchingNow).toBe("1.2M");
      expect(result.likes).toBe("800");
    });

    it("extracts year from release_date", async () => {
      client.get.mockResolvedValue(
        makeDetailResponse({ release_date: "2023-11-01T00:00:00Z" })
      );

      const result = await fetchDramaDetail("test-drama");
      expect(result.year).toBe("2023");
    });

    it("parses genre array input directly", async () => {
      client.get.mockResolvedValue(
        makeDetailResponse({ genre: ["action", "drama"] })
      );

      const result = await fetchDramaDetail("test-drama");
      expect(result.genre).toEqual(["action", "drama"]);
    });

    it("maps episode id from id, then episode_id, then fallback", async () => {
      client.get.mockResolvedValue(
        makeDetailResponse({
          episodes: [
            { id: 42, episode_number: 1, title: "A" },
            { episode_id: 99, episode_number: 2, title: "B" },
            { episode_number: 3, title: "C" },
          ],
        })
      );

      const result = await fetchDramaDetail("test-drama");
      expect(result.episodes[0].id).toBe("42");
      expect(result.episodes[1].id).toBe("99");
      expect(result.episodes[2].id).toBe("e3");
    });
  });

  // ---------------------------------------------------------------------------
  // fetchContinueWatching
  // ---------------------------------------------------------------------------
  describe("fetchContinueWatching", () => {
    it("returns mapped array from top-level array", async () => {
      client.get.mockResolvedValue({
        data: [
          { id: 1, title: "CW Drama", thumbnail_url: "https://cdn.test/cw.jpg", genre: "romance" },
        ],
      });

      const result = await fetchContinueWatching();
      expect(client.get).toHaveBeenCalledWith("/continue-watching");
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("CW Drama");
    });

    it("unwraps nested data.data", async () => {
      client.get.mockResolvedValue({
        data: { data: [{ id: 2, title: "Nested" }] },
      });

      const result = await fetchContinueWatching();
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("Nested");
    });

    it("returns empty array for non-array data", async () => {
      client.get.mockResolvedValue({ data: { success: true } });

      const result = await fetchContinueWatching();
      expect(result).toEqual([]);
    });
  });

  // ---------------------------------------------------------------------------
  // saveProgress
  // ---------------------------------------------------------------------------
  describe("saveProgress", () => {
    it("sends POST with correct payload", () => {
      client.post.mockResolvedValue({ data: { success: true } });

      saveProgress("ep-123", 120, false);
      expect(client.post).toHaveBeenCalledWith("/episodes/ep-123/progress", {
        progress_seconds: 120,
        is_completed: false,
      });
    });

    it("sends is_completed: true when episode finished", () => {
      client.post.mockResolvedValue({ data: { success: true } });

      saveProgress("ep-456", 300, true);
      expect(client.post).toHaveBeenCalledWith("/episodes/ep-456/progress", {
        progress_seconds: 300,
        is_completed: true,
      });
    });

    it("does not throw on API error (fire-and-forget)", () => {
      client.post.mockRejectedValue(new Error("Network error"));

      // saveProgress returns undefined (not a promise), so it should not throw
      expect(() => saveProgress("ep-1", 60, false)).not.toThrow();
    });

    it("does not return a promise (fire-and-forget pattern)", () => {
      client.post.mockResolvedValue({ data: {} });

      const result = saveProgress("ep-1", 60, false);
      // saveProgress does not use async/await — it starts a promise chain but returns void
      expect(result).toBeUndefined();
    });
  });

  // ---------------------------------------------------------------------------
  // likeDrama
  // ---------------------------------------------------------------------------
  describe("likeDrama", () => {
    it("calls POST /dramas/{id}/like and returns response data", async () => {
      client.post.mockResolvedValue({
        data: { liked: true, total_likes: 101 },
      });

      const result = await likeDrama("love-in-accra");
      expect(client.post).toHaveBeenCalledWith("/dramas/love-in-accra/like");
      expect(result).toEqual({ liked: true, total_likes: 101 });
    });

    it("propagates API errors", async () => {
      client.post.mockRejectedValue(new Error("Unauthorized"));

      await expect(likeDrama("drama-1")).rejects.toThrow("Unauthorized");
    });
  });
});
