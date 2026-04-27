jest.mock("../../api/client", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

const client = require("../../api/client").default;
const { fetchRails } = require("../../api/rails");

describe("API: rails.js", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // fetchRails
  // ---------------------------------------------------------------------------
  describe("fetchRails", () => {
    it("calls GET /rails", async () => {
      client.get.mockResolvedValue({ data: [] });

      await fetchRails();
      expect(client.get).toHaveBeenCalledWith("/rails");
    });

    it("returns mapped rails from top-level array", async () => {
      client.get.mockResolvedValue({
        data: [
          {
            id: 1,
            title: "Trending Now",
            slug: "trending-now",
            rail_type: "standard",
            display_order: 1,
            dramas: [
              { slug: "drama-a", title: "Drama A", thumbnail_url: "https://cdn.test/a.jpg", genre: "romance" },
            ],
          },
        ],
      });

      const result = await fetchRails();
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(
        expect.objectContaining({
          id: 1,
          title: "Trending Now",
          slug: "trending-now",
          rail_type: "standard",
          display_order: 1,
        })
      );
      expect(result[0].dramas).toHaveLength(1);
      expect(result[0].dramas[0]).toEqual(
        expect.objectContaining({
          id: "drama-a",
          title: "Drama A",
          image: "https://cdn.test/a.jpg",
          genre: "romance",
        })
      );
    });

    it("unwraps nested data.data array", async () => {
      client.get.mockResolvedValue({
        data: {
          data: [
            {
              id: 1,
              title: "Nested Rail",
              rail_type: "standard",
              dramas: [{ id: 1, title: "D1" }],
            },
          ],
        },
      });

      const result = await fetchRails();
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("Nested Rail");
    });

    it("filters out hero rails", async () => {
      client.get.mockResolvedValue({
        data: [
          {
            id: 1,
            title: "Hero Rail",
            rail_type: "hero",
            dramas: [{ id: 1, title: "D" }],
          },
          {
            id: 2,
            title: "Standard Rail",
            rail_type: "standard",
            dramas: [{ id: 2, title: "D2" }],
          },
        ],
      });

      const result = await fetchRails();
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("Standard Rail");
    });

    it("filters out rails with empty dramas array", async () => {
      client.get.mockResolvedValue({
        data: [
          {
            id: 1,
            title: "Empty Rail",
            rail_type: "standard",
            dramas: [],
          },
          {
            id: 2,
            title: "Has Content",
            rail_type: "standard",
            dramas: [{ id: 1, title: "D" }],
          },
        ],
      });

      const result = await fetchRails();
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("Has Content");
    });

    it("filters out rails with missing dramas property", async () => {
      client.get.mockResolvedValue({
        data: [
          { id: 1, title: "No Dramas", rail_type: "standard" },
          {
            id: 2,
            title: "Has Content",
            rail_type: "standard",
            dramas: [{ id: 1, title: "D" }],
          },
        ],
      });

      const result = await fetchRails();
      expect(result).toHaveLength(1);
    });

    it("sorts rails by display_order ascending", async () => {
      client.get.mockResolvedValue({
        data: [
          { id: 1, title: "Third", rail_type: "standard", display_order: 3, dramas: [{ id: 1, title: "D" }] },
          { id: 2, title: "First", rail_type: "standard", display_order: 1, dramas: [{ id: 2, title: "D" }] },
          { id: 3, title: "Second", rail_type: "standard", display_order: 2, dramas: [{ id: 3, title: "D" }] },
        ],
      });

      const result = await fetchRails();
      expect(result[0].title).toBe("First");
      expect(result[1].title).toBe("Second");
      expect(result[2].title).toBe("Third");
    });

    it("defaults display_order to 0 when missing", async () => {
      client.get.mockResolvedValue({
        data: [
          { id: 1, title: "No Order", rail_type: "standard", dramas: [{ id: 1, title: "D" }] },
          { id: 2, title: "Has Order", rail_type: "standard", display_order: 5, dramas: [{ id: 2, title: "D" }] },
        ],
      });

      const result = await fetchRails();
      expect(result[0].title).toBe("No Order");
      expect(result[0].display_order).toBe(0);
      expect(result[1].title).toBe("Has Order");
    });

    it("maps drama items within rails using field fallback chain", async () => {
      client.get.mockResolvedValue({
        data: [
          {
            id: 1,
            title: "Rail",
            rail_type: "standard",
            dramas: [
              { slug: "slug-a", name: "Name A", banner_url: "https://cdn.test/banner.jpg", category: "action" },
              { drama_id: 99, title: "Title B", media: { thumbnail_url: "https://cdn.test/media.jpg" } },
            ],
          },
        ],
      });

      const result = await fetchRails();
      const dramas = result[0].dramas;
      expect(dramas[0].id).toBe("slug-a");
      expect(dramas[0].title).toBe("Name A");
      expect(dramas[0].genre).toBe("action");
      expect(dramas[0].image).toBe("https://cdn.test/banner.jpg");
      expect(dramas[1].id).toBe("99");
      expect(dramas[1].image).toBe("https://cdn.test/media.jpg");
    });

    it("uses placeholder for dramas with no image", async () => {
      client.get.mockResolvedValue({
        data: [
          {
            id: 1,
            title: "Rail",
            rail_type: "standard",
            dramas: [{ id: 1, title: "No Image Drama" }],
          },
        ],
      });

      const result = await fetchRails();
      expect(result[0].dramas[0].image).toContain("placehold.co");
    });

    it("uses rail slug as title fallback when title is empty", async () => {
      client.get.mockResolvedValue({
        data: [
          {
            id: 1,
            title: "",
            slug: "trending-now",
            rail_type: "standard",
            dramas: [{ id: 1, title: "D" }],
          },
        ],
      });

      const result = await fetchRails();
      expect(result[0].title).toBe("trending-now");
    });

    it("returns empty array for non-array data", async () => {
      client.get.mockResolvedValue({ data: { success: true } });

      const result = await fetchRails();
      expect(result).toEqual([]);
    });

    it("maps optional drama fields (episode, progress, watching, releasedAgo, isNew)", async () => {
      client.get.mockResolvedValue({
        data: [
          {
            id: 1,
            title: "Rail",
            rail_type: "standard",
            dramas: [
              {
                id: 1,
                title: "D",
                episode: 30,
                progress: 0.5,
                watching: "10K",
                released_ago: "3 days ago",
                is_new: true,
              },
            ],
          },
        ],
      });

      const result = await fetchRails();
      const drama = result[0].dramas[0];
      expect(drama.episode).toBe(30);
      expect(drama.progress).toBe(0.5);
      expect(drama.watching).toBe("10K");
      expect(drama.releasedAgo).toBe("3 days ago");
      expect(drama.isNew).toBe(true);
    });

    it("propagates API errors", async () => {
      client.get.mockRejectedValue(new Error("Server Error"));

      await expect(fetchRails()).rejects.toThrow("Server Error");
    });
  });
});
