import type { ExportController } from "./useExport";
export default function ExportQuality({
  controller,
}: {
  controller: ExportController;
}) {
  const { quality, update } = controller;
  return (
    <label className="slider-field">
      <span>
        Quality<output>{quality}%</output>
      </span>
      <input
        aria-label="Export quality"
        type="range"
        min={10}
        max={100}
        value={quality}
        onChange={(event) => update({ quality: Number(event.target.value) })}
      />
    </label>
  );
}
