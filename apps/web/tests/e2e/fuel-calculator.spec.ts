import { test, expect } from "@playwright/test";

test.describe("Fuel calculator lead capture", () => {
  test("submits email and shows confirmation", async ({ page }) => {
    await page.goto("/en/tools/fuel-calculator");
    await page.getByLabel("Body mass (kg)").fill("72");
    await page.getByLabel("Email").fill("playwright@example.com");
    await page.getByRole("button", { name: "Email me the PDF" }).click();
    await expect(page.getByText("Thanks! Check your inbox" )).toBeVisible();
  });
});
