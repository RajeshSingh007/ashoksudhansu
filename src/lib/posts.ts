import { getCollection, type CollectionEntry } from 'astro:content';

export type Idea = CollectionEntry<'ideas'>;

const isProd = import.meta.env.PROD;

/** All published essays, newest first. Drafts hidden in production builds. */
export async function getPublishedIdeas(): Promise<Idea[]> {
  const ideas = await getCollection('ideas', ({ data }) => {
    return isProd ? data.draft !== true : true;
  });
  return ideas.sort(
    (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime(),
  );
}

/** Featured essays for the homepage, newest first, capped at `limit`. */
export async function getFeaturedIdeas(limit = 3): Promise<Idea[]> {
  const all = await getPublishedIdeas();
  const featured = all.filter((i) => i.data.featured);
  return (featured.length ? featured : all).slice(0, limit);
}

const WORDS_PER_MINUTE = 200;

/** Rough reading time in minutes from a raw markdown body. */
export function readingTime(body = ''): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

// Re-exported for existing server-side importers; defined in the pure module
// so client islands can import it without pulling in astro:content.
export { formatDate } from './format';
