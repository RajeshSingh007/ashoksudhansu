// ──────────────────────────────────────────────────────────────────────────
// Reviews / testimonials wall.
//
// One seed review (Anita Rao) ships from config and always renders. Everything
// else is added by visitors through the "Add your review" modal and persists in
// their browser (localStorage) — see components/reviews/ReviewBoard.tsx. When a
// real backend lands, replace localStorage with a DB query + moderation.
// ──────────────────────────────────────────────────────────────────────────

export interface Review {
  name: string;
  role: string;
  quote: string;
  /** Marks the one image-led featured review. */
  featured?: boolean;
  /** Hero image filename in src/assets/images (featured review only). */
  image?: string;
}

export const reviewsSection = {
  eyebrow: 'In their words',
  title: 'The people he has helped, and the readers he has moved',
  intro: '',
};

export const reviews: Review[] = [
  {
    name: 'Anita Rao',
    role: 'NGO Director, Pune',
    quote:
      'What stays with you is the warmth. He treats a farmer and a secretary with exactly the same attention — and that is why both trust him.',
    featured: true,
    image: 'garden-feeding.jpg',
  },
];
