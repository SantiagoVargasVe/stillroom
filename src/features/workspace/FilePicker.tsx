import { Plus } from "lucide-react";
import type { RefObject } from "react";
import { acceptMedia } from "../../lib/formats";
type Props = {
  inputRef: RefObject<HTMLInputElement | null>;
  busy: boolean;
  onOpen: () => void;
  onFile: (file: File) => Promise<void>;
};
export default function FilePicker({ inputRef, busy, onOpen, onFile }: Props) {
  return (
    <>
      <button
        className="button secondary open-button"
        onClick={onOpen}
        disabled={busy}
      >
        <Plus size={17} />
        Open file<span className="open-hint">or drop it here</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        aria-label="Open image or video file"
        accept={acceptMedia}
        onChange={(event) => {
          if (event.target.files?.[0]) void onFile(event.target.files[0]);
          event.target.value = "";
        }}
      />
    </>
  );
}
