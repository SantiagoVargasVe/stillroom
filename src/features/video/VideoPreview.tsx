import { Film, ImagePlus } from "lucide-react";
import type { VideoProps } from "./types";
import type { Playback } from "./usePlayback";
import { videoEvents } from "./video-events";
export default function VideoPreview({
  asset,
  onOpen,
  playback,
}: Pick<VideoProps, "asset" | "onOpen"> & { playback: Playback }) {
  const { ref, update } = playback;
  return (
    <>
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
            {...videoEvents(update)}
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
    </>
  );
}
