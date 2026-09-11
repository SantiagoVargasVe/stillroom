import type { PhotoController } from "./usePhotoEditor";
import { Image as ImageIcon, Undo2, Redo2 } from "lucide-react";
export default function PhotoHeader({ editor }: { editor: PhotoController }) {
  const { photo, canUndo, canRedo, undo, redo } = editor;
  return (
    <div className="canvas-header">
      <div className="file-label">
        <ImageIcon size={16} />
        <span>{photo?.name ?? "No image open"}</span>
        {photo?.kind === "sample" && <span className="badge">SAMPLE</span>}
        {photo?.kind === "raw" && <span className="badge raw">RAW</span>}
      </div>
      <div className="flex items-center gap-1">
        <button
          className="icon-button"
          aria-label="Undo edit"
          title="Undo edit"
          disabled={!canUndo}
          onClick={undo}
        >
          <Undo2 size={17} />
        </button>
        <button
          className="icon-button"
          aria-label="Redo edit"
          title="Redo edit"
          disabled={!canRedo}
          onClick={redo}
        >
          <Redo2 size={17} />
        </button>
      </div>
    </div>
  );
}
