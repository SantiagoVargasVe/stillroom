import { useEffect, useRef } from "react";
import { renderPhoto } from "../../lib/render-photo";
import { fullCrop } from "../../lib/edit-defaults";
import type { Photo, Edits } from "../../lib/types";
export function useCanvasPreview(
  photo: Photo | null,
  edits: Edits,
  original: boolean,
  onError: (error: string) => void,
) {
  const ref = useRef<HTMLCanvasElement>(null);
  const { rotation, flipX, flipY, adjustments } = edits;
  // Canvas is an external system. Crop/zoom changes do not require repainting its pixels.
  useEffect(() => {
    if (!photo || !ref.current) return;
    const target = ref.current;
    const frame = requestAnimationFrame(() => {
      try {
        const edits = {
          rotation,
          flipX,
          flipY,
          adjustments,
          crop: fullCrop,
          ratio: "Free",
        };
        const rendered = renderPhoto(photo, edits, { preview: true, original });
        target.width = rendered.width;
        target.height = rendered.height;
        target.getContext("2d")!.drawImage(rendered, 0, 0);
        rendered.width = 0;
        rendered.height = 0;
        onError("");
      } catch (reason) {
        onError(
          reason instanceof Error
            ? reason.message
            : "Could not render the image.",
        );
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [photo, rotation, flipX, flipY, adjustments, original, onError]);
  return ref;
}
