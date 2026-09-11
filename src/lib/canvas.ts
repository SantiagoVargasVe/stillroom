export function checkDimensions(width: number, height: number) {
  if (!width || !height || !Number.isFinite(width * height))
    throw new Error("This file has no readable image dimensions.");
  if (width * height > 60_000_000 || Math.max(width, height) > 16384)
    throw new Error(
      "This image exceeds the 60 megapixel / 16,384 px browser editing limit. Try a smaller image.",
    );
}
export function canvas2d(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context)
    throw new Error("Your browser could not create an image canvas.");
  return { canvas, context };
}
