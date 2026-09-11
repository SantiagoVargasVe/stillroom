import { loadPhoto } from "../../lib/load-photo";
import type { Photo } from "../../lib/types";
export async function loadSample(signal: AbortSignal): Promise<Photo | null> {
  try {
    const response = await fetch(
      `${import.meta.env.BASE_URL}samples/alpine.jpg`,
      { signal },
    );
    if (!response.ok) return null;
    const blob = await response.blob();
    const photo = await loadPhoto(
      new File([blob], "alpine-afternoon.jpg", { type: "image/jpeg" }),
    );
    return { ...photo, kind: "sample" };
  } catch {
    return null;
  }
}
