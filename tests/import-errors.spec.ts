import { test, expect } from "@playwright/test";
import { importPhoto } from "./helpers";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByText("alpine-afternoon.jpg", { exact: true }),
  ).toBeVisible();
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
