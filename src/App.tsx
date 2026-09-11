import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  Check,
  CircleHelp,
  Film,
  Focus,
  HardDrive,
  Image as ImageIcon,
  Leaf,
  LoaderCircle,
  LockKeyhole,
  Plus,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import PhotoEditor from "./components/PhotoEditor";
import VideoStudio, { type VideoAsset } from "./components/VideoStudio";
import Dialog from "./components/Dialog";
import {
  acceptMedia,
  isRaw,
  isVideo,
  loadPhoto,
  type Photo,
} from "./lib/media";

export default function App() {
  const [mode, setMode] = useState<"photo" | "video">("photo");
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [video, setVideo] = useState<VideoAsset | null>(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [help, setHelp] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);
  const requestId = useRef(0);
  const importLock = useRef(false);

  useEffect(() => {
    const id = ++requestId.current;
    const controller = new AbortController();
    let stale = false;
    async function sample() {
      try {
        const response = await fetch(
          `${import.meta.env.BASE_URL}samples/alpine.jpg`,
          { signal: controller.signal },
        );
        if (!response.ok) return;
        const blob = await response.blob();
        const result = await loadPhoto(
          new File([blob], "alpine-afternoon.jpg", { type: "image/jpeg" }),
        );
        if (stale || id !== requestId.current) result.release();
        else setPhoto({ ...result, kind: "sample" });
      } catch {
        /* A missing sample must never prevent importing a user's file. */
      }
    }
    void sample();
    return () => {
      stale = true;
      controller.abort();
    };
  }, []);
  useEffect(() => () => photo?.release(), [photo]);
  useEffect(
    () => () => {
      if (video) URL.revokeObjectURL(video.url);
    },
    [video],
  );
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 4500);
    return () => clearTimeout(timer);
  }, [message]);

  async function openFile(file: File) {
    if (importLock.current) return;
    importLock.current = true;
    ++requestId.current;
    setError("");
    setBusy(
      isRaw(file.name)
        ? "Developing your RAW photo… This can take a moment."
        : "Opening your file…",
    );
    try {
      if (isVideo(file)) {
        setVideo({
          name: file.name,
          size: file.size,
          url: URL.createObjectURL(file),
        });
        setMode("video");
      } else {
        const result = await loadPhoto(file);
        setPhoto(result);
        setMode("photo");
      }
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "This file could not be opened.",
      );
    } finally {
      importLock.current = false;
      setBusy("");
    }
  }
  function openPicker() {
    if (!busy) inputRef.current?.click();
  }

  return (
    <div
      className="app"
      onDragEnter={(event) => {
        if (!event.dataTransfer.types.includes("Files")) return;
        event.preventDefault();
        dragDepth.current++;
        setDragging(true);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        dragDepth.current--;
        if (dragDepth.current <= 0) setDragging(false);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = busy ? "none" : "copy";
      }}
      onDrop={(event) => {
        event.preventDefault();
        dragDepth.current = 0;
        setDragging(false);
        if (event.dataTransfer.files[0])
          void openFile(event.dataTransfer.files[0]);
      }}
    >
      <header className="app-header">
        <a className="brand" href="./" aria-label="Stillroom home">
          <span className="brand-mark">
            <Focus size={25} strokeWidth={1.5} />
          </span>
          <span>
            stillroom<span className="brand-period">.</span>
          </span>
        </a>
        <div className="header-tagline">A little room for your images.</div>
        <div className="header-right">
          <span className="privacy-pill">
            <span className="status-dot" />
            Private by nature
          </span>
          <button
            className="icon-button help-button"
            aria-label="Help and supported formats"
            title="Help and supported formats"
            onClick={() => setHelp(true)}
          >
            <CircleHelp size={20} />
          </button>
        </div>
      </header>
      <main>
        <section className="intro">
          <div>
            <div className="eyebrow">
              <span />
              THE EVERYDAY IMAGE STUDIO
            </div>
            <h1>
              Good moments. <em>Great frames.</em>
            </h1>
            <p>Crop a little. Find your balance. Keep the moment.</p>
          </div>
          <div className="intro-note">
            <ShieldCheck size={18} strokeWidth={1.5} />
            <span>
              On your device.
              <br />
              <strong>Always yours.</strong>
            </span>
          </div>
        </section>
        <div className="mode-row">
          <div
            className="mode-tabs"
            role="tablist"
            aria-label="Studio mode"
            onKeyDown={(event) => {
              if (
                !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)
              )
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
          <button
            className="button secondary open-button"
            onClick={openPicker}
            disabled={!!busy}
          >
            <Plus size={17} />
            Open file<span className="open-hint">or drop it here</span>
          </button>
          <input
            ref={inputRef}
            type="file"
            className="sr-only"
            aria-label="Open image or video file"
            accept={acceptMedia}
            onChange={(event) => {
              if (event.target.files?.[0]) void openFile(event.target.files[0]);
              event.target.value = "";
            }}
          />
        </div>
        {error && (
          <div className="import-error" role="alert">
            <span>{error}</span>
            <button
              className="icon-button"
              aria-label="Dismiss error"
              onClick={() => setError("")}
            >
              <X size={17} />
            </button>
          </div>
        )}
        <div
          id="photo-panel"
          role="tabpanel"
          aria-labelledby="photo-tab"
          hidden={mode !== "photo"}
        >
          <PhotoEditor
            key={photo?.id ?? "empty"}
            photo={photo}
            onOpen={openPicker}
            onMessage={setMessage}
          />
        </div>
        <div
          id="video-panel"
          role="tabpanel"
          aria-labelledby="video-tab"
          hidden={mode !== "video"}
        >
          <VideoStudio
            key={video?.url ?? "empty"}
            asset={video}
            active={mode === "video"}
            onOpen={openPicker}
            onEdit={(result) => {
              setPhoto(result);
              setMode("photo");
              setMessage("Frame opened in the photo studio");
            }}
            onMessage={setMessage}
          />
        </div>
        <section className="benefits" aria-label="Features">
          <div>
            <LockKeyhole size={19} />
            <p>
              <strong>Your files stay with you</strong>
              <span>No uploads. No accounts. Just create.</span>
            </p>
          </div>
          <div>
            <Sparkles size={19} />
            <p>
              <strong>A little RAW potential</strong>
              <span>Camera RAW, developed right in your browser.</span>
            </p>
          </div>
          <div>
            <Leaf size={20} />
            <p>
              <strong>Small studio. Plenty of possibility.</strong>
              <span>Photos, frames, and a fresh point of view.</span>
            </p>
          </div>
        </section>
      </main>
      <footer className="app-footer">
        <span>Made for the moments worth keeping.</span>
        <button onClick={() => setHelp(true)}>
          Meet your little studio <ArrowUpRight size={13} />
        </button>
        <span className="local-indicator">
          <HardDrive size={13} />
          100% local processing
        </span>
      </footer>
      {message && (
        <div className="toast" role="status">
          <Check size={17} />
          {message}
          <button
            aria-label="Dismiss notification"
            onClick={() => setMessage("")}
          >
            <X size={15} />
          </button>
        </div>
      )}
      {busy && (
        <div className="busy-overlay" role="status" aria-live="polite">
          <LoaderCircle size={29} className="spin" />
          <strong>{busy}</strong>
          <span>Your file stays on this device.</span>
        </div>
      )}
      {dragging && !busy && (
        <div className="drop-overlay">
          <div>
            <ImageIcon size={40} strokeWidth={1.3} />
            <h2>Drop a little inspiration.</h2>
            <p>Open one image or video to get started.</p>
          </div>
        </div>
      )}
      {help && (
        <Dialog
          title="Welcome to your little studio."
          onClose={() => setHelp(false)}
        >
          <div className="help-content">
            <p>
              Stillroom is a small, private workspace for your photos and video
              frames. Open a file or drop it anywhere to get started.
            </p>
            <h3>Photos, with room to play</h3>
            <p>
              Crop using the corners, choose an aspect ratio, show a composition
              grid, rotate or flip, and adjust light and color. Undo and redo
              let you try things freely. Export a PNG, JPEG or WebP at full or
              reduced resolution.
            </p>
            <h3>RAW, without the upload</h3>
            <p>
              ARW, CR2, CR3, DNG, NEF, RAF and other camera RAW files are
              decoded on your device with LibRaw. Support depends on the camera
              and compression. Development produces an 8-bit sRGB image using
              camera white balance; this is not a lossless RAW editing workflow.
            </p>
            <h3>A photo inside a video</h3>
            <p>
              Open a browser-playable video, scrub or step by a small time
              interval, then capture a full-resolution PNG. Download it directly
              or send it to Photo studio. Seek steps are time-based, not
              guaranteed frame-accurate.
            </p>
            <h3>A few useful details</h3>
            <p>
              HEIC, HEVC and MOV support depends on your browser. Images are
              limited to 60 megapixels and 16,384 px per side, and RAW files to
              150 MB. Edits and captures live only in this tab: download what
              you want to keep before replacing a file or closing the page.
              Exports omit original EXIF and GPS metadata. Grids are
              preview-only unless you choose to include them in export.
            </p>
            <div className="help-privacy">
              <ShieldCheck size={20} />
              <span>
                No accounts, uploads, analytics, or external processing. Even
                the RAW decoder is served locally.
              </span>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
