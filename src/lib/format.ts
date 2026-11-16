// Pure, framework-agnostic formatting helpers. No astro:content imports here,
// so this is safe to use from both server (.astro) and client (React islands).

const DATE_FMT = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

export function formatDate(date: Date): string {
  return DATE_FMT.format(date);
}
