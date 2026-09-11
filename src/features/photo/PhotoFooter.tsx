import type { PhotoController } from "./usePhotoEditor";
import { ScanLine, Expand } from "lucide-react";
import { formatBytes } from "../../lib/formats";
export default function PhotoFooter({ editor }: { editor: PhotoController }) {
  const { photo, compare, setCompare, zoom, setZoom } = editor;
  return (
    <div className="canvas-footer">
      <span className="dimensions">
        {photo
          ? `${photo.width.toLocaleString()} × ${photo.height.toLocaleString()} px`
          : "JPEG, PNG, WebP + RAW"}
        <span className="footer-divider" />
        {photo ? formatBytes(photo.size) : "All on your device"}
      </span>
      <div className="flex items-center gap-2">
        <button
          className={`icon-button ${compare ? "selected" : ""}`}
          title="Compare original color"
          aria-label="Compare original color"
          aria-pressed={compare}
          disabled={!photo}
          onClick={() => setCompare(!compare)}
        >
          <ScanLine size={17} />
        </button>
        <span className="footer-divider" />
        <select
          aria-label="Preview zoom"
          value={zoom}
          onChange={(event) => setZoom(Number(event.target.value))}
        >
          <option value={1}>Fit</option>
          <option value={1.5}>150%</option>
          <option value={2}>200%</option>
        </select>
        <button
          className="icon-button"
          aria-label="Fit image to view"
          title="Fit to view"
          onClick={() => setZoom(1)}
        >
          <Expand size={16} />
        </button>
      </div>
    </div>
  );
}
