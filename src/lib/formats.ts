export const rawExtensions = [
  "arw",
  "cr2",
  "cr3",
  "dng",
  "nef",
  "nrw",
  "orf",
  "raf",
  "rw2",
  "pef",
  "srw",
  "raw",
];
export const acceptMedia = `image/*,video/*,${rawExtensions.map((ext) => `.${ext}`).join(",")}`;
export const isRaw = (name: string) =>
  rawExtensions.includes(name.split(".").pop()?.toLowerCase() ?? "");
export const isVideo = (file: File) =>
  file.type.startsWith("video/") ||
  /\.(mp4|mov|m4v|webm|ogv|mkv|avi)$/i.test(file.name);
export const formatBytes = (bytes: number) =>
  bytes < 1024 * 1024
    ? `${Math.round(bytes / 1024)} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
export const formatTime = (time: number) => {
  const ms = Math.max(0, Math.round(time * 1000));
  const seconds = Math.floor(ms / 1000);
  return `${Math.floor(seconds / 60)
    .toString()
    .padStart(
      2,
      "0",
    )}:${(seconds % 60).toString().padStart(2, "0")}.${(ms % 1000).toString().padStart(3, "0")}`;
};
