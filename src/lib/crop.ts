import type { PercentCrop } from "react-image-crop";
import { fullCrop } from "./edit-defaults";
import type { Photo, Edits } from "./types";

export function dimensions(photo: Photo, rotation: number) {
  return rotation % 180 === 0
    ? { width: photo.width, height: photo.height }
    : { width: photo.height, height: photo.width };
}
export function cropPixels(photo: Photo, edits: Edits) {
  const size = dimensions(photo, edits.rotation);
  const x = Math.min(
    size.width - 1,
    Math.max(0, Math.round((size.width * edits.crop.x) / 100)),
  );
  const y = Math.min(
    size.height - 1,
    Math.max(0, Math.round((size.height * edits.crop.y) / 100)),
  );
  return {
    x,
    y,
    width: Math.max(
      1,
      Math.min(
        size.width - x,
        Math.round((size.width * edits.crop.width) / 100),
      ),
    ),
    height: Math.max(
      1,
      Math.min(
        size.height - y,
        Math.round((size.height * edits.crop.height) / 100),
      ),
    ),
  };
}
export function makeCrop(
  aspect: number | undefined,
  width: number,
  height: number,
): PercentCrop {
  if (!aspect) return { ...fullCrop };
  let cropW = width;
  let cropH = width / aspect;
  if (cropH > height) {
    cropH = height;
    cropW = height * aspect;
  }
  return {
    unit: "%",
    x: ((width - cropW) / width) * 50,
    y: ((height - cropH) / height) * 50,
    width: (cropW / width) * 100,
    height: (cropH / height) * 100,
  };
}
