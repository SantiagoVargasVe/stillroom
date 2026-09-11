import type { Photo } from "../../lib/types";
import type { VideoAsset } from "./types";
import { loadSample } from "./load-sample";

// Owns browser resources and asynchronous import lifetimes, never React state.
export class MediaSession {
  private generation = 0;
  private active = false;
  private locked = false;
  private controller?: AbortController;
  private photo: Photo | null = null;
  private video: VideoAsset | null = null;

  start(onSample: (photo: Photo) => void) {
    this.active = true;
    const ticket = ++this.generation;
    this.controller = new AbortController();
    void loadSample(this.controller.signal).then((photo) => {
      if (!photo) return;
      if (!this.isCurrent(ticket)) {
        photo.release();
        return;
      }
      this.replacePhoto(photo);
      onSample(photo);
    });
    return () => this.dispose();
  }
  begin() {
    if (this.locked || !this.active) return null;
    this.locked = true;
    this.controller?.abort();
    return ++this.generation;
  }
  isCurrent(ticket: number) {
    return this.active && ticket === this.generation;
  }
  finish(ticket: number) {
    if (ticket === this.generation) this.locked = false;
  }
  replacePhoto(photo: Photo) {
    this.photo?.release();
    this.photo = photo;
  }
  replaceVideo(video: VideoAsset) {
    if (this.video) URL.revokeObjectURL(this.video.url);
    this.video = video;
  }
  private dispose() {
    this.active = false;
    this.locked = false;
    ++this.generation;
    this.controller?.abort();
    this.photo?.release();
    if (this.video) URL.revokeObjectURL(this.video.url);
    this.photo = null;
    this.video = null;
  }
}
