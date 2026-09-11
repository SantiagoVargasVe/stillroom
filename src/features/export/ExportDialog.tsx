import { ArrowDownToLine, Check } from "lucide-react";
import Dialog from "../../components/Dialog";
import { cropPixels } from "../../lib/crop";
import { useExport } from "./useExport";
import ExportFields from "./ExportFields";
import ExportQuality from "./ExportQuality";
import type { ExportProps } from "./types";
export default function ExportDialog(props: ExportProps) {
  const controller = useExport(props);
  const { busy, error, format, scale, includeGrid, update, save } = controller;
  const crop = cropPixels(props.photo, props.edits);
  return (
    <Dialog
      title="Your image, ready to go."
      onClose={() => {
        if (!busy) props.onClose();
      }}
    >
      <p className="modal-description">
        A new copy, just the way you composed it.
      </p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
      >
        <fieldset disabled={busy} className="export-form">
          <ExportFields controller={controller} />
          {format !== "png" && <ExportQuality controller={controller} />}
          <label className="checkbox-field">
            <input
              type="checkbox"
              disabled={props.grid === "none" || busy}
              checked={includeGrid}
              onChange={(event) =>
                update({ includeGrid: event.target.checked })
              }
            />
            Include composition grid in export
          </label>
          <div className="export-summary">
            <Check size={16} />
            <span>
              {Math.max(1, Math.round(crop.width * scale))} ×{" "}
              {Math.max(1, Math.round(crop.height * scale))} px · Original file
              preserved
            </span>
          </div>
          {error && (
            <p className="error-message" role="alert">
              {error}
            </p>
          )}
          <button
            className="button primary export-submit"
            type="submit"
            disabled={busy}
          >
            <ArrowDownToLine size={17} />
            {busy ? "Preparing your image…" : "Download image"}
          </button>
        </fieldset>
      </form>
      <p className="export-footnote">
        8-bit image · No original EXIF or GPS metadata
        {format === "jpeg" ? " · White background for transparency" : ""}
      </p>
    </Dialog>
  );
}
