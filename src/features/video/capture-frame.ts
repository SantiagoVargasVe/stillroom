import { canvas2d, checkDimensions } from "../../lib/canvas";
import { toBlob } from "../../lib/download";
import { formatTime } from "../../lib/formats";
import { createId } from "../../lib/id";
export async function captureFrame(
  video: HTMLVideoElement,
  sourceName: string,
) {
  const width = video.videoWidth,
    height = video.videoHeight,
    time = video.currentTime;
  checkDimensions(width, height);
  const { canvas, context } = canvas2d(width, height);
  try {
    context.drawImage(video, 0, 0);
    const blob = await toBlob(canvas);
    const name = `${sourceName.replace(/\.[^.]+$/, "")}-frame-${formatTime(time).replace(/[:.]/g, "-")}.png`;
    return { id: createId(), blob, time, width, height, name };
  } finally {
    canvas.width = 0;
    canvas.height = 0;
  }
}
