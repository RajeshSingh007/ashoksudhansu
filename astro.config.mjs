// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

// NOTE: update `site` to the real production domain before deploying to Vercel.
// Pages are static by default; only routes that opt in with
// `export const prerender = false` (e.g. /ideas/[slug]) render on demand.
export default defineConfig({
  site: 'https://ashok.example.com',
  adapter: vercel(),
  integrations: [react(), mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  devToolbar: { enabled: false },
});
