import { test, expect } from "@playwright/test";
import { importPhoto, exportPng } from "./helpers";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByText("alpine-afternoon.jpg", { exact: true }),
  ).toBeVisible();
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
