import { createId } from "./id";
import { isRaw } from "./formats";
import { checkDimensions } from "./canvas";
import type { Photo } from "./types";

export async function loadPhoto(file: File): Promise<Photo> {
  if (isRaw(file.name)) {
    if (file.size > 150 * 1024 * 1024)
      throw new Error(
        "For RAW files, please choose a file smaller than 150 MB.",
      );
    const { decodeRaw } = await import("./raw");
    return decodeRaw(file);
  }
  if (file.size > 200 * 1024 * 1024)
    throw new Error("Please choose an image smaller than 200 MB.");
  const url = URL.createObjectURL(file);
  const source = new Image();
  source.src = url;
  try {
    await source.decode();
    checkDimensions(source.naturalWidth, source.naturalHeight);
    return {
      id: createId(),
      name: file.name,
      source,
      width: source.naturalWidth,
      height: source.naturalHeight,
      size: file.size,
      kind: "image",
      release: () => {
        URL.revokeObjectURL(url);
        source.src = "";
      },
    };
  } catch (error) {
    URL.revokeObjectURL(url);
    if (error instanceof Error && error.message.includes("limit")) throw error;
    throw new Error(
      "This image could not be opened. Try JPEG, PNG, WebP, or a supported camera RAW file. HEIC support depends on your browser.",
    );
  }
}
