import type { PhotoController } from "./usePhotoEditor";
import { Crop, SlidersHorizontal, Info } from "lucide-react";
export default function ToolRail({ editor }: { editor: PhotoController }) {
  const { tool, setTool } = editor;
  return (
    <nav className="tool-rail" aria-label="Image tools">
      <button
        aria-label="Crop and composition"
        title="Crop and composition"
        className={`rail-button ${tool === "crop" ? "active" : ""}`}
        onClick={() => setTool("crop")}
      >
        <Crop size={21} />
        <span>Crop</span>
      </button>
      <button
        aria-label="Image adjustments"
        title="Image adjustments"
        className={`rail-button ${tool === "adjust" ? "active" : ""}`}
        onClick={() => setTool("adjust")}
      >
        <SlidersHorizontal size={21} />
        <span>Adjust</span>
      </button>
      <button
        aria-label="File information"
        title="File information"
        className={`rail-button ${tool === "info" ? "active" : ""}`}
        onClick={() => setTool("info")}
      >
        <Info size={21} />
        <span>Info</span>
      </button>
      <div className="rail-bottom">
        <span className="tiny-plus">+</span>
      </div>
    </nav>
  );
}
