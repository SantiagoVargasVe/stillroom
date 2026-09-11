import { Image as ImageIcon } from "lucide-react";
import { useElementSize } from "../../hooks/useElementSize";
import type { PhotoController } from "./usePhotoEditor";
import CropSelection from "./CropSelection";
import PhotoHeader from "./PhotoHeader";
import PhotoFooter from "./PhotoFooter";
export default function PhotoCanvas({
  editor,
  onOpen,
}: {
  editor: PhotoController;
  onOpen: () => void;
}) {
  const { size: stageSize, measure } = useElementSize();
  const { photo, size, zoom, renderError } = editor;
  const fit = Math.min(
    (stageSize.width - 80) / size.width,
    (stageSize.height - 76) / size.height,
    1,
  );
  return (
    <section className="canvas-column" aria-label="Image workspace">
      <PhotoHeader editor={editor} />
      <div className={`canvas-stage ${zoom > 1 ? "zoomed" : ""}`} ref={measure}>
        {photo ? (
          <CropSelection
            editor={editor}
            displayWidth={Math.max(1, size.width * fit * zoom)}
            displayHeight={Math.max(1, size.height * fit * zoom)}
          />
        ) : (
          <button className="empty-photo" onClick={onOpen}>
            <ImageIcon size={36} strokeWidth={1.2} />
            <strong>Start with an image</strong>
            <span>Drop a file here or browse your device</span>
            <span className="button primary">Open image</span>
          </button>
        )}
        {renderError && (
          <div className="stage-error" role="alert">
            {renderError}
          </div>
        )}
      </div>
      <PhotoFooter editor={editor} />
    </section>
  );
}
