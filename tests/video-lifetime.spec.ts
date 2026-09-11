import { test, expect } from "@playwright/test";
import path from "node:path";

declare global {
  interface Window {
    finishEncoding?: () => void;
    createdUrls: number;
    revokedUrls: number;
  }
}

test("replacing a video disposes captures and ignores an unfinished encoding", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByText("alpine-afternoon.jpg", { exact: true }),
  ).toBeVisible();
  await page.evaluate(() => {
    const create = URL.createObjectURL,
      revoke = URL.revokeObjectURL;
    window.createdUrls = window.revokedUrls = 0;
    URL.createObjectURL = (object) => {
      window.createdUrls++;
      return create(object);
    };
    URL.revokeObjectURL = (url) => {
      window.revokedUrls++;
      revoke(url);
    };
  });
  const picker = page.getByLabel("Open image or video file");
  const capture = page.getByRole("button", {
    name: "Capture frame",
    exact: true,
  });
  await picker.setInputFiles(path.resolve("tests/fixtures/motion.mp4"));
  await expect(capture).toBeEnabled();
  await capture.click();
  await expect(page.locator(".capture-card")).toHaveCount(1);
  await page.getByRole("button", { name: "Dismiss notification" }).click();
  await page.evaluate(() => {
    const encode = HTMLCanvasElement.prototype.toBlob;
    HTMLCanvasElement.prototype.toBlob = function (callback, type, quality) {
      encode.call(
        this,
        (blob) => {
          window.finishEncoding = () => callback(blob);
        },
        type,
        quality,
      );
      HTMLCanvasElement.prototype.toBlob = encode;
    };
  });
  await capture.click();
  await page.waitForFunction(() => !!window.finishEncoding);
  await picker.setInputFiles(path.resolve("tests/fixtures/motion.mp4"));
  await expect(capture).toBeEnabled();
  await page.evaluate(async () => {
    window.finishEncoding!();
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
  await expect(page.locator(".capture-card")).toHaveCount(0);
  await expect(page.locator(".toast")).toHaveCount(0);
  // Only the replacement video's source remains owned by the video workspace.
  expect(
    await page.evaluate(() => window.createdUrls - window.revokedUrls),
  ).toBe(1);
  await capture.click();
  await expect(page.locator(".capture-card")).toHaveCount(1);
  await page.getByRole("button", { name: /Remove frame at/ }).click();
  expect(
    await page.evaluate(() => window.createdUrls - window.revokedUrls),
  ).toBe(1);
  await page.getByRole("button", { name: "Play video" }).click();
  await expect(page.getByRole("button", { name: "Pause video" })).toBeVisible();
  await page.getByRole("tab", { name: "Photo studio" }).click();
  await expect
    .poll(() =>
      page
        .locator("video")
        .evaluate((video) => (video as HTMLVideoElement).paused),
    )
    .toBe(true);
});
