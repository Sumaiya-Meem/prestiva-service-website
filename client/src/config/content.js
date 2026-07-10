import { CONTENT_DEFAULTS } from './contentSchema.js';
import { resolveContent } from '../utils/resolveContent.js';

let overrides = {}; // key -> saved value (replaces default wholesale)

/** Seed/replace the override map (called at boot and after an admin save). */
export function setContentOverrides(map) {
  overrides = map && typeof map === 'object' ? map : {};
}

/** Effective value for a content key: override (if a real value) else default. */
export function getContent(key) {
  return resolveContent(overrides[key], CONTENT_DEFAULTS[key]);
}

/** Current raw override map (for the admin editor to seed its state). */
export function getContentOverrides() {
  return overrides;
}
