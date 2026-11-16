import { useEffect, useState } from 'react';
import { getThought, type Thought } from '../../lib/thoughts';
import { formatDate } from '../../lib/format';

// Reads a browser-authored thought by ?slug= and renders it. Client-only: these
// thoughts live in localStorage, so there's nothing to render on the server.
export default function LocalThoughtReader() {
  const [thought, setThought] = useState<Thought | null | undefined>(undefined);

  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get('slug') ?? '';
    getThought(slug).then((t) => setThought(t ?? null));
  }, []);

  if (thought === undefined) {
    return <p className="text-[15px] text-fog">Loading…</p>;
  }

  if (thought === null) {
    return (
      <div>
        <p className="text-[17px] text-steel">That thought isn’t on this device.</p>
        <a
          href="/ideas/"
          className="mt-5 inline-flex items-center gap-1.5 text-[14px] font-medium text-obsidian"
        >
          <span aria-hidden="true">←</span> All thoughts
        </a>
      </div>
    );
  }

  const paragraphs = thought.body.split(/\n{2,}/).filter(Boolean);

  return (
    <article>
      <a
        href="/ideas/"
        className="inline-flex items-center gap-1.5 text-[14px] text-steel transition-colors hover:text-obsidian"
      >
        <span aria-hidden="true">←</span> All thoughts
      </a>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <span className="tag">{thought.category}</span>
        <time dateTime={thought.pubDate} className="text-[13px] text-fog">
          {formatDate(new Date(thought.pubDate))}
        </time>
      </div>

      <h1 className="mt-5 text-[34px] font-semibold leading-[1.1] tracking-[-0.03em] text-obsidian sm:text-[48px]">
        {thought.title}
      </h1>
      {thought.description && (
        <p className="mt-5 text-[19px] leading-relaxed text-steel">{thought.description}</p>
      )}

      <div className="prose mt-12 max-w-none">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </article>
  );
}
