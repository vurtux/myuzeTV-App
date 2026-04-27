/**
 * Player tests on physical Android device via Chrome CDP.
 * Uses real touch gestures — tests the exact QA bugs reported.
 *
 * Run: npx playwright test e2e-playwright/device-player-test.spec.ts --config e2e-playwright/device-test.config.ts
 */
import { test, expect, type Page, type BrowserContext } from "@playwright/test";

const APP_URL = "http://192.168.29.72:8082";

async function loginAsPaidUser(page: Page) {
  await page.goto(APP_URL);
  await page.waitForSelector("text=Sign in", { timeout: 60000 });

  const countryPicker = page.locator("[data-testid='country-picker']").first();
  await countryPicker.click();
  await page.getByText("United States").click();

  await page.getByPlaceholder("Enter phone number").first().fill("0000000002");
  await page.getByText("Continue").first().click();

  await page.waitForSelector("text=Enter Code", { timeout: 15000 });

  const otpContainer = page.locator("[data-testid='otp-container']");
  const firstInput = otpContainer.locator("input").first();
  await firstInput.click();
  await firstInput.focus();

  for (const digit of "123456") {
    await page.keyboard.type(digit);
    await page.waitForTimeout(100);
  }

  await page.getByText("Verify & Continue").click();
  await page.waitForSelector("[data-testid='tab-home']", { timeout: 15000 });
}

async function loginAsFreeUser(page: Page) {
  await page.goto(APP_URL);
  await page.waitForSelector("text=Sign in", { timeout: 60000 });

  const countryPicker = page.locator("[data-testid='country-picker']").first();
  await countryPicker.click();
  await page.getByText("United States").click();

  await page.getByPlaceholder("Enter phone number").first().fill("0000000001");
  await page.getByText("Continue").first().click();

  await page.waitForSelector("text=Enter Code", { timeout: 15000 });

  const otpContainer = page.locator("[data-testid='otp-container']");
  const firstInput = otpContainer.locator("input").first();
  await firstInput.click();
  await firstInput.focus();

  for (const digit of "123456") {
    await page.keyboard.type(digit);
    await page.waitForTimeout(100);
  }

  await page.getByText("Verify & Continue").click();
  await page.waitForSelector("[data-testid='tab-home']", { timeout: 15000 });
}

async function getTestDrama(page: Page): Promise<string> {
  // Navigate home and find first drama
  await page.waitForSelector("[data-testid='tab-home']", { timeout: 15000 });
  await page.waitForTimeout(3000);

  // Try to find a drama link
  const dramaLink = page.locator("a[href*='/drama/']").first();
  if (await dramaLink.isVisible().catch(() => false)) {
    const href = await dramaLink.getAttribute("href");
    const match = href?.match(/\/drama\/([^/?]+)/);
    if (match) return match[1];
  }

  // Fallback: click Watch Now → extract slug from URL
  const watchNow = page.getByText("Watch Now").first();
  if (await watchNow.isVisible().catch(() => false)) {
    await watchNow.click();
    await page.waitForTimeout(3000);
    const url = page.url();
    const match = url.match(/\/drama\/([^/?]+)/);
    if (match) return match[1];
  }

  throw new Error("Could not find test drama");
}

async function goToEpisode(page: Page, slug: string, ep: number) {
  await page.goto(`${APP_URL}/watch/${slug}-${ep}`);
  await page.locator("video").first().waitFor({ state: "visible", timeout: 30000 });
  await page.waitForTimeout(3000);
}

async function getCurrentEp(page: Page): Promise<number> {
  const badge = page.locator("text=/EP \\d+ \\/ \\d+/").first();
  const text = await badge.textContent({ timeout: 5000 });
  const match = text?.match(/EP (\d+)/);
  if (!match) throw new Error(`Could not parse EP badge: "${text}"`);
  return parseInt(match[1], 10);
}

async function waitForEp(page: Page, expected: number, timeout = 15000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    try {
      const current = await getCurrentEp(page);
      if (current === expected) return;
    } catch {}
    await page.waitForTimeout(300);
  }
  const actual = await getCurrentEp(page).catch(() => "unknown");
  throw new Error(`Expected EP ${expected} but got ${actual} after ${timeout}ms`);
}

/**
 * Real touch swipe using CDP Input.dispatchTouchEvent.
 * This produces REAL touch events that trigger FlatList's scroll handlers.
 */
async function touchSwipeUp(page: Page) {
  const viewport = page.viewportSize() ?? { width: 393, height: 851 };
  const cx = Math.round(viewport.width * 0.5);
  const startY = Math.round(viewport.height * 0.7);
  const endY = Math.round(viewport.height * 0.2);
  const steps = 12;

  const client = await page.context().newCDPSession(page);

  await client.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: cx, y: startY }],
  });

  for (let i = 1; i <= steps; i++) {
    const y = Math.round(startY + (endY - startY) * (i / steps));
    await client.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: cx, y }],
    });
    await page.waitForTimeout(20);
  }

  await client.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });

  await page.waitForTimeout(3000); // wait for snap + video load
}

async function touchSwipeDown(page: Page) {
  const viewport = page.viewportSize() ?? { width: 393, height: 851 };
  const cx = Math.round(viewport.width * 0.5);
  const startY = Math.round(viewport.height * 0.2);
  const endY = Math.round(viewport.height * 0.7);
  const steps = 12;

  const client = await page.context().newCDPSession(page);

  await client.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: cx, y: startY }],
  });

  for (let i = 1; i <= steps; i++) {
    const y = Math.round(startY + (endY - startY) * (i / steps));
    await client.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: cx, y }],
    });
    await page.waitForTimeout(20);
  }

  await client.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });

  await page.waitForTimeout(3000);
}

async function touchTap(page: Page, x: number, y: number) {
  const client = await page.context().newCDPSession(page);
  await client.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x, y }],
  });
  await page.waitForTimeout(50);
  await client.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await page.waitForTimeout(300);
}

// ─── Tests ────────────────────────────────────────────────────────

let dramaSlug: string;

test.describe("Device: Episode Navigation", () => {
  test.beforeAll(async ({ browser }) => {
    const context = browser.contexts()[0] ?? await browser.newContext();
    const page = context.pages()[0] ?? await context.newPage();
    await loginAsPaidUser(page);
    dramaSlug = await getTestDrama(page);
  });

  test("swipe forward E1→E2 plays E2", async ({ browser }) => {
    const page = browser.contexts()[0].pages()[0];
    await goToEpisode(page, dramaSlug, 1);
    await waitForEp(page, 1);

    await touchSwipeUp(page);
    await waitForEp(page, 2);
  });

  test("sequential forward E1→E2→E3 does NOT get stuck", async ({ browser }) => {
    const page = browser.contexts()[0].pages()[0];
    await goToEpisode(page, dramaSlug, 1);
    await waitForEp(page, 1);

    await touchSwipeUp(page);
    await waitForEp(page, 2);

    await touchSwipeUp(page);
    await waitForEp(page, 3);
  });

  test("sequential backward E5→E4→E3 does NOT get stuck", async ({ browser }) => {
    const page = browser.contexts()[0].pages()[0];
    await goToEpisode(page, dramaSlug, 5);
    await waitForEp(page, 5);

    await touchSwipeDown(page);
    await waitForEp(page, 4);

    await touchSwipeDown(page);
    await waitForEp(page, 3);
  });

  test("five-episode forward run E1→E5 without skipping", async ({ browser }) => {
    const page = browser.contexts()[0].pages()[0];
    await goToEpisode(page, dramaSlug, 1);
    await waitForEp(page, 1);

    for (let ep = 2; ep <= 5; ep++) {
      await touchSwipeUp(page);
      await waitForEp(page, ep);
    }
  });

  test("swipe backward E2→E1", async ({ browser }) => {
    const page = browser.contexts()[0].pages()[0];
    await goToEpisode(page, dramaSlug, 2);
    await waitForEp(page, 2);

    await touchSwipeDown(page);
    await waitForEp(page, 1);
  });
});

test.describe("Device: Pause Controls", () => {
  test("pause stops playback and survives 5 seconds", async ({ browser }) => {
    const context = browser.contexts()[0] ?? await browser.newContext();
    const page = context.pages()[0] ?? await context.newPage();

    if (!dramaSlug) {
      await loginAsPaidUser(page);
      dramaSlug = await getTestDrama(page);
    }

    await goToEpisode(page, dramaSlug, 1);
    await waitForEp(page, 1);

    // Wait for video to start playing
    await page.waitForTimeout(3000);

    const viewport = page.viewportSize() ?? { width: 393, height: 851 };

    // Tap to show controls
    await touchTap(page, Math.round(viewport.width * 0.25), Math.round(viewport.height * 0.35));
    await page.waitForTimeout(500);

    // Tap play/pause button
    await page.getByTestId("player-play-btn").click();
    await page.waitForTimeout(1000);

    const video = page.locator("video").first();
    const paused = await video.evaluate((v: HTMLVideoElement) => v.paused);
    expect(paused).toBe(true);

    // Wait 5 seconds — should STILL be paused
    const timeAtPause = await video.evaluate((v: HTMLVideoElement) => v.currentTime);
    await page.waitForTimeout(5000);
    const stillPaused = await video.evaluate((v: HTMLVideoElement) => v.paused);
    const timeAfter = await video.evaluate((v: HTMLVideoElement) => v.currentTime);

    expect(stillPaused).toBe(true);
    expect(timeAfter - timeAtPause).toBeLessThan(0.5);
  });
});

test.describe("Device: Lock Enforcement", () => {
  test("free user swipe to locked episode redirects", async ({ browser }) => {
    const context = browser.contexts()[0] ?? await browser.newContext();
    const page = context.pages()[0] ?? await context.newPage();

    await loginAsFreeUser(page);
    if (!dramaSlug) {
      dramaSlug = await getTestDrama(page);
    }

    await goToEpisode(page, dramaSlug, 1);
    await waitForEp(page, 1);

    // Swipe through episodes until we hit a lock redirect
    let redirected = false;
    for (let i = 0; i < 6; i++) {
      await touchSwipeUp(page);
      await page.waitForTimeout(2000);

      const url = page.url();
      if (url.includes("/subscribe") || url.includes("/login")) {
        redirected = true;
        break;
      }
    }

    expect(redirected).toBe(true);
  });
});
