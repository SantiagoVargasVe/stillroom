import { dimensions, cropPixels } from "./crop";
import { canvas2d } from "./canvas";
import { adjustPixels } from "./adjustments";
import type { Photo, Edits } from "./types";

export function renderPhoto(
  photo: Photo,
  edits: Edits,
  options: { preview?: boolean; original?: boolean; scale?: number } = {},
) {
  const size = dimensions(photo, edits.rotation);
  const crop = options.preview
    ? { x: 0, y: 0, ...size }
    : cropPixels(photo, edits);
  const scale = options.preview
    ? Math.min(1, 1600 / Math.max(size.width, size.height))
    : (options.scale ?? 1);
  const { canvas, context } = canvas2d(crop.width * scale, crop.height * scale);
  context.imageSmoothingQuality = "high";
  context.save();
  context.scale(canvas.width / crop.width, canvas.height / crop.height);
  context.translate(-crop.x + size.width / 2, -crop.y + size.height / 2);
  context.scale(edits.flipX ? -1 : 1, edits.flipY ? -1 : 1);
  context.rotate((edits.rotation * Math.PI) / 180);
  context.drawImage(
    photo.source,
    -photo.width / 2,
    -photo.height / 2,
    photo.width,
    photo.height,
  );
  context.restore();
  if (!options.original) adjustPixels(context, edits.adjustments);
  return canvas;
}
