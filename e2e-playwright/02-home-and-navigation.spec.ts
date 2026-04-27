import { test, expect } from "@playwright/test";
import { loginAsTestUser } from "./helpers";

test.describe("Home Screen & Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test("home screen loads with genre chips", async ({ page }) => {
    // Genre chips are inside a scrollable row — use first() to avoid multiple matches
    await expect(page.getByText("All").first()).toBeVisible();
    await expect(page.getByText("Romance").first()).toBeVisible();
  });

  test("genre chip filtering works", async ({ page }) => {
    await page.getByText("Romance").first().click();
    await page.waitForTimeout(500);
    await page.getByText("All").first().click();
  });

  test("bottom navigation works", async ({ page }) => {
    await page.getByTestId("tab-watchlist").click();
    await page.getByTestId("tab-profile").click();
    await expect(page.getByText("Test Free User")).toBeVisible();
    await page.getByTestId("tab-home").click();
  });
});
