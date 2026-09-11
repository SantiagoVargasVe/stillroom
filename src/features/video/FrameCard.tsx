import { ArrowDownToLine, Trash2 } from "lucide-react";
import { formatTime } from "../../lib/formats";
import { download } from "../../lib/download";
import type { Capture } from "./types";
import type { Captures } from "./useCaptures";
export default function FrameCard({
  frame,
  frames,
}: {
  frame: Capture;
  frames: Captures;
}) {
  const { busy, editFrame, removeCapture } = frames;
  return (
    <article key={frame.id} className="capture-card">
      <img src={frame.url} alt={`Video frame at ${formatTime(frame.time)}`} />
      <div className="capture-caption">
        <span>{formatTime(frame.time)}</span>
        <small>
          {frame.width} × {frame.height}
        </small>
      </div>
      <div className="capture-actions">
        <button
          className="text-button"
          disabled={busy}
          onClick={() => void editFrame(frame)}
        >
          Edit photo
        </button>
        <button
          className="icon-button"
          title="Download frame"
          aria-label={`Download frame at ${formatTime(frame.time)}`}
          onClick={() => download(frame.blob, frame.name)}
        >
          <ArrowDownToLine size={16} />
        </button>
        <button
          className="icon-button"
          title="Remove frame"
          aria-label={`Remove frame at ${formatTime(frame.time)}`}
          onClick={() => removeCapture(frame)}
        >
          <Trash2 size={15} />
        </button>
      </div>
    </article>
  );
}
