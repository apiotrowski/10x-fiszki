import { test, expect } from "@playwright/test";

test.describe("Example E2E Test", () => {
  test("should load the homepage", async ({ page }) => {
    await page.goto("/");

    // Wait for page to be loaded
    await page.waitForLoadState("networkidle");

    // Check if page is accessible
    expect(page.url()).toContain("localhost:4321");
  });

  test("should have a title", async ({ page }) => {
    await page.goto("/");

    // Wait for page to be loaded
    await page.waitForLoadState("networkidle");

    // Check if title exists
    await expect(page).toHaveTitle(/.+/);
  });
});
