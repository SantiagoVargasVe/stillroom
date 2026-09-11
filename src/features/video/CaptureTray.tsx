import { Camera } from "lucide-react";
import type { Captures } from "./useCaptures";
import FrameCard from "./FrameCard";
export default function CaptureTray({ frames }: { frames: Captures }) {
  const { captures } = frames;
  return (
    <section className="capture-tray">
      <div className="capture-heading">
        <h3>
          Your captured moments <span>{captures.length}/8</span>
        </h3>
        <p>Saved in this tab until you replace the video or close the page.</p>
      </div>
      {captures.length ? (
        <div className="capture-grid">
          {captures.map((frame) => (
            <FrameCard key={frame.id} frame={frame} frames={frames} />
          ))}
        </div>
      ) : (
        <div className="capture-placeholder">
          <Camera size={19} />
          <span>
            Your captures will appear here, ready to download or edit.
          </span>
        </div>
      )}
    </section>
  );
}
