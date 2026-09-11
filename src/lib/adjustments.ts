import type { Adjustments } from "./types";

export function adjustPixels(
  context: CanvasRenderingContext2D,
  adjustments: Adjustments,
) {
  if (Object.values(adjustments).every((value) => value === 0)) return;
  const image = context.getImageData(
    0,
    0,
    context.canvas.width,
    context.canvas.height,
  );
  const { data } = image;
  const exposure = 2 ** adjustments.exposure;
  const contrast = (100 + adjustments.contrast) / 100;
  const saturation = (100 + adjustments.saturation) / 100;
  const warmth = adjustments.warmth * 0.35;
  for (let i = 0; i < data.length; i += 4) {
    let r = (data[i] * exposure - 128) * contrast + 128 + warmth;
    let g = (data[i + 1] * exposure - 128) * contrast + 128;
    let b = (data[i + 2] * exposure - 128) * contrast + 128 - warmth;
    const luminance = r * 0.2126 + g * 0.7152 + b * 0.0722;
    r = luminance + (r - luminance) * saturation;
    g = luminance + (g - luminance) * saturation;
    b = luminance + (b - luminance) * saturation;
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }
  context.putImageData(image, 0, 0);
}
