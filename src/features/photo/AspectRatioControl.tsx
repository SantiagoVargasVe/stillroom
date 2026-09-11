import type { PhotoController } from "./usePhotoEditor";
import { Maximize } from "lucide-react";
import { ratios } from "./settings";
export default function AspectRatioControl({
  editor,
}: {
  editor: PhotoController;
}) {
  const { current, setRatio } = editor;
  return (
    <div className="control-section">
      <label className="section-label">ASPECT RATIO</label>
      <div className="ratio-grid">
        {Object.keys(ratios).map((ratio) => (
          <button
            key={ratio}
            className={`ratio-button ${current.ratio === ratio ? "active" : ""}`}
            aria-pressed={current.ratio === ratio}
            onClick={() => setRatio(ratio)}
          >
            <span className={`ratio-shape shape-${ratio.replace(":", "-")}`}>
              {ratio === "Free" ? <Maximize size={15} /> : <i />}
            </span>
            {ratio}
          </button>
        ))}
      </div>
    </div>
  );
}
