import { SlidersHorizontal, ScanLine } from "lucide-react";
import type { PhotoController } from "./usePhotoEditor";
import AdjustmentSliders from "./AdjustmentSliders";
import QuickLooks from "./QuickLooks";
export default function AdjustPanel({ editor }: { editor: PhotoController }) {
  return (
    <>
      <div className="panel-heading">
        <div>
          <h2>Light & color</h2>
          <p>Make the moment feel like you.</p>
        </div>
        <SlidersHorizontal size={19} />
      </div>
      <fieldset disabled={!editor.photo}>
        <AdjustmentSliders editor={editor} />
        <QuickLooks editor={editor} />
      </fieldset>
      <div className="panel-tip">
        <ScanLine size={20} />
        <p>
          Use the compare button below the image to check the original color.
        </p>
      </div>
    </>
  );
}
