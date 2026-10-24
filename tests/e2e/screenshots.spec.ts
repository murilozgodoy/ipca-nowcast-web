/**
 * Generates full-page screenshots of every dashboard route for the README.
 * Runs against the dev server with VITE_USE_MOCKS=true (configured in
 * playwright.config.ts) so results are deterministic.
 */

import { expect, test } from "@playwright/test";

const PAGES: Array<{ path: string; name: string; waitFor: string }> = [
  { path: "/", name: "01-home", waitFor: "Painel Macro Brasil" },
  { path: "/inflacao", name: "02-inflacao", waitFor: "Inflação" },
  { path: "/modelos", name: "03-modelos", waitFor: "Modelos" },
  { path: "/acompanhamento", name: "04-acompanhamento", waitFor: "Acompanhamento ao vivo" },
  { path: "/series", name: "05-series", waitFor: "Séries" },
  { path: "/metodologia", name: "06-metodologia", waitFor: "Metodologia" },
  { path: "/sobre", name: "07-sobre", waitFor: "Sobre" },
];

test.describe("README screenshots", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  for (const page of PAGES) {
    test(`captures ${page.name}`, async ({ page: pw }) => {
      const errors: string[] = [];
      pw.on("pageerror", (err) => errors.push(err.message));
      pw.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text());
      });
      await pw.goto(page.path, { waitUntil: "domcontentloaded" });
      await expect(
        pw
          .getByRole("heading", { name: new RegExp(`^${page.waitFor}$`, "i"), exact: true })
          .first(),
      ).toBeVisible({ timeout: 15_000 });
      // Wait for charts and data to settle.
      await pw.waitForTimeout(2500);
      await pw.evaluate(() => window.scrollTo(0, 0));
      await pw.waitForTimeout(300);
      await pw.screenshot({
        path: `docs/images/${page.name}.png`,
        fullPage: false,
        animations: "disabled",
      });
      expect(errors, `page errors on ${page.path}: ${errors.join("; ")}`).toEqual([]);
    });
  }
});
