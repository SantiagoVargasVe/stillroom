import { useState } from "react";
import { cropPixels, dimensions, makeCrop } from "../../lib/crop";
import { fullCrop } from "../../lib/edit-defaults";
import type { Edits, Grid, Photo } from "../../lib/types";
import { ratios, type Tool } from "./settings";
import { useEditHistory } from "./useEditHistory";

type View = {
  tool: Tool;
  grid: Grid;
  compare: boolean;
  zoom: number;
  exportOpen: boolean;
};
export function usePhotoEditor(photo: Photo | null) {
  const history = useEditHistory();
  const { current, commit } = history;
  const [view, setView] = useState<View>({
    tool: "crop",
    grid: "thirds",
    compare: false,
    zoom: 1,
    exportOpen: false,
  });
  const [renderError, setRenderError] = useState("");
  const updateView = (patch: Partial<View>) =>
    setView((value) => ({ ...value, ...patch }));
  const size = photo
    ? dimensions(photo, current.rotation)
    : { width: 3, height: 2 };
  const aspect =
    current.ratio === "Original"
      ? size.width / size.height
      : ratios[current.ratio];
  function setRatio(ratio: string) {
    const aspect =
      ratio === "Original" ? size.width / size.height : ratios[ratio];
    commit({
      ...current,
      ratio,
      crop: makeCrop(aspect, size.width, size.height),
    });
  }
  return {
    ...history,
    ...view,
    photo,
    size,
    aspect,
    renderError,
    setRenderError,
    setRatio,
    selectedPixels: photo ? cropPixels(photo, current) : null,
    transform: (patch: Partial<Edits>) =>
      commit({ ...current, ...patch, crop: { ...fullCrop }, ratio: "Free" }),
    setTool: (tool: Tool) => updateView({ tool }),
    setGrid: (grid: Grid) => updateView({ grid }),
    setCompare: (compare: boolean) => updateView({ compare }),
    setZoom: (zoom: number) => updateView({ zoom }),
    setExportOpen: (exportOpen: boolean) => updateView({ exportOpen }),
  };
}
export type PhotoController = ReturnType<typeof usePhotoEditor>;
