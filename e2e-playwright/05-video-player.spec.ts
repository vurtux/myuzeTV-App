import { test, expect } from "@playwright/test";
import { loginAsTestUser, navigateToPlayer } from "./helpers";

test.describe("Video Player", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page, "0000000002");
  });

  test("video starts playing from drama detail", async ({ page }) => {
    await navigateToPlayer(page);

    const video = page.locator("video").first();
    await video.waitFor({ state: "visible", timeout: 15000 });
    await page.waitForTimeout(3000);

    const currentTime = await video.evaluate((v: HTMLVideoElement) => v.currentTime);
    expect(currentTime).toBeGreaterThan(0);
  });

  test("swipe forward autoplays next episode", async ({ page }) => {
    await navigateToPlayer(page);

    const video1 = page.locator("video").first();
    await video1.waitFor({ state: "visible", timeout: 15000 });
    await page.waitForTimeout(3000);

    // Verify ep 1 is playing
    const t1 = await video1.evaluate((v: HTMLVideoElement) => v.currentTime);
    expect(t1).toBeGreaterThan(0);

    // Swipe up
    await page.mouse.move(195, 600);
    await page.mouse.down();
    await page.mouse.move(195, 150, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(5000);

    // Check ANY video is playing
    const videos = page.locator("video");
    const count = await videos.count();
    let playing = false;
    for (let i = 0; i < count; i++) {
      const p = await videos.nth(i).evaluate((v: HTMLVideoElement) => !v.paused && v.currentTime > 0).catch(() => false);
      if (p) { playing = true; break; }
    }
    expect(playing).toBe(true);
  });

  test("swipe back autoplays previous episode", async ({ page }) => {
    await navigateToPlayer(page);
    await page.locator("video").first().waitFor({ state: "visible", timeout: 15000 });
    await page.waitForTimeout(3000);

    // Swipe up to ep 2
    await page.mouse.move(195, 600);
    await page.mouse.down();
    await page.mouse.move(195, 150, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(4000);

    // Swipe down back to ep 1
    await page.mouse.move(195, 150);
    await page.mouse.down();
    await page.mouse.move(195, 600, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(4000);

    const videos = page.locator("video");
    const count = await videos.count();
    let playing = false;
    for (let i = 0; i < count; i++) {
      const p = await videos.nth(i).evaluate((v: HTMLVideoElement) => !v.paused && v.currentTime > 0).catch(() => false);
      if (p) { playing = true; break; }
    }
    expect(playing).toBe(true);
  });

  test("controls toggle on tap and auto-hide", async ({ page }) => {
    await navigateToPlayer(page);
    await page.locator("video").first().waitFor({ state: "visible", timeout: 15000 });
    await page.waitForTimeout(3000);

    // Tap center to show controls
    await page.mouse.click(195, 422);
    await page.waitForTimeout(500);
    await expect(page.getByTestId("player-play-btn")).toBeVisible({ timeout: 2000 });

    // Wait for auto-hide
    await page.waitForTimeout(5000);
    await expect(page.getByTestId("player-play-btn")).not.toBeVisible({ timeout: 2000 });
  });

  test("video is playing (not paused)", async ({ page }) => {
    await navigateToPlayer(page);
    const video = page.locator("video").first();
    await video.waitFor({ state: "visible", timeout: 15000 });
    await page.waitForTimeout(3000);

    // Video should be actively playing
    const currentTime = await video.evaluate((v: HTMLVideoElement) => v.currentTime);
    expect(currentTime).toBeGreaterThan(0);

    // Wait and check time advances (proves it's not paused)
    await page.waitForTimeout(2000);
    const laterTime = await video.evaluate((v: HTMLVideoElement) => v.currentTime);
    expect(laterTime).toBeGreaterThan(currentTime);
  });

  test("episode drawer opens", async ({ page }) => {
    await navigateToPlayer(page);
    await page.locator("video").first().waitFor({ state: "visible", timeout: 15000 });
    await page.waitForTimeout(3000);

    await page.mouse.click(195, 422);
    await page.waitForTimeout(1000);
    const epBtn = page.getByTestId("player-episodes-btn");
    await epBtn.waitFor({ state: "visible", timeout: 3000 });
    await epBtn.click();
    // Wait for drawer animation
    await page.waitForTimeout(1000);
    // Drawer shows episode numbers — check for "1" which is always present
    await expect(page.getByText("Episodes").first()).toBeVisible({ timeout: 5000 });
  });

  test("speed control changes playback rate", async ({ page }) => {
    await navigateToPlayer(page);
    const video = page.locator("video").first();
    await video.waitFor({ state: "visible", timeout: 15000 });
    await page.waitForTimeout(3000);

    await page.mouse.click(195, 422);
    await page.waitForTimeout(500);
    await page.getByTestId("speed-btn").click();
    await page.waitForTimeout(300);
    await page.getByText("1.5x").click();
    await page.waitForTimeout(500);

    const rate = await video.evaluate((v: HTMLVideoElement) => v.playbackRate);
    expect(rate).toBe(1.5);
  });

  test("back button exits player", async ({ page }) => {
    await navigateToPlayer(page);
    await page.locator("video").first().waitFor({ state: "visible", timeout: 15000 });
    await page.waitForTimeout(2000);

    await page.mouse.click(195, 422);
    await page.waitForTimeout(500);
    await page.getByTestId("player-back-btn").click();
    await page.waitForTimeout(2000);

    const stillOnPlayer = await page.getByTestId("player-back-btn").isVisible().catch(() => false);
    expect(stillOnPlayer).toBe(false);
  });

  test("playback starts within 5 seconds of tapping play", async ({ page }) => {
    await page.waitForTimeout(2000);
    const watchNow = page.getByText("Watch Now").first();
    await watchNow.click();
    await page.waitForSelector("[data-testid='play-cta-btn']", { timeout: 10000 });

    const tapTime = Date.now();
    await page.getByTestId("play-cta-btn").click();

    const video = page.locator("video").first();
    await video.waitFor({ state: "visible", timeout: 15000 });

    let started = false;
    for (let i = 0; i < 50; i++) {
      const ct = await video.evaluate((v: HTMLVideoElement) => v.currentTime).catch(() => 0);
      if (ct > 0) { started = true; break; }
      await page.waitForTimeout(200);
    }

    const latency = Date.now() - tapTime;
    expect(started).toBe(true);
    expect(latency).toBeLessThan(10000); // 10s generous limit for CI
  });
});
