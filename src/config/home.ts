// Homepage content. Images are referenced by filename and resolved through
// lib/images.ts (getImage) so this file stays pure data.
import { site, contactCta, type Link } from './site';

export interface Facet {
  image: string;
  alt: string;
  eyebrow: string;
  title: string;
  body: string;
  /** Mirror the image horizontally (so a reused portrait faces the other way). */
  mirror?: boolean;
}

export const hero = {
  // Banner image (image_4c4f66a8.jpg -> portrait-pensive.jpg)
  image: 'portrait-pensive.jpg',
  alt: `${site.fullName}, deep in thought`,
  // Hard credentials shown as the ember badge (authority at a glance).
  credentials: 'MA · UGC-NET · Journalism',
  // Identities that rotate word-by-word under the name (the creative hook).
  roles: ['Philosopher', 'Teacher', 'Journalist', 'Thinker', 'Social Worker'],
  name: site.fullName,
  tagline:
    'Turning ideas into change',
  primaryCta: { label: 'Read his latest thinking', href: '/ideas' } as Link,
  secondaryCta: contactCta,
};

// Thin credibility row along the bottom of the hero.
export const heroTrust = [
  '25+ years teaching',
  `1000's of students`,
  `100's of disputes resolved`,
];

export interface Wisdom {
  quote: string;
  author: string;
}

// Wisdom from thinkers whose spirit mirrors his — crossfades on the hero
// banner as an epigraph that captures how he thinks.
export const wisdom: Wisdom[] = [
  { quote: 'They alone live who live for others.', author: 'Swami Vivekananda' },
  {
    quote: "You can't cross the sea merely by standing and staring at the water.",
    author: 'Rabindranath Tagore',
  },
  { quote: 'Take up one idea. Make that one idea your life.', author: 'Swami Vivekananda' },
  {
    quote: 'Faith is the bird that feels the light when the dawn is still dark.',
    author: 'Rabindranath Tagore',
  },
  {
    quote: 'The best way to find yourself is to lose yourself in the service of others.',
    author: 'Mahatma Gandhi',
  },
  {
    quote: 'In a conflict between the heart and the brain, follow your heart.',
    author: 'Swami Vivekananda',
  },
  { quote: 'Arise, awake, and stop not till the goal is reached.', author: 'Swami Vivekananda' },
  {
    quote: 'We are what our thoughts have made us; so take care about what you think.',
    author: 'Swami Vivekananda',
  },
  {
    quote: 'Take risks in your life. If you win, you can lead; if you lose, you can guide.',
    author: 'Swami Vivekananda',
  },
  {
    quote: 'Where the mind is without fear and the head is held high.',
    author: 'Rabindranath Tagore',
  },
  {
    quote: 'Let us not pray to be sheltered from dangers but to be fearless when facing them.',
    author: 'Rabindranath Tagore',
  },
  {
    quote: 'The highest education is that which makes our life in harmony with all existence.',
    author: 'Rabindranath Tagore',
  },
  { quote: 'Be the change that you wish to see in the world.', author: 'Mahatma Gandhi' },
  {
    quote: 'Live as if you were to die tomorrow. Learn as if you were to live forever.',
    author: 'Mahatma Gandhi',
  },
  {
    quote: 'The weak can never forgive. Forgiveness is the attribute of the strong.',
    author: 'Mahatma Gandhi',
  },
  {
    quote: 'Dream is not that which you see while sleeping; it is something that does not let you sleep.',
    author: 'A. P. J. Abdul Kalam',
  },
  {
    quote: 'If you want to shine like a sun, first burn like a sun.',
    author: 'A. P. J. Abdul Kalam',
  },
  {
    quote:
      'I measure the progress of a community by the degree of progress which women have achieved.',
    author: 'B. R. Ambedkar',
  },
  {
    quote: 'Cultivation of mind should be the ultimate aim of human existence.',
    author: 'B. R. Ambedkar',
  },
  {
    quote:
      'Manpower without unity is not a strength unless it is harmonized and united properly.',
    author: 'Sardar Vallabhbhai Patel',
  },
  {
    quote: 'Three things cannot be long hidden: the sun, the moon, and the truth.',
    author: 'Gautama Buddha',
  },
];

export const duality = {
  eyebrow: 'Two sides, one purpose',
  title: "A philosopher's mind, a mediator's heart",
  intro:
    'The work moves between the weight of governance and the warmth of everyday human trust.',
  facets: [
    {
      image: 'portrait-pensive.jpg',
      alt: 'At his writing desk',
      eyebrow: 'The thinker',
      title: 'Ideas that serve the public good',
      body: 'Years of study in philosophy and journalism taught him to see clearly and argue honestly. He writes to turn ideas into something any citizen, or any leader, can act on.',
    },
    {
      image: 'portrait-pensive.jpg',
      alt: 'Deep in thought, facing the other way',
      mirror: true,
      eyebrow: 'The humanist',
      title: 'Dialogue over discord',
      body: 'Whether in a classroom or across a kitchen table, he helps people find their way through conflict — not by winning arguments, but by restoring the conditions for an honest conversation.',
    },
  ] satisfies Facet[],
};

