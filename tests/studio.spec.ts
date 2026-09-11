import { test, expect, type Page } from "@playwright/test";
import { PNG } from "pngjs";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

function quadrants() {
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
async function importPhoto(page: Page) {
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
async function exportPng(page: Page, grid = false, scale = "1") {
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
function pixel(png: PNG, x: number, y: number) {
  return Array.from(
    png.data.subarray((y * png.width + x) * 4, (y * png.width + x) * 4 + 4),
  );
}

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

test("rotation and flips match exported pixels; undo and redo restore edits", async ({
  page,
}) => {
  await importPhoto(page);
  await page.getByRole("button", { name: "Rotate right", exact: true }).click();
  let png = await exportPng(page);
  expect([png.width, png.height]).toEqual([240, 400]);
  expect(pixel(png, 20, 20)).toEqual([20, 30, 240, 255]);
  await page
    .getByRole("button", { name: "Flip horizontally", exact: true })
    .click();
  png = await exportPng(page);
  expect(pixel(png, 20, 20)).toEqual([240, 20, 30, 255]);
  await page.getByRole("button", { name: "Undo edit" }).click();
  png = await exportPng(page);
  expect(pixel(png, 20, 20)).toEqual([20, 30, 240, 255]);
  await page.getByRole("button", { name: "Redo edit" }).click();
  await page.getByRole("button", { name: "Reset edits" }).click();
  png = await exportPng(page);
  expect([png.width, png.height]).toEqual([400, 240]);
  expect(pixel(png, 20, 20)).toEqual([240, 20, 30, 255]);
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

test("crop corners can be dragged and edits persist between studio tabs", async ({
  page,
}) => {
  await importPhoto(page);
  const handle = page.getByRole("button", {
    name: "Use the arrow keys to move the south east drag handle to change the crop selection area",
  });
  const bounds = await handle.boundingBox();
  expect(bounds).not.toBeNull();
  await page.mouse.move(
    bounds!.x + bounds!.width / 2,
    bounds!.y + bounds!.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(bounds!.x - 65, bounds!.y - 45, { steps: 8 });
  await page.mouse.up();
  await page.getByRole("tab", { name: /Video to photo/ }).click();
  await page.getByRole("tab", { name: "Photo studio" }).click();
  const png = await exportPng(page);
  expect(png.width).toBeLessThan(400);
  expect(png.height).toBeLessThan(240);
  expect(png.width).toBeGreaterThan(200);
});

test("seeks video, captures distinct full-size PNGs, and edits a captured frame", async ({
  page,
}) => {
  await page
    .getByLabel("Open image or video file")
    .setInputFiles(path.resolve("tests/fixtures/motion.mp4"));
  await expect(
    page.getByRole("button", { name: "Capture frame", exact: true }),
  ).toBeEnabled();
  await page.getByLabel("Seek time in seconds").fill("1.25");
  await expect(
    page.getByRole("button", { name: "Capture frame", exact: true }),
  ).toBeEnabled();
  await page
    .getByRole("button", { name: "Capture frame", exact: true })
    .click();
  await expect(page.locator(".capture-card")).toHaveCount(1);
  await expect(page.locator(".capture-caption")).toContainText("00:01.250");
  const downloaded = page.waitForEvent("download");
  await page.getByRole("button", { name: /Download frame at/ }).click();
  const first = PNG.sync.read(readFileSync((await (await downloaded).path())!));
  expect([first.width, first.height]).toEqual([640, 360]);
  await page.getByRole("button", { name: "Step forward" }).click();
  await expect(page.getByLabel("Seek time in seconds")).not.toHaveValue("1.25");
  await page.getByLabel("Seek time in seconds").fill("2.5");
  await expect(
    page.getByRole("button", { name: "Capture frame", exact: true }),
  ).toBeEnabled();
  await page
    .getByRole("button", { name: "Capture frame", exact: true })
    .click();
  await expect(page.locator(".capture-card")).toHaveCount(2);
  const secondDownload = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download frame at 00:02.500" })
    .click();
  const second = PNG.sync.read(
    readFileSync((await (await secondDownload).path())!),
  );
  expect(first.data.equals(second.data)).toBe(false);
  await page
    .getByRole("button", { name: "Edit photo", exact: true })
    .first()
    .click();
  await expect(page.getByRole("tab", { name: "Photo studio" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  const edited = await exportPng(page);
  expect(edited.data.equals(second.data)).toBe(true);
  await page.getByRole("tab", { name: /Video to photo/ }).click();
  await expect(page.locator(".capture-card")).toHaveCount(2);
});

test("failed imports preserve the previous photo and leave editor usable", async ({
  page,
}) => {
  await importPhoto(page);
  await page.getByLabel("Open image or video file").setInputFiles({
    name: "broken.png",
    mimeType: "image/png",
    buffer: Buffer.from("not an image"),
  });
  await expect(page.getByRole("alert")).toContainText("could not be opened");
  await expect(page.getByText("quadrants.png", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Export image" }),
  ).toBeEnabled();
  await page.getByLabel("Open image or video file").setInputFiles({
    name: "broken.ARW",
    mimeType: "application/octet-stream",
    buffer: Buffer.from("not a raw image"),
  });
  await expect(page.getByRole("alert")).toContainText("could not be decoded", {
    timeout: 30000,
  });
  await expect(
    page.getByRole("button", { name: "Export image" }),
  ).toBeEnabled();
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

test("desktop and mobile layouts remain usable without page overflow", async ({
  page,
}) => {
  await page.screenshot({
    path: "test-results/stillroom-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(
    page.getByRole("button", { name: "Export image" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/stillroom-mobile.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "1:1", exact: true }).click();
  await page.getByRole("button", { name: "Export image" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page.getByRole("tab", { name: /Video to photo/ }).click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
