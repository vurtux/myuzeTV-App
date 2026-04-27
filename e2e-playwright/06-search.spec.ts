import { test, expect } from "@playwright/test";
import { loginAsTestUser } from "./helpers";

test.describe("Search Feature", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test("search overlay opens from top bar", async ({ page }) => {
    await page.getByTestId("search-btn").click();
    await page.waitForTimeout(500);

    // Search input should be visible and focused
    await expect(page.getByPlaceholder("Search dramas, genres...")).toBeVisible({ timeout: 3000 });
  });

  test("trending searches shown by default", async ({ page }) => {
    await page.getByTestId("search-btn").click();
    await page.waitForTimeout(500);

    // Should show "Trending searches" header
    await expect(page.getByText("Trending searches")).toBeVisible({ timeout: 3000 });

    // Should show trending items
    await expect(page.getByText("Love in Accra")).toBeVisible();
    await expect(page.getByText("CEO Secret")).toBeVisible();
  });

  test("typing a query filters dramas", async ({ page }) => {
    await page.getByTestId("search-btn").click();
    await page.waitForTimeout(500);

    // Type a search query
    await page.getByPlaceholder("Search dramas, genres...").fill("love");

    // Wait for debounce (300ms) + render
    await page.waitForTimeout(600);

    // Should show result count (not trending)
    await expect(page.getByText("Trending searches")).not.toBeVisible();
    // Should show "N result(s)" text
    await expect(page.getByText(/\d+ result/)).toBeVisible({ timeout: 3000 });
  });

  test("clearing search query returns to trending", async ({ page }) => {
    await page.getByTestId("search-btn").click();
    await page.waitForTimeout(500);

    // Type then clear
    const searchInput = page.getByPlaceholder("Search dramas, genres...");
    await searchInput.fill("love");
    await page.waitForTimeout(600);

    // Clear the input — tap the X button
    await searchInput.fill("");
    await page.waitForTimeout(600);

    // Should return to trending
    await expect(page.getByText("Trending searches")).toBeVisible({ timeout: 3000 });
  });

  test("genre chip filters results", async ({ page }) => {
    await page.getByTestId("search-btn").click();
    await page.waitForTimeout(500);

    // Tap Romance genre chip
    await page.locator("text=Romance").last().click({ force: true });
    await page.waitForTimeout(500);

    // Should show results (not trending)
    await expect(page.getByText("Trending searches")).not.toBeVisible();
    await expect(page.getByText(/\d+ result/)).toBeVisible({ timeout: 3000 });
  });

  test("genre chip + query applies both filters", async ({ page }) => {
    await page.getByTestId("search-btn").click();
    await page.waitForTimeout(500);

    // Select genre
    await page.locator("text=Romance").last().click({ force: true });
    await page.waitForTimeout(300);

    // Type query
    await page.getByPlaceholder("Search dramas, genres...").fill("love");
    await page.waitForTimeout(600);

    // Should show filtered results
    await expect(page.getByText(/\d+ result/)).toBeVisible({ timeout: 3000 });
  });

  test("no results shows empty state", async ({ page }) => {
    await page.getByTestId("search-btn").click();
    await page.waitForTimeout(500);

    // Type a query that won't match anything
    await page.getByPlaceholder("Search dramas, genres...").fill("xyzzynonexistent999");
    await page.waitForTimeout(600);

    // Should show "No dramas found" message
    await expect(page.getByText("No dramas found")).toBeVisible({ timeout: 3000 });
  });

  test("tapping trending search fills the query", async ({ page }) => {
    await page.getByTestId("search-btn").click();
    await page.waitForTimeout(500);

    // Tap a trending search
    await page.getByText("Love in Accra").click();
    await page.waitForTimeout(600);

    // Should now be filtering (not showing trending)
    // The input should contain the trending term
    const inputValue = await page.getByPlaceholder("Search dramas, genres...").inputValue();
    expect(inputValue).toBe("Love in Accra");
  });

  test("cancel button closes search overlay", async ({ page }) => {
    await page.getByTestId("search-btn").click();
    await page.waitForTimeout(500);

    // Tap Cancel
    await page.getByText("Cancel").click();
    await page.waitForTimeout(500);

    // Search overlay should be gone — home screen visible
    await expect(page.getByPlaceholder("Search dramas, genres...")).not.toBeVisible();
  });

  test("search results are displayed for genre filter", async ({ page }) => {
    await page.getByTestId("search-btn").click();
    await page.waitForTimeout(500);

    // Select a genre to show results
    await page.locator("text=Romance").last().click({ force: true });
    await page.waitForTimeout(500);

    // Should show result count
    await expect(page.getByText(/\d+ result/)).toBeVisible({ timeout: 3000 });
  });
});
