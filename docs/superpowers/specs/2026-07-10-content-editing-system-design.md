# Content Editing System (Phase 2) — Design Spec

**Date:** 2026-07-10
**Status:** Approved for planning
**Author:** Claude + owner (brainstorming session)

## Goal

Let the marketing team edit **all site text and service content** from the admin —
headlines, paragraphs, FAQs, reviews, service lists, and inner-page copy — with **basic
formatting** (bold, italic, links) and **add/edit/delete/reorder** for list content. Edits
save through the existing settings system and go live with no redeploy. Rolled out
**section-by-section** so each pass is independently reviewable.

## Background / current state

- Text is split between:
  - **`siteConfig`** — structured content (services, pricing, trust stats, announcements);
    some already editable via the **Site Settings** tab.
  - **Hardcoded JSX** inside ~8+ section components (`FAQ.jsx`, `Reviews.jsx`,
    `WhyChoose.jsx`, `HeroSection.jsx`, `AddOnServices.jsx`, `CleaningChecklist.jsx`,
    `CommercialSpotlight.jsx`, `PricingOverview.jsx`, `ResultsReel.jsx`) and the inner
    pages (About/Commercial/Residential/Landscaping/etc.).
- Phase 1 established the pattern this builds on: overrides saved to `/api/settings`,
  merged into `siteConfig` at startup (`main.jsx` → `applyOverrides`), resolved at render
  with a pure fallback helper (`resolveSeo`). Same shape reused here.

## Chosen approach

**Content registry + existing override system + a schema-driven editor** (chosen over an
external headless CMS, which adds infrastructure/cost/another tool, and over ad-hoc
per-string edits, which don't scale). Rationale: consistent with Phase 1, safe incremental
rollout, free, no new infrastructure, keeps a single admin.

## Architecture

### Content registry (single source of truth)
`client/src/config/contentSchema.js` exports `CONTENT_GROUPS` — an ordered list of groups
(by page/section), each with fields. Every field carries its **key**, **label**, **type**,
and **default** (the current on-site text). This one file drives both the editor UI and the
render-time defaults, so there is no drift.

```js
// shape
CONTENT_GROUPS = [
  { id: 'home-hero', title: 'Homepage — Hero', fields: [
    { key: 'home.hero.title',    label: 'Headline',  type: 'text',    default: '…' },
    { key: 'home.hero.subtitle', label: 'Subtitle',  type: 'richtext',default: '…' },
    { key: 'home.hero.trust',    label: 'Trust badges', type: 'list',  itemType: 'text',
      default: ['Fully Insured','Police Checked','Adelaide Based','Commercial & Residential'] },
  ]},
  { id: 'faq', title: 'FAQ', fields: [
    { key: 'faq.heading',    label: 'Section heading', type: 'text',     default: 'Frequently Asked Questions' },
    { key: 'faq.subheading', label: 'Sub-heading',     type: 'text',     default: 'Everything you need to know about our services' },
    { key: 'faq.items',      label: 'Questions',       type: 'listObject',
      itemFields: [
        { key: 'question', label: 'Question', type: 'text' },
        { key: 'answer',   label: 'Answer',   type: 'richtext' },
      ],
      default: [ /* current 5 Q&As */ ] },
  ]},
  // …remaining groups added per migration pass…
]
```

### Field types
- `text` — plain single-line.
- `textarea` — plain multi-line.
- `richtext` — restricted **HTML** (bold/italic/links); edited with a rich-text field
  (toolbar + live preview), stored as HTML, sanitized on render.
- `list` — array of primitives (e.g. hero trust badges); add/edit/delete/reorder.
- `listObject` — array of objects with `itemFields` (e.g. FAQ `{question, answer}`,
  reviews `{name, text, rating}`, service `{name}`); add/edit/delete/reorder.

### Resolution (override wins, else default)
- `client/src/config/content.js` exports:
  - `getContent(key)` → returns the override for `key` if set, else the schema default.
  - `setContentOverrides(obj)` → replaces the in-memory override map (used at boot and
    after an admin save).
  - A pure, tested helper `resolveContent(override, fallback)` (mirrors `resolveSeo`):
    blank string → fallback; `undefined` → fallback; otherwise the override.
- **Content overrides are resolved separately from `applyOverrides`** and **replace whole
  values per key** (a `list`/`listObject` override replaces the entire array). This avoids
  `applyOverrides`'s index-merge, which cannot represent a deleted/shortened list.
  `main.jsx` pulls `content` out of the fetched settings and calls `setContentOverrides`
  directly; everything else still flows through `applyOverrides`.

### Safe rich text (basic formatting) — HTML + sanitizer
- Stored as **restricted HTML** in the DB (marketing's instinct; WordPress-style).
- Rendered by `client/src/components/utils/RichText.jsx`, which runs the stored HTML through
  **DOMPurify** with a strict allow-list before injecting it:
  - `ALLOWED_TAGS: ['b','strong','i','em','a','br','p']`
  - `ALLOWED_ATTR: ['href','target','rel']`
  - `a` links forced to `rel="noopener noreferrer"`; DOMPurify's default URL policy blocks
    `javascript:`/other unsafe schemes.
  - Anything outside the allow-list (scripts, styles, pasted Word markup, arbitrary tags)
    is stripped — so formatting stays consistent **and** safe.
- The editor also sanitizes **on save** (defense in depth), so the DB holds clean HTML.
- `dangerouslySetInnerHTML` is used **only** with DOMPurify-sanitized output — the
  standard, safe pattern for user-editable rich text.
- **Dependency:** `dompurify` (small, widely-used, audited HTML sanitizer). This is the one
  new runtime dependency the project takes on, and it is the industry standard for exactly
  this job.

### Admin "Content" tab
`client/src/components/admin/ContentPanel.jsx` renders `CONTENT_GROUPS`:
- A group selector (list/dropdown), then that group's fields with the right control:
  - `text`/`textarea` → `admin-input`.
  - `richtext` → a `contenteditable` rich-text field with **Bold / Italic / Link** toolbar
    buttons (formatting forced to tags, not inline styles) that outputs restricted HTML,
    plus a live `RichText` (sanitized) preview.
  - `list`/`listObject` → rows with add / delete / move-up / move-down, each row editing
    its primitive or `itemFields`.
- Edits accumulate in local state; a single **Save changes** button merges the edited
  `content` map into the existing settings blob and persists via `saveSettings` (the API
  replaces the whole overrides doc). After save, `setContentOverrides` reflects it live in
  the session. Mirrors `SeoPanel` save/error handling.

### Component migration
Each section/page replaces hardcoded strings with `getContent('key')` (plain) or
`<RichText html={getContent('key')} />` (formatted), and lists with
`getContent('key').map(...)`. The removed strings become that field's `default` in
`contentSchema.js`. Plain-text defaults are valid HTML (they render unchanged), so migrating
a paragraph to `richtext` needs no default rewriting.

## Scope

### In scope
- The content engine: `content.js` (resolver + override store), `resolveContent` (pure,
  tested), `RichText.jsx` (DOMPurify-sanitized rendering), `contentSchema.js`.
- The **Content** admin tab with all five field-type controls, incl. add/edit/delete/reorder.
- `main.jsx` wiring: pull `content` out of the fetched settings and call
  `setContentOverrides()` (content lives in the `content.js` store, **not** in `siteConfig`).
- Migration of **every** home section and inner page to the content system, rolled out as
  reviewable passes (see below).
- Safety-net fallback on every field.

### Out of scope
- Creating/deleting whole pages and landing pages → **Phase 3**.
- Images (already covered by the Gallery and Page Backgrounds tabs).
- SEO fields (Phase 1).
- Full WYSIWYG (headings/colours/tables) — deliberately limited to bold/italic/links.
- Reordering *sections* on a page (content within sections only).

## Rollout (multi-pass; each pass is independently reviewable)

- **Pass 1 — Engine + first section:** `resolveContent` (tested) + `sanitizeHtml`
  (DOMPurify wrapper), `content.js`, `RichText.jsx`, `contentSchema.js` (Hero + FAQ groups),
  the Content tab, and
  migration of **HeroSection** + **FAQ**. Delivers the full working pattern end-to-end.
- **Pass 2 — Remaining hardcoded home sections:** WhyChoose, Reviews, AddOnServices,
  CleaningChecklist, CommercialSpotlight, PricingOverview, ResultsReel.
- **Pass 3 — Config-driven home sections' headings/copy:** ServicesOverview, AboutMini,
  CTABanner, ServiceAreas, TrustStats labels, WhoWeWorkWith, announcement bar.
- **Pass 4 — Inner pages:** About, Commercial, Residential, Landscaping, ServiceCategory,
  Contact, Privacy, Terms intros/headings/copy.

Each pass appends its groups to `contentSchema.js` and migrates those components only.

## Data model (settings overrides)

```
content: {
  'home.hero.title': 'Premium Property Maintenance, Landscaping & Cleaning in Adelaide',
  'home.hero.subtitle': 'Reliable, fully insured services for …',
  'home.hero.trust': ['Fully Insured','Police Checked','Adelaide Based','Commercial & Residential'],
  'faq.items': [ { question: '…', answer: '…' }, … ],
  …
}
```
Sparse (only edited keys stored). A key absent from `content` → its schema default renders.

## Testing / verification

- **Unit (`node --test`):**
  - `resolveContent` — override wins; blank/undefined → fallback.
  - `contentSchema` — every field has `key`/`label`/`type`; keys unique; `listObject`
    fields have `itemFields`; every `key` is unique across all groups.
  - (DOMPurify sanitization is verified by manual check + its own audited test suite; a
    thin `sanitizeHtml` wrapper around it with the allow-list config is asserted to strip a
    `<script>`/`onclick` sample and keep `<b>`/`<a>` — run under jsdom if available, else
    manual.)
- **Build + lint** clean on changed files (pre-existing repo lint issues excluded).
- **Manual (per pass):** edit a field + list (add/delete/reorder) in the Content tab, Save,
  reload the public page and confirm the change (incl. bold/italic/link rendering) and that
  clearing a field reverts to the default.

## Risks & mitigations

- **Large migration surface** → mitigated by per-pass rollout; each pass is small and
  reviewable, and the engine lands once in Pass 1.
- **Unsafe formatting/XSS** → mitigated by DOMPurify sanitization on render (and on save)
  with a strict tag/attr allow-list; unsafe URL schemes blocked by DOMPurify defaults.
- **Messy pasted formatting breaking layout** → mitigated by the same allow-list (Word/HTML
  paste is stripped to bold/italic/links only).
- **List deletes not persisting** → mitigated by whole-value replace semantics for content
  overrides (bypassing `applyOverrides` index-merge).
- **Default drift** → mitigated by keeping defaults in the same schema the editor reads.
- **One new runtime dependency (`dompurify`)** — deliberately chosen over a hand-rolled
  parser because a hand-rolled HTML sanitizer is exactly the thing you should never
  hand-roll; DOMPurify is the audited industry standard.
- **NO git commits/pushes** — per owner instruction, all changes left uncommitted for
  manual review.
