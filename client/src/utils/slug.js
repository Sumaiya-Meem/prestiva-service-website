/** Normalise text into a url-safe slug (UX auto-suggest; the server re-validates). */
export function slugify(str) {
  return String(str || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
