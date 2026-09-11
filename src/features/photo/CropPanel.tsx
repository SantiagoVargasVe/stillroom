import { Crop } from "lucide-react";
import type { PhotoController } from "./usePhotoEditor";
import AspectRatioControl from "./AspectRatioControl";
import GridControl from "./GridControl";
import TransformControl from "./TransformControl";
import CropSizeControl from "./CropSizeControl";
export default function CropPanel({ editor }: { editor: PhotoController }) {
  return (
    <>
      <div className="panel-heading">
        <div>
          <h2>Crop & compose</h2>
          <p>A little less. A little better.</p>
        </div>
        <Crop size={19} />
      </div>
      <fieldset disabled={!editor.photo}>
        <AspectRatioControl editor={editor} />
        <GridControl editor={editor} />
        <TransformControl editor={editor} />
        <CropSizeControl editor={editor} />
      </fieldset>
      <div className="panel-tip">
        <span>✦</span>
        <p>
          Drag the corners to crop.
          <br />
          Your original stays untouched.
        </p>
      </div>
    </>
  );
}
