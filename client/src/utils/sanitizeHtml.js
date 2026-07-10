import DOMPurify from 'dompurify';

// Allow only basic inline formatting + links. Everything else (scripts, styles,
// event handlers, pasted Word markup) is stripped, so content stays safe AND
// visually consistent.
const CONFIG = {
  ALLOWED_TAGS: ['b', 'strong', 'i', 'em', 'a', 'br', 'p'],
  ALLOWED_ATTR: ['href', 'target', 'rel'],
};

/** Clean editable HTML down to the safe allow-list (bold/italic/links/breaks). */
export function sanitizeHtml(html) {
  if (typeof html !== 'string' || !html) return '';
  return DOMPurify.sanitize(html, CONFIG);
}
