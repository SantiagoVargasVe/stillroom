import { test, expect } from "@playwright/test";
import { importPhoto, exportPng, pixel } from "./helpers";

test("new edits discard redo history and a slider gesture creates one undo step", async ({
  page,
}) => {
  await page.goto("/");
  await importPhoto(page);
  await page.getByRole("button", { name: "1:1", exact: true }).click();
  await page.getByRole("button", { name: "Rotate right", exact: true }).click();
  await page.getByRole("button", { name: "Undo edit" }).click();
  await expect(page.getByRole("button", { name: "Redo edit" })).toBeEnabled();
  await page.getByRole("button", { name: "4:3", exact: true }).click();
  await expect(page.getByRole("button", { name: "Redo edit" })).toBeDisabled();
  const cropped = await exportPng(page);
  expect([cropped.width, cropped.height]).toEqual([320, 240]);
  await page.getByRole("button", { name: "Reset edits" }).click();
  await page.getByRole("button", { name: "Image adjustments" }).click();
  const exposure = page.getByRole("slider", { name: "Exposure", exact: true });
  await exposure.focus();
  await exposure.press("ArrowRight");
  await expect(exposure).toHaveValue("0.05");
  await exposure.press("Tab");
  await page.getByRole("button", { name: "Undo edit" }).click();
  await expect(exposure).toHaveValue("0");
  const original = await exportPng(page);
  expect(pixel(original, 20, 20)).toEqual([240, 20, 30, 255]);
  await page.getByRole("button", { name: "Redo edit" }).click();
  await expect(exposure).toHaveValue("0.05");
});
