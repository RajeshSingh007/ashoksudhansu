import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { site } from '../config/site';

export async function GET(context: APIContext) {
  const ideas = await getCollection('ideas', ({ data }) => data.draft !== true);
  return rss({
    title: `${site.fullName} — Thoughts`,
    description: site.description,
    site: context.site ?? site.url,
    items: ideas
      .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime())
      .map((entry) => ({
        title: entry.data.title,
        description: entry.data.description,
        pubDate: entry.data.pubDate,
        categories: [entry.data.category],
        link: `/ideas/${entry.id}/`,
      })),
  });
}
