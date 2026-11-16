// ──────────────────────────────────────────────────────────────────────────
// Site identity & global configuration. EVERYTHING user-facing that is not a
// blog post is driven from the config/ folder so content can change without
// touching markup. This file is the single source of truth for who he is.
// ──────────────────────────────────────────────────────────────────────────

export interface Link {
  label: string;
  href: string;
}

export const site = {
  /** Short name shown in the header / logo. */
  name: 'Ashok',
  /** Full display name used in titles, hero and footer. */
  fullName: 'Ashok Sudhansu',
  /** One-line role, shown as the hero eyebrow / footer. */
  role: 'Philosopher · Teacher · Thinker',
  /** Hero / meta tagline. */
  tagline:
    'A philosopher, teacher and journalist turning ideas into change — and helping people find their way through conflict.',
  /** Default meta description. */
  description:
    'Thoughts on society, dialogue and the life of ideas from a teacher, journalist and philosopher — plus guidance for resolving conflict with clarity and dignity.',
  /** Contact email (used for mailto links everywhere). */
  email: 'hello@example.com', // TODO: real contact email
  /** Production URL — keep in sync with astro.config.mjs `site`. */
  url: 'https://ashok.example.com',
} as const;

export const nav: Link[] = [
  { label: 'Home', href: '/' },
  { label: 'Ideas', href: '/ideas' },
  { label: 'Reviews', href: '/#reviews' },
];

export const social: Link[] = [
  { label: 'Facebook', href: '#' }
];

/** Reusable primary call-to-action (contact). */
export const contactCta: Link = {
  label: 'Get in touch',
  href: `mailto:${site.email}`,
};

/** Essay categories — keep in sync with the schema in content.config.ts */
export const categories = ['Welfare', 'Governance', 'Dialogue', 'Society'] as const;
export type Category = (typeof categories)[number];
