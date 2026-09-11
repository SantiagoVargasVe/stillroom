import type { PhotoController } from "./usePhotoEditor";

export default function AdjustmentSliders({
  editor,
}: {
  editor: PhotoController;
}) {
  const { current, setDraft, draft, commit } = editor;
  return (
    <div className="control-section adjustment-list">
      {(
        [
          ["exposure", "Exposure", -2, 2, 0.05, " EV"],
          ["contrast", "Contrast", -100, 100, 1, ""],
          ["saturation", "Saturation", -100, 100, 1, ""],
          ["warmth", "Warmth", -100, 100, 1, ""],
        ] as const
      ).map(([key, label, min, max, step, suffix]) => (
        <label key={key} className="slider-field">
          <span>
            {label}
            <output>
              {current.adjustments[key] > 0 ? "+" : ""}
              {current.adjustments[key]}
              {suffix}
            </output>
          </span>
          <input
            type="range"
            aria-label={label}
            min={min}
            max={max}
            step={step}
            value={current.adjustments[key]}
            onChange={(event) =>
              setDraft({
                ...current,
                adjustments: {
                  ...current.adjustments,
                  [key]: Number(event.target.value),
                },
              })
            }
            onPointerUp={() => {
              if (draft) commit(draft);
            }}
            onKeyUp={() => {
              if (draft) commit(draft);
            }}
            onBlur={() => {
              if (draft) commit(draft);
            }}
          />
          <span className="range-labels">
            <small>
              {min}
              {suffix}
            </small>
            <small>
              {max}
              {suffix}
            </small>
          </span>
        </label>
      ))}
    </div>
  );
}
