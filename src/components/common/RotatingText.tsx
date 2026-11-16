import { useEffect, useRef, useState } from 'react';

interface Props {
  words: string[];
  class?: string;
  /** ms between swaps */
  interval?: number;
}

// Cycles through `words` with the fade/slide defined in global.css
// (.rotating-text / .is-out). Honors prefers-reduced-motion.
export default function RotatingText({ words, class: className = '', interval = 2200 }: Props) {
  const [index, setIndex] = useState(0);
  const [out, setOut] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (!Array.isArray(words) || words.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const id = setInterval(() => {
      setOut(true);
      const t = setTimeout(() => {
        setIndex((i) => (i + 1) % words.length);
        setOut(false);
      }, 280);
      timers.current.push(t);
    }, interval);

    return () => {
      clearInterval(id);
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [words, interval]);

  return (
    <span
      className={`rotating-text ${out ? 'is-out' : ''} ${className}`}
      aria-label={words.join(', ')}
    >
      {words[index]}
    </span>
  );
}
