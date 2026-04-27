import { isRecent } from "../../lib/date-utils";

describe("lib/date-utils", () => {
  describe("isRecent", () => {
    it("returns true for a date within the default 7-day window", () => {
      const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
      expect(isRecent(twoDaysAgo)).toBe(true);
    });

    it("returns true for today", () => {
      const today = new Date().toISOString();
      expect(isRecent(today)).toBe(true);
    });

    it("returns false for a date older than 7 days", () => {
      const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
      expect(isRecent(tenDaysAgo)).toBe(false);
    });

    it("returns false for undefined input", () => {
      expect(isRecent(undefined)).toBe(false);
    });

    it("returns false for empty string input", () => {
      expect(isRecent("")).toBe(false);
    });

    it("supports custom day window", () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
      expect(isRecent(threeDaysAgo, 2)).toBe(false);
      expect(isRecent(threeDaysAgo, 5)).toBe(true);
    });

    it("returns false for future dates", () => {
      const futureDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
      expect(isRecent(futureDate)).toBe(false);
    });

    it("returns true for date exactly on the boundary (7 days)", () => {
      const exactlySevenDays = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      // Due to execution time, this might be right at the edge
      // The function checks diffInDays <= days, so 7 days should be true
      expect(isRecent(exactlySevenDays)).toBe(true);
    });

    it("returns false for invalid date string", () => {
      expect(isRecent("not-a-date")).toBe(false);
    });
  });
});
