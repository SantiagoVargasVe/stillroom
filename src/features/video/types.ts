import type { Photo } from "../../lib/types";
import type { VideoAsset } from "../workspace/types";
export type Capture = {
  id: string;
  blob: Blob;
  url: string;
  time: number;
  width: number;
  height: number;
  name: string;
};
export type VideoProps = {
  asset: VideoAsset | null;
  active: boolean;
  onOpen: () => void;
  onEdit: (photo: Photo) => void;
  onMessage: (message: string) => void;
};
