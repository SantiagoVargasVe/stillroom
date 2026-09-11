import type { Photo } from "../../lib/types";
export type Mode = "photo" | "video";
export type VideoAsset = { name: string; url: string; size: number };
export type Workspace = {
  mode: Mode;
  photo: Photo | null;
  video: VideoAsset | null;
  busy: string;
  error: string;
};
export type WorkspaceAction =
  | { type: "sample"; photo: Photo }
  | { type: "photo"; photo: Photo }
  | { type: "video"; video: VideoAsset }
  | { type: "mode"; mode: Mode }
  | { type: "loading"; message: string }
  | { type: "error"; message: string };
