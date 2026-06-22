/**
 * Deep-merge admin-saved overrides INTO the target config object in place.
 *
 * - Plain objects merge recursively.
 * - Arrays merge element-by-element (so an override like
 *   `pricing.residential: [{price:'$130'}]` updates only that row's price and
 *   keeps the rest of each row, and `serviceCategories: [{fromPrice:'$70'}]`
 *   updates a category's price without touching its services list).
 * - Primitives are replaced.
 *
 * Mutating the shared siteConfig singleton means every `import siteConfig`
 * across the app sees the merged values, with zero refactor of consumers.
 */
const isPlainObject = (v) =>
  v !== null && typeof v === 'object' && !Array.isArray(v);

export default function applyOverrides(target, overrides) {
  // Array ↔ array: merge by index.
  if (Array.isArray(target) && Array.isArray(overrides)) {
    overrides.forEach((value, i) => {
      if (isPlainObject(value) && isPlainObject(target[i])) {
        applyOverrides(target[i], value);
      } else if (Array.isArray(value) && Array.isArray(target[i])) {
        applyOverrides(target[i], value);
      } else if (value !== undefined) {
        target[i] = value;
      }
    });
    return target;
  }

  if (!isPlainObject(target) || !isPlainObject(overrides)) return target;

  for (const [key, value] of Object.entries(overrides)) {
    if (isPlainObject(value) && isPlainObject(target[key])) {
      applyOverrides(target[key], value);
    } else if (Array.isArray(value) && Array.isArray(target[key])) {
      applyOverrides(target[key], value);
    } else {
      target[key] = value;
    }
  }
  return target;
}
