# SEO Editor Tab — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an admin "SEO" tab that lets non-developers edit each page's SEO title, meta description, and Google visibility (noindex) — saved instantly through the existing settings-override system with no redeploy.

**Architecture:** Reuse the proven settings-override flow (`GET/PUT /api/settings` → `applyOverrides` merges into the `siteConfig` singleton on load). A pure helper resolves the effective SEO from an override + the page's built-in default. `Seo.jsx` consumes it. A new `SeoPanel` edits the `seo` slice of the overrides. No backend changes.

**Tech Stack:** React 19 (auto-hoists `<title>`/`<meta>` into `<head>`), Vite, existing `adminApi` service, Node's built-in test runner (`node --test`), `sharp` (dev dep) for the one-off social image.

## Global Constraints

- **No new runtime dependencies.** Tests use Node's built-in runner only.
- **NO git commits or pushes** — per owner instruction, every task ends by leaving changes uncommitted for the owner's manual review. Replace all "commit" steps with a review checkpoint.
- **Fallback safety net:** an empty/whitespace override field must fall back to the page's built-in default — a page can never render a blank title/description.
- **Match existing admin styling** (`client/src/styles/admin.css` classes: `admin-card`, `admin-field`, `admin-input`, `admin-label`, `admin-btn`, `admin-select`, etc.) and the single-"Save changes" pattern used by `SettingsPanel.jsx`.
- **Social image is site-wide only** (static `index.html`), not per-page — social scrapers don't run JS. Per-page control targets Google Search.
- React 19: no SEO library needed; `Seo.jsx` returns bare tags that hoist to `<head>`.

---

### Task 1: Pure SEO-resolution helper (TDD)

The risk-carrying logic (override-wins + blank-falls-back-to-default + noindex) lives in one pure, dependency-free function so it is unit-testable with `node --test`.

**Files:**
- Create: `client/src/utils/resolveSeo.js`
- Test: `client/src/utils/resolveSeo.test.js`
- Modify: `client/package.json` (add `test` script)

**Interfaces:**
- Produces: `resolveSeo(override, defaults) -> { title: string, description: string, noindex: boolean }`
  - `override`: `{ title?, description?, noindex? }` or `undefined`
  - `defaults`: `{ title, description }`

- [ ] **Step 1: Write the failing test**

```js
// client/src/utils/resolveSeo.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveSeo } from './resolveSeo.js';

const defaults = { title: 'Default Title', description: 'Default description.' };

test('no override → uses defaults, noindex false', () => {
  assert.deepEqual(resolveSeo(undefined, defaults), {
    title: 'Default Title', description: 'Default description.', noindex: false,
  });
});

test('override title only → override title, default description', () => {
  const r = resolveSeo({ title: 'Custom' }, defaults);
  assert.equal(r.title, 'Custom');
  assert.equal(r.description, 'Default description.');
});

test('blank/whitespace override → falls back to default (safety net)', () => {
  const r = resolveSeo({ title: '   ', description: '' }, defaults);
  assert.equal(r.title, 'Default Title');
  assert.equal(r.description, 'Default description.');
});

test('noindex true is honored; missing → false', () => {
  assert.equal(resolveSeo({ noindex: true }, defaults).noindex, true);
  assert.equal(resolveSeo({}, defaults).noindex, false);
});
```

- [ ] **Step 2: Add the test script and run to verify it FAILS**

Add to `client/package.json` `scripts`:
```json
"test": "node --test \"src/**/*.test.js\""
```
Run: `cd client && npm test`
Expected: FAIL — cannot find `./resolveSeo.js` (module not created yet).

- [ ] **Step 3: Write the minimal implementation**

```js
// client/src/utils/resolveSeo.js
/**
 * Resolve effective SEO for a page from its admin override + built-in defaults.
 * Pure and import-free so it is trivially unit-testable. A blank/whitespace
 * override field falls back to the default, so a page can never go blank.
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
```

- [ ] **Step 4: Run the tests to verify they PASS**

Run: `cd client && npm test`
Expected: PASS (4 tests).

- [ ] **Step 5: Review checkpoint (no commit)**

Leave changes uncommitted. Note for owner review: "Task 1 — pure SEO resolver + tests."

---

### Task 2: Page registry

A single list of the editable pages with their display defaults, consumed by `SeoPanel` for the page list, placeholders, and live preview.

**Files:**
- Create: `client/src/config/seoPages.js`
- Test: `client/src/config/seoPages.test.js`

**Interfaces:**
- Produces: `SEO_PAGES: Array<{ path, name, defaultTitle, defaultDescription, dynamic?: boolean }>`

- [ ] **Step 1: Write the failing test**

```js
// client/src/config/seoPages.test.js
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

test('every entry has a name and unique path', () => {
  const seen = new Set();
  for (const p of SEO_PAGES) {
    assert.ok(p.name, `${p.path} needs a name`);
    assert.ok(!seen.has(p.path), `duplicate ${p.path}`);
    seen.add(p.path);
  }
});
```

- [ ] **Step 2: Run to verify it FAILS**

Run: `cd client && npm test`
Expected: FAIL — cannot find `./seoPages.js`.

- [ ] **Step 3: Write the registry**

Copy the current default `title`/`description` verbatim from each page's `<Seo>` (they are the existing hardcoded values). Service-category pages (`/cleaning`, `/property-maintenance`) build their SEO dynamically at runtime, so mark them `dynamic: true`; the panel shows a generic placeholder for those.

```js
// client/src/config/seoPages.js
/** Pages whose SEO title/description can be edited from the admin SEO tab. */
export const SEO_PAGES = [
  { path: '/', name: 'Home',
    defaultTitle: 'Premium Property Maintenance, Landscaping & Cleaning in Adelaide | Prestiva',
    defaultDescription: 'Your Partner in Property Excellence. Property maintenance, landscaping and turf, plus commercial & builders cleaning across Adelaide. Fully insured, police checked. Get a free quote — call 0403 540 227.' },
  { path: '/about', name: 'About',
    defaultTitle: 'About Us | Prestiva Property Services — Adelaide & Sydney',
    defaultDescription: 'Prestiva Property Services is a fully insured, police-checked team delivering reliable cleaning, landscaping and property services across Adelaide & Sydney. Reliable results, every time.' },
  { path: '/cleaning', name: 'Cleaning', dynamic: true,
    defaultTitle: '', defaultDescription: '' },
  { path: '/landscaping', name: 'Landscaping',
    defaultTitle: 'Landscaping, Turf Laying & Irrigation Adelaide & Sydney | Prestiva',
    defaultDescription: 'Lawn mowing, garden clean-ups, hedge trimming, mulching, turf laying, irrigation and full garden maintenance across Adelaide & Sydney. Get a free landscaping quote today.' },
  { path: '/property-maintenance', name: 'Property Maintenance', dynamic: true,
    defaultTitle: '', defaultDescription: '' },
  { path: '/commercial', name: 'Commercial',
    defaultTitle: 'Commercial Cleaning Adelaide & Sydney | Offices, Strata & Builders | Prestiva',
    defaultDescription: 'Professional commercial cleaning for offices, restaurants, medical, retail, warehouses, strata and after-builders. Fully insured contract cleaning across Adelaide & Sydney. Get a free quote.' },
  { path: '/residential', name: 'Residential',
    defaultTitle: 'Residential & End-of-Lease Cleaning Adelaide & Sydney | Prestiva',
    defaultDescription: 'House cleaning, end-of-lease bond cleaning, deep cleans, move in/out and carpet steam cleaning across Adelaide & Sydney. Fully insured & police-checked. Get a free quote — 0403 540 227.' },
  { path: '/gallery', name: 'Gallery',
    defaultTitle: 'Our Work Gallery | Prestiva Property Services',
    defaultDescription: 'Real photos of our cleaning, builders, end-of-lease, pressure washing and property maintenance work across Adelaide & Sydney.' },
  { path: '/contact', name: 'Contact',
    defaultTitle: 'Contact Us & Get a Free Quote | Prestiva Property Services',
    defaultDescription: 'Request a free, no-obligation quote for cleaning, landscaping, turf or irrigation. Call 0403 540 227 or email admin@prestiva.com.au. Serving Adelaide & Sydney, 7 days a week.' },
  { path: '/privacy', name: 'Privacy Policy',
    defaultTitle: 'Privacy Policy | Prestiva Property Services',
    defaultDescription: 'How Prestiva Property Services collects, uses and protects the personal information you provide through our website and quote forms.' },
  { path: '/terms', name: 'Terms of Service',
    defaultTitle: 'Terms of Service | Prestiva Property Services',
    defaultDescription: 'The terms under which Prestiva Property Services provides cleaning, landscaping and property services, including quotes, bookings, payment and cancellations.' },
];
```

- [ ] **Step 4: Run to verify PASS**

Run: `cd client && npm test`
Expected: PASS (all tests, both files).

- [ ] **Step 5: Review checkpoint (no commit).** Note: "Task 2 — page registry."

---

### Task 3: Wire overrides into `Seo.jsx` + `siteConfig`

Make the live site honor saved overrides. Override wins; blank falls back to the page's prop; noindex emits a robots meta.

**Files:**
- Modify: `client/src/components/utils/Seo.jsx`
- Modify: `client/src/config/siteConfig.js` (add `seo: {}` default)

**Interfaces:**
- Consumes: `resolveSeo` (Task 1), `siteConfig.seo` (path-keyed overrides merged in by `applyOverrides`).

- [ ] **Step 1: Add the `seo` default to siteConfig**

In `client/src/config/siteConfig.js`, add a `seo: {},` property to the exported config object (near the top-level keys). This gives `applyOverrides` a predictable object to merge path-keyed overrides into.

- [ ] **Step 2: Update `Seo.jsx` to resolve overrides**

At the top, import the helper:
```js
import { resolveSeo } from '../../utils/resolveSeo';
```
Inside the component, replace the direct use of `title`/`description` with the resolved values, and add the noindex meta:
```js
const Seo = ({ title, description, path = '', schema }) => {
  const url = `${SITE_URL}${path}`;
  const { title: seoTitle, description: seoDescription, noindex } =
    resolveSeo(siteConfig.seo?.[path], { title, description });
  // ...existing graph build unchanged...
  return (
    <>
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      {noindex && <meta name="robots" content="noindex" />}
      <link rel="canonical" href={url} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:url" content={url} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }} />
    </>
  );
};
```
(Use `seoTitle`/`seoDescription` everywhere the component previously used `title`/`description`.)

- [ ] **Step 3: Verify lint + build**

Run: `cd client && npm run lint && npm run build`
Expected: no lint errors; build succeeds.

- [ ] **Step 4: Review checkpoint (no commit).** Note: "Task 3 — Seo.jsx honors overrides + noindex."

---

### Task 4: `SeoPanel` component

The editing UI: pick a page, edit title/description, toggle Hide-from-Google, see live counters + a Google-result preview, and save all pending edits at once (mirrors `SettingsPanel`).

**Files:**
- Create: `client/src/components/admin/SeoPanel.jsx`

**Interfaces:**
- Consumes: `fetchSettings`, `saveSettings` from `../../services/adminApi`; `SEO_PAGES` (Task 2); `resolveSeo` (Task 1); `applyOverrides` + `siteConfig` (to reflect changes live, like `SettingsPanel`).

- [ ] **Step 1: Implement the panel**

Behavior:
- On mount, `fetchSettings()` → hold `existing` overrides and seed local `seo` edit state from `existing.seo || {}`.
- A page `<select>` (or list) from `SEO_PAGES`. For the selected page, render:
  - **SEO title** `admin-input` with a counter: `{len}/60` — add class `is-warn` past 60.
  - **Meta description** `<textarea class="admin-input">` with counter `{len}/160` — `is-warn` past 160.
  - **Hide from Google** checkbox → sets `noindex` for that path; helper text: "Removes this page from Google search results. Only use for pages you don't want found."
  - Placeholder for each field = that page's `defaultTitle`/`defaultDescription` (or, for `dynamic` pages, "Auto-generated from service settings — type to override").
- **Live Google preview** block using `resolveSeo(localSeo[path], { title: defaultTitle, description: defaultDescription })`: blue title, green `www.prestiva.com.au{path}`, grey description.
- **Save changes** button: merge local `seo` into `existing` (`applyOverrides(structuredClone(existing), { seo })`), call `saveSettings(merged)`, then `applyOverrides(siteConfig, { seo })` so the public site reflects it in-session. Show `admin-alert admin-alert--success` "Saved. SEO changes are live." Mirror `SettingsPanel`'s save/reset/error handling exactly.

Edits to multiple pages accumulate in local state and all persist on one Save.

- [ ] **Step 2: Verify lint + build**

Run: `cd client && npm run lint && npm run build`
Expected: no lint errors; build succeeds.

- [ ] **Step 3: Review checkpoint (no commit).** Note: "Task 4 — SeoPanel UI."

---

### Task 5: Add the SEO tab to the dashboard

**Files:**
- Modify: `client/src/pages/admin/AdminDashboard.jsx`

- [ ] **Step 1: Wire the tab**

- Import: `import SeoPanel from '../../components/admin/SeoPanel';`
- Add a tab button after "Site Settings" (or before it):
```jsx
<button
  className={`admin-tab ${tab === 'seo' ? 'admin-tab--active' : ''}`}
  onClick={() => setTab('seo')}
>
  SEO
</button>
```
- Add the render branch in `admin-main`:
```jsx
{tab === 'seo' && <SeoPanel />}
```

- [ ] **Step 2: Verify in the running app**

Run: `cd client && npm run dev` (or full `npm run dev` from root), log into `/admin`, open the **SEO** tab. Edit a page's title/description, Save, then reload that public page and confirm the browser-tab title and `<meta name="description">` reflect the change. Clear the fields → confirm it reverts to the default. Toggle Hide-from-Google → confirm `<meta name="robots" content="noindex">` appears in the page `<head>`.

- [ ] **Step 3: Review checkpoint (no commit).** Note: "Task 5 — SEO tab wired into dashboard."

---

### Task 6: Fix the site-wide social-share image

Replace the SVG `og:image` (which social scrapers won't render) with a proper 1200×630 raster at an absolute URL.

**Files:**
- Create: `client/public/og-image.jpg` (generated)
- Create (temp): `client/scripts/make-og-image.mjs`
- Modify: `client/index.html`

- [ ] **Step 1: Generate the image with sharp**

```js
// client/scripts/make-og-image.mjs  (one-off; safe to delete after)
import sharp from 'sharp';
// Source: an existing on-brand gallery photo. Pick a clean, representative one.
const SRC = 'src/assets/gallery/builders/1.webp';
await sharp(SRC)
  .resize(1200, 630, { fit: 'cover', position: 'centre' })
  .jpeg({ quality: 82 })
  .toFile('public/og-image.jpg');
console.log('Wrote public/og-image.jpg');
```
Run: `cd client && node scripts/make-og-image.mjs`
Expected: "Wrote public/og-image.jpg". Verify the file exists and is a valid 1200×630 JPG (open it). If `builders/1.webp` isn't a good hero, choose another gallery image and re-run.

- [ ] **Step 2: Point `index.html` at the new absolute-URL image**

In `client/index.html`, change:
```html
<meta property="og:image" content="/logo-icon.svg" />
```
to:
```html
<meta property="og:image" content="https://www.prestiva.com.au/og-image.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
```
(Facebook/WhatsApp require an absolute URL and prefer JP/PNG at 1200×630.)

- [ ] **Step 3: Verify build**

Run: `cd client && npm run build`
Expected: build succeeds; `dist/og-image.jpg` present; `dist/index.html` shows the absolute `og:image` URL.

- [ ] **Step 4: Review checkpoint (no commit).** Note: "Task 6 — proper social image + og tags."

---

### Task 7: Full verification pass

**Files:** none (verification only).

- [ ] **Step 1: Run the full test + quality suite**

Run:
```
cd client && npm test && npm run lint && npm run build
```
Expected: all `node --test` tests pass; no lint errors; production build succeeds.

- [ ] **Step 2: End-to-end manual checklist (dev server)**

- SEO tab loads and lists all 11 pages.
- Editing a page's title/description + Save → public page reflects it after reload (tab title + meta description).
- Clearing a field → reverts to the built-in default (never blank).
- Hide-from-Google toggle → `<meta name="robots" content="noindex">` present.
- Counters warn past 60 / 160 chars; Google preview updates live.
- Other admin tabs (Quote Requests, Gallery, Backgrounds, Site Settings) and the public site are unchanged.
- `og-image.jpg` resolves; `index.html` has the absolute `og:image`.

- [ ] **Step 3: Hand off for owner review (no commit)**

Summarize all changed/created files for the owner to review and commit manually. Do NOT commit or push.

---

## Self-Review

**Spec coverage:**
- Per-page title/description editing → Tasks 1–5. ✅
- Hide-from-Google (noindex) → Tasks 1, 3, 4. ✅
- Live Google preview + counters → Task 4. ✅
- Instant save via settings system, no redeploy → Task 4 (`saveSettings` + in-session `applyOverrides`). ✅
- Fallback safety net → Task 1 (tested). ✅
- Static social-image fix → Task 6. ✅
- No backend change → confirmed (reuses `/api/settings`). ✅
- Out-of-scope items (per-page social, content editing, landing pages, dynamic sitemap, roles) → not included. ✅

**Placeholder scan:** Registry `defaultTitle`/`defaultDescription` are real strings copied from the pages; dynamic service pages explicitly flagged. No TBD/TODO. ✅

**Type consistency:** `resolveSeo(override, defaults) -> { title, description, noindex }` used identically in Tasks 1, 3, 4. `SEO_PAGES` entry shape consistent across Tasks 2 & 4. ✅

**Known tradeoff (documented):** `SEO_PAGES` display defaults duplicate the pages' `<Seo>` props (display-only; runtime still uses the page prop as the true default). Acceptable for v1; a future cleanup could source both from one place.
