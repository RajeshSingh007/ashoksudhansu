import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { supabase } from '../../lib/supabase';
import { useIsAdmin } from '../../lib/useAdmin';
import Loader from '../common/Loader';

interface Review {
  id: string;
  name: string;
  role: string | null;
  quote: string;
}

interface Props {
  /** The image used for the featured slot (resolved src from the .astro side). */
  imageSrc?: string;
}

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

function DeleteButton({ onClick, className = '' }: { onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Delete review"
      className={`inline-flex h-8 w-8 items-center justify-center rounded-full border border-cloud bg-snow text-steel transition-colors hover:border-ember hover:text-ember ${className}`}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 6h18" />
        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      </svg>
    </button>
  );
}

function ReviewCard({
  review,
  isAdmin,
  onDelete,
}: {
  review: Review;
  isAdmin: boolean;
  onDelete: (review: Review) => void;
}) {
  return (
    <div className="card relative flex h-full min-h-[240px] flex-col p-7">
      {isAdmin && <DeleteButton onClick={() => onDelete(review)} className="absolute right-4 top-4" />}
      <span className="text-[44px] font-semibold leading-[0.6] text-ember" aria-hidden="true">
        “
      </span>
      <blockquote className="mt-4 flex-1 text-[17px] leading-relaxed text-graphite [overflow-wrap:anywhere]">
        {review.quote}
      </blockquote>
      <div className="mt-6 flex items-center gap-3">
        <span
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-obsidian text-[14px] font-semibold text-snow"
          aria-hidden="true"
        >
          {initials(review.name)}
        </span>
        <div>
          <p className="text-[15px] font-semibold text-obsidian">{review.name}</p>
          {review.role && <p className="text-[13px] text-steel">{review.role}</p>}
        </div>
      </div>
    </div>
  );
}

const EMPTY = { name: '', role: '', quote: '' };

// The featured slot: always the picture. Once a review exists, the first one
// fills it (name over the image, quote below); otherwise it's just the picture.
function FeaturedCard({
  imageSrc,
  review,
  isAdmin,
  onDelete,
}: {
  imageSrc?: string;
  review?: Review;
  isAdmin: boolean;
  onDelete: (review: Review) => void;
}) {
  return (
    <div className="card relative overflow-hidden">
      {isAdmin && review && (
        <DeleteButton onClick={() => onDelete(review)} className="absolute right-4 top-4 z-10" />
      )}
      <figure>
        {imageSrc && (
          <div className="relative">
            <img
              src={imageSrc}
              alt={review?.name ?? ''}
              className="aspect-[4/5] w-full object-cover object-[50%_30%]"
            />
            {review && (
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-obsidian/90 to-transparent p-6 pt-14">
                <p className="text-[16px] font-semibold text-white">{review.name}</p>
                {review.role && <p className="text-[13px] text-white/80">{review.role}</p>}
              </figcaption>
            )}
          </div>
        )}
        {review ? (
          <blockquote className="p-6 text-[16px] leading-relaxed text-graphite [overflow-wrap:anywhere]">
            <span className="text-ember">“</span>
            {review.quote}
            <span className="text-ember">”</span>
          </blockquote>
        ) : (
          <div className="p-6">
            <p className="text-[15px] leading-relaxed text-steel">
              The first review will appear here.
            </p>
          </div>
        )}
      </figure>
    </div>
  );
}

export default function ReviewBoard({ imageSrc }: Props) {
  const isAdmin = useIsAdmin();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [pending, setPending] = useState<Review | null>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  async function load() {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) {
      console.error('[reviews] load', error);
    } else {
      setReviews((data ?? []) as Review[]);
    }
    setLoaded(true);
  }

  useEffect(() => {
    load();
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

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const name = form.name.trim();
    const quote = form.quote.trim();
    const role = form.role.trim();
    if (!name || !quote) {
      setError('Please add your name and a few words.');
      return;
    }
    setSaving(true);
    setError('');
    const { error } = await supabase.from('reviews').insert({ name, role: role || null, quote });
    setSaving(false);
    if (error) {
      setError('Could not post your review. Please try again.');
      return;
    }
    close();
    load();
  }

  // Lock scroll + Escape-to-close while the delete dialog is open.
  useEffect(() => {
    if (!pending) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPending(null);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [pending]);

  async function confirmDelete() {
    if (!pending) return;
    const { error } = await supabase.from('reviews').delete().eq('id', pending.id);
    if (error) {
      console.error('[reviews] delete', error);
    }
    setPending(null);
    load();
  }

  const featuredReview = reviews[0];
  const rest = reviews.slice(1);
  const field =
    'rounded-[14px] border border-cloud bg-snow px-3.5 py-2.5 text-[15px] text-obsidian outline-none transition-colors focus:border-obsidian';

  return (
    <div>
      {!loaded ? (
        <Loader label="Loading reviews…" className="py-20" />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:items-stretch">
          <FeaturedCard
            imageSrc={imageSrc}
            review={featuredReview}
            isAdmin={isAdmin}
            onDelete={setPending}
          />
          {rest.length > 0 && (
            <div className="flex h-full snap-x snap-mandatory gap-6 overflow-x-auto pb-4 [scrollbar-width:thin]">
              {rest.map((r) => (
                <div key={r.id} className="w-[300px] shrink-0 snap-start sm:w-[320px]">
                  <ReviewCard review={r} isAdmin={isAdmin} onDelete={setPending} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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
                  maxLength={80}
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
                  maxLength={80}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className={field}
                  placeholder="e.g. Teacher, Pune"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[13px] font-medium text-graphite">Your review</span>
                <textarea
                  value={form.quote}
                  maxLength={600}
                  onChange={(e) => setForm({ ...form, quote: e.target.value })}
                  rows={4}
                  className={`${field} resize-none leading-relaxed`}
                  placeholder="What stayed with you?"
                />
              </label>
              <p className="-mt-2 text-right text-[12px] text-fog">{form.quote.length}/600</p>
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
                  disabled={saving}
                  className="inline-flex items-center justify-center rounded-[14px] border border-[#2c2e34] bg-obsidian px-4 py-2.5 text-[15px] font-medium text-snow transition-colors hover:bg-graphite disabled:opacity-60"
                >
                  {saving ? 'Posting…' : 'Post review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {pending && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian/50 p-4 backdrop-blur-sm"
          onClick={() => setPending(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Confirm delete"
        >
          <div
            className="card w-full max-w-sm p-7 text-center sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-ember/10 text-ember">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 6h18" />
                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
              </svg>
            </div>

            <h3 className="mt-5 text-[22px] font-semibold tracking-[-0.01em] text-obsidian">
              Delete this review?
            </h3>
            <p className="mt-2 text-[15px] leading-relaxed text-steel">
              The review by <span className="font-medium text-graphite">{pending.name}</span> will be
              removed for good. This can’t be undone.
            </p>

            <div className="mt-7 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setPending(null)}
                className="inline-flex items-center justify-center rounded-[14px] border border-cloud bg-snow px-5 py-2.5 text-[15px] font-medium text-graphite transition-colors hover:border-mist"
              >
                Keep it
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="inline-flex items-center justify-center rounded-[14px] bg-ember px-5 py-2.5 text-[15px] font-medium text-white transition hover:brightness-110"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
