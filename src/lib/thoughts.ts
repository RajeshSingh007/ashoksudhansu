import { supabase } from './supabase';
import type { Category } from '../config/site';

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

interface Row {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: Category;
  body: string;
  pub_date: string;
}

function toThought(r: Row): Thought {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    description: r.description,
    category: r.category,
    body: r.body,
    pubDate: r.pub_date,
  };
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

/** Newest first. Public read. */
export async function listThoughts(): Promise<Thought[]> {
  const { data, error } = await supabase
    .from('thoughts')
    .select('*')
    .order('pub_date', { ascending: false });
  if (error) {
    console.error('[thoughts] list', error);
    return [];
  }
  return (data as Row[]).map(toThought);
}

export async function getThought(slug: string): Promise<Thought | undefined> {
  const { data, error } = await supabase
    .from('thoughts')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  if (error) {
    console.error('[thoughts] get', error);
    return undefined;
  }
  return data ? toThought(data as Row) : undefined;
}

/** Admin only (enforced by RLS). Generates a unique slug from the title. */
export async function createThought(input: ThoughtInput): Promise<Thought> {
  const base = slugify(input.title);
  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = attempt === 0 ? base : `${base}-${Math.random().toString(36).slice(2, 6)}`;
    const { data, error } = await supabase
      .from('thoughts')
      .insert({
        slug,
        title: input.title,
        description: input.description,
        category: input.category,
        body: input.body,
      })
      .select()
      .single();
    if (!error && data) return toThought(data as Row);
    // 23505 = unique_violation (slug taken) → retry with a suffix; else fail.
    if (error && error.code !== '23505') throw error;
  }
  throw new Error('Could not create thought (slug kept colliding).');
}

/** Admin only (RLS). Slug/pub_date preserved. */
export async function updateThought(
  slug: string,
  input: ThoughtInput,
): Promise<Thought | undefined> {
  const { data, error } = await supabase
    .from('thoughts')
    .update({
      title: input.title,
      description: input.description,
      category: input.category,
      body: input.body,
      updated_at: new Date().toISOString(),
    })
    .eq('slug', slug)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data ? toThought(data as Row) : undefined;
}

/** Admin only (RLS). */
export async function deleteThought(slug: string): Promise<void> {
  const { error } = await supabase.from('thoughts').delete().eq('slug', slug);
  if (error) throw error;
}
