import { useEffect, useRef, useState } from "react";
import { loadPhoto } from "../../lib/load-photo";
import { formatTime } from "../../lib/formats";
import { captureFrame } from "./capture-frame";
import type { Capture, VideoProps } from "./types";
import type { Playback } from "./usePlayback";
export function useCaptures(props: VideoProps, playback: Playback) {
  const [captures, setCaptures] = useState<Capture[]>([]);
  const [status, setStatus] = useState({ busy: false, error: "" });
  const session = useRef({
    generation: 0,
    pending: false,
    urls: new Set<string>(),
  });
  useEffect(() => {
    const owner = session.current;
    return () => {
      owner.generation++;
      owner.urls.forEach(URL.revokeObjectURL);
      owner.urls.clear();
    };
  }, []);
  async function run(action: (current: () => boolean) => Promise<void>) {
    const owner = session.current;
    if (owner.pending) return;
    const generation = owner.generation;
    const current = () => generation === owner.generation;
    owner.pending = true;
    setStatus({ busy: true, error: "" });
    try {
      await action(current);
      if (current()) setStatus({ busy: false, error: "" });
    } catch (reason) {
      if (current())
        setStatus({
          busy: false,
          error:
            reason instanceof Error
              ? reason.message
              : "Could not prepare this frame.",
        });
    } finally {
      owner.pending = false;
    }
  }
  function capture() {
    const video = playback.ref.current;
    if (
      !video ||
      !props.asset ||
      !playback.ready ||
      playback.seeking ||
      video.seeking ||
      video.readyState < 2
    )
      return;
    if (captures.length >= 8) {
      setStatus({
        busy: false,
        error:
          "Keep up to 8 captures at a time. Download and remove a frame to make room.",
      });
      return;
    }
    const name = props.asset.name;
    video.pause();
    return run(async (current) => {
      const frame = await captureFrame(video, name);
      if (!current()) return;
      const url = URL.createObjectURL(frame.blob);
      session.current.urls.add(url);
      setCaptures((items) => [{ ...frame, url }, ...items]);
      props.onMessage(`Frame captured at ${formatTime(frame.time)}`);
    });
  }
  function editFrame(frame: Capture) {
    return run(async (current) => {
      const photo = await loadPhoto(
        new File([frame.blob], frame.name, { type: "image/png" }),
      );
      if (current()) props.onEdit({ ...photo, kind: "frame" });
      else photo.release();
    });
  }
  function removeCapture(frame: Capture) {
    URL.revokeObjectURL(frame.url);
    session.current.urls.delete(frame.url);
    setCaptures((items) => items.filter((item) => item.id !== frame.id));
  }
  return { captures, ...status, capture, editFrame, removeCapture };
}
export type Captures = ReturnType<typeof useCaptures>;
