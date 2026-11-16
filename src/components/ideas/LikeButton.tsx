import { useEffect, useState } from 'react';
import type { MouseEvent } from 'react';
import { getLike, toggleLike } from '../../lib/likes';

interface Props {
  slug: string;
  className?: string;
  /** Show the word "likes" after the count (more room = reader page). */
  showLabel?: boolean;
}

export default function LikeButton({ slug, className = '', showLabel = false }: Props) {
  const [state, setState] = useState({ count: 0, liked: false });

  useEffect(() => {
    setState(getLike(slug));
  }, [slug]);

  function onClick(e: MouseEvent) {
    // Likes often live inside/near a card link — don't navigate on click.
    e.preventDefault();
    e.stopPropagation();
    setState(toggleLike(slug));
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={state.liked}
      aria-label={state.liked ? 'Remove like' : 'Like this thought'}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-medium tabular-nums transition-colors ${
        state.liked
          ? 'border-ember/30 bg-ember/10 text-ember'
          : 'border-cloud bg-snow text-graphite hover:border-mist'
      } ${className}`}
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill={state.liked ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      <span>{state.count}</span>
      {showLabel && <span>{state.count === 1 ? 'like' : 'likes'}</span>}
    </button>
  );
}
