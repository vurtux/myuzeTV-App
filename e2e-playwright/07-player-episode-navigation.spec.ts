import { test, expect } from "@playwright/test";
import {
  loginAsPaidUser,
  getTestDrama,
  goToEpisode,
  swipeUp,
  swipeDown,
  waitForVideoPlaying,
  waitForEpisodeBadge,
  getCurrentEpisodeNumber,
  showControls,
} from "./helpers";

let dramaSlug: string;

test.describe("Player: Episode Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsPaidUser(page);
    if (!dramaSlug) {
      dramaSlug = await getTestDrama(page);
    }
  });

  // RN FlatList on web does not respond to synthetic scroll events (wheel, touch,
  // programmatic) for its internal viewability tracking. Only real user touch on a
  // physical device triggers the scroll->viewability->currentIndex chain.
  // All swipe-dependent tests are marked fixme until this limitation is resolved.

  test.fixme("swipe forward E1→E2 plays E2", async ({ page }) => {
    await goToEpisode(page, dramaSlug, 1);
    await waitForEpisodeBadge(page, 1);
    await waitForVideoPlaying(page);

    await swipeUp(page);

    await waitForEpisodeBadge(page, 2);
    await waitForVideoPlaying(page);
  });

  test.fixme("swipe backward E2→E1 plays E1", async ({ page }) => {
    await goToEpisode(page, dramaSlug, 2);
    await waitForEpisodeBadge(page, 2);
    await waitForVideoPlaying(page);

    await swipeDown(page);

    await waitForEpisodeBadge(page, 1);
    await waitForVideoPlaying(page);
  });

  test.fixme("sequential forward E1→E2→E3 does not get stuck", async ({ page }) => {
    await goToEpisode(page, dramaSlug, 1);
    await waitForEpisodeBadge(page, 1);
    await waitForVideoPlaying(page);

    await swipeUp(page);
    await waitForEpisodeBadge(page, 2);
    await waitForVideoPlaying(page);

    await swipeUp(page);
    await waitForEpisodeBadge(page, 3);
    await waitForVideoPlaying(page);
  });

  test.fixme("sequential backward E5→E4→E3 does not get stuck", async ({ page }) => {
    await goToEpisode(page, dramaSlug, 5);
    await waitForEpisodeBadge(page, 5);
    await waitForVideoPlaying(page);

    await swipeDown(page);
    await waitForEpisodeBadge(page, 4);
    await waitForVideoPlaying(page);

    await swipeDown(page);
    await waitForEpisodeBadge(page, 3);
    await waitForVideoPlaying(page);
  });

  test.fixme("five-episode forward run E1→E5 without skipping", async ({ page }) => {
    await goToEpisode(page, dramaSlug, 1);
    await waitForEpisodeBadge(page, 1);

    for (let ep = 2; ep <= 5; ep++) {
      await swipeUp(page);
      await waitForEpisodeBadge(page, ep, 15000);
      const actual = await getCurrentEpisodeNumber(page);
      expect(actual).toBe(ep);
    }
  });

  test.fixme("five-episode backward run E5→E1 without skipping", async ({ page }) => {
    await goToEpisode(page, dramaSlug, 5);
    await waitForEpisodeBadge(page, 5);

    for (let ep = 4; ep >= 1; ep--) {
      await swipeDown(page);
      await waitForEpisodeBadge(page, ep, 15000);
      const actual = await getCurrentEpisodeNumber(page);
      expect(actual).toBe(ep);
    }
  });

  test.fixme("rapid consecutive swipes do not skip episodes", async ({ page }) => {
    await goToEpisode(page, dramaSlug, 1);
    await waitForEpisodeBadge(page, 1);
    await waitForVideoPlaying(page);

    // Two quick swipes with minimal gap
    await swipeUp(page);
    await page.waitForTimeout(500);
    await swipeUp(page);

    // Should be at E2 or E3 — never E4+
    await page.waitForTimeout(3000);
    const ep = await getCurrentEpisodeNumber(page);
    expect(ep).toBeLessThanOrEqual(3);
    expect(ep).toBeGreaterThanOrEqual(2);
  });

  test.fixme("swipe at first episode bounces (no negative index)", async ({ page }) => {
    await goToEpisode(page, dramaSlug, 1);
    await waitForEpisodeBadge(page, 1);

    await swipeDown(page);
    await page.waitForTimeout(2000);

    const ep = await getCurrentEpisodeNumber(page);
    expect(ep).toBe(1);
  });

  test.fixme("swipe at last episode bounces (no overflow)", async ({ page }) => {
    await goToEpisode(page, dramaSlug, 1);
    await waitForEpisodeBadge(page, 1);

    // Read total from badge ("EP 1 / N")
    const badgeText = await page.locator("text=/EP \\d+ \\/ \\d+/").first().textContent();
    const totalMatch = badgeText?.match(/\/\s*(\d+)/);
    const total = totalMatch ? parseInt(totalMatch[1], 10) : 5;

    await goToEpisode(page, dramaSlug, total);
    await waitForEpisodeBadge(page, total);

    await swipeUp(page);
    await page.waitForTimeout(2000);

    const ep = await getCurrentEpisodeNumber(page);
    expect(ep).toBe(total);
  });

  // Drawer navigation depends on FlatList scrollToIndex which has the same
  // viewability tracking limitation as swipe on web
  test.fixme("episode from drawer plays correct episode", async ({ page }) => {
    await goToEpisode(page, dramaSlug, 1);
    await waitForEpisodeBadge(page, 1);
    await waitForVideoPlaying(page);

    await showControls(page);
    const episodesBtn = page.getByTestId("player-episodes-btn");
    await episodesBtn.waitFor({ state: "visible", timeout: 5000 });
    await episodesBtn.click();
    await page.waitForTimeout(1500);

    const ep4Tile = page.getByTestId("drawer-ep-4");
    await ep4Tile.waitFor({ state: "visible", timeout: 5000 });
    await ep4Tile.click();
    await page.waitForTimeout(3000);

    await waitForEpisodeBadge(page, 4, 15000);
    await waitForVideoPlaying(page);
  });

  // Swipe-dependent: RN FlatList synthetic scroll limitation on web
  test.fixme("URL updates silently on swipe", async ({ page }) => {
    await goToEpisode(page, dramaSlug, 1);
    await waitForEpisodeBadge(page, 1);

    await swipeUp(page);
    await waitForEpisodeBadge(page, 2);

    const url = page.url();
    expect(url).toContain(`${dramaSlug}-2`);
  });
});
