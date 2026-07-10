# Page Builder — Pass 1 (Backbone + Core Blocks) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a working page builder: a `Page` collection + API, a dynamic `/:slug` route that renders DB-backed pages from blocks, and a "Pages" admin tab to create/edit/delete pages with draft/publish — using the `hero`, `heading`, `richtext`, and `cta` blocks.

**Architecture:** Mirrors existing backend patterns (model → controller → route + `adminAuth`, mounted in `server.js`). The public site fetches a published page by slug and renders an ordered block list; the admin edits pages (fields + block editor). Reuses Phase-1 `Seo` and Phase-2 `RichText`/`RichTextInput`.

**Tech Stack:** Express + Mongoose (CommonJS), React 19 + React Router (ESM), Node `node --test` (both packages), DOMPurify (already installed).

## Global Constraints

- **NO git commits/pushes** — end each task by leaving changes uncommitted for review.
- **No new dependencies.**
- **Never shadow a fixed route:** slug validation rejects reserved slugs; router ranking keeps static routes first.
- **Drafts are private:** public API returns only `published`.
- **All rich text through `RichText`** (DOMPurify-sanitized).
- Match existing patterns: server `dbReady()` guards; admin styling classes; single "Save" pattern.
- Reserved slugs: `admin, about, commercial, residential, landscaping, cleaning, property-maintenance, gallery, contact, privacy, terms` and empty string.

---

### Task 1: Server slug utilities (TDD)

**Files:**
- Create: `server/utils/slug.js`
- Test: `server/test/slug.test.js`

**Interfaces:**
- Produces (CommonJS): `slugify(str) -> string`, `RESERVED_SLUGS` (array), `isReservedSlug(slug) -> boolean`.

- [ ] **Step 1: Write the failing test**

```js
// server/test/slug.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const { slugify, isReservedSlug } = require('../utils/slug');

test('slugify lowercases, trims and dashes spaces', () => {
  assert.equal(slugify('  Spring Cleaning Offer! '), 'spring-cleaning-offer');
  assert.equal(slugify('Turf & Irrigation'), 'turf-irrigation');
  assert.equal(slugify('multi   space__underscore'), 'multi-space-underscore');
});

test('isReservedSlug flags fixed routes and empty', () => {
  assert.equal(isReservedSlug('about'), true);
  assert.equal(isReservedSlug('contact'), true);
  assert.equal(isReservedSlug(''), true);
  assert.equal(isReservedSlug('spring-cleaning-offer'), false);
});
```

- [ ] **Step 2: Run to verify it FAILS** — `cd server && npm test` → FAIL (module missing).

- [ ] **Step 3: Implement**

```js
// server/utils/slug.js
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
```

- [ ] **Step 4: Run to verify PASS** — `cd server && npm test` → PASS.

- [ ] **Step 5: Review checkpoint (no commit).** Note: "P3 Task 1 — server slug utils."

---

### Task 2: Page model

**Files:**
- Create: `server/models/Page.js`

- [ ] **Step 1: Implement the schema**

```js
// server/models/Page.js
const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    title: { type: String, required: true, trim: true },
    blocks: { type: [mongoose.Schema.Types.Mixed], default: [] },
    seo: {
      title: { type: String, default: '' },
      description: { type: String, default: '' },
      noindex: { type: Boolean, default: false },
    },
    showInNav: { type: Boolean, default: false },
    navLabel: { type: String, default: '' },
    status: { type: String, enum: ['draft', 'published'], default: 'draft', index: true },
  },
  { timestamps: true, minimize: false }
);

module.exports = mongoose.model('Page', pageSchema);
```

- [ ] **Step 2: Verify it loads** — `cd server && node -e "require('./models/Page'); console.log('ok')"`
Expected: prints `ok` (schema compiles).

- [ ] **Step 3: Review checkpoint (no commit).** Note: "P3 Task 2 — Page model."

---

### Task 3: Page controller + routes + mount

**Files:**
- Create: `server/controllers/pageController.js`
- Create: `server/routes/pageRoutes.js`
- Modify: `server/server.js` (mount `/api/pages`)

**Interfaces (consumed by the client in Task 4):**
- `GET /api/pages/slug/:slug` (public) → `{ success, page }` for a **published** page, else 404.
- `GET /api/pages` (admin) → `{ success, pages }` (all, newest first).
- `POST /api/pages` (admin) `{ page }` → `{ success, page }`.
- `PUT /api/pages/:id` (admin) `{ page }` → `{ success, page }`.
- `DELETE /api/pages/:id` (admin) → `{ success }`.

- [ ] **Step 1: Implement the controller**

```js
// server/controllers/pageController.js
const { dbReady } = require('../config/db');
const Page = require('../models/Page');
const { slugify, isReservedSlug } = require('../utils/slug');

const notConfigured = (res) =>
  res.status(503).json({ success: false, message: 'Database not configured.' });

/** Normalise + validate a slug; returns { slug } or { error }. */
const cleanSlug = (raw) => {
  const slug = slugify(raw);
  if (isReservedSlug(slug)) return { error: 'That web address is reserved — choose another.' };
  return { slug };
};

// Public: a single published page.
exports.getBySlug = async (req, res) => {
  if (!dbReady()) return notConfigured(res);
  try {
    const page = await Page.findOne({ slug: req.params.slug, status: 'published' }).lean();
    if (!page) return res.status(404).json({ success: false, message: 'Page not found.' });
    return res.json({ success: true, page });
  } catch (err) {
    console.error('[pages] getBySlug error:', err.message);
    return res.status(500).json({ success: false, message: 'Could not load page.' });
  }
};

// Admin: every page (incl. drafts).
exports.listAll = async (req, res) => {
  if (!dbReady()) return notConfigured(res);
  const pages = await Page.find().sort({ updatedAt: -1 }).lean();
  return res.json({ success: true, pages });
};

exports.create = async (req, res) => {
  if (!dbReady()) return notConfigured(res);
  const body = (req.body && req.body.page) || {};
  const { slug, error } = cleanSlug(body.slug || body.title);
  if (error) return res.status(400).json({ success: false, message: error });
  try {
    const exists = await Page.findOne({ slug }).lean();
    if (exists) return res.status(409).json({ success: false, message: 'That web address is already used.' });
    const page = await Page.create({ ...body, slug });
    return res.json({ success: true, page });
  } catch (err) {
    console.error('[pages] create error:', err.message);
    return res.status(500).json({ success: false, message: 'Could not create page.' });
  }
};

exports.update = async (req, res) => {
  if (!dbReady()) return notConfigured(res);
  const body = (req.body && req.body.page) || {};
  const patch = { ...body };
  if (body.slug !== undefined) {
    const { slug, error } = cleanSlug(body.slug);
    if (error) return res.status(400).json({ success: false, message: error });
    const clash = await Page.findOne({ slug, _id: { $ne: req.params.id } }).lean();
    if (clash) return res.status(409).json({ success: false, message: 'That web address is already used.' });
    patch.slug = slug;
  }
  try {
    const page = await Page.findByIdAndUpdate(req.params.id, patch, { new: true }).lean();
    if (!page) return res.status(404).json({ success: false, message: 'Page not found.' });
    return res.json({ success: true, page });
  } catch (err) {
    console.error('[pages] update error:', err.message);
    return res.status(500).json({ success: false, message: 'Could not save page.' });
  }
};

exports.remove = async (req, res) => {
  if (!dbReady()) return notConfigured(res);
  try {
    await Page.findByIdAndDelete(req.params.id);
    return res.json({ success: true });
  } catch (err) {
    console.error('[pages] remove error:', err.message);
    return res.status(500).json({ success: false, message: 'Could not delete page.' });
  }
};
```

- [ ] **Step 2: Implement the routes**

```js
// server/routes/pageRoutes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/pageController');
const adminAuth = require('../middleware/adminAuth');

router.get('/slug/:slug', ctrl.getBySlug);   // public
router.get('/', adminAuth, ctrl.listAll);     // admin
router.post('/', adminAuth, ctrl.create);     // admin
router.put('/:id', adminAuth, ctrl.update);   // admin
router.delete('/:id', adminAuth, ctrl.remove);// admin

module.exports = router;
```

- [ ] **Step 3: Mount in `server.js`** — after the existing route mounts add:

```js
app.use('/api/pages', require('./routes/pageRoutes'));
```

- [ ] **Step 4: Verify it loads** — `cd server && node -e "require('./routes/pageRoutes'); console.log('ok')"`
Expected: `ok` (controller + routes compile).

- [ ] **Step 5: Review checkpoint (no commit).** Note: "P3 Task 3 — page API."

---

### Task 4: Client slug helper (TDD) + API functions

**Files:**
- Create: `client/src/utils/slug.js`
- Test: `client/src/utils/slug.test.js`
- Modify: `client/src/services/adminApi.js`

**Interfaces:**
- `slugify(str) -> string` (ESM; UX auto-suggest — server re-validates authoritatively).
- adminApi: `fetchPageBySlug(slug)`, `fetchPages()`, `createPage(page)`, `updatePage(id, page)`, `deletePage(id)`.

- [ ] **Step 1: Write the failing test**

```js
// client/src/utils/slug.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { slugify } from './slug.js';

test('slugify matches the server rules', () => {
  assert.equal(slugify('  Spring Cleaning Offer! '), 'spring-cleaning-offer');
  assert.equal(slugify('Turf & Irrigation'), 'turf-irrigation');
});
```

- [ ] **Step 2: Run to verify it FAILS** — `cd client && npm test` → FAIL.

- [ ] **Step 3: Implement the helper**

```js
// client/src/utils/slug.js
/** Normalise text into a url-safe slug (UX only; the server re-validates). */
export function slugify(str) {
  return String(str || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
```

- [ ] **Step 4: Run to verify PASS** — `cd client && npm test` → PASS.

- [ ] **Step 5: Add the API functions** to `client/src/services/adminApi.js` (after the settings block):

```js
/* ── Pages (page builder) ── */
export const fetchPageBySlug = async (slug) => {
  const res = await fetch(`${BASE}/api/pages/slug/${encodeURIComponent(slug)}`);
  return handle(res); // { success, page }  (throws on 404)
};

export const fetchPages = async () => {
  const res = await fetch(`${BASE}/api/pages`, { headers: authHeaders() });
  return handle(res); // { success, pages }
};

export const createPage = async (page) => {
  const res = await fetch(`${BASE}/api/pages`, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ page }),
  });
  return handle(res);
};

export const updatePage = async (id, page) => {
  const res = await fetch(`${BASE}/api/pages/${id}`, {
    method: 'PUT',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ page }),
  });
  return handle(res);
};

export const deletePage = async (id) => {
  const res = await fetch(`${BASE}/api/pages/${id}`, { method: 'DELETE', headers: authHeaders() });
  return handle(res);
};
```

- [ ] **Step 6: Verify** — `cd client && npm test && npx eslint src/services/adminApi.js src/utils/slug.js` (pass; lint 0).

- [ ] **Step 7: Review checkpoint (no commit).** Note: "P3 Task 4 — client slug + page API."

---

### Task 5: Block renderer + core block components

**Files:**
- Create: `client/src/components/pageblocks/PageBlock.jsx`
- Create: `client/src/components/pageblocks/blocks.jsx` (the 4 block components)
- Modify: `client/src/index.css` or a new `client/src/styles/pageblocks.css` imported by `PageBlock` (minimal block styling that reuses existing site tokens)

**Interfaces:**
- `<PageBlock block={{ type, ...fields }} />` → renders the matching block; unknown type → `null`.

- [ ] **Step 1: Implement the blocks**

```jsx
// client/src/components/pageblocks/blocks.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import RichText from '../utils/RichText';

// A button that routes internally (starts with "/") or opens an absolute URL.
const Btn = ({ text, link, className = 'btn btn-primary' }) => {
  if (!text) return null;
  const to = link || '/contact';
  return to.startsWith('/')
    ? <Link to={to} className={className}>{text}</Link>
    : <a href={to} className={className}>{text}</a>;
};

export const HeroBlock = ({ heading, subtext, image, buttonText, buttonLink }) => (
  <section className="hero-section subpage-hero" style={image ? { backgroundImage: `linear-gradient(rgba(10,22,40,0.6),rgba(10,22,40,0.6)), url(${image})` } : undefined}>
    <div className="container">
      <div className="hero-content">
        {heading && <h1 className="hero-title">{heading}</h1>}
        {subtext && <RichText as="p" className="hero-subtitle" html={subtext} />}
        {buttonText && <div className="hero-btns cta-btns"><Btn text={buttonText} link={buttonLink} /></div>}
      </div>
    </div>
  </section>
);

export const HeadingBlock = ({ text }) => (
  <section className="section"><div className="container">
    <h2 className="section-title" style={{ textAlign: 'center' }}>{text}</h2>
  </div></section>
);

export const RichTextBlock = ({ html }) => (
  <section className="section"><div className="container" style={{ maxWidth: '820px' }}>
    <RichText as="div" className="legal-content" html={html} />
  </div></section>
);

export const CtaBlock = ({ heading, buttonText, buttonLink }) => (
  <section className="section cta-banner bg-navy" style={{ textAlign: 'center' }}>
    <div className="container">
      {heading && <h2 className="section-title" style={{ color: '#fff' }}>{heading}</h2>}
      <div className="cta-btns" style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '20px' }}>
        <Btn text={buttonText} link={buttonLink} />
      </div>
    </div>
  </section>
);
```

- [ ] **Step 2: Implement the switch**

```jsx
// client/src/components/pageblocks/PageBlock.jsx
import React from 'react';
import { HeroBlock, HeadingBlock, RichTextBlock, CtaBlock } from './blocks';

const MAP = { hero: HeroBlock, heading: HeadingBlock, richtext: RichTextBlock, cta: CtaBlock };

const PageBlock = ({ block }) => {
  const Comp = MAP[block?.type];
  return Comp ? <Comp {...block} /> : null;
};

export default PageBlock;
```

- [ ] **Step 3: Verify** — `cd client && npx eslint src/components/pageblocks/*.jsx && npm run build` (lint 0; build ok).

- [ ] **Step 4: Review checkpoint (no commit).** Note: "P3 Task 5 — block renderer."

---

### Task 6: Dynamic route + DynamicPage + Seo noindex

**Files:**
- Create: `client/src/pages/DynamicPage.jsx`
- Modify: `client/src/App.jsx` (add `/:slug` route before `*`)
- Modify: `client/src/components/utils/Seo.jsx` (optional `noindex` prop)

- [ ] **Step 1: Add the `noindex` prop to `Seo.jsx`**

Change the signature to `({ title, description, path = '', schema, noindex: noindexProp })` and combine:
`const finalNoindex = noindexProp ?? noindex;` (where `noindex` is the resolved override), and render the robots meta on `finalNoindex`.

- [ ] **Step 2: Implement `DynamicPage`**

```jsx
// client/src/pages/DynamicPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchPageBySlug } from '../services/adminApi';
import Seo from '../components/utils/Seo';
import PageBlock from '../components/pageblocks/PageBlock';
import PageLoader from '../components/utils/PageLoader';
import NotFoundPage from './NotFoundPage';

const DynamicPage = () => {
  const { slug } = useParams();
  const [state, setState] = useState({ loading: true, page: null });

  useEffect(() => {
    let alive = true;
    setState({ loading: true, page: null });
    fetchPageBySlug(slug)
      .then((d) => alive && setState({ loading: false, page: d.page }))
      .catch(() => alive && setState({ loading: false, page: null }));
    return () => { alive = false; };
  }, [slug]);

  if (state.loading) return <PageLoader />;
  if (!state.page) return <NotFoundPage />;

  const p = state.page;
  return (
    <div className="dynamic-page">
      <Seo
        title={p.seo?.title || p.title}
        description={p.seo?.description || ''}
        path={`/${p.slug}`}
        noindex={Boolean(p.seo?.noindex)}
      />
      {(p.blocks || []).map((b, i) => <PageBlock key={i} block={b} />)}
    </div>
  );
};

export default DynamicPage;
```

- [ ] **Step 3: Add the route in `App.jsx`** — inside the `<Route element={<Layout />}>` group, **immediately before** `<Route path="*" ... />`:

```jsx
const DynamicPage = lazy(() => import('./pages/DynamicPage'));
// ...
<Route path="/:slug" element={<DynamicPage />} />
<Route path="*" element={<NotFoundPage />} />
```

- [ ] **Step 4: Verify** — `cd client && npx eslint src/pages/DynamicPage.jsx src/App.jsx src/components/utils/Seo.jsx && npm run build` (lint 0; build ok).

- [ ] **Step 5: Review checkpoint (no commit).** Note: "P3 Task 6 — dynamic route."

---

### Task 7: "Pages" admin tab (list + editor + block editor)

**Files:**
- Create: `client/src/components/admin/PagesPanel.jsx`
- Modify: `client/src/pages/admin/AdminDashboard.jsx` (add "Pages" tab + help callout)
- Modify: `client/src/styles/admin.css` (page-list + block-editor helpers, reusing existing tokens)

**Interfaces:** consumes `fetchPages`, `createPage`, `updatePage`, `deletePage`; `slugify`; `RichTextInput`.

- [ ] **Step 1: Implement `PagesPanel`**

Behaviour:
- **List view** (default): `fetchPages()` → table of `title`, `/slug`, status badge, with **Edit** and **Delete** (Delete asks `window.confirm` first). A **"+ New page"** button opens the editor with a blank page (`{ title:'', slug:'', blocks:[], seo:{}, showInNav:false, status:'draft' }`).
- **Editor view:** local `page` state. Fields:
  - `title` (text) — on change, if the slug is empty or was auto-derived, set `slug = slugify(title)`.
  - `slug` (text) with a `/` prefix label; on blur run `slugify`.
  - `status` select (Draft / Published).
  - `showInNav` checkbox + `navLabel` text (shown when checked).
  - SEO: `seo.title`, `seo.description` (text), `seo.noindex` (checkbox).
  - **Block editor:** a "+ Add block" menu (Hero / Heading / Rich text / Call to action) appends a block with empty fields; each block renders its fields by type (text inputs; `RichTextInput` for `subtext`/`html`; a plain URL text field for `image`), with ↑ ↓ reorder and ✕ delete (reuse the Phase-2 list-row pattern).
  - **Save:** create (`createPage`) or update (`updatePage`); on success return to the list and refresh. Surface API errors (reserved/duplicate slug) in an `admin-alert`.
  - **Cancel:** back to list without saving.
- Block field definitions (drives the per-block form):
  ```js
  const BLOCK_FIELDS = {
    hero: [['heading','text'],['subtext','richtext'],['image','url'],['buttonText','text'],['buttonLink','text']],
    heading: [['text','text']],
    richtext: [['html','richtext']],
    cta: [['heading','text'],['buttonText','text'],['buttonLink','text']],
  };
  const BLOCK_LABELS = { hero: 'Hero banner', heading: 'Heading', richtext: 'Rich text', cta: 'Call to action' };
  ```

- [ ] **Step 2: Add the "Pages" tab to `AdminDashboard.jsx`** — import `PagesPanel`, add a tab button (after "Content") and `{tab === 'pages' && <PagesPanel />}`, plus the standard `admin-help` callout inside `PagesPanel` explaining what the tab does and how to use it.

- [ ] **Step 3: Add minimal styles** to `admin.css` for the page list and block rows (reuse `admin-listrow*`, `admin-table*`, `admin-field*`).

- [ ] **Step 4: Verify** — `cd client && npx eslint src/components/admin/PagesPanel.jsx src/pages/admin/AdminDashboard.jsx && npm run build` (lint 0; build ok).

- [ ] **Step 5: Review checkpoint (no commit).** Note: "P3 Task 7 — Pages admin tab."

---

### Task 8: Full verification

- [ ] **Step 1: Automated** — `cd client && npm test && npm run lint && npm run build`; `cd server && npm test`. Expect: tests pass; changed-file lint clean (pre-existing repo lint excluded); build ok.

- [ ] **Step 2: Load checks (no DB needed)** — `cd server && node -e "require('./routes/pageRoutes'); require('./models/Page'); console.log('server ok')"`.

- [ ] **Step 3: Manual (running stack + admin token), when available:**
  - Pages tab → New page → add Hero + Rich text + CTA → set slug `test-offer` → Save as **Draft**.
  - Visit `/test-offer` → **404** (draft private).
  - Set **Published** → Save → `/test-offer` renders the blocks; `/about` etc. still render.
  - Try slug `about` → rejected with the reserved-slug message.
  - Reorder/delete a block → Save → reflected. Delete the page → 404 + gone from list.

- [ ] **Step 4: Hand off for owner review (no commit).** Summarise changed/new files.

---

## Self-Review

**Spec coverage (Pass 1 scope):** Page model + API + slug/reserved validation → Tasks 1–3;
dynamic route + DynamicPage + block renderer (hero/heading/richtext/cta) → Tasks 5–6; Pages
admin tab (create/edit/delete, block editor, draft/publish) → Task 7; `Seo` noindex → Task 6.
Nav integration, `image`/`twoColumn`/`getQuote` blocks are **Pass 2** (out of this plan). ✅

**Placeholder scan:** all code blocks are concrete; `BLOCK_FIELDS`/`BLOCK_LABELS` given; no
TBD/TODO. ✅

**Type consistency:** API shapes (`{ success, page }` / `{ success, pages }`) match between
controller (Task 3) and adminApi (Task 4) and consumers (Tasks 6–7); `slugify` identical on
both sides (Tasks 1 & 4); block field names match block components (Task 5) ↔ editor field
defs (Task 7). ✅

**Note:** controllers need a live DB, so they're verified by load-check + manual (Task 8),
with pure slug logic covered by unit tests (Tasks 1 & 4).
