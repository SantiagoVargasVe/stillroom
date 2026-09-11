import { test, expect } from "@playwright/test";
import { importPhoto, exportPng, pixel } from "./helpers";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByText("alpine-afternoon.jpg", { exact: true }),
  ).toBeVisible();
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
