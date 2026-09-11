import type { PhotoController } from "./usePhotoEditor";
import { neutral } from "../../lib/edit-defaults";
import type { Adjustments } from "../../lib/types";
export default function QuickLooks({ editor }: { editor: PhotoController }) {
  const { current, commit } = editor;
  return (
    <div className="control-section">
      <label className="section-label">QUICK LOOKS</label>
      <div className="look-buttons">
        {(
          [
            { name: "Natural", adjustments: neutral },
            {
              name: "Warm",
              adjustments: {
                exposure: 0.1,
                contrast: 5,
                saturation: -8,
                warmth: 24,
              },
            },
            {
              name: "Mono",
              adjustments: {
                exposure: 0,
                contrast: 12,
                saturation: -100,
                warmth: 0,
              },
            },
          ] satisfies { name: string; adjustments: Adjustments }[]
        ).map((look) => (
          <button
            key={look.name}
            onClick={() =>
              commit({
                ...current,
                adjustments: { ...look.adjustments },
              })
            }
          >
            {look.name}
          </button>
        ))}
      </div>
      <button
        className="text-button reset-crop"
        onClick={() => commit({ ...current, adjustments: { ...neutral } })}
      >
        Reset adjustments
      </button>
    </div>
  );
}
