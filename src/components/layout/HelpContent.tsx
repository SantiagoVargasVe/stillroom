import { ShieldCheck } from "lucide-react";
export default function HelpContent() {
  return (
    <div className="help-content">
      <p>
        Stillroom is a small, private workspace for your photos and video
        frames. Open a file or drop it anywhere to get started.
      </p>
      <h3>Photos, with room to play</h3>
      <p>
        Crop using the corners, choose an aspect ratio, show a composition grid,
        rotate or flip, and adjust light and color. Undo and redo let you try
        things freely. Export a PNG, JPEG or WebP at full or reduced resolution.
      </p>
      <h3>RAW, without the upload</h3>
      <p>
        ARW, CR2, CR3, DNG, NEF, RAF and other camera RAW files are decoded on
        your device with LibRaw. Support depends on the camera and compression.
        Development produces an 8-bit sRGB image using camera white balance;
        this is not a lossless RAW editing workflow.
      </p>
      <h3>A photo inside a video</h3>
      <p>
        Open a browser-playable video, scrub or step by a small time interval,
        then capture a full-resolution PNG. Download it directly or send it to
        Photo studio. Seek steps are time-based, not guaranteed frame-accurate.
      </p>
      <h3>A few useful details</h3>
      <p>
        HEIC, HEVC and MOV support depends on your browser. Images are limited
        to 60 megapixels and 16,384 px per side, and RAW files to 150 MB. Edits
        and captures live only in this tab: download what you want to keep
        before replacing a file or closing the page. Exports omit original EXIF
        and GPS metadata. Grids are preview-only unless you choose to include
        them in export.
      </p>
      <div className="help-privacy">
        <ShieldCheck size={20} />
        <span>
          No accounts, uploads, analytics, or external processing. Even the RAW
          decoder is served locally.
        </span>
      </div>
    </div>
  );
}
