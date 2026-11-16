import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';

interface Review {
  name: string;
  role: string;
  quote: string;
}

interface Featured {
  name: string;
  role: string;
  quote: string;
  imageSrc: string;
}

interface Props {
  /** Reviews that always show, rendered server-side from config. */
  seed: Review[];
  /** The one image-led review (resolved src passed from the .astro side). */
  featured?: Featured | null;
}

const STORAGE_KEY = 'ashok:reviews';

function initials(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w.charAt(0))
      .join('')
      .toUpperCase() || '?'
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="card p-6">
      <figure>
        <div className="flex items-center gap-3">
          <span
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-obsidian text-[14px] font-semibold text-snow"
            aria-hidden="true"
          >
            {initials(review.name)}
          </span>
          <figcaption>
            <p className="text-[15px] font-semibold text-obsidian">{review.name}</p>
            {review.role && <p className="text-[13px] text-steel">{review.role}</p>}
          </figcaption>
        </div>
        <blockquote className="mt-4 text-[15px] leading-relaxed text-graphite">
          {review.quote}
        </blockquote>
      </figure>
    </div>
  );
}

const EMPTY = { name: '', role: '', quote: '' };

function FeaturedCard({ review }: { review: Featured }) {
  return (
    <div className="card overflow-hidden">
      <figure>
        <div className="relative">
          <img
            src={review.imageSrc}
            alt={review.name}
            className="aspect-[4/5] w-full object-cover object-[50%_30%]"
          />
          <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-obsidian/90 to-transparent p-6 pt-14">
            <p className="text-[16px] font-semibold text-white">{review.name}</p>
            <p className="text-[13px] text-white/80">{review.role}</p>
          </figcaption>
        </div>
        <blockquote className="p-6 text-[16px] leading-relaxed text-graphite">
          <span className="text-ember">“</span>
          {review.quote}
          <span className="text-ember">”</span>
        </blockquote>
      </figure>
    </div>
  );
}

export default function ReviewBoard({ seed, featured }: Props) {
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const firstFieldRef = useRef<HTMLInputElement>(null);

  // Load any reviews this visitor has already added.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      if (Array.isArray(parsed)) setUserReviews(parsed);
    } catch {
      /* ignore malformed storage */
    }
  }, []);

  function close() {
    setOpen(false);
    setError('');
    setForm(EMPTY);
  }

  // Modal behaviour: lock scroll, focus first field, Escape to close.
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    firstFieldRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const name = form.name.trim();
    const quote = form.quote.trim();
    const role = form.role.trim();
    if (!name || !quote) {
      setError('Please add your name and a few words.');
      return;
    }
    const next = [...userReviews, { name, role, quote }];
    setUserReviews(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* storage may be unavailable; review still shows this session */
    }
    close();
  }

  const all = [...seed, ...userReviews];
  const field =
    'rounded-[14px] border border-cloud bg-snow px-3.5 py-2.5 text-[15px] text-obsidian outline-none transition-colors focus:border-obsidian';

  return (
    <div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:items-start">
        {featured && <FeaturedCard review={featured} />}
        {all.map((r, i) => (
          <ReviewCard key={i} review={r} />
        ))}
      </div>

      <div className="mt-12 flex flex-col items-center gap-3 text-center">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-[14px] border border-[#2c2e34] bg-obsidian px-6 py-3.5 text-[16px] font-medium text-snow transition-colors hover:bg-graphite"
        >
          Add your review
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian/50 p-4 backdrop-blur-sm"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label="Add your review"
        >
          <div className="card w-full max-w-md p-7 sm:p-8" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-[22px] font-semibold tracking-[-0.01em] text-obsidian">
              Share your review
            </h3>
            <p className="mt-1 text-[14px] text-steel">A sentence or two on your experience.</p>
            <form className="mt-5 flex flex-col gap-4" onSubmit={submit}>
              <label className="flex flex-col gap-1.5">
                <span className="text-[13px] font-medium text-graphite">Name</span>
                <input
                  ref={firstFieldRef}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={field}
                  placeholder="Your name"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[13px] font-medium text-graphite">
                  Role <span className="text-fog">(optional)</span>
                </span>
                <input
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className={field}
                  placeholder="e.g. Teacher, Pune"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[13px] font-medium text-graphite">Your review</span>
                <textarea
                  value={form.quote}
                  onChange={(e) => setForm({ ...form, quote: e.target.value })}
                  rows={4}
                  className={`${field} resize-none leading-relaxed`}
                  placeholder="What stayed with you?"
                />
              </label>
              {error && <p className="text-[13px] text-ember">{error}</p>}
              <div className="mt-1 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={close}
                  className="inline-flex items-center justify-center rounded-[14px] border border-cloud bg-snow px-4 py-2.5 text-[15px] font-medium text-graphite transition-colors hover:border-mist"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-[14px] border border-[#2c2e34] bg-obsidian px-4 py-2.5 text-[15px] font-medium text-snow transition-colors hover:bg-graphite"
                >
                  Post review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
