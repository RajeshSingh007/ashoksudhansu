import { useEffect, useState } from 'react';
import { listThoughts } from '../../lib/thoughts';
import { formatDate } from '../../lib/format';
import LikeButton from '../ideas/LikeButton';

interface Item {
  slug: string;
  title: string;
  description: string;
  category: string;
  pubDate: string; // ISO
  href: string;
}

interface Props {
  /** Build-time thoughts from the content collection (may be empty). */
  seed: Item[];
}

export default function FeaturedThoughts({ seed }: Props) {
  const [local, setLocal] = useState<Item[]>([]);

  useEffect(() => {
    const load = () =>
      listThoughts().then((list) =>
        setLocal(
          list.map((t) => ({
            slug: t.slug,
            title: t.title,
            description: t.description,
            category: t.category,
            pubDate: t.pubDate,
            href: `/ideas/local/?slug=${encodeURIComponent(t.slug)}`,
          })),
        ),
      );
    load();
    // Re-read when restored from bfcache (browser back) or changed in another tab.
    const onShow = (e: PageTransitionEvent) => {
      if (e.persisted) load();
    };
    window.addEventListener('pageshow', onShow);
    window.addEventListener('storage', load);
    return () => {
      window.removeEventListener('pageshow', onShow);
      window.removeEventListener('storage', load);
    };
  }, []);

  const featured = [...local, ...seed]
    .sort((a, b) => +new Date(b.pubDate) - +new Date(a.pubDate))
    .slice(0, 2);

  return (
    <ol className="flex flex-col justify-center rounded-[36px] border border-cloud bg-snow px-7 sm:px-9">
      {featured.length === 0 ? (
        <li className="py-12 text-center">
          <p className="text-[15px] leading-relaxed text-steel">
            The first thoughts will appear here once they’re published.
          </p>
          <a
            href="/ideas/new/"
            className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-medium text-obsidian"
          >
            Write a thought
            <span aria-hidden="true">→</span>
          </a>
        </li>
      ) : (
        featured.map((item, i) => (
          <li key={item.href} className="relative border-cloud [&:not(:first-child)]:border-t">
            <LikeButton slug={item.slug} className="absolute right-0 top-8 z-10" />
            <a href={item.href} className="group flex gap-6 py-8 transition-opacity">
              <span className="select-none pt-1 text-[22px] font-semibold tabular-nums leading-none text-mist transition-colors group-hover:text-ember">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-3 text-[12px]">
                  <span className="tag">{item.category}</span>
                  <time dateTime={item.pubDate} className="text-fog">
                    {formatDate(new Date(item.pubDate))}
                  </time>
                </div>
                <h3 className="mt-4 text-[22px] font-semibold leading-snug tracking-[-0.01em] text-obsidian decoration-mist underline-offset-4 group-hover:underline">
                  {item.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-[15px] leading-relaxed text-steel">
                  {item.description}
                </p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-[14px] font-medium text-obsidian">
                  Read thought
                  <span className="transition-transform group-hover:translate-x-0.5" aria-hidden="true">
                    →
                  </span>
                </span>
              </div>
            </a>
          </li>
        ))
      )}
    </ol>
  );
}
