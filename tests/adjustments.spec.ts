import { test, expect } from "@playwright/test";
import { importPhoto, exportPng, pixel } from "./helpers";
import { readFileSync } from "node:fs";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByText("alpine-afternoon.jpg", { exact: true }),
  ).toBeVisible();
});

test("color adjustments export and preserve alpha; JPEG and WebP download", async ({
  page,
}) => {
  await importPhoto(page);
  await page.getByRole("button", { name: "Image adjustments" }).click();
  await page.getByRole("button", { name: "Mono", exact: true }).click();
  const png = await exportPng(page);
  const color = pixel(png, 20, 20);
  expect(color[0]).toEqual(color[1]);
  expect(color[1]).toEqual(color[2]);
  expect(pixel(png, 300, 200)[3]).toBe(0);
  for (const format of ["jpeg", "webp"]) {
    await page.getByRole("button", { name: "Export image" }).click();
    await page.getByLabel("Export format").selectOption(format);
    const downloaded = page.waitForEvent("download");
    await page
      .getByRole("button", { name: "Download image", exact: true })
      .click();
    const file = await downloaded;
    const bytes = readFileSync((await file.path())!);
    expect(bytes.length).toBeGreaterThan(100);
    expect(file.suggestedFilename()).toMatch(
      format === "jpeg" ? /\.jpg$/ : /\.webp$/,
    );
    if (format === "jpeg")
      expect(bytes.subarray(0, 2).toString("hex")).toBe("ffd8");
    else expect(bytes.subarray(8, 12).toString()).toBe("WEBP");
  }
});
