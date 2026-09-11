import type { Workspace, WorkspaceAction } from "./types";
export const initialWorkspace: Workspace = {
  mode: "photo",
  photo: null,
  video: null,
  busy: "",
  error: "",
};
export function workspaceReducer(
  state: Workspace,
  action: WorkspaceAction,
): Workspace {
  switch (action.type) {
    case "sample":
      return { ...state, photo: action.photo };
    case "photo":
      return {
        ...state,
        photo: action.photo,
        mode: "photo",
        busy: "",
        error: "",
      };
    case "video":
      return {
        ...state,
        video: action.video,
        mode: "video",
        busy: "",
        error: "",
      };
    case "mode":
      return { ...state, mode: action.mode };
    case "loading":
      return { ...state, busy: action.message, error: "" };
    case "error":
      return { ...state, busy: "", error: action.message };
  }
}
