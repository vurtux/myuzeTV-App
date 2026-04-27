import { test, expect } from "@playwright/test";
import { loginAsTestUser } from "./helpers";

test.describe("Profile Screen", () => {
  test("logged-in user sees stats and logout", async ({ page }) => {
    await loginAsTestUser(page);
    await page.getByTestId("tab-profile").click();

    await expect(page.getByText("Test Free User")).toBeVisible();
    await expect(page.getByText("Saved")).toBeVisible();
    await expect(page.getByText("Seen")).toBeVisible();
    await expect(page.getByText("Hours")).toBeVisible();
    await expect(page.getByText("Log Out")).toBeVisible();
  });

  test("edit profile button does not exist", async ({ page }) => {
    await loginAsTestUser(page);
    await page.getByTestId("tab-profile").click();
    await expect(page.getByText("Edit Profile")).not.toBeVisible();
  });

  test("guest user sees Login button not Logout", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("text=Skip for now", { timeout: 30000 });
    await page.getByText("Skip for now").click();
    await page.waitForSelector("[data-testid='tab-home']", { timeout: 10000 });

    await page.getByTestId("tab-profile").click();
    await expect(page.getByText("Guest")).toBeVisible();
    await expect(page.getByText("Log In")).toBeVisible();
    await expect(page.getByText("Log Out")).not.toBeVisible();
  });
});
