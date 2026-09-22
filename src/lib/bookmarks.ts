export interface Bookmark {
  url: string;
  slug: string;
}

export const STORAGE_KEY = 'mona-bookmarks';
const BASE62 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const SLUG_LENGTH = 4;
const SLUG_SPACE = BASE62.length ** SLUG_LENGTH;
const URL_ERROR = 'Enter a valid HTTP or HTTPS link, such as example.com.';

export function normalizeUrl(value: string): string {
  const input = value.trim();
  const isRelativePath = (input.startsWith('/') && !input.startsWith('//'))
    || input.startsWith('./') || input.startsWith('../') || input.startsWith('\\');
  if (!input || isRelativePath) throw new Error(URL_ERROR);

  // A hostname with a port is not a URI scheme (for example, localhost:4321).
  const hasScheme = /^[a-z][a-z\d+.-]*:/i.test(input)
    && !/^[^/?#:\s]+:\d+(?:[/?#]|$)/.test(input);
  const candidate = input.startsWith('//')
    ? `https:${input}`
    : hasScheme ? input : `https://${input}`;

  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    throw new Error(URL_ERROR);
  }

  if (!['http:', 'https:'].includes(url.protocol) || !url.hostname
    || url.username || url.password) {
    throw new Error(URL_ERROR);
  }

  return url.href;
}

export function loadBookmarks(value: string | null): {
  bookmarks: Bookmark[];
  recovered: boolean;
} {
  if (value === null || value.trim() === '') {
    return { bookmarks: [], recovered: false };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    return { bookmarks: [], recovered: true };
  }
  if (!Array.isArray(parsed)) return { bookmarks: [], recovered: true };

  const bookmarks: Bookmark[] = [];
  const slugs = new Set<string>();
  const entries: unknown[] = parsed;
  let recovered = false;
  for (const entry of entries) {
    if (typeof entry !== 'object' || entry === null || Array.isArray(entry)
      || !('url' in entry) || !('slug' in entry)
      || typeof entry.url !== 'string' || typeof entry.slug !== 'string'
      || !/^mona-[0-9a-zA-Z]+$/.test(entry.slug) || slugs.has(entry.slug)) {
      recovered = true;
      continue;
    }

    let url: string;
    try {
      url = normalizeUrl(entry.url);
    } catch {
      recovered = true;
      continue;
    }
    recovered ||= url !== entry.url;
    bookmarks.push({ url, slug: entry.slug });
    slugs.add(entry.slug);
  }
  return { bookmarks, recovered };
}

export function generateSlug(
  bookmarks: readonly Bookmark[],
  random: () => number = Math.random,
): string {
  const slugs = new Set(bookmarks.map((bookmark) => bookmark.slug));
  const sample = random();
  if (!Number.isFinite(sample) || sample < 0 || sample >= 1) {
    throw new Error('Could not generate a bookmark alias. Please try again.');
  }
  const start = Math.floor(sample * SLUG_SPACE);

  // Probe the next value on collision, even when the random source repeats.
  for (let offset = 0; offset < SLUG_SPACE; offset += 1) {
    let value = (start + offset) % SLUG_SPACE;
    let suffix = '';
    for (let index = 0; index < SLUG_LENGTH; index += 1) {
      suffix = BASE62[value % BASE62.length] + suffix;
      value = Math.floor(value / BASE62.length);
    }
    const slug = `mona-${suffix}`;
    if (!slugs.has(slug)) return slug;
  }
  throw new Error('All bookmark aliases are in use. Clear some bookmarks first.');
}

export function createBookmark(value: string, bookmarks: readonly Bookmark[]): Bookmark {
  return { url: normalizeUrl(value), slug: generateSlug(bookmarks) };
}

export function formatBookmark(bookmark: Bookmark): string {
  return `${bookmark.url} :: ${bookmark.slug}`;
}
