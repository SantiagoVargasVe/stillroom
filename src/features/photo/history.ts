import { initialEdits } from "../../lib/edit-defaults";
import type { Edits } from "../../lib/types";
export type History = { entries: Edits[]; index: number; draft: Edits | null };
export type HistoryAction =
  | { type: "preview"; edits: Edits | null }
  | { type: "commit"; edits: Edits }
  | { type: "undo" }
  | { type: "redo" };
export const newHistory = (): History => ({
  entries: [initialEdits()],
  index: 0,
  draft: null,
});
export function historyReducer(state: History, action: HistoryAction): History {
  if (action.type === "preview") return { ...state, draft: action.edits };
  if (action.type === "undo")
    return { ...state, index: Math.max(0, state.index - 1), draft: null };
  if (action.type === "redo")
    return {
      ...state,
      index: Math.min(state.entries.length - 1, state.index + 1),
      draft: null,
    };
  if (
    JSON.stringify(action.edits) === JSON.stringify(state.entries[state.index])
  )
    return { ...state, draft: null };
  const entries = [
    ...state.entries.slice(0, state.index + 1),
    action.edits,
  ].slice(-60);
  return { entries, index: entries.length - 1, draft: null };
}
