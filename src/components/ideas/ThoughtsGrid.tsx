import { useEffect, useState } from 'react';
import { listThoughts, deleteThought } from '../../lib/thoughts';
import { formatDate } from '../../lib/format';
import LikeButton from './LikeButton';

interface Item {
  slug: string;
  title: string;
  description: string;
  category: string;
  pubDate: string; // ISO
  href: string;
  local?: boolean;
}

interface Props {
  /** Build-time thoughts from the content collection, rendered server-side. */
  seed: Item[];
}

function Card({ item, onDelete }: { item: Item; onDelete: (item: Item) => void }) {
  return (
    <div className="card relative flex flex-col overflow-hidden transition-colors">
      <LikeButton slug={item.slug} className="absolute right-4 top-4 z-10" />
      <a href={item.href} className="group flex flex-1 flex-col p-7">
        <div className="flex items-center gap-3 text-[12px]">
          <span className="tag">{item.category}</span>
          <time dateTime={item.pubDate} className="text-fog">
            {formatDate(new Date(item.pubDate))}
          </time>
        </div>
        <h3 className="mt-4 text-[20px] font-semibold leading-snug tracking-[-0.01em] text-obsidian">
          {item.title}
        </h3>
        <p className="mt-2 line-clamp-3 text-[15px] leading-relaxed text-steel">
          {item.description}
        </p>
        <span className="mt-5 inline-flex items-center gap-1.5 text-[14px] font-medium text-obsidian">
          Read thought
          <span className="transition-transform group-hover:translate-x-0.5" aria-hidden="true">
            →
          </span>
        </span>
      </a>
      {item.local && (
        <div className="flex items-center gap-3 border-t border-cloud px-7 py-4 text-[14px] font-medium">
          <a href={`/ideas/new/?edit=${encodeURIComponent(item.slug)}`} className="text-graphite transition-colors hover:text-obsidian">
            Edit
          </a>
          <span className="text-mist" aria-hidden="true">·</span>
          <button
            type="button"
            onClick={() => onDelete(item)}
            className="text-steel transition-colors hover:text-ember"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default function ThoughtsGrid({ seed }: Props) {
  const [local, setLocal] = useState<Item[]>([]);
  const [pending, setPending] = useState<Item | null>(null);

  function refresh() {
    listThoughts().then((list) =>
      setLocal(
        list.map((t) => ({
          slug: t.slug,
          title: t.title,
          description: t.description,
          category: t.category,
          pubDate: t.pubDate,
          href: `/ideas/local/?slug=${encodeURIComponent(t.slug)}`,
          local: true,
        })),
      ),
    );
  }

  useEffect(refresh, []);

  // Lock scroll + Escape-to-close while the confirm dialog is open.
  useEffect(() => {
    if (!pending) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPending(null);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [pending]);

  async function confirmDelete() {
    if (!pending) return;
    await deleteThought(pending.slug);
    setPending(null);
    refresh();
  }

  const all = [...local, ...seed].sort(
    (a, b) => +new Date(b.pubDate) - +new Date(a.pubDate),
  );

  return (
    <>
      {all.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-[16px] text-steel">No thoughts yet. Write the first one.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {all.map((item) => (
            <Card key={item.href} item={item} onDelete={setPending} />
          ))}
        </div>
      )}

      {pending && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian/50 p-4 backdrop-blur-sm"
          onClick={() => setPending(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Confirm delete"
        >
          <div
            className="card w-full max-w-sm p-7 text-center sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-ember/10 text-ember">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 6h18" />
                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
              </svg>
            </div>

            <h3 className="mt-5 text-[22px] font-semibold tracking-[-0.01em] text-obsidian">
              Delete this thought?
            </h3>
            <p className="mt-2 text-[15px] leading-relaxed text-steel">
              <span className="font-medium text-graphite">“{pending.title}”</span> will be gone for
              good. This can’t be undone.
            </p>

            <div className="mt-7 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setPending(null)}
                className="inline-flex items-center justify-center rounded-[14px] border border-cloud bg-snow px-5 py-2.5 text-[15px] font-medium text-graphite transition-colors hover:border-mist"
              >
                Keep it
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="inline-flex items-center justify-center rounded-[14px] bg-ember px-5 py-2.5 text-[15px] font-medium text-white transition hover:brightness-110"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
