// Pure plain-text → structured blocks formatter for a thought body. No
// framework imports, so it's usable from both Astro (SSR) and React.
export type Block =
  | { type: 'h'; text: string }
  | { type: 'p'; text: string }
  | { type: 'quote'; text: string }
  | { type: 'ul'; intro?: string; items: string[] };

export function parseBody(body: string): Block[] {
  const blocks: Block[] = [];
  const chunks = body.replace(/\r\n/g, '\n').split(/\n\s*\n/);

  for (const chunk of chunks) {
    const text = chunk.trim();
    if (!text) continue;

    // Blockquote: lines starting with ">"
    if (text.startsWith('>')) {
      blocks.push({ type: 'quote', text: text.replace(/^>\s?/gm, '').trim() });
      continue;
    }

    // Standalone numbered section heading, e.g. "1. Mock Debate & GD Topics"
    if (/^\d+[.)]\s+\S/.test(text) && !text.includes('\n') && text.length <= 90) {
      blocks.push({ type: 'h', text: text.replace(/^\d+[.)]\s+/, '') });
      continue;
    }

    // Bullets — either inline " • " or line-start "•/-/*"
    const hasInline = text.includes('•');
    const hasLineBullets = /^\s*[•\-*]\s+/m.test(text);
    if (hasInline || hasLineBullets) {
      let intro = '';
      const items: string[] = [];
      if (hasInline) {
        const parts = text.split('•').map((s) => s.replace(/\s+/g, ' ').trim());
        intro = parts.shift() ?? '';
        for (const p of parts) if (p) items.push(p);
      } else {
        const introLines: string[] = [];
        for (const line of text.split('\n')) {
          const m = line.match(/^\s*[•\-*]\s+(.*)$/);
          if (m) items.push(m[1].trim());
          else if (items.length === 0) introLines.push(line.trim());
        }
        intro = introLines.join(' ').trim();
      }
      if (items.length) {
        blocks.push({ type: 'ul', intro: intro || undefined, items });
        continue;
      }
    }

    // Plain paragraph — collapse single newlines into spaces.
    blocks.push({ type: 'p', text: text.replace(/\s*\n\s*/g, ' ').trim() });
  }

  return blocks;
}

/** Rough reading time in minutes from a body string. */
export function readingMinutes(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
