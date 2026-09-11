import { formatTime } from "../../lib/formats";
import type { Playback } from "./usePlayback";
import PlaybackControls from "./PlaybackControls";
export default function Timeline({
  playback,
  busy,
}: {
  playback: Playback;
  busy: boolean;
}) {
  const { ready, time, duration, maxTime, seek } = playback;
  return (
    <div className="timeline">
      <div className="timeline-labels">
        <span>{formatTime(time)}</span>
        <span>{formatTime(duration)}</span>
      </div>
      <input
        aria-label="Video timeline"
        type="range"
        min={0}
        max={maxTime || 1}
        step={0.001}
        value={Math.min(time, maxTime)}
        disabled={!ready || busy}
        onChange={(event) => seek(Number(event.target.value))}
      />
      <PlaybackControls playback={playback} busy={busy} />
    </div>
  );
}
