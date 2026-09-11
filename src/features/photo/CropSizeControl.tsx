import type { PhotoController } from "./usePhotoEditor";
import { X } from "lucide-react";
export default function CropSizeControl({
  editor,
}: {
  editor: PhotoController;
}) {
  const { selectedPixels, setRatio } = editor;
  return (
    <div className="control-section">
      <div className="flex items-center justify-between">
        <label className="section-label">CROP SIZE</label>
        <span className="micro-label">px</span>
      </div>
      <div className="size-readout">
        <span>
          <small>W</small>
          {selectedPixels?.width.toLocaleString() ?? "—"}
        </span>
        <X size={12} />
        <span>
          <small>H</small>
          {selectedPixels?.height.toLocaleString() ?? "—"}
        </span>
      </div>
      <button
        className="text-button reset-crop"
        onClick={() => setRatio("Free")}
      >
        Reset crop
      </button>
    </div>
  );
}
