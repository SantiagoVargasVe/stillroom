import { test, expect } from "@playwright/test";
import { exportPng } from "./helpers";
import { PNG } from "pngjs";
import { readFileSync } from "node:fs";
import path from "node:path";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByText("alpine-afternoon.jpg", { exact: true }),
  ).toBeVisible();
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
