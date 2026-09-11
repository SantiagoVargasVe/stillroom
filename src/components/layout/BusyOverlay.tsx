import { LoaderCircle } from "lucide-react";
export default function BusyOverlay({ busy }: { busy: string }) {
  return (
    <div className="busy-overlay" role="status" aria-live="polite">
      <LoaderCircle size={29} className="spin" />
      <strong>{busy}</strong>
      <span>Your file stays on this device.</span>
    </div>
  );
}
