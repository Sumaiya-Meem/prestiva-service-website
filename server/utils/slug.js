const RESERVED_SLUGS = [
  'admin', 'about', 'commercial', 'residential', 'landscaping', 'cleaning',
  'property-maintenance', 'gallery', 'contact', 'privacy', 'terms',
];

/** Normalise arbitrary text into a url-safe slug. */
function slugify(str) {
  return String(str || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-') // non-alphanumerics → dash
    .replace(/^-+|-+$/g, '');    // trim leading/trailing dashes
}

/** True if the slug collides with a fixed route or is empty. */
function isReservedSlug(slug) {
  return !slug || RESERVED_SLUGS.includes(slug);
}

module.exports = { slugify, isReservedSlug, RESERVED_SLUGS };
