import { Camera } from "lucide-react";
import type { Captures } from "./useCaptures";
export default function VideoToolbar({
  frames,
  ready,
  seeking,
}: {
  frames: Captures;
  ready: boolean;
  seeking: boolean;
}) {
  const { busy, captures, capture } = frames;
  return (
    <div className="workspace-toolbar">
      <div className="flex items-center gap-2 text-sm text-muted">
        <span className="status-dot" />
        One moment. Worth keeping.
      </div>
      <button
        className="button primary"
        disabled={!ready || seeking || busy || captures.length >= 8}
        onClick={() => void capture()}
      >
        <Camera size={17} />
        {busy ? "Preparing frame…" : "Capture frame"}
      </button>
    </div>
  );
}
