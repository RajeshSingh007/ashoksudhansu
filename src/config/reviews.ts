// ──────────────────────────────────────────────────────────────────────────
// Reviews / testimonials wall.
//
// No seed reviews ship from config now — the featured slot shows `featuredImage`
// on its own until visitors add reviews. Once they do, the first review fills
// the featured (image) card and the rest flow into the carousel. Reviews live
// in Supabase: anyone can post + read; only the author can delete.
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
