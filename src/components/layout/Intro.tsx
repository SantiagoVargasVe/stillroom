import { ShieldCheck } from "lucide-react";
export default function Intro() {
  return (
    <section className="intro">
      <div>
        <div className="eyebrow">
          <span />
          THE EVERYDAY IMAGE STUDIO
        </div>
        <h1>
          Good moments. <em>Great frames.</em>
        </h1>
        <p>Crop a little. Find your balance. Keep the moment.</p>
      </div>
      <div className="intro-note">
        <ShieldCheck size={18} strokeWidth={1.5} />
        <span>
          On your device.
          <br />
          <strong>Always yours.</strong>
        </span>
      </div>
    </section>
  );
}
