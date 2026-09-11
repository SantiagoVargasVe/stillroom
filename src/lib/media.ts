import { createId } from "./id";
import type { PercentCrop } from "react-image-crop";

export type Photo = {
  id: string;
  name: string;
  source: HTMLImageElement | HTMLCanvasElement;
  width: number;
  height: number;
  size: number;
  kind: "image" | "raw" | "frame" | "sample";
  camera?: string;
  release: () => void;
};
export type Adjustments = {
  exposure: number;
  contrast: number;
  saturation: number;
  warmth: number;
};
export type Edits = {
  rotation: number;
  flipX: boolean;
  flipY: boolean;
  adjustments: Adjustments;
  crop: PercentCrop;
  ratio: string;
};
export type Grid = "none" | "thirds" | "golden" | "square";
export const neutral: Adjustments = {
  exposure: 0,
  contrast: 0,
  saturation: 0,
  warmth: 0,
};
export const fullCrop: PercentCrop = {
  unit: "%",
  x: 0,
  y: 0,
  width: 100,
  height: 100,
};
export const initialEdits = (): Edits => ({
  rotation: 0,
  flipX: false,
  flipY: false,
  adjustments: { ...neutral },
  crop: { ...fullCrop },
  ratio: "Free",
});
export const rawExtensions = [
  "arw",
  "cr2",
  "cr3",
  "dng",
  "nef",
  "nrw",
  "orf",
  "raf",
  "rw2",
  "pef",
  "srw",
  "raw",
];
export const acceptMedia = `image/*,video/*,${rawExtensions.map((ext) => `.${ext}`).join(",")}`;
export const isRaw = (name: string) =>
  rawExtensions.includes(name.split(".").pop()?.toLowerCase() ?? "");
export const isVideo = (file: File) =>
  file.type.startsWith("video/") ||
  /\.(mp4|mov|m4v|webm|ogv|mkv|avi)$/i.test(file.name);
export const formatBytes = (bytes: number) =>
  bytes < 1024 * 1024
    ? `${Math.round(bytes / 1024)} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
export const formatTime = (time: number) => {
  const ms = Math.max(0, Math.round(time * 1000));
  const seconds = Math.floor(ms / 1000);
  return `${Math.floor(seconds / 60)
    .toString()
    .padStart(
      2,
      "0",
    )}:${(seconds % 60).toString().padStart(2, "0")}.${(ms % 1000).toString().padStart(3, "0")}`;
};
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
export async function loadPhoto(file: File): Promise<Photo> {
  if (isRaw(file.name)) {
    if (file.size > 150 * 1024 * 1024)
      throw new Error(
        "For RAW files, please choose a file smaller than 150 MB.",
      );
    const { decodeRaw } = await import("./raw");
    return decodeRaw(file);
  }
  if (file.size > 200 * 1024 * 1024)
    throw new Error("Please choose an image smaller than 200 MB.");
  const url = URL.createObjectURL(file);
  const source = new Image();
  source.src = url;
  try {
    await source.decode();
    checkDimensions(source.naturalWidth, source.naturalHeight);
    return {
      id: createId(),
      name: file.name,
      source,
      width: source.naturalWidth,
      height: source.naturalHeight,
      size: file.size,
      kind: "image",
      release: () => {
        URL.revokeObjectURL(url);
        source.src = "";
      },
    };
  } catch (error) {
    URL.revokeObjectURL(url);
    if (error instanceof Error && error.message.includes("limit")) throw error;
    throw new Error(
      "This image could not be opened. Try JPEG, PNG, WebP, or a supported camera RAW file. HEIC support depends on your browser.",
    );
  }
}
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
// The preview and full-resolution export share the exact same pixel operations.
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
export function gridLines(grid: Grid): number[] {
  if (grid === "thirds") return [1 / 3, 2 / 3];
  if (grid === "golden") return [0.382, 0.618];
  if (grid === "square") return [0.2, 0.4, 0.6, 0.8];
  return [];
}
export function drawGrid(canvas: HTMLCanvasElement, grid: Grid) {
  const context = canvas.getContext("2d")!;
  const { width, height } = canvas;
  context.save();
  context.strokeStyle = "rgba(255,255,255,0.75)";
  context.shadowColor = "rgba(0,0,0,0.6)";
  context.shadowBlur = Math.max(1, width / 1000);
  context.lineWidth = Math.max(1, width / 1200);
  for (const n of gridLines(grid)) {
    context.beginPath();
    context.moveTo(n * width, 0);
    context.lineTo(n * width, height);
    context.stroke();
    context.beginPath();
    context.moveTo(0, n * height);
    context.lineTo(width, n * height);
    context.stroke();
  }
  context.restore();
}
export function toBlob(
  canvas: HTMLCanvasElement,
  type = "image/png",
  quality = 0.92,
): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(
              new Error(
                "The browser could not encode this image. Try a smaller export size.",
              ),
            ),
      type,
      quality,
    ),
  );
}
export function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
