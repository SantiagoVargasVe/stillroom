import { LockKeyhole, Sparkles, Leaf } from "lucide-react";
export default function Benefits() {
  return (
    <section className="benefits" aria-label="Features">
      <div>
        <LockKeyhole size={19} />
        <p>
          <strong>Your files stay with you</strong>
          <span>No uploads. No accounts. Just create.</span>
        </p>
      </div>
      <div>
        <Sparkles size={19} />
        <p>
          <strong>A little RAW potential</strong>
          <span>Camera RAW, developed right in your browser.</span>
        </p>
      </div>
      <div>
        <Leaf size={20} />
        <p>
          <strong>Small studio. Plenty of possibility.</strong>
          <span>Photos, frames, and a fresh point of view.</span>
        </p>
      </div>
    </section>
  );
}
