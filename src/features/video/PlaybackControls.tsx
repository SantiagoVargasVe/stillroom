import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import type { Playback } from "./usePlayback";
export default function PlaybackControls({
  playback,
  busy,
}: {
  playback: Playback;
  busy: boolean;
}) {
  const { ready, fps, time, playing, seek, togglePlayback, maxTime } = playback;
  return (
    <div className="playback-controls">
      <div className="flex items-center gap-2">
        <button
          className="icon-button"
          aria-label="Step backward"
          title={`Step back 1/${fps} second`}
          disabled={!ready || busy}
          onClick={() => seek(time - 1 / fps)}
        >
          <ChevronLeft size={20} />
        </button>
        <button
          className="play-button"
          aria-label={playing ? "Pause video" : "Play video"}
          disabled={!ready || busy}
          onClick={() => void togglePlayback()}
        >
          {playing ? (
            <Pause size={17} />
          ) : (
            <Play size={17} fill="currentColor" />
          )}
        </button>
        <button
          className="icon-button"
          aria-label="Step forward"
          title={`Step forward 1/${fps} second`}
          disabled={!ready || busy}
          onClick={() => seek(time + 1 / fps)}
        >
          <ChevronRight size={20} />
        </button>
      </div>
      <label className="seek-field">
        Jump to (seconds)
        <input
          aria-label="Seek time in seconds"
          type="number"
          min={0}
          max={maxTime}
          step={0.001}
          value={Number(time.toFixed(3))}
          disabled={!ready || busy}
          onChange={(event) => {
            if (event.target.value !== "") seek(Number(event.target.value));
          }}
        />
      </label>
    </div>
  );
}
