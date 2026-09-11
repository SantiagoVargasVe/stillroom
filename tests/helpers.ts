import { expect, type Page } from "@playwright/test";
import { PNG } from "pngjs";
import { readFileSync } from "node:fs";
export function quadrants() {
  const png = new PNG({ width: 400, height: 240 });
  const colors = [
    [240, 20, 30, 255],
    [20, 230, 40, 255],
    [20, 30, 240, 255],
    [230, 220, 20, 0],
  ];
  for (let y = 0; y < png.height; y++)
    for (let x = 0; x < png.width; x++) {
      const color = colors[(y >= 120 ? 2 : 0) + (x >= 200 ? 1 : 0)];
      png.data.set(color, (y * png.width + x) * 4);
    }
  return PNG.sync.write(png);
}
export async function importPhoto(page: Page) {
  await page.getByLabel("Open image or video file").setInputFiles({
    name: "quadrants.png",
    mimeType: "image/png",
    buffer: quadrants(),
  });
  await expect(page.getByText("quadrants.png", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Export image" }),
  ).toBeEnabled();
}
export async function exportPng(page: Page, grid = false, scale = "1") {
  await page.getByRole("button", { name: "Export image" }).click();
  await page.getByLabel("Export size").selectOption(scale);
  if (grid) await page.getByLabel("Include composition grid in export").check();
  const downloaded = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download image", exact: true })
    .click();
  const download = await downloaded;
  const png = PNG.sync.read(readFileSync((await download.path())!));
  await expect(page.getByRole("dialog")).toHaveCount(0);
  return png;
}
export function pixel(png: PNG, x: number, y: number) {
  return Array.from(
    png.data.subarray((y * png.width + x) * 4, (y * png.width + x) * 4 + 4),
  );
}
