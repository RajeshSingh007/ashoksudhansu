interface Props {
  /** Optional caption under the spinner. */
  label?: string;
  /** Spinner diameter in px. */
  size?: number;
  className?: string;
  /** Cover the whole viewport with a soft backdrop (page-level loads). */
  fullscreen?: boolean;
}

// A calm, on-brand loader: a hairline zinc ring with a single ember arc tracing
// around it. Inline by default; `fullscreen` for page-level loads.
export default function Loader({ label, size = 28, className = '', fullscreen = false }: Props) {
  const inner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <span className="relative inline-block" style={{ width: size, height: size }}>
        <span className="absolute inset-0 rounded-full border-2 border-cloud" />
        <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-ember [animation-duration:0.9s]" />
      </span>
      {label && <p className="text-[13px] text-fog">{label}</p>}
      <span className="sr-only">Loading…</span>
    </div>
  );

  if (fullscreen) {
    return (
      <div
        className="fixed inset-0 z-[60] flex items-center justify-center bg-paper/80 backdrop-blur-sm"
        role="status"
        aria-live="polite"
      >
        {inner}
      </div>
    );
  }

  return (
    <div className={className} role="status" aria-live="polite">
      {inner}
    </div>
  );
}
