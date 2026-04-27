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
  fetchWatchlist,
  addToWatchlist,
  removeFromWatchlist,
} = require("../../api/watchlist");

describe("API: watchlist.js", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // fetchWatchlist
  // ---------------------------------------------------------------------------
  describe("fetchWatchlist", () => {
    it("returns mapped items from top-level array", async () => {
      client.get.mockResolvedValue({
        data: [
          {
            slug: "love-in-accra",
            title: "Love in Accra",
            thumbnail_url: "https://cdn.test/thumb.jpg",
            genre: "romance",
            total_episodes: 20,
          },
        ],
      });

      const result = await fetchWatchlist();
      expect(client.get).toHaveBeenCalledWith("/watchlist");
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(
        expect.objectContaining({
          id: "love-in-accra",
          title: "Love in Accra",
          image: "https://cdn.test/thumb.jpg",
          genre: "romance",
          episodeCount: 20,
        })
      );
    });

    it("unwraps nested data.data array", async () => {
      client.get.mockResolvedValue({
        data: {
          data: [{ id: 5, title: "Nested Drama", genre: "thriller" }],
        },
      });

      const result = await fetchWatchlist();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("5");
    });

    it("returns empty array for non-array data", async () => {
      client.get.mockResolvedValue({ data: { success: true } });

      const result = await fetchWatchlist();
      expect(result).toEqual([]);
    });

    it("maps id from slug first, then id, then drama_id", async () => {
      client.get.mockResolvedValue({
        data: [
          { slug: "my-slug", id: 1, title: "A" },
          { id: 2, title: "B" },
          { drama_id: 3, title: "C" },
        ],
      });

      const result = await fetchWatchlist();
      expect(result[0].id).toBe("my-slug");
      expect(result[1].id).toBe("2");
      expect(result[2].id).toBe("3");
    });

    it("maps title from title first, then name", async () => {
      client.get.mockResolvedValue({
        data: [
          { id: 1, title: "Title Field" },
          { id: 2, name: "Name Field" },
        ],
      });

      const result = await fetchWatchlist();
      expect(result[0].title).toBe("Title Field");
      expect(result[1].title).toBe("Name Field");
    });

    it("resolves images through the fallback chain", async () => {
      client.get.mockResolvedValue({
        data: [
          { id: 1, title: "T", banner_url: "https://cdn.test/banner.jpg" },
          { id: 2, title: "T2", poster: "https://cdn.test/poster.jpg" },
          { id: 3, title: "T3", media: { thumbnail_url: "https://cdn.test/media.jpg" } },
        ],
      });

      const result = await fetchWatchlist();
      expect(result[0].image).toBe("https://cdn.test/banner.jpg");
      expect(result[1].image).toBe("https://cdn.test/poster.jpg");
      expect(result[2].image).toBe("https://cdn.test/media.jpg");
    });

    it("uses placeholder when no image exists", async () => {
      client.get.mockResolvedValue({
        data: [{ id: 1, title: "No Pic" }],
      });

      const result = await fetchWatchlist();
      expect(result[0].image).toContain("placehold.co");
    });

    it("maps genre from genre first, then category", async () => {
      client.get.mockResolvedValue({
        data: [
          { id: 1, title: "T", genre: "romance" },
          { id: 2, title: "T2", category: "comedy" },
        ],
      });

      const result = await fetchWatchlist();
      expect(result[0].genre).toBe("romance");
      expect(result[1].genre).toBe("comedy");
    });

    it("maps episodeCount from total_episodes, then episode", async () => {
      client.get.mockResolvedValue({
        data: [
          { id: 1, title: "T", total_episodes: 30 },
          { id: 2, title: "T2", episode: "Ep 5 of 20" },
        ],
      });

      const result = await fetchWatchlist();
      expect(result[0].episodeCount).toBe(30);
      expect(result[1].episodeCount).toBe("Ep 5 of 20");
    });

    it("maps optional fields (progress, watching, releasedAgo, isNew)", async () => {
      client.get.mockResolvedValue({
        data: [
          {
            id: 1,
            title: "T",
            progress: 0.75,
            watching: "5K",
            released_ago: "yesterday",
            is_new: true,
          },
        ],
      });

      const result = await fetchWatchlist();
      expect(result[0]).toEqual(
        expect.objectContaining({
          progress: 0.75,
          watching: "5K",
          releasedAgo: "yesterday",
          isNew: true,
        })
      );
    });

    it("propagates API errors", async () => {
      client.get.mockRejectedValue(new Error("Server Error"));

      await expect(fetchWatchlist()).rejects.toThrow("Server Error");
    });
  });

  // ---------------------------------------------------------------------------
  // addToWatchlist
  // ---------------------------------------------------------------------------
  describe("addToWatchlist", () => {
    it("sends POST with drama_id in body", async () => {
      client.post.mockResolvedValue({ data: { success: true } });

      const result = await addToWatchlist("love-in-accra");
      expect(client.post).toHaveBeenCalledWith("/watchlist", {
        drama_id: "love-in-accra",
      });
      expect(result).toEqual({ success: true });
    });

    it("works with numeric drama ID", async () => {
      client.post.mockResolvedValue({ data: { success: true } });

      await addToWatchlist(42);
      expect(client.post).toHaveBeenCalledWith("/watchlist", {
        drama_id: 42,
      });
    });

    it("propagates API errors", async () => {
      client.post.mockRejectedValue(new Error("Conflict"));

      await expect(addToWatchlist("drama-1")).rejects.toThrow("Conflict");
    });
  });

  // ---------------------------------------------------------------------------
  // removeFromWatchlist
  // ---------------------------------------------------------------------------
  describe("removeFromWatchlist", () => {
    it("sends DELETE /watchlist/{dramaId}", async () => {
      client.delete.mockResolvedValue({ data: { success: true } });

      const result = await removeFromWatchlist("love-in-accra");
      expect(client.delete).toHaveBeenCalledWith("/watchlist/love-in-accra");
      expect(result).toEqual({ success: true });
    });

    it("works with numeric drama ID", async () => {
      client.delete.mockResolvedValue({ data: { success: true } });

      await removeFromWatchlist(42);
      expect(client.delete).toHaveBeenCalledWith("/watchlist/42");
    });

    it("propagates API errors", async () => {
      client.delete.mockRejectedValue(new Error("Not Found"));

      await expect(removeFromWatchlist("drama-1")).rejects.toThrow("Not Found");
    });
  });
});
