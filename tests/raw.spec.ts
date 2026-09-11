import { test, expect } from "@playwright/test";
import { exportPng } from "./helpers";
import { existsSync } from "node:fs";
import path from "node:path";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByText("alpine-afternoon.jpg", { exact: true }),
  ).toBeVisible();
});

test("real Sony RAW decodes with local WASM and exports full resolution", async ({
  page,
}) => {
  test.skip(
    !existsSync("tests/fixtures/example-sony.ARW"),
    "Fetch the documented optional RAW fixture to run this integration test.",
  );
  test.setTimeout(120_000);
  const external: string[] = [];
  page.on("request", (request) => {
    if (
      /^https?:/.test(request.url()) &&
      new URL(request.url()).origin !== new URL(page.url()).origin
    )
      external.push(request.url());
  });
  await page
    .getByLabel("Open image or video file")
    .setInputFiles(path.resolve("tests/fixtures/example-sony.ARW"));
  await expect(page.getByText("example-sony.ARW", { exact: true })).toBeVisible(
    { timeout: 100000 },
  );
  await page.getByRole("button", { name: "File information" }).click();
  await expect(page.getByText("Camera RAW · full decode")).toBeVisible();
  const png = await exportPng(page);
  expect(png.width * png.height).toBeGreaterThan(10_000_000);
  expect(png.data.some((value) => value > 0 && value < 255)).toBe(true);
  expect(external).toEqual([]);
});
