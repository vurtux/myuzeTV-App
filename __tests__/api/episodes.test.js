jest.mock("../../api/client", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

const client = require("../../api/client").default;
const { fetchEpisodeStream } = require("../../api/episodes");

describe("API: episodes.js", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // fetchEpisodeStream
  // ---------------------------------------------------------------------------
  describe("fetchEpisodeStream", () => {
    it("calls GET /episodes/{id}/stream", async () => {
      client.get.mockResolvedValue({ data: { url: "https://cdn.test/stream.m3u8" } });

      await fetchEpisodeStream("love-in-accra-1");
      expect(client.get).toHaveBeenCalledWith("/episodes/love-in-accra-1/stream");
    });

    it("returns URL from data.url field", async () => {
      client.get.mockResolvedValue({
        data: { url: "https://cdn.test/stream.m3u8" },
      });

      const result = await fetchEpisodeStream("ep-1");
      expect(result).toBe("https://cdn.test/stream.m3u8");
    });

    it("returns URL from data.hls_url field", async () => {
      client.get.mockResolvedValue({
        data: { hls_url: "https://cdn.test/hls.m3u8" },
      });

      const result = await fetchEpisodeStream("ep-2");
      expect(result).toBe("https://cdn.test/hls.m3u8");
    });

    it("returns URL from data.hls field", async () => {
      client.get.mockResolvedValue({
        data: { hls: "https://cdn.test/direct.m3u8" },
      });

      const result = await fetchEpisodeStream("ep-3");
      expect(result).toBe("https://cdn.test/direct.m3u8");
    });

    it("returns URL from data.stream_url field", async () => {
      client.get.mockResolvedValue({
        data: { stream_url: "https://cdn.test/stream-url.m3u8" },
      });

      const result = await fetchEpisodeStream("ep-4");
      expect(result).toBe("https://cdn.test/stream-url.m3u8");
    });

    it("returns string directly when data is a plain string", async () => {
      client.get.mockResolvedValue({
        data: "https://cdn.test/raw-string.m3u8",
      });

      const result = await fetchEpisodeStream("ep-5");
      expect(result).toBe("https://cdn.test/raw-string.m3u8");
    });

    it("returns null when no URL field exists", async () => {
      client.get.mockResolvedValue({
        data: { success: true },
      });

      const result = await fetchEpisodeStream("ep-6");
      expect(result).toBeNull();
    });

    it("returns null when data is an empty object", async () => {
      client.get.mockResolvedValue({ data: {} });

      const result = await fetchEpisodeStream("ep-7");
      expect(result).toBeNull();
    });

    it("returns null when data is null", async () => {
      client.get.mockResolvedValue({ data: null });

      const result = await fetchEpisodeStream("ep-8");
      expect(result).toBeNull();
    });

    it("prioritizes url over hls_url over hls over stream_url", async () => {
      client.get.mockResolvedValue({
        data: {
          url: "https://cdn.test/priority.m3u8",
          hls_url: "https://cdn.test/hls.m3u8",
          hls: "https://cdn.test/hls2.m3u8",
          stream_url: "https://cdn.test/stream.m3u8",
        },
      });

      const result = await fetchEpisodeStream("ep-9");
      expect(result).toBe("https://cdn.test/priority.m3u8");
    });

    it("propagates API errors", async () => {
      client.get.mockRejectedValue(new Error("Forbidden"));

      await expect(fetchEpisodeStream("ep-10")).rejects.toThrow("Forbidden");
    });
  });
});
