import { useRef, useState, type DragEvent } from "react";
export function useFileDrop(
  openFile: (file: File) => Promise<void>,
  busy: boolean,
) {
  const [dragging, setDragging] = useState(false);
  const depth = useRef(0);
  return {
    dragging,
    handlers: {
      onDragEnter(event: DragEvent) {
        if (!event.dataTransfer.types.includes("Files")) return;
        event.preventDefault();
        depth.current++;
        setDragging(true);
      },
      onDragLeave(event: DragEvent) {
        event.preventDefault();
        depth.current = Math.max(0, depth.current - 1);
        if (!depth.current) setDragging(false);
      },
      onDragOver(event: DragEvent) {
        event.preventDefault();
        event.dataTransfer.dropEffect = busy ? "none" : "copy";
      },
      onDrop(event: DragEvent) {
        event.preventDefault();
        depth.current = 0;
        setDragging(false);
        if (!busy && event.dataTransfer.files[0])
          void openFile(event.dataTransfer.files[0]);
      },
    },
  };
}
