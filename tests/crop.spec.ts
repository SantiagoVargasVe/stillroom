import { test, expect } from "@playwright/test";
import { importPhoto, exportPng, pixel } from "./helpers";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByText("alpine-afternoon.jpg", { exact: true }),
  ).toBeVisible();
});

test("crop exports correct pixels and dimensions; grids are opt-in", async ({
  page,
}) => {
  await importPhoto(page);
  await page.getByRole("button", { name: "1:1", exact: true }).click();
  const png = await exportPng(page);
  expect([png.width, png.height]).toEqual([240, 240]);
  expect(pixel(png, 10, 10)).toEqual([240, 20, 30, 255]);
  expect(pixel(png, 200, 10)).toEqual([20, 230, 40, 255]);
  expect(pixel(png, 80, 30)).toEqual([240, 20, 30, 255]);
  const withGrid = await exportPng(page, true);
  expect(pixel(withGrid, 80, 30)[1]).toBeGreaterThan(60);
  const half = await exportPng(page, false, "0.5");
  expect([half.width, half.height]).toEqual([120, 120]);
});
