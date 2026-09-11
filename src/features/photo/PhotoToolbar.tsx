import type { PhotoController } from "./usePhotoEditor";
import { RotateCcw, ArrowDownToLine, ChevronDown } from "lucide-react";
import { initialEdits } from "../../lib/edit-defaults";
export default function PhotoToolbar({ editor }: { editor: PhotoController }) {
  const { photo, commit, canUndo, renderError, setExportOpen } = editor;
  return (
    <div className="workspace-toolbar">
      <div className="flex items-center gap-2 text-sm text-muted">
        <span className="status-dot" />
        {photo ? "Ready for a fresh perspective" : "Your workspace is ready"}
      </div>
      <div className="flex items-center gap-2">
        <button
          className="text-button"
          onClick={() => commit(initialEdits())}
          disabled={!photo || !canUndo}
        >
          <RotateCcw size={15} /> Reset edits
        </button>
        <button
          className="button primary"
          disabled={!photo || !!renderError}
          onClick={() => setExportOpen(true)}
        >
          <ArrowDownToLine size={16} /> Export image <ChevronDown size={14} />
        </button>
      </div>
    </div>
  );
}
