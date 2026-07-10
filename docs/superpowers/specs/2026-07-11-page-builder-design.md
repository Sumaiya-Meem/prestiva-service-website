# Page Builder (Phase 3) — Design Spec

**Date:** 2026-07-11
**Status:** Approved for planning
**Author:** Claude + owner (brainstorming session)

## Goal

Let the marketing team **create, edit and delete custom pages / landing pages** from the
admin — no developer, no redeploy — using a **block builder** (a fixed set of styled
sections). Pages are stored in the database, served by a dynamic route, support
**draft/publish**, optional **navigation placement**, and **per-page SEO**.

## Background / current state

- Routing: `App.jsx` uses React Router with fixed routes inside a shared `<Layout>` and a
  `*` catch-all → `NotFoundPage`. React Router ranks static routes above dynamic (`/:slug`)
  above splat (`*`), so a dynamic page route can be added safely without shadowing fixed
  pages.
- Backend: Express + Mongoose on Render, MongoDB Atlas. Existing collections (Settings,
  Quotes, Gallery, Backgrounds) each follow the model → controller → route + `adminAuth`
  pattern. A new `Page` collection follows the same shape.
- The content system (Phase 2) provides `RichText` (DOMPurify-sanitized) for safe rich text,
  and the SEO system (Phase 1) provides the `Seo` component and per-page title/description.
- Media: Cloudinary via existing gallery/background upload endpoints; `mediaUrl()` builds
  absolute URLs.
- Auth: single shared `ADMIN_API_TOKEN` (admin routes fail closed without it).

## Chosen approach

**Database-backed dynamic pages + a block renderer + an admin block editor** (chosen over
an external website builder and over code-file pages). Rationale: consistent with the
existing backend patterns, keeps one free admin, edits go live with no redeploy, and the
fixed block set keeps pages on-brand and unbreakable.

## Data model — `Page`

```
{
  slug: String,          // unique, url-safe (e.g. "spring-cleaning-offer"); no leading slash
  title: String,         // page title (also default nav label)
  blocks: [Block],       // ordered list (see Block types)
  seo: {
    title: String,       // optional; falls back to `title`
    description: String,
    noindex: Boolean,
  },
  showInNav: Boolean,    // default false → standalone landing page
  navLabel: String,      // optional; falls back to `title`
  status: String,        // 'draft' | 'published'; default 'draft'
  createdAt, updatedAt,  // timestamps
}
```

- `slug` is validated: lower-case, `a–z 0–9 -` only, and **must not collide** with a
  reserved/fixed route (`admin`, `about`, `commercial`, `residential`, `landscaping`,
  `cleaning`, `property-maintenance`, `gallery`, `contact`, `privacy`, `terms`, and `""`).
- Unique index on `slug`.

## Block types

Each block is `{ type, ...fields }`. Rich text fields are stored as sanitized HTML and
rendered through `RichText`.

| type | fields |
|---|---|
| `hero` | `heading` (text), `subtext` (richtext), `image` (url), `buttonText` (text), `buttonLink` (text) |
| `heading` | `text` (text) |
| `richtext` | `html` (richtext) |
| `image` | `url` (url), `alt` (text) |
| `twoColumn` | `html` (richtext), `image` (url), `imageSide` ('left' \| 'right') |
| `cta` | `heading` (text), `buttonText` (text), `buttonLink` (text) |
| `getQuote` | `buttonText` (text), `service` (text, pre-fills the contact form) |

`buttonLink` accepts an internal path (`/contact`) or an absolute URL; `getQuote` links to
`/contact?service=<service>`.

## Architecture

### Backend (new, mirrors existing patterns)
- `server/models/Page.js` — the schema above + unique slug index.
- `server/controllers/pageController.js`:
  - `listPublishedNav` → published pages with `showInNav`, minimal fields (public).
  - `getBySlug` → a single **published** page by slug (public); 404 if missing/draft.
  - `listAll` → all pages incl. drafts (admin).
  - `create` / `update` / `remove` (admin) — with slug validation + reserved-slug guard.
- `server/routes/pageRoutes.js` — public GETs; admin CRUD behind `adminAuth`.
- Mount at `/api/pages` in the server app.

### Public rendering
- `client/src/pages/DynamicPage.jsx` — reads `:slug` from the route, fetches
  `/api/pages/:slug`; on success renders `<Seo>` (from the page's SEO) + the block list; on
  404 renders `NotFoundPage`. Shows `PageLoader` while fetching.
- `client/src/components/pageblocks/PageBlock.jsx` — switches on `block.type` and renders
  the matching styled block component; unknown types render nothing (forward-compatible).
- `App.jsx` — add `<Route path="/:slug" element={<DynamicPage />} />` **inside the Layout
  route, immediately before** the `*` route.
- `Seo.jsx` — extend to accept an optional `noindex` prop (used by dynamic pages), still
  honoring the existing `siteConfig.seo` overrides for fixed pages.

### Navigation
- `Header.jsx` — fetch published nav pages once (cached, fault-tolerant like `main.jsx`'s
  settings boot) and append them to the menu. Failure = no extra links (never breaks the
  header).

### Admin editor
- `client/src/components/admin/PagesPanel.jsx` — a new **"Pages"** tab:
  - **List:** every page (title, slug, status badge) with Edit / Delete (Delete confirms).
  - **Editor** (create or edit): fields for `title`, `slug` (auto-suggested from title,
    editable, validated), `status` (Draft/Published), `showInNav` + `navLabel`, SEO
    (`title`, `description`, `noindex`), and the **block editor**.
  - **Block editor:** a palette to add a block, then per-block controls with reorder (↑ ↓),
    delete (✕), and the block's fields rendered by type (text, `RichTextInput`, image
    picker/URL). Reuses the Phase-2 list/reorder + rich-text patterns.
  - **Save:** POST (create) or PUT (update) to `/api/pages`; reflects in the list.
- `AdminDashboard.jsx` — add the "Pages" tab, with the standard help callout.
- Images: reuse the existing Cloudinary upload (gallery/background endpoint) or accept a
  pasted image URL — no new media pipeline.

## Scope

### In scope
- `Page` model + API (public read + admin CRUD) with slug/reserved validation.
- Dynamic `/:slug` route + `DynamicPage` + block renderer for all 7 block types.
- "Pages" admin tab: create / edit / delete, block editor, draft/publish, nav toggle,
  per-page SEO.
- Header nav integration for published in-nav pages.
- `Seo` `noindex` prop.

### Out of scope (future)
- Drag-and-drop / free-form layout, custom per-element styling.
- Nested pages / multi-segment slugs.
- Per-page social images (needs prerendering, deferred).
- Scheduled publish, revisions/history, A/B testing.
- Per-user roles (still the shared admin token).

## Rollout (multi-pass; each pass independently reviewable)

- **Pass 1 — Backbone + core blocks:** `Page` model + API, dynamic route + `DynamicPage` +
  `PageBlock` with `hero`, `heading`, `richtext`, `cta`; the "Pages" admin tab with
  create/edit/delete, draft/publish, slug validation, and the block editor. A landing page
  can be built and published end-to-end.
- **Pass 2 — Remaining blocks + nav + SEO:** `image`, `twoColumn`, `getQuote` blocks; Header
  nav integration; per-page SEO fields + `Seo` `noindex` prop; delete confirmation polish.

## Constraints

- **NO git commits/pushes** — leave changes uncommitted for owner review.
- **No new runtime dependencies** beyond those already added (DOMPurify).
- **Client-rendered pages:** Google renders JS so search works; social link-previews show
  the site-wide default (documented, acceptable for landing pages).
- **Never shadow a fixed route:** enforced by React Router ranking **and** reserved-slug
  validation on save.
- **Fixed pages untouched:** this feature only adds; Home/Contact/etc. remain code-based.

## Testing / verification

- **Unit (`node --test`):** slug validation/normalisation (valid → kept, spaces/caps →
  slugified, reserved → rejected); block-list helpers; a pure "is reserved slug" check.
- **Build + lint** clean on changed files.
- **Manual (per pass):** create a page with blocks → save as draft → confirm public 404 →
  publish → confirm it renders at `/slug` → toggle "show in nav" → confirm menu link →
  edit/reorder blocks → confirm live → delete → confirm 404 and removed from list. Confirm a
  reserved slug (e.g. `about`) is rejected and fixed pages still render.

## Risks & mitigations

- **Slug collision with a real page** → reserved-slug guard + unique index + router ranking.
- **Draft leakage** → public API returns only `published`; `DynamicPage` 404s otherwise.
- **Unsafe block HTML** → all rich text through DOMPurify (`RichText`), same as Phase 2.
- **Header break if API down** → nav fetch is cached and fault-tolerant (no links on error).
- **Large feature** → split into two reviewable passes; Pass 1 delivers a working page
  builder on its own.
