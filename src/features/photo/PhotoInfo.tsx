import type { PhotoController } from "./usePhotoEditor";
import { Info } from "lucide-react";
import { formatBytes } from "../../lib/formats";
export default function PhotoInfo({ editor }: { editor: PhotoController }) {
  const { photo } = editor;
  return (
    <>
      <div className="panel-heading">
        <div>
          <h2>A closer look</h2>
          <p>The details behind your image.</p>
        </div>
        <Info size={19} />
      </div>
      <dl className="file-details">
        <dt>File name</dt>
        <dd>{photo?.name ?? "—"}</dd>
        <dt>Dimensions</dt>
        <dd>{photo ? `${photo.width} × ${photo.height} px` : "—"}</dd>
        <dt>File size</dt>
        <dd>{photo ? formatBytes(photo.size) : "—"}</dd>
        <dt>Source</dt>
        <dd>
          {photo?.kind === "raw"
            ? "Camera RAW · full decode"
            : photo?.kind === "frame"
              ? "Captured video frame"
              : photo?.kind === "sample"
                ? "Included sample photograph"
                : "Browser-decoded image"}
        </dd>
        {photo?.camera && (
          <>
            <dt>Camera</dt>
            <dd>{photo.camera}</dd>
          </>
        )}
      </dl>
      <div className="info-note">
        <strong>Made to stay private</strong>
        <p>
          Files are processed in this tab. Nothing is uploaded, and exports omit
          the original EXIF and GPS metadata.
        </p>
        {photo?.kind === "raw" && (
          <p>
            RAW is developed to 8-bit sRGB with camera white balance. Exports
            are standard images, not RAW files.
          </p>
        )}
      </div>
    </>
  );
}
