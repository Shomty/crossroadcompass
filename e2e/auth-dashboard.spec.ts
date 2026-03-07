import { test, expect } from "@playwright/test";

/**
 * E2E: Dev sign-in → redirect to home → dashboard (or onboarding) is visible.
 * Requires NODE_ENV=development so /api/dev-signin is enabled.
 */
test.describe("auth and dashboard", () => {
  test("dev sign-in redirects to app and dashboard is visible", async ({ page }) => {
    await page.goto("/api/dev-signin?email=e2e@test.com");
    await expect(page).toHaveURL(/\/(dashboard)?(\?.*)?$/, { timeout: 10000 });
    await page.waitForURL(/\/dashboard/, { timeout: 5000 }).catch(() => {});
    await expect(page.getByText("Personal Dashboard").or(page.getByText(/Good\s/))).toBeVisible({ timeout: 10000 });
  });
});
