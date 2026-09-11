import { useEffect, useRef, useState } from "react";
export function usePlayback(active: boolean) {
  const ref = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState({
    duration: 0,
    resolution: { width: 0, height: 0 },
    time: 0,
    playing: false,
    ready: false,
    seeking: false,
    fps: 30,
    error: "",
  });
  const update = (patch: Partial<typeof state>) =>
    setState((current) => ({ ...current, ...patch }));
  useEffect(() => {
    if (!active) ref.current?.pause();
  }, [active]);
  const maxTime = Math.max(0, state.duration - 0.001);
  function seek(value: number) {
    const video = ref.current;
    if (!video || !state.ready) return;
    video.pause();
    const target = Math.max(0, Math.min(maxTime, value));
    if (Math.abs(video.currentTime - target) < 0.0001) return;
    update({ seeking: true, time: target });
    video.currentTime = target;
  }
  async function togglePlayback() {
    const video = ref.current;
    if (!video) return;
    if (!video.paused) {
      video.pause();
      return;
    }
    try {
      await video.play();
    } catch {
      update({
        error:
          "Playback could not start. Try a video codec supported by your browser.",
      });
    }
  }
  return {
    ...state,
    ref,
    maxTime,
    update,
    seek,
    togglePlayback,
    setFps: (fps: number) => update({ fps }),
  };
}
export type Playback = ReturnType<typeof usePlayback>;
