import { Check, X } from "lucide-react";
export default function Toast({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  return (
    <div className="toast" role="status">
      <Check size={17} />
      {message}
      <button aria-label="Dismiss notification" onClick={onClose}>
        <X size={15} />
      </button>
    </div>
  );
}
