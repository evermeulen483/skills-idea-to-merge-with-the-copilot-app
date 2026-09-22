import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  STORAGE_KEY, createBookmark, formatBookmark, generateSlug, loadBookmarks, normalizeUrl,
} from '../src/lib/bookmarks.ts';

const bookmark = { url: 'https://www.example.com/', slug: 'mona-7fk2' };

describe('URL normalization', () => {
  it('saves the same URL with and without https://', () => {
    const bare = createBookmark('www.example.com', []);
    const explicit = createBookmark('https://www.example.com', []);
    assert.equal(bare.url, explicit.url);
    assert.equal(bare.url, bookmark.url);
  });

  for (const [input, expected] of [
    ['  EXAMPLE.com/articles?q=hello#intro  ', 'https://example.com/articles?q=hello#intro'],
    ['//example.com/path', 'https://example.com/path'],
    ['http://example.com/path', 'http://example.com/path'],
    ['localhost:4321/path', 'https://localhost:4321/path'],
    ['example.com:8080/path', 'https://example.com:8080/path'],
    ['[::1]:4321/path', 'https://[::1]:4321/path'],
    ['https://example.com/a b', 'https://example.com/a%20b'],
  ]) {
    it(`normalizes ${input}`, () => assert.equal(normalizeUrl(input), expected));
  }

  for (const value of [
    '', '   ', 'not a url', '/relative', './relative', '../relative', '\\relative',
    'https://', 'javascript:alert(1)',
    'data:text/html,hello', 'ftp://example.com', 'mailto:hello@example.com',
    'https://user:password@example.com',
  ]) {
    it(`rejects invalid or unsafe input ${JSON.stringify(value)}`, () => {
      assert.throws(() => normalizeUrl(value), /valid HTTP or HTTPS link/);
    });
  }
});

describe('defensive storage loading', () => {
  it('uses the required storage key', () => assert.equal(STORAGE_KEY, 'mona-bookmarks'));

  for (const value of [null, '', '  ', '[]']) {
    it(`recovers empty storage ${JSON.stringify(value)}`, () => {
      assert.deepEqual(loadBookmarks(value), { bookmarks: [], recovered: false });
    });
  }

  for (const value of [
    '{broken', 'undefined', 'null', '42', 'true', '"old bookmark"',
    '{}', '{"bookmarks":[]}', '["https://example.com"]',
    '[{"originalUrl":"https://example.com","shortUrl":"old-slug"}]',
  ]) {
    it(`recovers corrupted, legacy, or non-array storage ${value}`, () => {
      assert.deepEqual(loadBookmarks(value), { bookmarks: [], recovered: true });
      assert.doesNotThrow(() => createBookmark('example.org', loadBookmarks(value).bookmarks));
    });
  }

  it('keeps only validated records and strips unrelated properties', () => {
    const stored = [
      { ...bookmark, extra: '<script>bad()</script>' },
      null, [], 1, false, 'old',
      {}, { url: bookmark.url }, { slug: bookmark.slug },
      { url: 42, slug: 'mona-test' },
      { url: bookmark.url, slug: 42 },
      { url: '', slug: 'mona-test' },
      { url: 'not a url', slug: 'mona-test' },
      { url: 'javascript:alert(1)', slug: 'mona-test' },
      { url: bookmark.url, slug: '<img src=x>' },
      { url: bookmark.url, slug: 'mona-' },
      { url: bookmark.url, slug: 'legacy-slug' },
      { url: 'https://example.org/', slug: bookmark.slug },
      { url: 'example.org', slug: 'mona-AbZ9' },
    ];
    assert.deepEqual(loadBookmarks(JSON.stringify(stored)), {
      bookmarks: [bookmark, { url: 'https://example.org/', slug: 'mona-AbZ9' }],
      recovered: true,
    });
  });

  it('round-trips saved bookmarks with their original slugs', () => {
    const saved = [bookmark, createBookmark('example.org/path', [bookmark])];
    assert.deepEqual(loadBookmarks(JSON.stringify(saved)), { bookmarks: saved, recovered: false });
  });
});

describe('short aliases', () => {
  it('generates a four-character base62 suffix', () => {
    assert.equal(generateSlug([], () => 0), 'mona-0000');
    assert.equal(generateSlug([], () => 1 - Number.EPSILON), 'mona-ZZZZ');
    assert.match(createBookmark('example.com', []).slug, /^mona-[0-9a-zA-Z]{4}$/);
  });

  it('resolves repeated random collisions without duplicating a saved slug', () => {
    const saved = ['mona-0000', 'mona-0001', 'mona-0002'].map((slug) => ({ ...bookmark, slug }));
    assert.equal(generateSlug(saved, () => 0), 'mona-0003');
  });

  it('wraps around when the final alias is occupied', () => {
    assert.equal(generateSlug([{ ...bookmark, slug: 'mona-ZZZZ' }], () => 1 - Number.EPSILON), 'mona-0000');
  });

  it('reports invalid random values rather than producing invalid aliases', () => {
    for (const value of [NaN, Infinity, -1, 1]) {
      assert.throws(() => generateSlug([], () => value), /Could not generate/);
    }
  });
});

describe('bookmark formatting', () => {
  it('uses the exact visible " :: " separator', () => {
    assert.equal(formatBookmark(bookmark), 'https://www.example.com/ :: mona-7fk2');
  });
});
