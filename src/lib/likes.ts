// localStorage-backed likes — a stand-in for a real backend (same pattern as
// lib/thoughts.ts). When the DB lands, swap these for fetch() calls.
//
// NOTE: because this is localStorage, counts are per-browser, not shared across
// visitors. A real backend is needed for a true global like count.
const COUNT_KEY = 'ashok:likeCounts';
const MINE_KEY = 'ashok:likedByMe';

type Counts = Record<string, number>;
type Mine = Record<string, boolean>;

function read<T extends object>(key: string): T {
  if (typeof localStorage === 'undefined') return {} as T;
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : {};
    return (parsed && typeof parsed === 'object' ? parsed : {}) as T;
  } catch {
    return {} as T;
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
}

export interface LikeState {
  count: number;
  liked: boolean;
}

export function getLike(slug: string): LikeState {
  const counts = read<Counts>(COUNT_KEY);
  const mine = read<Mine>(MINE_KEY);
  return { count: counts[slug] ?? 0, liked: !!mine[slug] };
}

export function toggleLike(slug: string): LikeState {
  const counts = read<Counts>(COUNT_KEY);
  const mine = read<Mine>(MINE_KEY);
  const liked = !mine[slug];
  mine[slug] = liked;
  counts[slug] = Math.max(0, (counts[slug] ?? 0) + (liked ? 1 : -1));
  write(COUNT_KEY, counts);
  write(MINE_KEY, mine);
  return { count: counts[slug], liked };
}
