import { useReducer } from "react";
import { historyReducer, newHistory } from "./history";
import type { Edits } from "../../lib/types";
export function useEditHistory() {
  const [state, dispatch] = useReducer(historyReducer, undefined, newHistory);
  return {
    current: state.draft ?? state.entries[state.index],
    draft: state.draft,
    canUndo: state.index > 0,
    canRedo: state.index < state.entries.length - 1,
    setDraft: (edits: Edits | null) => dispatch({ type: "preview", edits }),
    commit: (edits: Edits) => dispatch({ type: "commit", edits }),
    undo: () => dispatch({ type: "undo" }),
    redo: () => dispatch({ type: "redo" }),
  };
}
