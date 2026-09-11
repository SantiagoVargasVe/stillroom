import type { ExportController } from "./useExport";
export default function ExportFields({
  controller,
}: {
  controller: ExportController;
}) {
  const { name, format, scale, update } = controller;
  return (
    <>
      <label className="form-field">
        File name
        <input
          value={name}
          onChange={(event) => update({ name: event.target.value })}
          maxLength={160}
        />
      </label>
      <div className="form-columns">
        <label className="form-field">
          Format
          <select
            aria-label="Export format"
            value={format}
            onChange={(event) => update({ format: event.target.value })}
          >
            <option value="png">PNG · lossless</option>
            <option value="jpeg">JPEG · smaller file</option>
            <option value="webp">WebP · modern</option>
          </select>
        </label>
        <label className="form-field">
          Size
          <select
            aria-label="Export size"
            value={scale}
            onChange={(event) => update({ scale: Number(event.target.value) })}
          >
            <option value={1}>Full resolution</option>
            <option value={0.75}>75%</option>
            <option value={0.5}>50%</option>
            <option value={0.25}>25%</option>
          </select>
        </label>
      </div>
    </>
  );
}
