/**
 * Page hero/background images.
 *
 * Each page has a built-in default (the bundled asset that ships with the site).
 * The admin can override any of these from the dashboard; the chosen URL is
 * saved in the Settings overrides under `pageBackgrounds.<key>` and merged onto
 * `siteConfig` at boot (see main.jsx), so `pageBgUrl()` transparently returns
 * the custom image when one is set and the default otherwise.
 *
 * Keys MUST match the server allow-list in
 * server/controllers/backgroundController.js.
 */
import siteConfig from './siteConfig';

import homeHero from '../assets/images/home_hero.webp';
import landscapingHero from '../assets/images/landscaping_hero.webp';
import commercialHero from '../assets/gallery/office/3.webp';
import residentialHero from '../assets/gallery/end-of-lease/2.webp';
import cleaningHero from '../assets/gallery/office/2.webp';
import maintenanceHero from '../assets/gallery/property/1.webp';

// `default: null` = a navy hero with no image by default (an uploaded image is optional).
export const PAGE_BACKGROUNDS = [
  { key: 'home', label: 'Home', default: homeHero },
  { key: 'cleaning', label: 'Cleaning Services', default: cleaningHero },
  { key: 'property-maintenance', label: 'Property Maintenance', default: maintenanceHero },
  { key: 'landscaping', label: 'Landscaping', default: landscapingHero },
  { key: 'commercial', label: 'Commercial', default: commercialHero },
  { key: 'residential', label: 'Residential', default: residentialHero },
  { key: 'about', label: 'About', default: null },
  { key: 'gallery', label: 'Gallery', default: null },
  { key: 'contact', label: 'Contact', default: null },
];

const DEFAULTS = Object.fromEntries(PAGE_BACKGROUNDS.map((p) => [p.key, p.default]));

/** Make a server-relative /uploads path absolute against the API origin. */
const abs = (u) =>
  !u || /^https?:\/\//.test(u) || u.startsWith('data:') || u.startsWith('blob:')
    ? u
    : `${siteConfig.apiBaseUrl}${u}`;

/**
 * The background URL to use for a page: the admin override if set, else the
 * built-in default (which may be null for navy pages).
 */
export const pageBgUrl = (key) => {
  const override = siteConfig.pageBackgrounds && siteConfig.pageBackgrounds[key];
  return override ? abs(override) : DEFAULTS[key] || null;
};

/**
 * Inline style for a navy sub-page hero that shows an admin-set background image
 * (with a dark overlay for legible white text) when one exists, and falls back
 * to the plain navy `bg-navy` class (returns undefined) when it doesn't.
 */
export const heroBgStyle = (key) => {
  const url = pageBgUrl(key);
  return url
    ? {
        backgroundImage: `linear-gradient(rgba(10,22,40,0.72), rgba(10,22,40,0.72)), url(${url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : undefined;
};
