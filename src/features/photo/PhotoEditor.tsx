import type { Photo } from "../../lib/types";
import { usePhotoEditor } from "./usePhotoEditor";
import PhotoToolbar from "./PhotoToolbar";
import ToolRail from "./ToolRail";
import PhotoCanvas from "./PhotoCanvas";
import CropPanel from "./CropPanel";
import AdjustPanel from "./AdjustPanel";
import PhotoInfo from "./PhotoInfo";
import ExportDialog from "../export/ExportDialog";
type Props = {
  photo: Photo | null;
  onOpen: () => void;
  onMessage: (message: string) => void;
};
export default function PhotoEditor({ photo, onOpen, onMessage }: Props) {
  const editor = usePhotoEditor(photo);
  return (
    <>
      <PhotoToolbar editor={editor} />
      <div className="editor-shell">
        <ToolRail editor={editor} />
        <PhotoCanvas editor={editor} onOpen={onOpen} />
        <aside className="settings-panel">
          {editor.tool === "crop" && <CropPanel editor={editor} />}
          {editor.tool === "adjust" && <AdjustPanel editor={editor} />}
          {editor.tool === "info" && <PhotoInfo editor={editor} />}
        </aside>
      </div>
      {editor.exportOpen && photo && (
        <ExportDialog
          photo={photo}
          edits={editor.current}
          grid={editor.grid}
          onClose={() => editor.setExportOpen(false)}
          onMessage={onMessage}
        />
      )}
    </>
  );
}
