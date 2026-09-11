import type { PhotoController } from "./usePhotoEditor";
import {
  RotateCcw,
  RotateCw,
  FlipHorizontal2,
  FlipVertical2,
} from "lucide-react";
export default function TransformControl({
  editor,
}: {
  editor: PhotoController;
}) {
  const { current, transform } = editor;
  return (
    <div className="control-section">
      <label className="section-label">ROTATE & FLIP</label>
      <div className="transform-buttons">
        <button
          aria-label="Rotate left"
          title="Rotate left 90°"
          onClick={() =>
            transform({ rotation: (current.rotation + 270) % 360 })
          }
        >
          <RotateCcw size={19} />
        </button>
        <button
          aria-label="Rotate right"
          title="Rotate right 90°"
          onClick={() => transform({ rotation: (current.rotation + 90) % 360 })}
        >
          <RotateCw size={19} />
        </button>
        <span />
        <button
          aria-label="Flip horizontally"
          title="Flip horizontally"
          aria-pressed={current.flipX}
          onClick={() => transform({ flipX: !current.flipX })}
        >
          <FlipHorizontal2 size={20} />
        </button>
        <button
          aria-label="Flip vertically"
          title="Flip vertically"
          aria-pressed={current.flipY}
          onClick={() => transform({ flipY: !current.flipY })}
        >
          <FlipVertical2 size={20} />
        </button>
      </div>
    </div>
  );
}
