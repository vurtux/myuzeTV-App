import { Page, expect } from "@playwright/test";

/**
 * Login as a test user via phone OTP.
 */
export async function loginAsTestUser(page: Page, phone = "0000000001") {
  await page.goto("/");
  await page.waitForSelector("text=Sign in", { timeout: 30000 });

  const countryPicker = page.locator("[data-testid='country-picker']").first();
  await countryPicker.click();
  await page.getByText("United States").click();

  await page.getByPlaceholder("Enter phone number").first().fill(phone);
  await page.getByText("Continue").first().click();

  await page.waitForSelector("text=Enter Code", { timeout: 10000 });

  const otpContainer = page.locator("[data-testid='otp-container']");
  const firstInput = otpContainer.locator("input").first();
  await firstInput.click();
  await firstInput.focus();

  for (const digit of "123456") {
    await page.keyboard.type(digit);
    await page.waitForTimeout(100);
  }

  await page.getByText("Verify & Continue").click();
  await page.waitForSelector("[data-testid='tab-home']", { timeout: 10000 });
}

/**
 * Navigate to the video player from the home screen.
 * Uses the hero "Watch Now" button or first drama card.
 */
export async function navigateToPlayer(page: Page) {
  await page.waitForTimeout(2000);

  // Try hero "Watch Now" button first
  const watchNow = page.getByText("Watch Now").first();
  if (await watchNow.isVisible().catch(() => false)) {
    await watchNow.click();
    // This goes to drama detail — then tap play CTA
    await page.waitForSelector("[data-testid='play-cta-btn']", { timeout: 10000 });
    await page.getByTestId("play-cta-btn").click();
  } else {
    // Fallback: scroll and click first drama title
    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(1000);
    const firstCard = page.locator("[data-testid^='episode-']").first();
    if (await firstCard.isVisible().catch(() => false)) {
      await firstCard.click();
    }
  }

  // Wait for player to load
  await page.waitForTimeout(5000);
}

/**
 * Login shortcuts for free/paid test accounts.
 */
export async function loginAsFreeUser(page: Page) {
  await loginAsTestUser(page, "0000000001");
}

export async function loginAsPaidUser(page: Page) {
  await loginAsTestUser(page, "0000000002");
}

/**
 * Navigate directly to an episode by URL.
 * Waits for a video element to appear.
 */
export async function goToEpisode(page: Page, dramaSlug: string, epNum: number) {
  await page.goto(`/watch/${dramaSlug}-${epNum}`);
  await page.locator("video").first().waitFor({ state: "visible", timeout: 20000 });
  await page.waitForTimeout(2000); // let video initialize

  // Prime the FlatList scroll container — the first wheel event on a fresh page
  // is absorbed by RN's internal scroll handler. A tiny scroll+unscroll activates it.
  const viewport = page.viewportSize()!;
  await page.mouse.move(Math.round(viewport.width * 0.5), Math.round(viewport.height * 0.5));
  await page.mouse.wheel(0, 5);
  await page.waitForTimeout(100);
  await page.mouse.wheel(0, -5);
  await page.waitForTimeout(500);
}

/**
 * Scroll the FlatList container by one screen height using wheel events.
 *
 * RN FlatList on web tracks scroll internally — the first wheel scroll after
 * page load "primes" the native scroll handler but doesn't update viewability.
 * The second scroll reliably works. This function detects the EP badge before
 * and after, and retries once if the badge didn't change.
 */
async function wheelScroll(page: Page, direction: "up" | "down") {
  const viewport = page.viewportSize()!;
  const sign = direction === "up" ? 1 : -1;
  const cx = Math.round(viewport.width * 0.5);
  const cy = Math.round(viewport.height * 0.5);

  await page.mouse.move(cx, cy);

  // Scroll via repeated small wheel events (simulates natural scrolling)
  const totalDelta = viewport.height + 50;
  const steps = 8;
  const deltaPerStep = Math.round(totalDelta / steps) * sign;
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, deltaPerStep);
    await page.waitForTimeout(30);
  }
  await page.waitForTimeout(2500);
}

/**
 * Swipe up (next episode) using wheel events on the FlatList scroll container.
 */
export async function swipeUp(page: Page) {
  await wheelScroll(page, "up");
}

/**
 * Swipe down (previous episode) using wheel events on the FlatList scroll container.
 */
export async function swipeDown(page: Page) {
  await wheelScroll(page, "down");
}

/**
 * Wait until a video element is actively playing (not paused, currentTime > 0).
 * Retries up to `timeout` ms.
 */
export async function waitForVideoPlaying(page: Page, timeout = 15000): Promise<{ currentTime: number; paused: boolean }> {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const videos = page.locator("video");
    const count = await videos.count();
    for (let i = 0; i < count; i++) {
      const state = await videos.nth(i).evaluate((v: HTMLVideoElement) => ({
        currentTime: v.currentTime,
        paused: v.paused,
      })).catch(() => ({ currentTime: 0, paused: true }));
      if (!state.paused && state.currentTime > 0) {
        return state;
      }
    }
    await page.waitForTimeout(300);
  }
  throw new Error(`No video playing after ${timeout}ms`);
}

/**
 * Get the current episode number from the EP badge text ("EP 3 / 20" → 3).
 */
export async function getCurrentEpisodeNumber(page: Page): Promise<number> {
  const badge = page.locator("text=/EP \\d+ \\/ \\d+/").first();
  const text = await badge.textContent({ timeout: 5000 });
  const match = text?.match(/EP (\d+)/);
  if (!match) throw new Error(`Could not parse EP badge: "${text}"`);
  return parseInt(match[1], 10);
}

/**
 * Wait until the EP badge shows a specific episode number.
 * Retries up to `timeout` ms.
 */
export async function waitForEpisodeBadge(page: Page, expectedEpNum: number, timeout = 10000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    try {
      const current = await getCurrentEpisodeNumber(page);
      if (current === expectedEpNum) return;
    } catch {}
    await page.waitForTimeout(300);
  }
  const actual = await getCurrentEpisodeNumber(page).catch(() => "unknown");
  throw new Error(`EP badge expected ${expectedEpNum} but got ${actual} after ${timeout}ms`);
}

/**
 * Discover a test drama slug. Uses env var PLAYWRIGHT_TEST_DRAMA if set,
 * otherwise navigates home and extracts the first drama card link.
 */
export async function getTestDrama(page: Page): Promise<string> {
  const envDrama = process.env.PLAYWRIGHT_TEST_DRAMA;
  if (envDrama) return envDrama;

  // Navigate to home and find first drama link
  await page.goto("/");
  await page.waitForSelector("[data-testid='tab-home']", { timeout: 15000 });
  await page.waitForTimeout(2000);

  // Look for a drama card link (they navigate to /drama/{slug})
  const dramaLink = page.locator("a[href*='/drama/']").first();
  if (await dramaLink.isVisible().catch(() => false)) {
    const href = await dramaLink.getAttribute("href");
    const match = href?.match(/\/drama\/([^/?]+)/);
    if (match) return match[1];
  }

  // Fallback: try "Watch Now" button path
  const watchNow = page.getByText("Watch Now").first();
  if (await watchNow.isVisible().catch(() => false)) {
    await watchNow.click();
    await page.waitForTimeout(2000);
    const url = page.url();
    const match = url.match(/\/drama\/([^/?]+)/);
    if (match) return match[1];
  }

  throw new Error("Could not discover test drama slug. Set PLAYWRIGHT_TEST_DRAMA env var.");
}

/**
 * Show player controls by tapping a non-button area of the screen.
 * When controls are hidden, a full-screen Pressable covers the player.
 * We tap the upper-left quadrant to avoid hitting the center play button
 * or the right-side action buttons.
 */
export async function showControls(page: Page) {
  const viewport = page.viewportSize()!;
  // Tap upper-left area — avoids play button (center), side actions (right), seekbar (bottom)
  await page.mouse.click(Math.round(viewport.width * 0.25), Math.round(viewport.height * 0.35));
  await page.waitForTimeout(500);
}

/**
 * Hide player controls by tapping the semi-transparent backdrop.
 * When controls are visible, the backdrop has an onPress={fadeControlsOut}.
 * We tap the left edge of the screen (15%, 50%) — away from side actions (right),
 * top bar, bottom bar, and center play button.
 */
export async function hideControls(page: Page) {
  const viewport = page.viewportSize()!;
  await page.mouse.click(Math.round(viewport.width * 0.15), Math.round(viewport.height * 0.5));
  await page.waitForTimeout(500);
}
