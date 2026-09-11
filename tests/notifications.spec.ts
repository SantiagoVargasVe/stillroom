import { test, expect } from "@playwright/test";
import path from "node:path";

test("repeating the same capture notification restarts its expiry", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByLabel("Open image or video file")
    .setInputFiles(path.resolve("tests/fixtures/motion.mp4"));
  const capture = page.getByRole("button", {
    name: "Capture frame",
    exact: true,
  });
  await expect(capture).toBeEnabled();
  await page.clock.install();
  await capture.click();
  await expect(page.locator(".capture-card")).toHaveCount(1);
  await page.clock.fastForward(3000);
  await capture.click();
  await expect(page.locator(".capture-card")).toHaveCount(2);
  await page.clock.fastForward(2000);
  await expect(page.locator(".toast")).toContainText(
    "Frame captured at 00:00.000",
  );
  await page.clock.fastForward(3000);
  await expect(page.locator(".toast")).toHaveCount(0);
});
