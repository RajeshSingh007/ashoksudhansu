import { useEffect, useState } from 'react';
import { listThoughts, deleteThought } from '../../lib/thoughts';
import { formatDate } from '../../lib/format';

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

function Card({ item, onDelete }: { item: Item; onDelete: (slug: string) => void }) {
  return (
    <div className="card flex flex-col overflow-hidden transition-colors">
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
            onClick={() => onDelete(item.slug)}
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

  async function handleDelete(slug: string) {
    if (!window.confirm('Delete this thought? This cannot be undone.')) return;
    await deleteThought(slug);
    refresh();
  }

  const all = [...local, ...seed].sort(
    (a, b) => +new Date(b.pubDate) - +new Date(a.pubDate),
  );

  if (all.length === 0) {
    return (
      <div className="card p-12 text-center">
        <p className="text-[16px] text-steel">
          No thoughts yet. Write the first one.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {all.map((item) => (
        <Card key={item.href} item={item} onDelete={handleDelete} />
      ))}
    </div>
  );
}
