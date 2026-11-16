import { useEffect, useRef, useState } from 'react';
import { wisdom } from '../../config/home';

// Crossfades through the curated quotes in config (wisdom) using the
// .hero-quote / .is-out classes in global.css. Reduced-motion safe.
export default function WisdomQuote() {
  const [index, setIndex] = useState(0);
  const [out, setOut] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (wisdom.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const id = setInterval(() => {
      setOut(true);
      const t = setTimeout(() => {
        setIndex((i) => (i + 1) % wisdom.length);
        setOut(false);
      }, 500);
      timers.current.push(t);
    }, 10000);

    return () => {
      clearInterval(id);
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, []);

  const q = wisdom[index];

  return (
    <figure className="hero-quote">
      <span className="hero-quote__mark" aria-hidden="true">
        &#8220;
      </span>
      <div className={`hero-quote__body ${out ? 'is-out' : ''}`}>
        <blockquote className="hero-quote__text">{q.quote}</blockquote>
        <figcaption className="hero-quote__author">— {q.author}</figcaption>
      </div>
    </figure>
  );
}
