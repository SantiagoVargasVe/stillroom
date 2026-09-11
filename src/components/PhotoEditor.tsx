import { useEffect, useRef, useState } from "react";
import ReactCrop from "react-image-crop";
import {
  ArrowDownToLine,
  Check,
  ChevronDown,
  Crop,
  Expand,
  FlipHorizontal2,
  FlipVertical2,
  Grid3X3,
  Image as ImageIcon,
  Info,
  Maximize,
  Redo2,
  RotateCcw,
  RotateCw,
  ScanLine,
  SlidersHorizontal,
  Undo2,
  X,
} from "lucide-react";
import {
  canvas2d,
  cropPixels,
  dimensions,
  download,
  drawGrid,
  formatBytes,
  fullCrop,
  gridLines,
  initialEdits,
  makeCrop,
  neutral,
  renderPhoto,
  toBlob,
  type Adjustments,
  type Edits,
  type Grid,
  type Photo,
} from "../lib/media";
import Dialog from "./Dialog";

const ratios: Record<string, number | undefined> = {
  Free: undefined,
  Original: undefined,
  "1:1": 1,
  "4:3": 4 / 3,
  "3:2": 3 / 2,
  "16:9": 16 / 9,
  "4:5": 4 / 5,
  "9:16": 9 / 16,
};
const gridNames: Record<Grid, string> = {
  none: "No grid",
  thirds: "Rule of thirds",
  golden: "Golden ratio",
  square: "5 × 5 grid",
};
type Tool = "crop" | "adjust" | "info";

export default function PhotoEditor({
  photo,
  onOpen,
  onMessage,
}: {
  photo: Photo | null;
  onOpen: () => void;
  onMessage: (message: string) => void;
}) {
  const [history, setHistory] = useState<Edits[]>([initialEdits()]);
  const [index, setIndex] = useState(0);
  const edits = history[index];
  const [draft, setDraft] = useState<Edits | null>(null);
  const current = draft ?? edits;
  const [tool, setTool] = useState<Tool>("crop");
  const [grid, setGrid] = useState<Grid>("thirds");
  const [compare, setCompare] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [exportOpen, setExportOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 500 });
  const [renderError, setRenderError] = useState("");

  function commit(next: Edits) {
    if (JSON.stringify(next) !== JSON.stringify(edits)) {
      const updated = [...history.slice(0, index + 1), next].slice(-60);
      setHistory(updated);
      setIndex(updated.length - 1);
    }
    setDraft(null);
  }
  function undo() {
    setDraft(null);
    setIndex((value) => Math.max(0, value - 1));
  }
  function redo() {
    setDraft(null);
    setIndex((value) => Math.min(history.length - 1, value + 1));
  }
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width)
        setStageSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
    });
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!photo || !canvasRef.current) return;
    const target = canvasRef.current;
    const frame = requestAnimationFrame(() => {
      try {
        const rendered = renderPhoto(photo, current, {
          preview: true,
          original: compare,
        });
        target.width = rendered.width;
        target.height = rendered.height;
        target.getContext("2d")!.drawImage(rendered, 0, 0);
        rendered.width = 0;
        rendered.height = 0;
        setRenderError("");
      } catch (error) {
        setRenderError(
          error instanceof Error
            ? error.message
            : "Could not render the image.",
        );
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [photo, current, compare]);

  const size = photo
    ? dimensions(photo, current.rotation)
    : { width: 3, height: 2 };
  const fit = Math.min(
    (stageSize.width - 80) / size.width,
    (stageSize.height - 76) / size.height,
    1,
  );
  const displayWidth = Math.max(1, size.width * fit * zoom);
  const displayHeight = Math.max(1, size.height * fit * zoom);
  const selectedPixels = photo ? cropPixels(photo, current) : null;
  const aspect =
    current.ratio === "Original"
      ? size.width / size.height
      : ratios[current.ratio];
  function setRatio(ratio: string) {
    commit({
      ...current,
      ratio,
      crop: makeCrop(
        ratio === "Original" ? size.width / size.height : ratios[ratio],
        size.width,
        size.height,
      ),
    });
  }
  function transform(patch: Partial<Edits>) {
    commit({ ...current, ...patch, crop: { ...fullCrop }, ratio: "Free" });
  }

  return (
    <>
      <div className="workspace-toolbar">
        <div className="flex items-center gap-2 text-sm text-muted">
          <span className="status-dot" />
          {photo ? "Ready for a fresh perspective" : "Your workspace is ready"}
        </div>
        <div className="flex items-center gap-2">
          <button
            className="text-button"
            onClick={() => commit(initialEdits())}
            disabled={!photo || index === 0}
          >
            <RotateCcw size={15} /> Reset edits
          </button>
          <button
            className="button primary"
            disabled={!photo || !!renderError}
            onClick={() => setExportOpen(true)}
          >
            <ArrowDownToLine size={16} /> Export image <ChevronDown size={14} />
          </button>
        </div>
      </div>
      <div className="editor-shell">
        <nav className="tool-rail" aria-label="Image tools">
          <button
            aria-label="Crop and composition"
            title="Crop and composition"
            className={`rail-button ${tool === "crop" ? "active" : ""}`}
            onClick={() => setTool("crop")}
          >
            <Crop size={21} />
            <span>Crop</span>
          </button>
          <button
            aria-label="Image adjustments"
            title="Image adjustments"
            className={`rail-button ${tool === "adjust" ? "active" : ""}`}
            onClick={() => setTool("adjust")}
          >
            <SlidersHorizontal size={21} />
            <span>Adjust</span>
          </button>
          <button
            aria-label="File information"
            title="File information"
            className={`rail-button ${tool === "info" ? "active" : ""}`}
            onClick={() => setTool("info")}
          >
            <Info size={21} />
            <span>Info</span>
          </button>
          <div className="rail-bottom">
            <span className="tiny-plus">+</span>
          </div>
        </nav>
        <section className="canvas-column" aria-label="Image workspace">
          <div className="canvas-header">
            <div className="file-label">
              <ImageIcon size={16} />
              <span>{photo?.name ?? "No image open"}</span>
              {photo?.kind === "sample" && (
                <span className="badge">SAMPLE</span>
              )}
              {photo?.kind === "raw" && <span className="badge raw">RAW</span>}
            </div>
            <div className="flex items-center gap-1">
              <button
                className="icon-button"
                aria-label="Undo edit"
                title="Undo edit"
                disabled={index === 0}
                onClick={undo}
              >
                <Undo2 size={17} />
              </button>
              <button
                className="icon-button"
                aria-label="Redo edit"
                title="Redo edit"
                disabled={index === history.length - 1}
                onClick={redo}
              >
                <Redo2 size={17} />
              </button>
            </div>
          </div>
          <div
            className={`canvas-stage ${zoom > 1 ? "zoomed" : ""}`}
            ref={stageRef}
          >
            {photo ? (
              <div
                className="image-positioner"
                style={{ width: displayWidth, height: displayHeight }}
              >
                <ReactCrop
                  crop={current.crop}
                  onChange={(_, crop) => setDraft({ ...current, crop })}
                  onComplete={(_, crop) => {
                    if (crop.width > 0 && crop.height > 0)
                      commit({ ...current, crop });
                    else setDraft(null);
                  }}
                  aspect={aspect}
                  disabled={tool !== "crop" || compare}
                  keepSelection
                  minWidth={8}
                  minHeight={8}
                  className={tool !== "crop" || compare ? "crop-inactive" : ""}
                  renderSelectionAddon={() =>
                    !compare && (
                      <div className="composition-grid" aria-hidden="true">
                        {gridLines(grid).map((line) => (
                          <span key={line}>
                            <i style={{ left: `${line * 100}%` }} />
                            <b style={{ top: `${line * 100}%` }} />
                          </span>
                        ))}
                      </div>
                    )
                  }
                >
                  <canvas
                    ref={canvasRef}
                    className="photo-canvas"
                    style={{ width: displayWidth, height: displayHeight }}
                    aria-label="Photo preview"
                    role="img"
                  />
                </ReactCrop>
                {compare && <span className="preview-tag">Original color</span>}
              </div>
            ) : (
              <button className="empty-photo" onClick={onOpen}>
                <ImageIcon size={36} strokeWidth={1.2} />
                <strong>Start with an image</strong>
                <span>Drop a file here or browse your device</span>
                <span className="button primary">Open image</span>
              </button>
            )}
            {renderError && (
              <div className="stage-error" role="alert">
                {renderError}
              </div>
            )}
          </div>
          <div className="canvas-footer">
            <span className="dimensions">
              {photo
                ? `${photo.width.toLocaleString()} × ${photo.height.toLocaleString()} px`
                : "JPEG, PNG, WebP + RAW"}
              <span className="footer-divider" />
              {photo ? formatBytes(photo.size) : "All on your device"}
            </span>
            <div className="flex items-center gap-2">
              <button
                className={`icon-button ${compare ? "selected" : ""}`}
                title="Compare original color"
                aria-label="Compare original color"
                aria-pressed={compare}
                disabled={!photo}
                onClick={() => setCompare(!compare)}
              >
                <ScanLine size={17} />
              </button>
              <span className="footer-divider" />
              <select
                aria-label="Preview zoom"
                value={zoom}
                onChange={(event) => setZoom(Number(event.target.value))}
              >
                <option value={1}>Fit</option>
                <option value={1.5}>150%</option>
                <option value={2}>200%</option>
              </select>
              <button
                className="icon-button"
                aria-label="Fit image to view"
                title="Fit to view"
                onClick={() => setZoom(1)}
              >
                <Expand size={16} />
              </button>
            </div>
          </div>
        </section>
        <aside className="settings-panel">
          {tool === "crop" && (
            <>
              <div className="panel-heading">
                <div>
                  <h2>Crop & compose</h2>
                  <p>A little less. A little better.</p>
                </div>
                <Crop size={19} />
              </div>
              <fieldset disabled={!photo}>
                <div className="control-section">
                  <label className="section-label">ASPECT RATIO</label>
                  <div className="ratio-grid">
                    {Object.keys(ratios).map((ratio) => (
                      <button
                        key={ratio}
                        className={`ratio-button ${current.ratio === ratio ? "active" : ""}`}
                        aria-pressed={current.ratio === ratio}
                        onClick={() => setRatio(ratio)}
                      >
                        <span
                          className={`ratio-shape shape-${ratio.replace(":", "-")}`}
                        >
                          {ratio === "Free" ? <Maximize size={15} /> : <i />}
                        </span>
                        {ratio}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="control-section">
                  <label className="section-label" htmlFor="grid-select">
                    COMPOSITION GRID
                  </label>
                  <div className="select-wrap">
                    <Grid3X3 size={16} />
                    <select
                      id="grid-select"
                      value={grid}
                      onChange={(event) => setGrid(event.target.value as Grid)}
                    >
                      {Object.entries(gridNames).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="control-hint">
                    Find a little balance in the frame.
                  </p>
                </div>
                <div className="control-section">
                  <label className="section-label">ROTATE & FLIP</label>
                  <div className="transform-buttons">
                    <button
                      aria-label="Rotate left"
                      title="Rotate left 90°"
                      onClick={() =>
                        transform({ rotation: (current.rotation + 270) % 360 })
                      }
                    >
                      <RotateCcw size={19} />
                    </button>
                    <button
                      aria-label="Rotate right"
                      title="Rotate right 90°"
                      onClick={() =>
                        transform({ rotation: (current.rotation + 90) % 360 })
                      }
                    >
                      <RotateCw size={19} />
                    </button>
                    <span />
                    <button
                      aria-label="Flip horizontally"
                      title="Flip horizontally"
                      aria-pressed={current.flipX}
                      onClick={() => transform({ flipX: !current.flipX })}
                    >
                      <FlipHorizontal2 size={20} />
                    </button>
                    <button
                      aria-label="Flip vertically"
                      title="Flip vertically"
                      aria-pressed={current.flipY}
                      onClick={() => transform({ flipY: !current.flipY })}
                    >
                      <FlipVertical2 size={20} />
                    </button>
                  </div>
                </div>
                <div className="control-section">
                  <div className="flex items-center justify-between">
                    <label className="section-label">CROP SIZE</label>
                    <span className="micro-label">px</span>
                  </div>
                  <div className="size-readout">
                    <span>
                      <small>W</small>
                      {selectedPixels?.width.toLocaleString() ?? "—"}
                    </span>
                    <X size={12} />
                    <span>
                      <small>H</small>
                      {selectedPixels?.height.toLocaleString() ?? "—"}
                    </span>
                  </div>
                  <button
                    className="text-button reset-crop"
                    onClick={() => setRatio("Free")}
                  >
                    Reset crop
                  </button>
                </div>
              </fieldset>
              <div className="panel-tip">
                <span>✦</span>
                <p>
                  Drag the corners to crop.
                  <br />
                  Your original stays untouched.
                </p>
              </div>
            </>
          )}
          {tool === "adjust" && (
            <>
              <div className="panel-heading">
                <div>
                  <h2>Light & color</h2>
                  <p>Make the moment feel like you.</p>
                </div>
                <SlidersHorizontal size={19} />
              </div>
              <fieldset disabled={!photo}>
                <div className="control-section adjustment-list">
                  {(
                    [
                      ["exposure", "Exposure", -2, 2, 0.05, " EV"],
                      ["contrast", "Contrast", -100, 100, 1, ""],
                      ["saturation", "Saturation", -100, 100, 1, ""],
                      ["warmth", "Warmth", -100, 100, 1, ""],
                    ] as const
                  ).map(([key, label, min, max, step, suffix]) => (
                    <label key={key} className="slider-field">
                      <span>
                        {label}
                        <output>
                          {current.adjustments[key] > 0 ? "+" : ""}
                          {current.adjustments[key]}
                          {suffix}
                        </output>
                      </span>
                      <input
                        type="range"
                        aria-label={label}
                        min={min}
                        max={max}
                        step={step}
                        value={current.adjustments[key]}
                        onChange={(event) =>
                          setDraft({
                            ...current,
                            adjustments: {
                              ...current.adjustments,
                              [key]: Number(event.target.value),
                            },
                          })
                        }
                        onPointerUp={() => {
                          if (draft) commit(draft);
                        }}
                        onKeyUp={() => {
                          if (draft) commit(draft);
                        }}
                        onBlur={() => {
                          if (draft) commit(draft);
                        }}
                      />
                      <span className="range-labels">
                        <small>
                          {min}
                          {suffix}
                        </small>
                        <small>
                          {max}
                          {suffix}
                        </small>
                      </span>
                    </label>
                  ))}
                </div>
                <div className="control-section">
                  <label className="section-label">QUICK LOOKS</label>
                  <div className="look-buttons">
                    {(
                      [
                        { name: "Natural", adjustments: neutral },
                        {
                          name: "Warm",
                          adjustments: {
                            exposure: 0.1,
                            contrast: 5,
                            saturation: -8,
                            warmth: 24,
                          },
                        },
                        {
                          name: "Mono",
                          adjustments: {
                            exposure: 0,
                            contrast: 12,
                            saturation: -100,
                            warmth: 0,
                          },
                        },
                      ] satisfies { name: string; adjustments: Adjustments }[]
                    ).map((look) => (
                      <button
                        key={look.name}
                        onClick={() =>
                          commit({
                            ...current,
                            adjustments: { ...look.adjustments },
                          })
                        }
                      >
                        {look.name}
                      </button>
                    ))}
                  </div>
                  <button
                    className="text-button reset-crop"
                    onClick={() =>
                      commit({ ...current, adjustments: { ...neutral } })
                    }
                  >
                    Reset adjustments
                  </button>
                </div>
              </fieldset>
              <div className="panel-tip">
                <ScanLine size={20} />
                <p>
                  Use the compare button below the image to check the original
                  color.
                </p>
              </div>
            </>
          )}
          {tool === "info" && (
            <>
              <div className="panel-heading">
                <div>
                  <h2>A closer look</h2>
                  <p>The details behind your image.</p>
                </div>
                <Info size={19} />
              </div>
              <dl className="file-details">
                <dt>File name</dt>
                <dd>{photo?.name ?? "—"}</dd>
                <dt>Dimensions</dt>
                <dd>{photo ? `${photo.width} × ${photo.height} px` : "—"}</dd>
                <dt>File size</dt>
                <dd>{photo ? formatBytes(photo.size) : "—"}</dd>
                <dt>Source</dt>
                <dd>
                  {photo?.kind === "raw"
                    ? "Camera RAW · full decode"
                    : photo?.kind === "frame"
                      ? "Captured video frame"
                      : photo?.kind === "sample"
                        ? "Included sample photograph"
                        : "Browser-decoded image"}
                </dd>
                {photo?.camera && (
                  <>
                    <dt>Camera</dt>
                    <dd>{photo.camera}</dd>
                  </>
                )}
              </dl>
              <div className="info-note">
                <strong>Made to stay private</strong>
                <p>
                  Files are processed in this tab. Nothing is uploaded, and
                  exports omit the original EXIF and GPS metadata.
                </p>
                {photo?.kind === "raw" && (
                  <p>
                    RAW is developed to 8-bit sRGB with camera white balance.
                    Exports are standard images, not RAW files.
                  </p>
                )}
              </div>
            </>
          )}
        </aside>
      </div>
      {exportOpen && photo && (
        <ExportDialog
          photo={photo}
          edits={current}
          grid={grid}
          onClose={() => setExportOpen(false)}
          onMessage={onMessage}
        />
      )}
    </>
  );
}

function ExportDialog({
  photo,
  edits,
  grid,
  onClose,
  onMessage,
}: {
  photo: Photo;
  edits: Edits;
  grid: Grid;
  onClose: () => void;
  onMessage: (message: string) => void;
}) {
  const [format, setFormat] = useState("png");
  const [quality, setQuality] = useState(92);
  const [scale, setScale] = useState(1);
  const [name, setName] = useState(
    photo.name.replace(/\.[^.]+$/, "") + "-stillroom",
  );
  const [includeGrid, setIncludeGrid] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const crop = cropPixels(photo, edits);
  async function save() {
    setBusy(true);
    setError("");
    try {
      await new Promise((resolve) =>
        requestAnimationFrame(() => setTimeout(resolve, 0)),
      );
      const canvas = renderPhoto(photo, edits, { scale });
      if (includeGrid) drawGrid(canvas, grid);
      if (format === "jpeg") {
        // JPEG has no alpha channel. Flatten transparency against white explicitly.
        const { canvas: background, context } = canvas2d(
          canvas.width,
          canvas.height,
        );
        context.fillStyle = "#fff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(canvas, 0, 0);
        canvas.getContext("2d")!.drawImage(background, 0, 0);
        background.width = 0;
      }
      const blob = await toBlob(canvas, `image/${format}`, quality / 100);
      canvas.width = 0;
      canvas.height = 0;
      if (blob.type !== `image/${format}`)
        throw new Error(
          "Your browser does not support this export format. Please choose PNG or JPEG.",
        );
      const safeName =
        Array.from(name.trim())
          .map((char) =>
            char.charCodeAt(0) < 32 || '<>:"/\\|?*'.includes(char) ? "-" : char,
          )
          .join("")
          .slice(0, 160) || "stillroom-image";
      download(blob, `${safeName}.${format === "jpeg" ? "jpg" : format}`);
      onMessage(`Image exported · ${formatBytes(blob.size)}`);
      onClose();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Export failed. Try a smaller size.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog
      title="Your image, ready to go."
      onClose={() => {
        if (!busy) onClose();
      }}
    >
      <p className="modal-description">
        A new copy, just the way you composed it.
      </p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
      >
        <fieldset disabled={busy} className="export-form">
          <label className="form-field">
            File name
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={160}
            />
          </label>
          <div className="form-columns">
            <label className="form-field">
              Format
              <select
                aria-label="Export format"
                value={format}
                onChange={(event) => setFormat(event.target.value)}
              >
                <option value="png">PNG · lossless</option>
                <option value="jpeg">JPEG · smaller file</option>
                <option value="webp">WebP · modern</option>
              </select>
            </label>
            <label className="form-field">
              Size
              <select
                aria-label="Export size"
                value={scale}
                onChange={(event) => setScale(Number(event.target.value))}
              >
                <option value={1}>Full resolution</option>
                <option value={0.75}>75%</option>
                <option value={0.5}>50%</option>
                <option value={0.25}>25%</option>
              </select>
            </label>
          </div>
          {format !== "png" && (
            <label className="slider-field">
              <span>
                Quality<output>{quality}%</output>
              </span>
              <input
                aria-label="Export quality"
                type="range"
                min={10}
                max={100}
                value={quality}
                onChange={(event) => setQuality(Number(event.target.value))}
              />
            </label>
          )}
          <label className="checkbox-field">
            <input
              type="checkbox"
              disabled={grid === "none" || busy}
              checked={includeGrid}
              onChange={(event) => setIncludeGrid(event.target.checked)}
            />
            Include composition grid in export
          </label>
          <div className="export-summary">
            <Check size={16} />
            <span>
              {Math.max(1, Math.round(crop.width * scale))} ×{" "}
              {Math.max(1, Math.round(crop.height * scale))} px · Original file
              preserved
            </span>
          </div>
          {error && (
            <p className="error-message" role="alert">
              {error}
            </p>
          )}
          <button
            className="button primary export-submit"
            type="submit"
            disabled={busy}
          >
            <ArrowDownToLine size={17} />
            {busy ? "Preparing your image…" : "Download image"}
          </button>
        </fieldset>
      </form>
      <p className="export-footnote">
        8-bit image · No original EXIF or GPS metadata
        {format === "jpeg" ? " · White background for transparency" : ""}
      </p>
    </Dialog>
  );
}
