import { X } from "lucide-react";
export default function ImportError({
  error,
  onClose,
}: {
  error: string;
  onClose: () => void;
}) {
  return (
    <div className="import-error" role="alert">
      <span>{error}</span>
      <button
        className="icon-button"
        aria-label="Dismiss error"
        onClick={onClose}
      >
        <X size={17} />
      </button>
    </div>
  );
}
