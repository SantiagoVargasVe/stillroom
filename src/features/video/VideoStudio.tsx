import { usePlayback } from "./usePlayback";
import { useCaptures } from "./useCaptures";
import type { VideoProps } from "./types";
import VideoToolbar from "./VideoToolbar";
import VideoPreview from "./VideoPreview";
import Timeline from "./Timeline";
import VideoDetails from "./VideoDetails";
import CaptureTray from "./CaptureTray";
export default function VideoStudio(props: VideoProps) {
  const playback = usePlayback(props.active);
  const frames = useCaptures(props, playback);
  const error = frames.error || playback.error;
  return (
    <>
      <VideoToolbar
        frames={frames}
        ready={playback.ready}
        seeking={playback.seeking}
      />
      <div className="video-shell">
        <section className="video-main">
          <VideoPreview
            asset={props.asset}
            onOpen={props.onOpen}
            playback={playback}
          />
          <Timeline playback={playback} busy={frames.busy} />
          {error && (
            <div className="video-error" role="alert">
              {error}
            </div>
          )}
        </section>
        <VideoDetails asset={props.asset} playback={playback} />
      </div>
      <CaptureTray frames={frames} />
    </>
  );
}
