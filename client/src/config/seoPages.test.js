import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SEO_PAGES } from './seoPages.js';

const SITEMAP_PATHS = ['/', '/about', '/cleaning', '/landscaping',
  '/property-maintenance', '/commercial', '/residential', '/gallery',
  '/contact', '/privacy', '/terms'];

test('every sitemap path has a registry entry', () => {
  const paths = SEO_PAGES.map((p) => p.path);
  for (const p of SITEMAP_PATHS) assert.ok(paths.includes(p), `missing ${p}`);
});

test('every entry has a name and a unique path', () => {
  const seen = new Set();
  for (const p of SEO_PAGES) {
    assert.ok(p.name, `${p.path} needs a name`);
    assert.ok(!seen.has(p.path), `duplicate ${p.path}`);
    seen.add(p.path);
  }
});
