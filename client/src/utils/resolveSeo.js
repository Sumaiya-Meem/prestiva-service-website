/**
 * Resolve effective SEO for a page from its admin override + built-in defaults.
 *
 * Pure and import-free so it is trivially unit-testable. A blank/whitespace
 * override field falls back to the default, so a page can never render a blank
 * title or description (the admin-editor safety net).
 *
 * @param {{ title?: string, description?: string, noindex?: boolean }|undefined} override
 * @param {{ title?: string, description?: string }} defaults
 * @returns {{ title: string, description: string, noindex: boolean }}
 */
export function resolveSeo(override, defaults = {}) {
  const o = override || {};
  const pick = (v, fallback) =>
    typeof v === 'string' && v.trim() ? v : fallback;
  return {
    title: pick(o.title, defaults.title),
    description: pick(o.description, defaults.description),
    noindex: Boolean(o.noindex),
  };
}
