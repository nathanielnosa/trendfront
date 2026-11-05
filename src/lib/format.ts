/** "2026-10-26T20:29:26+01:00" becomes "26 Oct 2026". Empty or bad input gives "". */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

/** Minutes to read as a label. The API sends 0 for very short posts; show at least 1. */
export function formatReadingTime(minutes: number): string {
  return `${Math.max(1, Math.round(minutes))} min read`;
}

/** 950 stays "950"; 1200 becomes "1.2k"; 2500000 becomes "2.5M". */
export function formatCount(value: number): string {
  if (value < 1000) return String(value);
  if (value < 1_000_000) return `${trim(value / 1000)}k`;
  return `${trim(value / 1_000_000)}M`;
}

/** One decimal place, without a trailing ".0". */
function trim(value: number): string {
  return value.toFixed(1).replace(/\.0$/, "");
}