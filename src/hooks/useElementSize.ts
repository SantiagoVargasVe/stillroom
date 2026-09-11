import { useCallback, useState } from "react";
export function useElementSize() {
  const [size, setSize] = useState({ width: 800, height: 500 });
  // React 19 callback refs own setup and cleanup for the observed DOM node.
  const measure = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width) setSize({ width, height });
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return { measure, size };
}
