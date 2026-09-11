import { useRef, useState } from "react";
import { formatBytes } from "../../lib/formats";
import { exportImage } from "./export-image";
import type { ExportOptions, ExportProps } from "./types";
export function useExport(props: ExportProps) {
  const [options, setOptions] = useState<ExportOptions>({
    format: "png",
    quality: 92,
    scale: 1,
    name: props.photo.name.replace(/\.[^.]+$/, "") + "-stillroom",
    includeGrid: false,
  });
  const [status, setStatus] = useState({ busy: false, error: "" });
  const pending = useRef(false);
  function update(patch: Partial<ExportOptions>) {
    setOptions((current) => ({ ...current, ...patch }));
  }
  async function save() {
    if (pending.current) return;
    pending.current = true;
    setStatus({ busy: true, error: "" });
    try {
      await new Promise((resolve) =>
        requestAnimationFrame(() => setTimeout(resolve, 0)),
      );
      const size = await exportImage(props, options);
      props.onMessage(`Image exported · ${formatBytes(size)}`);
      props.onClose();
    } catch (reason) {
      setStatus({
        busy: false,
        error:
          reason instanceof Error
            ? reason.message
            : "Export failed. Try a smaller size.",
      });
    } finally {
      pending.current = false;
    }
  }
  return { ...options, ...status, update, save };
}
export type ExportController = ReturnType<typeof useExport>;
