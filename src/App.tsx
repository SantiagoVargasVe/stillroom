import { useRef, useState } from "react";
import AppHeader from "./components/layout/AppHeader";
import Intro from "./components/layout/Intro";
import Benefits from "./components/layout/Benefits";
import AppFooter from "./components/layout/AppFooter";
import HelpContent from "./components/layout/HelpContent";
import StudioTabs from "./components/layout/StudioTabs";
import ImportError from "./components/layout/ImportError";
import Toast from "./components/layout/Toast";
import BusyOverlay from "./components/layout/BusyOverlay";
import DropOverlay from "./components/layout/DropOverlay";
import Dialog from "./components/Dialog";
import FilePicker from "./features/workspace/FilePicker";
import PhotoEditor from "./features/photo/PhotoEditor";
import VideoStudio from "./features/video/VideoStudio";
import { useWorkspace } from "./features/workspace/useWorkspace";
import { useFileDrop } from "./hooks/useFileDrop";
import { useNotification } from "./hooks/useNotification";

export default function App() {
  const workspace = useWorkspace();
  const notice = useNotification();
  const drop = useFileDrop(workspace.openFile, !!workspace.busy);
  const [help, setHelp] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const openPicker = () => {
    if (!workspace.busy) inputRef.current?.click();
  };
  return (
    <div className="app" {...drop.handlers}>
      <AppHeader onHelp={() => setHelp(true)} />
      <main>
        <Intro />
        <div className="mode-row">
          <StudioTabs mode={workspace.mode} setMode={workspace.setMode} />
          <FilePicker
            inputRef={inputRef}
            busy={!!workspace.busy}
            onOpen={openPicker}
            onFile={workspace.openFile}
          />
        </div>
        {workspace.error && (
          <ImportError error={workspace.error} onClose={workspace.clearError} />
        )}
        <div
          id="photo-panel"
          role="tabpanel"
          aria-labelledby="photo-tab"
          hidden={workspace.mode !== "photo"}
        >
          <PhotoEditor
            key={workspace.photo?.id ?? "empty"}
            photo={workspace.photo}
            onOpen={openPicker}
            onMessage={notice.show}
          />
        </div>
        <div
          id="video-panel"
          role="tabpanel"
          aria-labelledby="video-tab"
          hidden={workspace.mode !== "video"}
        >
          <VideoStudio
            key={workspace.video?.url ?? "empty"}
            asset={workspace.video}
            active={workspace.mode === "video"}
            onOpen={openPicker}
            onMessage={notice.show}
            onEdit={(photo) => {
              workspace.editPhoto(photo);
              notice.show("Frame opened in the photo studio");
            }}
          />
        </div>
        <Benefits />
      </main>
      <AppFooter onHelp={() => setHelp(true)} />
      {notice.message && (
        <Toast message={notice.message} onClose={notice.clear} />
      )}
      {workspace.busy && <BusyOverlay busy={workspace.busy} />}
      {drop.dragging && !workspace.busy && <DropOverlay />}
      {help && (
        <Dialog
          title="Welcome to your little studio."
          onClose={() => setHelp(false)}
        >
          <HelpContent />
        </Dialog>
      )}
    </div>
  );
}
