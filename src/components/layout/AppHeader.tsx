import { Focus, CircleHelp } from "lucide-react";
export default function AppHeader({ onHelp }: { onHelp: () => void }) {
  return (
    <header className="app-header">
      <a className="brand" href="./" aria-label="Stillroom home">
        <span className="brand-mark">
          <Focus size={25} strokeWidth={1.5} />
        </span>
        <span>
          stillroom<span className="brand-period">.</span>
        </span>
      </a>
      <div className="header-tagline">A little room for your images.</div>
      <div className="header-right">
        <span className="privacy-pill">
          <span className="status-dot" />
          Private by nature
        </span>
        <button
          className="icon-button help-button"
          aria-label="Help and supported formats"
          title="Help and supported formats"
          onClick={onHelp}
        >
          <CircleHelp size={20} />
        </button>
      </div>
    </header>
  );
}
