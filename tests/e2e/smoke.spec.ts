import { expect, test } from "@playwright/test";

test("home renders header and nav", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: /Painel Macro Brasil/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Visão geral/i })).toBeVisible();
});
