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
