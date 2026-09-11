import type { VideoHTMLAttributes } from "react";
import type { Playback } from "./usePlayback";
export function videoEvents(
  update: Playback["update"],
): VideoHTMLAttributes<HTMLVideoElement> {
  return {
    onLoadedMetadata: ({ currentTarget: video }) => {
      if (!Number.isFinite(video.duration) || video.duration <= 0) {
        update({
          error: "This video has no readable duration. Try another file.",
        });
        return;
      }
      update({
        duration: video.duration,
        resolution: { width: video.videoWidth, height: video.videoHeight },
      });
    },
    onLoadedData: ({ currentTarget: video }) =>
      update({
        ready: Number.isFinite(video.duration) && video.duration > 0,
        time: video.currentTime,
      }),
    onTimeUpdate: ({ currentTarget: video }) =>
      update({ time: video.currentTime }),
    onPlay: () => update({ playing: true }),
    onPause: () => update({ playing: false }),
    onSeeking: () => update({ seeking: true }),
    onSeeked: ({ currentTarget: video }) =>
      update({ seeking: false, time: video.currentTime }),
    onError: () =>
      update({
        ready: false,
        seeking: false,
        error:
          "This video cannot be played in this browser. Try an H.264 MP4 or VP8/VP9 WebM. MOV and HEVC support depends on the browser.",
      }),
  };
}
