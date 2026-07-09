/**
 * Bundled built-in gallery assets — the same photos/clips that ship inside the
 * Vite build and are served by the static host (Vercel CDN). Unlike the API
 * server's /uploads files (which live on an ephemeral disk and disappear on
 * every deploy/restart), these URLs never 404.
 *
 * Two jobs:
 *   1. Whole-list fallback when the gallery API returns nothing (empty DB / API
 *      down) — see `bundledItems()`.
 *   2. Per-item fallback: when a single media item's server file is missing, an
 *      <img>/<video> `onError` swaps to the bundled asset for the SAME section,
 *      so a wiped uploads directory never shows broken images to visitors.
 *      (Only fires on a real load error, so genuinely-uploaded custom photos
 *      that DO exist on the server are never replaced.)
 */

// Eagerly import every bundled asset's final URL. Keys are module paths like
// "../assets/gallery/office/5.webp".
const imageModules = import.meta.glob('../assets/gallery/**/*.webp', { eager: true, query: '?url', import: 'default' });
const videoModules = import.meta.glob('../assets/gallery/**/*.mp4', { eager: true, query: '?url', import: 'default' });
const posterModules = import.meta.glob('../assets/gallery/**/*.jpg', { eager: true, query: '?url', import: 'default' });

// Folder slug (e.g. "office") and base name (e.g. "5") from a module path.
const slugOf = (p) => p.split('/').slice(-2, -1)[0];
const baseOf = (p) => p.split('/').pop().replace(/\.[^.]+$/, '');

// Section slug -> human display tag (matches the built-in sections seeded server-side).
export const FOLDER_META = {
  office: 'Office Cleaning', commercial: 'Commercial Cleaning', builders: 'Builders Cleaning',
  'end-of-lease': 'End of Lease', airbnb: 'Airbnb Cleaning', 'real-estate': 'Real Estate Cleaning',
  pressure: 'Pressure Washing', property: 'Property Maintenance', landscaping: 'Landscaping',
  window: 'Window Cleaning', carpet: 'Carpet Cleaning', results: 'Cleaning Results',
};

// Posters keyed by "<slug>/<base>" so each video can find its matching still frame.
const posterBySlugBase = {};
for (const [p, url] of Object.entries(posterModules)) posterBySlugBase[`${slugOf(p)}/${baseOf(p)}`] = url;

// slug -> [imageUrl, ...]
const imagesBySlug = {};
for (const [p, url] of Object.entries(imageModules)) {
  (imagesBySlug[slugOf(p)] = imagesBySlug[slugOf(p)] || []).push(url);
}

// slug -> [{ src, poster }, ...]
const videosBySlug = {};
for (const [p, url] of Object.entries(videoModules)) {
  const slug = slugOf(p);
  (videosBySlug[slug] = videosBySlug[slug] || []).push({ src: url, poster: posterBySlugBase[`${slug}/${baseOf(p)}`] || '' });
}

// Positive modulo so a negative index still lands in range.
const at = (arr, i) => arr[((i % arr.length) + arr.length) % arr.length];

/**
 * A bundled IMAGE url to stand in for a broken server image in this section.
 * Rotates by `index` so several broken tiles in one section don't all show the
 * same photo. Falls back to any bundled image, then '' if there are none.
 */
export const bundledImageFor = (slug, index = 0) => {
  const arr = imagesBySlug[slug];
  if (arr && arr.length) return at(arr, index);
  for (const a of Object.values(imagesBySlug)) if (a.length) return a[0];
  return '';
};

/**
 * A bundled VIDEO { src, poster } to stand in for a broken server video in this
 * section, or null if none is bundled.
 */
export const bundledVideoFor = (slug, index = 0) => {
  const arr = videosBySlug[slug];
  if (arr && arr.length) return at(arr, index);
  for (const a of Object.values(videosBySlug)) if (a.length) return a[0];
  return null;
};

/** Flat list of every bundled item — used when the API returns no media at all. */
export const bundledItems = () => {
  const items = [];
  for (const [slug, urls] of Object.entries(imagesBySlug))
    for (const url of urls) items.push({ id: `b:${url}`, src: url, slug, tag: FOLDER_META[slug] || 'Our Work', type: 'image' });
  for (const [slug, vids] of Object.entries(videosBySlug))
    for (const v of vids) items.push({ id: `b:${v.src}`, src: v.src, poster: v.poster, slug, tag: FOLDER_META[slug] || 'Our Work', type: 'video' });
  return items.sort((a, b) =>
    a.type !== b.type ? (a.type === 'video' ? -1 : 1) : a.tag.localeCompare(b.tag)
  );
};

/** Bundled "results" clips (with posters) for the homepage reel fallback. */
export const bundledResultsClips = () => (videosBySlug.results || []).map((v) => ({ src: v.src, poster: v.poster }));
