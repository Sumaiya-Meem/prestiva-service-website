# SEO Editor Tab — Design Spec

**Date:** 2026-07-10
**Status:** Approved for planning
**Author:** Claude + owner (brainstorming session)

## Goal

Let the marketing team edit each page's **SEO title** and **meta description**, and
**hide any page from Google**, directly from the existing admin panel — with no
developer help and no redeploy. This is the first of several marketing-driven admin
improvements (content editing and landing pages are planned as later, separate projects).

## Background / current state

- The site is a **client-side React (Vite) SPA**: front-end on Vercel, API on Render,
  MongoDB Atlas, media on Cloudinary.
- **SEO today is hardcoded.** Every page passes fixed `title`, `description`, `path`
  (and optional `schema`) props into a shared `Seo.jsx` component, which renders
  `<title>`, meta description, canonical, Open Graph / Twitter tags, and JSON-LD.
- There is a proven **settings-override system**: `GET /api/settings` (public) returns
  saved overrides; `PUT /api/settings` (admin) saves them; on page load the client
  deep-merges them into the `siteConfig` singleton via `applyOverrides`. The existing
  **Site Settings** tab uses this to edit business info, contact details, and prices —
  live, with no redeploy.
- Admin auth is a **single shared token** (`ADMIN_API_TOKEN`); the marketing team
  already has access.
- Existing admin tabs: **Quote Requests** (leads), **Gallery**, **Page Backgrounds**,
  **Site Settings**.
- `robots.txt`, `sitemap.xml` (11 static URLs), and a Google Search Console
  verification file already exist. GTM (`GTM-PTGTM988`) is installed for tracking.

## Chosen approach

**Extend the existing settings-override system** (chosen over a dedicated SEO backend or
a redeploy-per-change config file). Rationale: reuses a proven pattern, needs no new
database model or API routes, edits go live instantly, lowest risk, free.

## Important constraint (why scope is what it is)

Because the site renders in the browser:

- **Googlebot runs JavaScript**, so React-injected per-page `<title>` and meta
  description **are picked up for Google Search**. This is the primary goal and it works.
- **Social scrapers (Facebook, WhatsApp, LinkedIn) do NOT run JavaScript** — they read
  only the base `index.html`. So per-page social previews are **not** achievable without
  "prerendering," which the owner has chosen to **defer** (pragmatic tier). Social link
  previews therefore show a single site-wide title/description/image for every page.
- Consequently the **social-share image is fixed once in `index.html`** (a developer
  change), not exposed as an admin field — an admin field there would appear to work but
  never reach Facebook/WhatsApp.

## Scope

### In scope
1. **New "SEO" admin tab** with, for each of the 11 public pages:
   - **SEO title** input — live character counter (amber past ~60 chars).
   - **Meta description** textarea — live character counter (amber past ~160 chars).
   - **Hide from Google** toggle (noindex).
   - A **live Google-result preview** (title / URL / description) that updates as they type.
   - Placeholder text showing the current hardcoded default, so it's clear what will show
     if a field is left blank.
2. **`Seo.jsx` reads overrides** from `siteConfig.seo[path]`, preferring an override and
   falling back to the page's default prop. Adds a `noindex` robots meta when toggled.
3. **One-time static social-image fix**: replace the SVG `og:image` in `index.html` with a
   proper absolute-URL 1200×630 raster image so shared links show a real preview.
4. Save/read through the **existing** `fetchSettings` / `saveSettings` — no new API.

### Out of scope (future / separate projects)
- Per-page social-share images and per-page social previews (needs prerendering/SSR).
- Editing body copy / service content ("edit all website text") — separate build.
- Landing page builder — separate, larger project.
- Auto-generating `sitemap.xml` from settings (dynamic sitemap) — easy future add.
- Per-user logins / roles — separate improvement.
- Any change to Quote Requests, Gallery, Backgrounds, or Site Settings tabs.

## Data model

Add a `seo` key to the settings-overrides object (sparse — only edited fields stored):

```
seo: {
  "/":            { title?: string, description?: string, noindex?: boolean },
  "/about":       { title?: string, description?: string, noindex?: boolean },
  "/cleaning":    { ... },
  ...
}
```

- `siteConfig.seo` is initialized to `{}` so `applyOverrides` merges predictably.
- Keyed by the same `path` each page already passes to `<Seo>`, so dynamic
  service-category pages (`/cleaning`, `/property-maintenance`) are covered too.

## Components & changes

### Frontend
- **`src/components/admin/SeoPanel.jsx`** (new): the tab UI. Loads current overrides via
  `fetchSettings`. Layout: a **page selector** (list or dropdown of the 11 pages) with the
  selected page's **title / description / Hide-from-Google** fields and its **live Google
  preview** beside it. Edits to multiple pages are held in local state; a **single "Save
  changes" button** merges the full `seo` object into existing overrides and calls
  `saveSettings` once (same single-save pattern as `SettingsPanel`). Reflects changes into
  `siteConfig` immediately after save so the public site updates without redeploy.
- **`src/pages/admin/AdminDashboard.jsx`**: add an "SEO" tab button + render `SeoPanel`.
- **`src/components/utils/Seo.jsx`**: look up `siteConfig.seo?.[path]`; use
  `override.title || title` and `override.description || description`; render
  `<meta name="robots" content="noindex" />` when `override.noindex` is true.
- **`src/config/siteConfig.js`**: add `seo: {}` default.
- **A shared page list** (path → friendly name) constant used by `SeoPanel` for the 11
  pages: `/`, `/about`, `/cleaning`, `/landscaping`, `/property-maintenance`,
  `/commercial`, `/residential`, `/gallery`, `/contact`, `/privacy`, `/terms`.
- **`client/index.html`**: swap `og:image` from `/logo-icon.svg` to an absolute-URL
  1200×630 raster (`https://www.prestiva.com.au/og-image.jpg`); add `og-image.jpg` asset
  to `client/public`.

### Backend
- **No changes.** The generic settings endpoints already accept and persist an arbitrary
  overrides blob, so the new `seo` key rides along with existing validation.

## Behaviour details

- **Fallback safety net:** clearing a field reverts that page to its current hardcoded
  title/description — a page can never end up blank.
- **noindex:** injects the robots noindex meta (Google honors it and drops the page).
  The static `sitemap.xml` is left unchanged for now; a noindexed URL still listed there
  produces only a harmless "Submitted URL marked noindex" notice in Search Console.
- **Instant live:** after save, overrides are merged into `siteConfig` in-session and
  persisted, so the public site reflects changes without a redeploy (identical to how
  Site Settings behaves today).

## Testing / verification

- Edit a page's title & description in the SEO tab → save → reload the public page and
  confirm the browser tab title and `<meta name="description">` reflect the override.
- Clear the fields → confirm the page falls back to the original hardcoded values.
- Toggle "Hide from Google" → confirm `<meta name="robots" content="noindex">` is present
  in the rendered head.
- Confirm character counters change state at the length thresholds and the Google preview
  updates live.
- Confirm the other admin tabs and the public site are unaffected.
- Confirm the new static `og:image` resolves to a valid 1200×630 image at an absolute URL.

## Risks & mitigations

- **Expectation mismatch on social previews:** documented above; social image is a
  site-wide static fix, not per-page. Communicated to marketing.
- **JS-injected noindex reliability:** reliable for Google in practice; a hard guarantee
  would require prerendering (deferred). Combined with the option to also drop the page
  from a future dynamic sitemap.
- **Character limits are guidance, not hard caps:** counters warn but don't block, so
  marketing keeps control.
