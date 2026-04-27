import { test, expect } from "@playwright/test";
import { loginAsTestUser } from "./helpers";

test.describe("Login Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.goto("/");
  });

  test("shows login screen on first visit", async ({ page }) => {
    await page.waitForSelector("text=Sign in", { timeout: 30000 });
    await expect(page.getByText("Sign in to start watching")).toBeVisible();
  });

  test("guest mode allows browsing but shows Guest on profile", async ({ page }) => {
    await page.waitForSelector("text=Skip for now", { timeout: 30000 });
    await page.getByText("Skip for now").click();
    await page.waitForSelector("[data-testid='tab-home']", { timeout: 10000 });

    await page.getByTestId("tab-profile").click();
    await expect(page.getByText("Guest")).toBeVisible();
    await expect(page.getByText("Log In")).toBeVisible();
  });

  test("login with test free user via phone OTP", async ({ page }) => {
    await loginAsTestUser(page, "0000000001");

    await page.getByTestId("tab-profile").click();
    await expect(page.getByText("Test Free User")).toBeVisible();
    await expect(page.getByText("Log Out")).toBeVisible();
  });

  test("login persists after page refresh", async ({ page }) => {
    await loginAsTestUser(page, "0000000001");

    await page.reload();
    await page.waitForSelector("[data-testid='tab-home']", { timeout: 30000 });

    await page.getByTestId("tab-profile").click();
    await expect(page.getByText("Test Free User")).toBeVisible();
  });

  test("login with premium user", async ({ page }) => {
    await loginAsTestUser(page, "0000000002");

    await page.getByTestId("tab-profile").click();
    await expect(page.getByText("Test Premium User")).toBeVisible();
  });
});
