import { useEffect, useReducer, useState } from "react";
import { isRaw, isVideo } from "../../lib/formats";
import { loadPhoto } from "../../lib/load-photo";
import type { Photo } from "../../lib/types";
import { MediaSession } from "./media-session";
import { initialWorkspace, workspaceReducer } from "./reducer";
import type { Mode } from "./types";

export function useWorkspace() {
  const [state, dispatch] = useReducer(workspaceReducer, initialWorkspace);
  const [session] = useState(() => new MediaSession());
  // Synchronizes the sample request and media resources with the workspace lifetime.
  useEffect(
    () => session.start((photo) => dispatch({ type: "sample", photo })),
    [session],
  );
  function editPhoto(photo: Photo) {
    session.replacePhoto(photo);
    dispatch({ type: "photo", photo });
  }
  async function openFile(file: File) {
    const ticket = session.begin();
    if (ticket === null) return;
    dispatch({
      type: "loading",
      message: isRaw(file.name)
        ? "Developing your RAW photo… This can take a moment."
        : "Opening your file…",
    });
    try {
      if (isVideo(file)) {
        const video = {
          name: file.name,
          size: file.size,
          url: URL.createObjectURL(file),
        };
        session.replaceVideo(video);
        dispatch({ type: "video", video });
      } else {
        const photo = await loadPhoto(file);
        if (session.isCurrent(ticket)) editPhoto(photo);
        else photo.release();
      }
    } catch (reason) {
      if (session.isCurrent(ticket))
        dispatch({
          type: "error",
          message:
            reason instanceof Error
              ? reason.message
              : "This file could not be opened.",
        });
    } finally {
      session.finish(ticket);
    }
  }
  return {
    ...state,
    openFile,
    editPhoto,
    setMode: (mode: Mode) => dispatch({ type: "mode", mode }),
    clearError: () => dispatch({ type: "error", message: "" }),
  };
}
