import { test, expect } from "@playwright/test";
import {
  loginAsPaidUser,
  getTestDrama,
  goToEpisode,
  waitForVideoPlaying,
  waitForEpisodeBadge,
  showControls,
  hideControls,
} from "./helpers";

let dramaSlug: string;

test.describe("Player: Controls", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsPaidUser(page);
    if (!dramaSlug) {
      dramaSlug = await getTestDrama(page);
    }
    await goToEpisode(page, dramaSlug, 1);
    await waitForEpisodeBadge(page, 1);
    await waitForVideoPlaying(page);
  });

  test("pause stops video playback", async ({ page }) => {
    // Ensure video is actively playing before attempting pause
    await waitForVideoPlaying(page);

    await showControls(page);
    await page.getByTestId("player-play-btn").click();
    await page.waitForTimeout(1000);

    const video = page.locator("video").first();
    const paused = await video.evaluate((v: HTMLVideoElement) => v.paused);
    expect(paused).toBe(true);
  });

  test("resume after pause continues playback", async ({ page }) => {
    // Ensure video is actively playing before attempting pause
    await waitForVideoPlaying(page);

    // Pause
    await showControls(page);
    await page.getByTestId("player-play-btn").click();
    await page.waitForTimeout(1000);

    const video = page.locator("video").first();
    const timeAtPause = await video.evaluate((v: HTMLVideoElement) => v.currentTime);

    // Resume
    await showControls(page);
    await page.getByTestId("player-play-btn").click();
    await page.waitForTimeout(2000);

    const timeAfterResume = await video.evaluate((v: HTMLVideoElement) => v.currentTime);
    expect(timeAfterResume).toBeGreaterThan(timeAtPause);
  });

  test("pause survives across 5 seconds (no auto-resume)", async ({ page }) => {
    // Ensure video is actively playing before attempting pause
    await waitForVideoPlaying(page);

    await showControls(page);
    await page.getByTestId("player-play-btn").click();
    await page.waitForTimeout(1000);

    const video = page.locator("video").first();
    const timeAtPause = await video.evaluate((v: HTMLVideoElement) => v.currentTime);

    // Wait 5 seconds
    await page.waitForTimeout(5000);

    const paused = await video.evaluate((v: HTMLVideoElement) => v.paused);
    const timeAfterWait = await video.evaluate((v: HTMLVideoElement) => v.currentTime);

    expect(paused).toBe(true);
    // Allow 1.0s tolerance — buffering can cause small currentTime jumps even when paused
    expect(timeAfterWait - timeAtPause).toBeLessThan(1.0);
  });

  test.fixme("seek forward 10s advances position", async ({ page }) => {
    // Wait for video to accumulate some playtime
    await waitForVideoPlaying(page);
    await page.waitForTimeout(1000);

    const video = page.locator("video").first();
    const timeBefore = await video.evaluate((v: HTMLVideoElement) => v.currentTime);

    // Show controls and immediately tap seek forward via testID
    await showControls(page);
    await page.getByTestId("player-seek-fwd-btn").click();
    await page.waitForTimeout(1000);

    const timeAfter = await video.evaluate((v: HTMLVideoElement) => v.currentTime);
    expect(timeAfter).toBeGreaterThan(timeBefore + 5); // at least 5s forward
  });

  test.fixme("seek backward 10s rewinds position", async ({ page }) => {
    // Set video to 20s so there is room to rewind
    const video = page.locator("video").first();
    await video.evaluate((v: HTMLVideoElement) => { v.currentTime = 20; });
    await page.waitForTimeout(1000);

    const timeBefore = await video.evaluate((v: HTMLVideoElement) => v.currentTime);

    // Show controls and immediately tap seek backward via testID
    await showControls(page);
    await page.getByTestId("player-seek-back-btn").click();
    await page.waitForTimeout(1000);

    const timeAfter = await video.evaluate((v: HTMLVideoElement) => v.currentTime);
    expect(timeAfter).toBeLessThan(timeBefore - 5); // at least 5s back
  });

  test("speed change to 1.5x persists during playback", async ({ page }) => {
    await showControls(page);

    // Retry loop: speed picker may not open reliably on first click
    let pickerVisible = false;
    for (let attempt = 0; attempt < 3; attempt++) {
      await page.getByTestId("speed-btn").click();
      await page.waitForTimeout(500);

      pickerVisible = await page.getByText("1.5x").isVisible().catch(() => false);
      if (pickerVisible) break;

      // Controls may have auto-hidden, re-show them
      await showControls(page);
    }

    if (!pickerVisible) {
      throw new Error("Speed picker did not appear after 3 attempts");
    }

    await page.getByText("1.5x").click();
    await page.waitForTimeout(2000);

    const video = page.locator("video").first();
    const rate = await video.evaluate((v: HTMLVideoElement) => v.playbackRate);
    expect(rate).toBe(1.5);
  });

  test("controls auto-hide after 4 seconds", async ({ page }) => {
    await showControls(page);
    await expect(page.getByTestId("player-play-btn")).toBeVisible({ timeout: 2000 });

    // Wait for auto-hide: CONTROLS_TIMEOUT (4000ms) + fade animation (250ms) + buffer
    await page.waitForTimeout(6500);
    await expect(page.getByTestId("player-play-btn")).not.toBeVisible({ timeout: 3000 });
  });

  // Controls backdrop sits behind all buttons at a lower z-index.
  // Click-to-dismiss is unreliable — any click coordinate overlaps a button.
  // Auto-hide is tested separately above.
  test.fixme("tap toggles controls visibility", async ({ page }) => {
    // Initially controls hidden
    const playBtn = page.getByTestId("player-play-btn");
    await expect(playBtn).not.toBeVisible({ timeout: 2000 });

    // Tap to show
    await showControls(page);
    await expect(playBtn).toBeVisible({ timeout: 2000 });

    // Wait for auto-hide instead of trying to tap dismiss (controls overlay
    // backdrop sits behind all buttons, making click-to-dismiss unreliable).
    await page.waitForTimeout(5000);

    await expect(playBtn).not.toBeVisible({ timeout: 3000 });
  });

  test("progress bar advances during playback", async ({ page }) => {
    // Ensure video is actively playing and note initial time
    const state = await waitForVideoPlaying(page);
    const initialTime = state.currentTime;

    // Wait for playback to advance
    await page.waitForTimeout(3000);

    const video = page.locator("video").first();
    const time = await video.evaluate((v: HTMLVideoElement) => v.currentTime);
    // Video should have advanced from its initial position
    expect(time).toBeGreaterThan(initialTime + 1);
  });

  test("back button exits player", async ({ page }) => {
    await showControls(page);
    await page.getByTestId("player-back-btn").click();
    await page.waitForTimeout(2000);

    // Should no longer be on the player
    const onPlayer = await page.getByTestId("player-back-btn").isVisible().catch(() => false);
    expect(onPlayer).toBe(false);
  });
});
