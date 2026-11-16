import type { ImageMetadata } from 'astro';

// Eagerly import every image in src/assets/images so content front-matter can
// reference them by filename (e.g. heroImage: "garden-feeding.jpg").
const files = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/images/*.{jpg,jpeg,png,webp,avif}',
  { eager: true },
);

export const images: Record<string, ImageMetadata> = Object.fromEntries(
  Object.entries(files).map(([path, mod]) => [path.split('/').pop()!, mod.default]),
);

/** Resolve an image by filename; returns undefined if not found. */
export function getImage(name?: string): ImageMetadata | undefined {
  return name ? images[name] : undefined;
}
