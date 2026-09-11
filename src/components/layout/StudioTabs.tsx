import { Film, Image as ImageIcon } from "lucide-react";
import type { Mode } from "../../features/workspace/types";
export default function StudioTabs({
  mode,
  setMode,
}: {
  mode: Mode;
  setMode: (mode: Mode) => void;
}) {
  return (
    <div
      className="mode-tabs"
      role="tablist"
      aria-label="Studio mode"
      onKeyDown={(event) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key))
          return;
        event.preventDefault();
        const next =
          event.key === "Home"
            ? "photo"
            : event.key === "End"
              ? "video"
              : mode === "photo"
                ? "video"
                : "photo";
        setMode(next);
        document.getElementById(`${next}-tab`)?.focus();
      }}
    >
      <button
        role="tab"
        id="photo-tab"
        aria-controls="photo-panel"
        aria-selected={mode === "photo"}
        tabIndex={mode === "photo" ? 0 : -1}
        className={mode === "photo" ? "active" : ""}
        onClick={() => setMode("photo")}
      >
        <ImageIcon size={17} />
        Photo studio
      </button>
      <button
        role="tab"
        id="video-tab"
        aria-controls="video-panel"
        aria-selected={mode === "video"}
        tabIndex={mode === "video" ? 0 : -1}
        className={mode === "video" ? "active" : ""}
        onClick={() => setMode("video")}
      >
        <Film size={17} />
        Video to photo<span className="new-badge">FRAME GRAB</span>
      </button>
    </div>
  );
}
