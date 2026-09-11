# Stillroom

A private, frontend-only photo studio and video frame grabber, built with **React 19, TypeScript, Vite 6, and Tailwind CSS 4**. Everything happens in the browser. No application server, API, database, account, analytics, or media uploads.

## Run locally

Requires Node.js 22.14 or newer. From this directory:

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. To choose a different development port:

```sh
npm run dev -- --port 5176
```

## What it does

- Open an image or video using the file picker, or drag a file anywhere into the app.
- Crop with mouse, touch, or keyboard-accessible handles. Presets: free, original, 1:1, 4:3, 3:2, 16:9, 4:5, and 9:16.
- Preview rule-of-thirds, golden-ratio, and 5 × 5 composition guides.
- Rotate by 90° and flip horizontally or vertically. These actions reset the crop to the full transformed image; undo restores the previous crop and transform together.
- Adjust exposure, contrast, saturation, and warmth; apply Natural, Warm, or Mono looks. Compare the original color and undo/redo up to 59 prior edit states.
- Export PNG, JPEG, or WebP, choose compression quality and output scale, and optionally include the grid. Grids are excluded by default. PNG/WebP preserve transparency; JPEG flattens it against white.
- Open browser-playable videos, scrub, jump to a time in seconds, and step by 1/24, 1/25, 1/30, or 1/60 second. Capture full-resolution PNGs; download them or open them in the photo editor. Keep up to eight captures per video.
- Decode camera RAW files locally with LibRaw compiled to WebAssembly. Verified with the upstream Sony ARW example, including export at the decoded full resolution.

An included landscape photograph opens as a clearly labeled sample. Importing your own file replaces it.

## RAW and browser limits

RAW support uses `libraw-wasm` 1.6.0, loaded only when opening a RAW file. The actual sensor image is developed with camera white balance to **8-bit sRGB**; this is not embedded-preview extraction, nondestructive RAW development, or RAW export. Subsequent light/color adjustments operate on the developed pixels. Camera models and compression variants supported by this LibRaw build vary; newer/lossy formats may fail with an actionable error. Common extensions offered include ARW, CR2, CR3, DNG, NEF, NRW, ORF, RAF, RW2, PEF, SRW, and RAW.

- Images: up to 60 megapixels and 16,384 px per side; ordinary image files up to 200 MB; RAW files up to 150 MB. Large files still depend on available device/browser memory.
- RAW development runs in a Web Worker; previews are downscaled to at most 1,600 px on their longest edge. Exports are rendered again from the full-resolution source, never from the preview.
- HEIC images, HEVC video, and MOV containers depend on browser/OS codecs. H.264 MP4 and VP8/VP9 WebM are good video starting points. There is no server-side transcoder or FFmpeg runtime in the app.
- Video steps use browser time seeking, so they are **not guaranteed to correspond to exact source frame boundaries**, particularly for variable-frame-rate footage. Captures use the currently decoded frame's native dimensions.
- Files, edit history, and captures stay in this tab's memory. Replacing a photo resets its edits; replacing a video clears its captures. Download before replacing a file, reloading, or closing the page. Switching between tabs preserves both workspaces.
- Exported images omit original EXIF/GPS metadata and RAW bit depth. Original files are never overwritten.

## Static production build

```sh
npm run build
npm run preview
```

Serve the generated **`dist/` directory** with any ordinary static web server. No Node.js process is needed in production. Relative asset paths support hosting under a subdirectory. Open it over HTTP(S), not `file://`.

The `predev` and `prebuild` scripts copy the installed decoder's worker, JavaScript, and WASM into `public/vendor/libraw/`. They must remain together. Vite includes them in `dist/vendor/libraw/`; this avoids worker/asset bundling issues and removes any need for runtime CDNs. Generated vendor files are ignored by Git and recreated from the pinned npm package. Keep the entire `dist/` output when serving the app; do not omit the `.wasm` or worker files.

## Verification

```sh
npm run lint
npm run build
npx playwright install chromium
npm test
```

The Playwright suite starts a **production build** on `127.0.0.1:4176`. It checks exported crop dimensions and actual pixels, grid inclusion, rotation/flips, undo/redo, alpha, JPEG/WebP downloads, pointer cropping, video seeking/capture/editing, import failures, mobile layout, and RAW development. Desktop/mobile screenshots are written to the ignored `test-results/` directory.

The small synthetic H.264 video fixture is included in `tests/fixtures/motion.mp4`. Regenerate it with a locally installed FFmpeg if needed (FFmpeg is only a development fixture tool):

```sh
ffmpeg -y -f lavfi -i 'testsrc2=size=640x360:rate=30:duration=3' -c:v libx264 -pix_fmt yuv420p tests/fixtures/motion.mp4
```

The optional 30 MB Sony RAW fixture is intentionally excluded from Git. Download it from the decoder project's own integration sample:

```sh
curl -L --fail https://raw.githubusercontent.com/ybouane/LibRaw-Wasm/main/example-sony.ARW -o tests/fixtures/example-sony.ARW
npm test
```

Without that file, the RAW integration test is explicitly skipped; all other tests still run. With it present, the test also checks that RAW import/export makes no HTTP requests outside the local app origin.

## Code map

- `src/App.tsx`: file import, sample, workspace tabs, privacy/help, error/loading states, and resource ownership.
- `src/components/PhotoEditor.tsx`: crop/composition controls, edit history, previews, and export dialog.
- `src/components/VideoStudio.tsx`: local video playback, seeking, captures, and transfer to the editor.
- `src/lib/media.ts`: shared canvas rendering, pixel adjustments, crop geometry, encoding, and download helpers.
- `src/lib/raw.ts`: lazy RAW decoding with timeout and worker disposal.
- `scripts/sync-vendor.mjs`: local decoder asset preparation.

## Credits

- [LibRaw-Wasm](https://github.com/ybouane/LibRaw-Wasm) for the browser RAW decoder; [LibRaw](https://www.libraw.org/) for underlying camera support.
- [React Image Crop](https://github.com/dominictobias/react-image-crop) for accessible crop interactions.
- [Lucide](https://lucide.dev/) for icons; [Tailwind CSS](https://tailwindcss.com/docs/installation/using-vite) for styling integration.
- Included sample: [Unsplash landscape image](https://images.unsplash.com/photo-1464822759023-fed622ff2c3b), downloaded and served locally, under the [Unsplash license](https://unsplash.com/license). No image requests are made to Unsplash while using the app.

Dependency license information and source locations are listed in `THIRD_PARTY_NOTICES.md`.
