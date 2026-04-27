import { test, expect } from "@playwright/test";
import { loginAsTestUser } from "./helpers";

test.describe("Free vs Paid User Behavior", () => {
  test("free user profile shows correct info", async ({ page }) => {
    await loginAsTestUser(page, "0000000001");
    await page.getByTestId("tab-profile").click();
    await expect(page.getByText("Test Free User")).toBeVisible();
  });

  test("premium user profile shows correct info", async ({ page }) => {
    await loginAsTestUser(page, "0000000002");
    await page.getByTestId("tab-profile").click();
    await expect(page.getByText("Test Premium User")).toBeVisible();
  });

  test("guest user direct /watch URL redirects to login", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("text=Skip for now", { timeout: 30000 });
    await page.getByText("Skip for now").click();
    await page.waitForSelector("[data-testid='tab-home']", { timeout: 10000 });

    await page.goto("/watch/test-drama-1");
    await page.waitForSelector("text=Sign in", { timeout: 15000 });
  });
});
