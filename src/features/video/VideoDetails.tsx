import { Camera } from "lucide-react";
import { formatBytes } from "../../lib/formats";
import type { VideoAsset } from "../workspace/types";
import type { Playback } from "./usePlayback";
export default function VideoDetails({
  asset,
  playback,
}: {
  asset: VideoAsset | null;
  playback: Playback;
}) {
  const { fps, setFps, ready, resolution } = playback;
  return (
    <aside className="settings-panel">
      <div className="panel-heading">
        <div>
          <h2>Pause. Keep. Repeat.</h2>
          <p>A photo hiding in every video.</p>
        </div>
        <Camera size={20} />
      </div>
      <div className="control-section">
        <label htmlFor="step-size" className="section-label">
          SEEK STEP
        </label>
        <select
          id="step-size"
          className="full-select"
          value={fps}
          onChange={(event) => setFps(Number(event.target.value))}
        >
          {[24, 25, 30, 60].map((value) => (
            <option key={value} value={value}>
              1/{value} second
            </option>
          ))}
        </select>
        <p className="control-hint">
          Match your video’s frame rate for finer seeking. Steps are time-based;
          exact frame boundaries depend on the video.
        </p>
      </div>
      <div className="control-section">
        <label className="section-label">CAPTURE DETAILS</label>
        <dl className="video-details">
          <dt>Resolution</dt>
          <dd>
            {ready
              ? `${resolution.width} × ${resolution.height}`
              : "Original video size"}
          </dd>
          <dt>Format</dt>
          <dd>PNG · lossless</dd>
          <dt>Audio</dt>
          <dd>Muted for editing</dd>
          {asset && (
            <>
              <dt>Video size</dt>
              <dd>{formatBytes(asset.size)}</dd>
            </>
          )}
        </dl>
      </div>
      <div className="panel-tip">
        <span>✦</span>
        <p>Capture a frame, then crop and adjust it in the photo studio.</p>
      </div>
    </aside>
  );
}
