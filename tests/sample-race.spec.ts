import { test, expect } from "@playwright/test";
import { importPhoto, exportPng, pixel } from "./helpers";

declare global {
  interface Window {
    releaseSample?: () => void;
    sampleReleased: boolean;
    sampleDecoded: boolean;
  }
}

test("a late sample result cannot replace an imported photo", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const fetchOriginal = window.fetch;
    const decode = HTMLImageElement.prototype.decode;
    window.fetch = async (input, init) => {
      if (!String(input).endsWith("samples/alpine.jpg"))
        return fetchOriginal(input, init);
      // Simulate work that has progressed beyond cancellable network I/O.
      const response = await fetchOriginal(input);
      return new Promise<Response>((resolve) => {
        window.releaseSample = () => {
          window.sampleReleased = true;
          resolve(response);
        };
      });
    };
    HTMLImageElement.prototype.decode = async function () {
      await decode.call(this);
      if (window.sampleReleased) window.sampleDecoded = true;
    };
  });
  await page.goto("/");
  await page.waitForFunction(() => !!window.releaseSample);
  await importPhoto(page);
  await page.evaluate(() => window.releaseSample!());
  await page.waitForFunction(() => window.sampleDecoded);
  await expect(page.getByText("quadrants.png", { exact: true })).toBeVisible();
  const png = await exportPng(page);
  expect([png.width, png.height]).toEqual([400, 240]);
  expect(pixel(png, 20, 20)).toEqual([240, 20, 30, 255]);
});
