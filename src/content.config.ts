import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Essays / blog posts. Markdown & MDX files live in src/content/ideas/.
const ideas = defineCollection({
  loader: glob({ base: './src/content/ideas', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    category: z.enum(['Welfare', 'Governance', 'Dialogue', 'Society']),
    featured: z.boolean().default(false),
    // Filename of a hero image in src/assets/images (e.g. "garden-feeding.jpg").
    heroImage: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { ideas };
