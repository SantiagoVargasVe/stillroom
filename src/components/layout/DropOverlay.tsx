import { Image as ImageIcon } from "lucide-react";
export default function DropOverlay() {
  return (
    <div className="drop-overlay">
      <div>
        <ImageIcon size={40} strokeWidth={1.3} />
        <h2>Drop a little inspiration.</h2>
        <p>Open one image or video to get started.</p>
      </div>
    </div>
  );
}
