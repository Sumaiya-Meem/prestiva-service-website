/**
 * Resolve an editable content value: the admin override if it is a real value,
 * otherwise the built-in default. A blank/whitespace *string* falls back (the
 * safety net); arrays/objects (incl. an empty array the user deliberately saved)
 * pass through unchanged.
 */
export function resolveContent(override, fallback) {
  if (override === undefined || override === null) return fallback;
  if (typeof override === 'string' && !override.trim()) return fallback;
  return override;
}
