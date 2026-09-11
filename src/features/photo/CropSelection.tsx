import type { PhotoController } from "./usePhotoEditor";
import ReactCrop from "react-image-crop";
import { gridLines } from "../../lib/grid";
import { useCanvasPreview } from "./useCanvasPreview";
export default function CropSelection({
  editor,
  displayWidth,
  displayHeight,
}: {
  editor: PhotoController;
  displayWidth: number;
  displayHeight: number;
}) {
  const {
    photo,
    current,
    setDraft,
    commit,
    aspect,
    tool,
    compare,
    grid,
    setRenderError,
  } = editor;
  const canvasRef = useCanvasPreview(photo, current, compare, setRenderError);
  return (
    <div
      className="image-positioner"
      style={{ width: displayWidth, height: displayHeight }}
    >
      <ReactCrop
        crop={current.crop}
        onChange={(_, crop) => setDraft({ ...current, crop })}
        onComplete={(_, crop) => {
          if (crop.width > 0 && crop.height > 0) commit({ ...current, crop });
          else setDraft(null);
        }}
        aspect={aspect}
        disabled={tool !== "crop" || compare}
        keepSelection
        minWidth={8}
        minHeight={8}
        className={tool !== "crop" || compare ? "crop-inactive" : ""}
        renderSelectionAddon={() =>
          !compare && (
            <div className="composition-grid" aria-hidden="true">
              {gridLines(grid).map((line) => (
                <span key={line}>
                  <i style={{ left: `${line * 100}%` }} />
                  <b style={{ top: `${line * 100}%` }} />
                </span>
              ))}
            </div>
          )
        }
      >
        <canvas
          ref={canvasRef}
          className="photo-canvas"
          style={{ width: displayWidth, height: displayHeight }}
          aria-label="Photo preview"
          role="img"
        />
      </ReactCrop>
      {compare && <span className="preview-tag">Original color</span>}
    </div>
  );
}
