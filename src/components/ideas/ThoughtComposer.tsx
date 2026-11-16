import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { createThought, updateThought, getThought } from '../../lib/thoughts';
import { categories, type Category } from '../../config/site';
import { useIsAdmin } from '../../lib/useAdmin';

const field =
  'w-full rounded-[14px] border border-cloud bg-snow px-3.5 py-2.5 text-[15px] text-obsidian outline-none transition-colors focus:border-obsidian';

export default function ThoughtComposer() {
  const isAdmin = useIsAdmin();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>(categories[0]);
  const [description, setDescription] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [editSlug, setEditSlug] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  // In edit mode (?edit=slug) prefill the form from the saved thought.
  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get('edit');
    if (!slug) {
      setLoaded(true);
      return;
    }
    setEditSlug(slug);
    getThought(slug).then((t) => {
      if (t) {
        setTitle(t.title);
        setCategory(t.category);
        setDescription(t.description);
        setBody(t.body);
      }
      setLoaded(true);
    });
  }, []);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const t = title.trim();
    const b = body.trim();
    if (!t || !b) {
      setError('A title and some words are needed.');
      return;
    }
    setSaving(true);
    setError('');
    const input = {
      title: t,
      description: description.trim() || `${b.slice(0, 140)}${b.length > 140 ? '…' : ''}`,
      category,
      body: b,
    };
    try {
      const result = editSlug
        ? await updateThought(editSlug, input)
        : await createThought(input);
      const slug = result?.slug ?? editSlug ?? '';
      window.location.href = `/ideas/${encodeURIComponent(slug)}/`;
    } catch (err) {
      setSaving(false);
      setError(err instanceof Error ? err.message : 'Could not save. Are you signed in?');
    }
  }

  if (!loaded) {
    return <p className="text-[15px] text-fog">Loading…</p>;
  }

  if (!isAdmin) {
    return (
      <div className="card p-7 text-center sm:p-8">
        <h1 className="text-[22px] font-semibold tracking-[-0.01em] text-obsidian">
          Author access only
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-steel">
          Writing thoughts is restricted to the author. Please sign in.
        </p>
        <a
          href="/admin/"
          className="mt-6 inline-flex items-center justify-center rounded-[14px] border border-[#2c2e34] bg-obsidian px-5 py-2.5 text-[15px] font-medium text-snow transition-colors hover:bg-graphite"
        >
          Sign in
        </a>
      </div>
    );
  }

  return (
    <>
      <h1 className="mb-8 text-[30px] font-semibold leading-[1.1] tracking-[-0.02em] text-obsidian sm:text-[40px]">
        {editSlug ? 'Edit thought' : 'Write a thought'}
      </h1>
      <form className="flex flex-col gap-6" onSubmit={submit}>
      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] font-medium text-graphite">Title</span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`${field} text-[20px] font-semibold tracking-[-0.01em]`}
          placeholder="What is this thought about?"
          autoFocus
        />
      </label>

      <div className="flex flex-col gap-2">
        <span className="text-[13px] font-medium text-graphite">Topic</span>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              aria-pressed={category === c}
              className={`rounded-full border px-4 py-1.5 text-[14px] font-medium transition-colors ${
                category === c
                  ? 'border-[#2c2e34] bg-obsidian text-snow'
                  : 'border-cloud bg-snow text-graphite hover:border-mist'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] font-medium text-graphite">
          Summary <span className="text-fog">(optional)</span>
        </span>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={field}
          placeholder="A line that previews the thought"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] font-medium text-graphite">Your thought</span>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={14}
          className={`${field} resize-y leading-relaxed`}
          placeholder={'Write freely. Leave a blank line between paragraphs.'}
        />
      </label>

      {error && <p className="text-[13px] text-ember">{error}</p>}

      <div className="flex items-center justify-end gap-3">
        <a
          href="/ideas/"
          className="inline-flex items-center justify-center rounded-[14px] border border-cloud bg-snow px-4 py-2.5 text-[15px] font-medium text-graphite transition-colors hover:border-mist"
        >
          Cancel
        </a>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center rounded-[14px] border border-[#2c2e34] bg-obsidian px-5 py-2.5 text-[15px] font-medium text-snow transition-colors hover:bg-graphite disabled:opacity-60"
        >
          {editSlug
            ? saving
              ? 'Saving…'
              : 'Save changes'
            : saving
              ? 'Publishing…'
              : 'Publish thought'}
        </button>
      </div>
    </form>
    </>
  );
}
