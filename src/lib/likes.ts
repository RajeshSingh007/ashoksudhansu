import { supabase } from './supabase';

// A random per-browser id so a visitor can like once (and un-like). Not tied to
// auth — likes are anonymous.
const VOTER_KEY = 'ashok:voterId';

function getVoterId(): string {
  if (typeof localStorage === 'undefined') return 'server';
  let id = localStorage.getItem(VOTER_KEY);
  if (!id) {
    id =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(VOTER_KEY, id);
  }
  return id;
}

export interface LikeState {
  count: number;
  liked: boolean;
}

// ── Shared cache ────────────────────────────────────────────────────────────
// All like buttons on a page share ONE fetch of the likes table (slug → voters)
// instead of each button making its own count + liked-by-me requests. Toggles
// update this cache in place, so the only network calls are: 1 load per page +
// 1 per like/unlike. (Snapshot per page load — fine at this scale; swap to a
// per-slug count/view if the table ever grows large.)
let cache: Promise<Map<string, Set<string>>> | null = null;

function loadAll(): Promise<Map<string, Set<string>>> {
  if (!cache) {
    cache = supabase
      .from('likes')
      .select('thought_slug, voter_id')
      .then(({ data, error }) => {
        const map = new Map<string, Set<string>>();
        if (error) {
          console.error('[likes] load', error);
          return map;
        }
        for (const row of data ?? []) {
          const set = map.get(row.thought_slug) ?? new Set<string>();
          set.add(row.voter_id);
          map.set(row.thought_slug, set);
        }
        return map;
      });
  }
  return cache;
}

export async function getLike(slug: string): Promise<LikeState> {
  const map = await loadAll();
  const set = map.get(slug);
  return { count: set?.size ?? 0, liked: set?.has(getVoterId()) ?? false };
}

export async function toggleLike(slug: string): Promise<LikeState> {
  const map = await loadAll();
  const voter = getVoterId();
  let set = map.get(slug);
  if (!set) {
    set = new Set<string>();
    map.set(slug, set);
  }
  const liked = set.has(voter);
  if (liked) {
    set.delete(voter);
    await supabase.from('likes').delete().eq('thought_slug', slug).eq('voter_id', voter);
  } else {
    set.add(voter);
    await supabase.from('likes').insert({ thought_slug: slug, voter_id: voter });
  }
  return { count: set.size, liked: !liked };
}
