import { ArrowUpRight, HardDrive } from "lucide-react";
export default function AppFooter({ onHelp }: { onHelp: () => void }) {
  return (
    <footer className="app-footer">
      <span>Made for the moments worth keeping.</span>
      <button onClick={onHelp}>
        Meet your little studio <ArrowUpRight size={13} />
      </button>
      <span className="local-indicator">
        <HardDrive size={13} />
        100% local processing
      </span>
    </footer>
  );
}
