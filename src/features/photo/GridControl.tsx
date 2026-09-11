import type { PhotoController } from "./usePhotoEditor";
import { Grid3X3 } from "lucide-react";
import type { Grid } from "../../lib/types";
import { gridNames } from "./settings";
export default function GridControl({ editor }: { editor: PhotoController }) {
  const { grid, setGrid } = editor;
  return (
    <div className="control-section">
      <label className="section-label" htmlFor="grid-select">
        COMPOSITION GRID
      </label>
      <div className="select-wrap">
        <Grid3X3 size={16} />
        <select
          id="grid-select"
          value={grid}
          onChange={(event) => setGrid(event.target.value as Grid)}
        >
          {Object.entries(gridNames).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <p className="control-hint">Find a little balance in the frame.</p>
    </div>
  );
}
