import type { Photo, Edits, Grid } from "../../lib/types";
export type ExportOptions = {
  format: string;
  quality: number;
  scale: number;
  name: string;
  includeGrid: boolean;
};
export type ExportProps = {
  photo: Photo;
  edits: Edits;
  grid: Grid;
  onClose: () => void;
  onMessage: (message: string) => void;
};
