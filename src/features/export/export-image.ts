import { renderPhoto } from "../../lib/render-photo";
import { drawGrid } from "../../lib/grid";
import { toBlob, download } from "../../lib/download";
import type { ExportOptions, ExportProps } from "./types";
export async function exportImage(
  { photo, edits, grid }: ExportProps,
  options: ExportOptions,
) {
  const { format, scale, quality, name, includeGrid } = options;
  const canvas = renderPhoto(photo, edits, { scale });
  try {
    if (includeGrid) drawGrid(canvas, grid);
    if (format === "jpeg") {
      const context = canvas.getContext("2d")!;
      context.globalCompositeOperation = "destination-over";
      context.fillStyle = "#fff";
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
    const blob = await toBlob(canvas, `image/${format}`, quality / 100);
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
    return blob.size;
  } finally {
    canvas.width = 0;
    canvas.height = 0;
  }
}
