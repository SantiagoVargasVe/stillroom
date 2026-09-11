import { createId } from "../lib/id";
import { useEffect, useRef, useState } from "react";
import {
  ArrowDownToLine,
  Camera,
  ChevronLeft,
  ChevronRight,
  Film,
  ImagePlus,
  Pause,
  Play,
  Trash2,
} from "lucide-react";
import {
  canvas2d,
  checkDimensions,
  download,
  formatBytes,
  formatTime,
  loadPhoto,
  toBlob,
  type Photo,
} from "../lib/media";

export type VideoAsset = { name: string; url: string; size: number };
type Capture = {
  id: string;
  blob: Blob;
  url: string;
  time: number;
  width: number;
  height: number;
  name: string;
};

export default function VideoStudio({
  asset,
  active,
  onOpen,
  onEdit,
  onMessage,
}: {
  asset: VideoAsset | null;
  active: boolean;
  onOpen: () => void;
  onEdit: (photo: Photo) => void;
  onMessage: (message: string) => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [duration, setDuration] = useState(0);
  const [resolution, setResolution] = useState({ width: 0, height: 0 });
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [seeking, setSeeking] = useState(false);
  const [fps, setFps] = useState(30);
  const [captures, setCaptures] = useState<Capture[]>([]);
  const urls = useRef(new Set<string>());
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!active) ref.current?.pause();
  }, [active]);
  useEffect(() => {
    const ownedUrls = urls.current;
    return () => {
      ownedUrls.forEach((url) => URL.revokeObjectURL(url));
      ownedUrls.clear();
    };
  }, []);
  const maxTime = Math.max(0, duration - 0.001);
  function seek(value: number) {
    const video = ref.current;
    if (!video || !ready) return;
    video.pause();
    const target = Math.max(0, Math.min(maxTime, value));
    if (Math.abs(video.currentTime - target) < 0.0001) return;
    setSeeking(true);
    setTime(target);
    video.currentTime = target;
  }
  async function togglePlayback() {
    const video = ref.current;
    if (!video) return;
    if (video.paused) {
      try {
        await video.play();
      } catch {
        setError(
          "Playback could not start. Try a video codec supported by your browser.",
        );
      }
    } else video.pause();
  }
  async function capture() {
    const video = ref.current;
    if (!video || !ready || seeking || busy || video.readyState < 2) return;
    if (captures.length >= 8) {
      setError(
        "Keep up to 8 captures at a time. Download and remove a frame to make room.",
      );
      return;
    }
    setBusy(true);
    setError("");
    video.pause();
    try {
      checkDimensions(video.videoWidth, video.videoHeight);
      const { canvas, context } = canvas2d(video.videoWidth, video.videoHeight);
      context.drawImage(video, 0, 0);
      const capturedTime = video.currentTime;
      const blob = await toBlob(canvas);
      const url = URL.createObjectURL(blob);
      urls.current.add(url);
      const name = `${asset!.name.replace(/\.[^.]+$/, "")}-frame-${formatTime(capturedTime).replace(/[:.]/g, "-")}.png`;
      setCaptures((current) => [
        {
          id: createId(),
          blob,
          url,
          time: capturedTime,
          width: canvas.width,
          height: canvas.height,
          name,
        },
        ...current,
      ]);
      canvas.width = 0;
      canvas.height = 0;
      onMessage(`Frame captured at ${formatTime(capturedTime)}`);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Could not capture this frame.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function editFrame(frame: Capture) {
    setBusy(true);
    try {
      const photo = await loadPhoto(
        new File([frame.blob], frame.name, { type: "image/png" }),
      );
      onEdit({ ...photo, kind: "frame" });
    } catch {
      setError("Could not open this frame in the editor.");
    } finally {
      setBusy(false);
    }
  }
  function removeCapture(frame: Capture) {
    URL.revokeObjectURL(frame.url);
    urls.current.delete(frame.url);
    setCaptures((current) => current.filter((item) => item.id !== frame.id));
  }
  return (
    <>
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
      <div className="video-shell">
        <section className="video-main">
          <div className="canvas-header">
            <div className="file-label">
              <Film size={17} />
              <span>{asset?.name ?? "Your next still is in there"}</span>
            </div>
            <span className="micro-label">VIDEO TO PHOTO</span>
          </div>
          <div className="video-stage">
            {asset ? (
              <video
                ref={ref}
                src={asset.url}
                playsInline
                muted
                preload="auto"
                aria-label="Video preview"
                onLoadedMetadata={(event) => {
                  const video = event.currentTarget;
                  if (!Number.isFinite(video.duration) || video.duration <= 0) {
                    setError(
                      "This video has no readable duration. Try another file.",
                    );
                    return;
                  }
                  setDuration(video.duration);
                  setResolution({
                    width: video.videoWidth,
                    height: video.videoHeight,
                  });
                }}
                onLoadedData={(event) => {
                  setReady(
                    Number.isFinite(event.currentTarget.duration) &&
                      event.currentTarget.duration > 0,
                  );
                  setTime(event.currentTarget.currentTime);
                }}
                onTimeUpdate={(event) =>
                  setTime(event.currentTarget.currentTime)
                }
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onSeeking={() => setSeeking(true)}
                onSeeked={(event) => {
                  setSeeking(false);
                  setTime(event.currentTarget.currentTime);
                }}
                onError={() => {
                  setReady(false);
                  setSeeking(false);
                  setError(
                    "This video cannot be played in this browser. Try an H.264 MP4 or VP8/VP9 WebM. MOV and HEVC support depends on the browser.",
                  );
                }}
              />
            ) : (
              <button className="empty-photo video-empty" onClick={onOpen}>
                <span className="video-empty-icon">
                  <Film size={34} strokeWidth={1.2} />
                </span>
                <strong>Find the still in the motion.</strong>
                <span>Open a video, find your moment, keep a photo.</span>
                <span className="button primary">
                  <ImagePlus size={17} />
                  Open a video
                </span>
                <small>MP4, WebM, MOV · Codec support varies by browser</small>
              </button>
            )}
          </div>
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
                    if (event.target.value !== "")
                      seek(Number(event.target.value));
                  }}
                />
              </label>
            </div>
          </div>
          {error && (
            <div className="video-error" role="alert">
              {error}
            </div>
          )}
        </section>
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
              Match your video’s frame rate for finer seeking. Steps are
              time-based; exact frame boundaries depend on the video.
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
      </div>
      <section className="capture-tray">
        <div className="capture-heading">
          <h3>
            Your captured moments <span>{captures.length}/8</span>
          </h3>
          <p>
            Saved in this tab until you replace the video or close the page.
          </p>
        </div>
        {captures.length ? (
          <div className="capture-grid">
            {captures.map((frame) => (
              <article key={frame.id} className="capture-card">
                <img
                  src={frame.url}
                  alt={`Video frame at ${formatTime(frame.time)}`}
                />
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
    </>
  );
}
