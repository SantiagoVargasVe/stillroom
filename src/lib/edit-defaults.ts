import type { PercentCrop } from "react-image-crop";
import type { Adjustments, Edits } from "./types";

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
