import { createId } from "./id";
import type LibRaw from "libraw-wasm";
import { canvas2d, checkDimensions } from "./canvas";
import type { Photo } from "./types";

export async function decodeRaw(file: File): Promise<Photo> {
  const moduleUrl = new URL(
    `${import.meta.env.BASE_URL}vendor/libraw/index.js`,
    document.baseURI,
  ).href;
  const { default: Decoder } = (await import(/* @vite-ignore */ moduleUrl)) as {
    default: typeof LibRaw;
  };
  const decoder = new Decoder();
  // Worker startup failures must not leave the editor stuck forever.
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(
        new Error(
          "RAW decoding took too long. Try a smaller file or another browser.",
        ),
      );
      decoder.dispose();
    }, 90_000);
  });
  try {
    return await Promise.race([
      timeout,
      (async (): Promise<Photo> => {
        await decoder.open(new Uint8Array(await file.arrayBuffer()), {
          useCameraWb: true,
          outputColor: 1,
          outputBps: 8,
          userQual: 3,
        });
        const metadata = await decoder.metadata();
        if (metadata) checkDimensions(metadata.width, metadata.height);
        const image = await decoder.imageData();
        if (!image || image.bits !== 8 || ![1, 3, 4].includes(image.colors))
          throw new Error("Unsupported RAW pixel layout.");
        checkDimensions(image.width, image.height);
        if (image.data.length < image.width * image.height * image.colors)
          throw new Error("Incomplete RAW pixels.");
        const { canvas, context } = canvas2d(image.width, image.height);
        const rgba = context.createImageData(image.width, image.height);
        for (let pixel = 0; pixel < image.width * image.height; pixel++) {
          const s = pixel * image.colors,
            d = pixel * 4;
          rgba.data[d] = image.data[s];
          rgba.data[d + 1] = image.data[s + (image.colors === 1 ? 0 : 1)];
          rgba.data[d + 2] = image.data[s + (image.colors === 1 ? 0 : 2)];
          rgba.data[d + 3] = 255;
        }
        context.putImageData(rgba, 0, 0);
        return {
          id: createId(),
          name: file.name,
          source: canvas,
          width: canvas.width,
          height: canvas.height,
          size: file.size,
          kind: "raw",
          camera: metadata
            ? `${metadata.camera_make} ${metadata.camera_model}`.trim()
            : undefined,
          release: () => {
            canvas.width = 0;
            canvas.height = 0;
          },
        };
      })(),
    ]);
  } catch (error) {
    if (error instanceof Error && /limit|too long/.test(error.message))
      throw error;
    throw new Error(
      "This camera RAW file could not be decoded. Camera models and compression variants vary; try an uncompressed RAW or DNG, or export a JPEG from your camera software.",
    );
  } finally {
    clearTimeout(timer);
    decoder.dispose();
  }
}
