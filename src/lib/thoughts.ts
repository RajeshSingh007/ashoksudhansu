// ──────────────────────────────────────────────────────────────────────────
// Thoughts "API" — create/list/read thoughts the author writes in the browser.
//
// Right now this is backed by localStorage as a stand-in for a real database,
// so authored thoughts persist on the author's device and show up in /ideas.
// The functions are async (Promise-based) on purpose: when a real backend
// lands, swap each body for a `fetch('/api/thoughts', …)` call and NONE of the
// callers (ThoughtComposer, ThoughtsGrid, LocalThoughtReader) need to change.
// ──────────────────────────────────────────────────────────────────────────
import type { Category } from '../config/site';

const STORAGE_KEY = 'ashok:thoughts';

export interface ThoughtInput {
  title: string;
  description: string;
  category: Category;
  body: string;
}

export interface Thought extends ThoughtInput {
  id: string;
  slug: string;
  /** ISO date string. */
  pubDate: string;
}

function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || 'thought'
  );
}

function read(): Thought[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? (parsed as Thought[]) : [];
  } catch {
    return [];
  }
}

function write(list: Thought[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* storage may be full/unavailable */
  }
}

function uid(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Newest first. */
export async function listThoughts(): Promise<Thought[]> {
  return read().sort((a, b) => +new Date(b.pubDate) - +new Date(a.pubDate));
}

export async function getThought(slug: string): Promise<Thought | undefined> {
  return read().find((t) => t.slug === slug);
}

export async function createThought(input: ThoughtInput): Promise<Thought> {
  const list = read();
  const base = slugify(input.title);
  let slug = base;
  let n = 2;
  while (list.some((t) => t.slug === slug)) slug = `${base}-${n++}`;

  const thought: Thought = {
    ...input,
    id: uid(),
    slug,
    pubDate: new Date().toISOString(),
  };
  write([thought, ...list]);
  return thought;
}

/** Update an existing thought in place. Slug, id and pubDate are preserved so
 *  links stay stable. */
export async function updateThought(
  slug: string,
  input: ThoughtInput,
): Promise<Thought | undefined> {
  const list = read();
  const idx = list.findIndex((t) => t.slug === slug);
  if (idx === -1) return undefined;
  const updated: Thought = { ...list[idx], ...input, slug: list[idx].slug };
  list[idx] = updated;
  write(list);
  return updated;
}

export async function deleteThought(slug: string): Promise<void> {
  write(read().filter((t) => t.slug !== slug));
}
