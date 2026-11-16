import { useEffect, useState } from 'react';
import { getThought, type Thought } from '../../lib/thoughts';
import { formatDate } from '../../lib/format';

// ── Tiny plain-text formatter ───────────────────────────────────────────────
// Turns a free-written body into structured blocks so bullets, section
// headings and quotes render properly instead of as one wall of text.
type Block =
  | { type: 'h'; text: string }
  | { type: 'p'; text: string }
  | { type: 'quote'; text: string }
  | { type: 'ul'; intro?: string; items: string[] };

function parseBody(body: string): Block[] {
  const blocks: Block[] = [];
  const chunks = body.replace(/\r\n/g, '\n').split(/\n\s*\n/);

  for (const chunk of chunks) {
    const text = chunk.trim();
    if (!text) continue;

    // Blockquote: lines starting with ">"
    if (text.startsWith('>')) {
      blocks.push({ type: 'quote', text: text.replace(/^>\s?/gm, '').trim() });
      continue;
    }

    // Standalone numbered section heading, e.g. "1. Mock Debate & GD Topics"
    if (/^\d+[.)]\s+\S/.test(text) && !text.includes('\n') && text.length <= 90) {
      blocks.push({ type: 'h', text: text.replace(/^\d+[.)]\s+/, '') });
      continue;
    }

    // Bullets — either inline " • " or line-start "•/-/*"
    const hasInline = text.includes('•');
    const hasLineBullets = /^\s*[•\-*]\s+/m.test(text);
    if (hasInline || hasLineBullets) {
      let intro = '';
      let items: string[] = [];
      if (hasInline) {
        const parts = text.split('•').map((s) => s.replace(/\s+/g, ' ').trim());
        intro = parts.shift() ?? '';
        items = parts.filter(Boolean);
      } else {
        const introLines: string[] = [];
        for (const line of text.split('\n')) {
          const m = line.match(/^\s*[•\-*]\s+(.*)$/);
          if (m) items.push(m[1].trim());
          else if (items.length === 0) introLines.push(line.trim());
        }
        intro = introLines.join(' ').trim();
      }
      if (items.length) {
        blocks.push({ type: 'ul', intro: intro || undefined, items });
        continue;
      }
    }

    // Plain paragraph — collapse single newlines into spaces.
    blocks.push({ type: 'p', text: text.replace(/\s*\n\s*/g, ' ').trim() });
  }

  return blocks;
}

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

  const blocks = parseBody(thought.body);
  const firstPara = blocks.findIndex((b) => b.type === 'p');
  const words = thought.body.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));

  return (
    <article>
      <a
        href="/ideas/"
        className="inline-flex items-center gap-1.5 text-[14px] text-steel transition-colors hover:text-obsidian"
      >
        <span aria-hidden="true">←</span> All thoughts
      </a>

      {/* Header */}
      <div className="mt-6 flex flex-wrap items-center gap-3 text-[13px]">
        <span className="tag">{thought.category}</span>
        <time dateTime={thought.pubDate} className="text-fog">
          {formatDate(new Date(thought.pubDate))}
        </time>
        <span className="text-mist" aria-hidden="true">·</span>
        <span className="text-fog">{minutes} min read</span>
      </div>

      <h1 className="mt-5 text-[34px] font-semibold leading-[1.08] tracking-[-0.03em] text-obsidian sm:text-[52px]">
        {thought.title}
      </h1>
      {thought.description && (
        <p className="mt-5 text-[20px] leading-relaxed text-steel sm:text-[22px]">
          {thought.description}
        </p>
      )}

      <div className="mt-8 h-px w-full bg-cloud" aria-hidden="true" />

      {/* Body */}
      <div className="prose mt-10 max-w-none">
        {blocks.map((b, i) => {
          if (b.type === 'h') {
            return (
              <h2 key={i} className="flex items-center gap-3">
                <span className="h-px w-8 shrink-0 bg-ember" aria-hidden="true" />
                {b.text}
              </h2>
            );
          }
          if (b.type === 'quote') {
            return <blockquote key={i}>{b.text}</blockquote>;
          }
          if (b.type === 'ul') {
            return (
              <div key={i}>
                {b.intro && <p>{b.intro}</p>}
                <ul className="not-prose mt-5 flex flex-col gap-4">
                  {b.items.map((it, j) => (
                    <li key={j} className="flex gap-4 text-[18px] leading-relaxed text-graphite">
                      <span
                        className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-ember"
                        aria-hidden="true"
                      />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          }
          // Paragraph — drop-cap + lead treatment on the very first one.
          const isLead = i === firstPara;
          return (
            <p
              key={i}
              className={
                isLead
                  ? 'text-[20px] leading-relaxed text-obsidian first-letter:mr-3 first-letter:float-left first-letter:text-[56px] first-letter:font-semibold first-letter:leading-[0.78] first-letter:text-ember'
                  : ''
              }
            >
              {b.text}
            </p>
          );
        })}
      </div>
    </article>
  );
}
