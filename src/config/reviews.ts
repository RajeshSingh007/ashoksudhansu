// ──────────────────────────────────────────────────────────────────────────
// Reviews / testimonials wall.
//
// No seed reviews ship from config now — the featured slot shows `featuredImage`
// on its own until visitors add reviews. Once they do, the first review fills
// the featured (image) card and the rest flow to the right. Reviews are added
// through the "Add your review" modal and persist in the visitor's browser
// (localStorage) — see components/reviews/ReviewBoard.tsx. When a real backend
// lands, replace localStorage with a DB query + moderation.
// ──────────────────────────────────────────────────────────────────────────

export interface Review {
  name: string;
  role: string;
  quote: string;
}

export const reviewsSection = {
  eyebrow: 'In their words',
  title: 'The people he has helped, and the readers he has moved',
  intro: '',
};

/** Image shown in the featured slot (filename in src/assets/images). */
export const featuredImage = 'garden-feeding.jpg';

export const reviews: Review[] = [];
