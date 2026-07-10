# Content Editing — Pass 1 (Engine + Hero & FAQ) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the content-editing engine (registry, resolver, sanitized rich-text renderer, admin Content tab) and prove it end-to-end by making the **Hero** and **FAQ** sections editable.

**Architecture:** Every editable string has a key + default in `contentSchema.js`. `getContent(key)` returns an admin override (held in a module store, seeded at boot) or the default. Formatted fields store HTML, sanitized by DOMPurify on render. A schema-driven Content tab edits and saves to the existing settings system. Reuses the Phase-1 override pattern.

**Tech Stack:** React 19, Vite, existing `adminApi`/settings flow, Node `node --test`, **DOMPurify** (new dep, HTML sanitizer).

## Global Constraints

- **NO git commits/pushes** — every task ends by leaving changes uncommitted for owner review (replace "commit" with a review checkpoint).
- **One new dependency only:** `dompurify`. No others.
- **Content overrides replace whole values per key** and resolve via the `content.js` store — NOT through `applyOverrides` (avoids array index-merge so list deletes persist).
- **Safety net:** blank/undefined override → schema default (a field can never render empty).
- **Rich text:** stored as HTML; **always** sanitized through the DOMPurify allow-list before render (`ALLOWED_TAGS: ['b','strong','i','em','a','br','p']`, `ALLOWED_ATTR: ['href','target','rel']`).
- Match existing admin styling (`admin.css` classes) and the single-"Save changes" pattern.

---

### Task 1: Content resolver (TDD)

**Files:**
- Create: `client/src/utils/resolveContent.js`
- Test: `client/src/utils/resolveContent.test.js`

**Interfaces:**
- Produces: `resolveContent(override, fallback) -> value` — returns `fallback` when `override`
  is `undefined`/`null` or a blank/whitespace string; otherwise `override` (strings, arrays,
  and objects pass through unchanged).

- [ ] **Step 1: Write the failing test**

```js
// client/src/utils/resolveContent.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveContent } from './resolveContent.js';

test('undefined/null override → fallback', () => {
  assert.equal(resolveContent(undefined, 'def'), 'def');
  assert.equal(resolveContent(null, 'def'), 'def');
});

test('blank/whitespace string override → fallback', () => {
  assert.equal(resolveContent('', 'def'), 'def');
  assert.equal(resolveContent('   ', 'def'), 'def');
});

test('non-blank string override wins', () => {
  assert.equal(resolveContent('hi', 'def'), 'hi');
});

test('array/object overrides pass through (incl. empty array)', () => {
  const arr = [];
  assert.equal(resolveContent(arr, ['d']), arr); // explicit empty list is a real value
  const obj = { a: 1 };
  assert.equal(resolveContent(obj, {}), obj);
});
```

- [ ] **Step 2: Run to verify it FAILS**

Run: `cd client && npm test`
Expected: FAIL — `./resolveContent.js` not found.

- [ ] **Step 3: Implement**

```js
// client/src/utils/resolveContent.js
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
```

- [ ] **Step 4: Run to verify PASS**

Run: `cd client && npm test`
Expected: PASS.

- [ ] **Step 5: Review checkpoint (no commit).** Note: "P2 Task 1 — content resolver."

---

### Task 2: Content schema — Hero + FAQ (TDD)

**Files:**
- Create: `client/src/config/contentSchema.js`
- Test: `client/src/config/contentSchema.test.js`

**Interfaces:**
- Produces: `CONTENT_GROUPS: Array<{ id, title, fields: Field[] }>` and a derived
  `CONTENT_DEFAULTS: Record<key, defaultValue>` (flattened, for the store).
- `Field` = `{ key, label, type: 'text'|'textarea'|'richtext'|'list'|'listObject', default,
  itemType?, itemFields? }`.

- [ ] **Step 1: Write the failing test**

```js
// client/src/config/contentSchema.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CONTENT_GROUPS, CONTENT_DEFAULTS } from './contentSchema.js';

const allFields = CONTENT_GROUPS.flatMap((g) => g.fields);

test('groups have id, title and fields', () => {
  for (const g of CONTENT_GROUPS) {
    assert.ok(g.id && g.title && Array.isArray(g.fields) && g.fields.length);
  }
});

test('every field has key/label/type and a default', () => {
  for (const f of allFields) {
    assert.ok(f.key && f.label && f.type, `bad field ${JSON.stringify(f)}`);
    assert.ok('default' in f, `${f.key} missing default`);
  }
});

test('field keys are globally unique', () => {
  const seen = new Set();
  for (const f of allFields) {
    assert.ok(!seen.has(f.key), `duplicate key ${f.key}`);
    seen.add(f.key);
  }
});

test('listObject fields declare itemFields', () => {
  for (const f of allFields.filter((x) => x.type === 'listObject')) {
    assert.ok(Array.isArray(f.itemFields) && f.itemFields.length, `${f.key} needs itemFields`);
  }
});

test('CONTENT_DEFAULTS maps every key to its default', () => {
  for (const f of allFields) assert.deepEqual(CONTENT_DEFAULTS[f.key], f.default);
});
```

- [ ] **Step 2: Run to verify it FAILS** — `cd client && npm test` → FAIL (module missing).

- [ ] **Step 3: Implement** (defaults copied verbatim from `HeroSection.jsx` and `FAQ.jsx`)

```js
// client/src/config/contentSchema.js
/** Editable content, grouped by page/section. Each field's `default` is the
 *  current on-site text — the single source of truth for the editor + fallback. */
export const CONTENT_GROUPS = [
  {
    id: 'home-hero', title: 'Homepage — Hero',
    fields: [
      { key: 'home.hero.title', label: 'Headline', type: 'text',
        default: 'Premium Property Maintenance, Landscaping & Cleaning in Adelaide' },
      { key: 'home.hero.subtitle', label: 'Subtitle', type: 'richtext',
        default: 'Reliable, fully insured services for commercial sites, builders, real estate, homes and outdoor spaces.' },
      { key: 'home.hero.ctaPrimary', label: 'Primary button text', type: 'text',
        default: 'Get a Free Quote' },
      { key: 'home.hero.trust', label: 'Trust badges', type: 'list', itemType: 'text',
        default: ['Fully Insured', 'Police Checked', 'Adelaide Based', 'Commercial & Residential'] },
    ],
  },
  {
    id: 'home-faq', title: 'Homepage — FAQ',
    fields: [
      { key: 'faq.heading', label: 'Section heading', type: 'text',
        default: 'Frequently Asked Questions' },
      { key: 'faq.subheading', label: 'Sub-heading', type: 'text',
        default: 'Everything you need to know about our services' },
      { key: 'faq.items', label: 'Questions & answers', type: 'listObject',
        itemFields: [
          { key: 'question', label: 'Question', type: 'text' },
          { key: 'answer', label: 'Answer', type: 'richtext' },
        ],
        default: [
          { question: 'What areas do you service?',
            answer: 'We currently provide professional cleaning and landscaping services across Adelaide and Sydney and their surrounding suburbs.' },
          { question: 'Are your team members insured and police-checked?',
            answer: 'Yes, our team members are professionally selected and committed to providing safe, reliable and high-quality service.' },
          { question: 'Do I need to be home for the service?',
            answer: "It's entirely up to you. Many of our clients provide access instructions or keys for when they are at work. We ensure your property is secure at all times." },
          { question: 'What is your satisfaction guarantee?',
            answer: 'We pride ourselves on quality. If you are not completely satisfied with our service, please contact us within 24 hours and we will return to rectify the issue at no extra cost.' },
          { question: 'Do you bring your own cleaning supplies?',
            answer: "Yes, we bring all necessary eco-friendly cleaning products and professional-grade equipment. If you have specific products you'd like us to use, just let us know!" },
        ] },
    ],
  },
];

/** Flattened key → default, for the content store. */
export const CONTENT_DEFAULTS = Object.fromEntries(
  CONTENT_GROUPS.flatMap((g) => g.fields.map((f) => [f.key, f.default]))
);
```

- [ ] **Step 4: Run to verify PASS** — `cd client && npm test` → PASS.

- [ ] **Step 5: Review checkpoint (no commit).** Note: "P2 Task 2 — content schema (Hero+FAQ)."

---

### Task 3: Content store (TDD)

**Files:**
- Create: `client/src/config/content.js`
- Test: `client/src/config/content.test.js`

**Interfaces:**
- Produces: `getContent(key)`, `setContentOverrides(map)`, `getContentGroupValues(groupId)`
  (returns effective values for the editor).

- [ ] **Step 1: Write the failing test**

```js
// client/src/config/content.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getContent, setContentOverrides } from './content.js';
import { CONTENT_DEFAULTS } from './contentSchema.js';

test('getContent returns the default when no override set', () => {
  setContentOverrides({});
  assert.equal(getContent('home.hero.title'), CONTENT_DEFAULTS['home.hero.title']);
});

test('getContent returns override when set; blank falls back', () => {
  setContentOverrides({ 'home.hero.title': 'New headline', 'faq.heading': '  ' });
  assert.equal(getContent('home.hero.title'), 'New headline');
  assert.equal(getContent('faq.heading'), CONTENT_DEFAULTS['faq.heading']); // blank → default
});

test('unknown key returns undefined safely', () => {
  setContentOverrides({});
  assert.equal(getContent('nope.nope'), undefined);
});
```

- [ ] **Step 2: Run to verify it FAILS** — FAIL (module missing).

- [ ] **Step 3: Implement**

```js
// client/src/config/content.js
import { CONTENT_DEFAULTS } from './contentSchema';
import { resolveContent } from '../utils/resolveContent';

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
```

- [ ] **Step 4: Run to verify PASS** — PASS.

- [ ] **Step 5: Review checkpoint (no commit).** Note: "P2 Task 3 — content store."

---

### Task 4: DOMPurify sanitizer + RichText renderer

**Files:**
- Modify: `client/package.json` (add `dompurify`)
- Create: `client/src/utils/sanitizeHtml.js`
- Create: `client/src/components/utils/RichText.jsx`

**Interfaces:**
- Produces: `sanitizeHtml(html) -> string` (allow-listed); `<RichText html={string} as="span|div" />`.

- [ ] **Step 1: Install DOMPurify**

Run: `cd client && npm install dompurify`
Expected: adds `dompurify` to dependencies; `npm ls dompurify` shows a version.

- [ ] **Step 2: Implement the sanitizer wrapper**

```js
// client/src/utils/sanitizeHtml.js
import DOMPurify from 'dompurify';

const CONFIG = {
  ALLOWED_TAGS: ['b', 'strong', 'i', 'em', 'a', 'br', 'p'],
  ALLOWED_ATTR: ['href', 'target', 'rel'],
};

/** Clean editable HTML down to the safe allow-list (bold/italic/links/breaks). */
export function sanitizeHtml(html) {
  if (typeof html !== 'string' || !html) return '';
  return DOMPurify.sanitize(html, CONFIG);
}
```

- [ ] **Step 3: Implement the renderer**

```jsx
// client/src/components/utils/RichText.jsx
import React from 'react';
import { sanitizeHtml } from '../../utils/sanitizeHtml';

/** Render admin-editable HTML safely (DOMPurify-sanitized). Plain text passes through. */
const RichText = ({ html, as: Tag = 'span', className }) => (
  <Tag className={className} dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }} />
);

export default RichText;
```

- [ ] **Step 4: Verify lint + build**

Run: `cd client && npx eslint src/utils/sanitizeHtml.js src/components/utils/RichText.jsx && npm run build`
Expected: lint exit 0; build succeeds.

- [ ] **Step 5: Review checkpoint (no commit).** Note: "P2 Task 4 — sanitizer + RichText."

---

### Task 5: Boot wiring — apply content overrides

**Files:**
- Modify: `client/src/main.jsx`

- [ ] **Step 1: Pull `content` out of settings and seed the store**

In `main.jsx`, import `setContentOverrides` and split content from the other overrides so
content resolves via its own store (not the array-index-merging `applyOverrides`):

```js
import { setContentOverrides } from './config/content'
// ...
if (data && data.settings) {
  const { content, ...rest } = data.settings
  applyOverrides(siteConfig, rest)
  setContentOverrides(content || {})
}
```

- [ ] **Step 2: Verify lint + build**

Run: `cd client && npx eslint src/main.jsx && npm run build`
Expected: lint exit 0; build succeeds.

- [ ] **Step 3: Review checkpoint (no commit).** Note: "P2 Task 5 — boot wiring."

---

### Task 6: Rich-text input field (admin)

A `contentEditable` field with Bold / Italic / Link buttons that emits allow-listed HTML.

**Files:**
- Create: `client/src/components/admin/RichTextInput.jsx`

**Interfaces:**
- Consumes: `sanitizeHtml`.
- Produces: `<RichTextInput value={html} onChange={(html)=>...} />`.

- [ ] **Step 1: Implement**

Mechanics:
- On mount, set the editable div's `innerHTML` to `sanitizeHtml(value)` once (uncontrolled body).
- Call `document.execCommand('styleWithCSS', false, false)` before formatting so bold/italic
  emit `<b>`/`<i>` tags (not inline styles the allow-list would strip).
- Toolbar buttons: **Bold** → `execCommand('bold')`; **Italic** → `execCommand('italic')`;
  **Link** → read the current selection, `const url = window.prompt('Link URL (https://…)')`,
  then `execCommand('createLink', false, url)` when a valid `http(s)/mailto/tel` URL is given.
- On `input`, read `el.innerHTML`, run `sanitizeHtml`, and call `onChange(clean)`.
- Style with existing admin classes plus a small `.admin-rte` / `.admin-rte__bar` block
  (added in Task 7's styling if needed).

```jsx
// client/src/components/admin/RichTextInput.jsx
import React, { useEffect, useRef } from 'react';
import { sanitizeHtml } from '../../utils/sanitizeHtml';

const RichTextInput = ({ value, onChange }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== (value || '')) {
      ref.current.innerHTML = sanitizeHtml(value || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // seed once; avoids clobbering the caret while typing

  const exec = (cmd, arg) => {
    document.execCommand('styleWithCSS', false, false);
    document.execCommand(cmd, false, arg);
    if (ref.current) onChange(sanitizeHtml(ref.current.innerHTML));
  };

  const addLink = () => {
    const url = window.prompt('Link URL (https://…)');
    if (url && /^(https?:|mailto:|tel:)/i.test(url)) exec('createLink', url);
  };

  return (
    <div className="admin-rte">
      <div className="admin-rte__bar">
        <button type="button" className="admin-btn admin-btn--sm" onMouseDown={(e) => { e.preventDefault(); exec('bold'); }}><b>B</b></button>
        <button type="button" className="admin-btn admin-btn--sm" onMouseDown={(e) => { e.preventDefault(); exec('italic'); }}><i>I</i></button>
        <button type="button" className="admin-btn admin-btn--sm" onMouseDown={(e) => { e.preventDefault(); addLink(); }}>Link</button>
      </div>
      <div
        ref={ref}
        className="admin-input admin-rte__area"
        contentEditable
        suppressContentEditableWarning
        onInput={() => ref.current && onChange(sanitizeHtml(ref.current.innerHTML))}
      />
    </div>
  );
};

export default RichTextInput;
```

- [ ] **Step 2: Verify lint + build**

Run: `cd client && npx eslint src/components/admin/RichTextInput.jsx && npm run build`
Expected: lint exit 0; build succeeds.

- [ ] **Step 3: Review checkpoint (no commit).** Note: "P2 Task 6 — rich-text input."

---

### Task 7: Content admin tab (editor) + dashboard wiring + styles

**Files:**
- Create: `client/src/components/admin/ContentPanel.jsx`
- Modify: `client/src/styles/admin.css` (add `.admin-rte*`, `.admin-listrow*` helpers)
- Modify: `client/src/pages/admin/AdminDashboard.jsx` (add "Content" tab)

**Interfaces:**
- Consumes: `fetchSettings`, `saveSettings`; `CONTENT_GROUPS`; `getContentOverrides`,
  `setContentOverrides`; `RichTextInput`; `resolveContent`.

- [ ] **Step 1: Implement `ContentPanel`**

Behavior (mirrors `SeoPanel` save flow):
- On mount `fetchSettings()`; hold full `existing` overrides; seed local `content` edit map
  from `existing.content || {}`.
- Group selector from `CONTENT_GROUPS`. For the selected group, render each field by `type`:
  - `text` → `admin-input`; `textarea` → `<textarea class="admin-input">`.
  - `richtext` → `<RichTextInput value={effective} onChange={...} />`.
  - `list` → rows of `admin-input`, each with delete + move up/down, and an "Add" button.
  - `listObject` → rows; each row renders its `itemFields` (text/richtext), with delete +
    move up/down, and an "Add" button that appends a blank item.
- The **effective value** for display = `resolveContent(content[key], field.default)`.
- Editing sets `content[key]` in local state (whole-value for lists).
- **Save**: `merged = structuredClone(existing); merged.content = cleanContent(content)`
  where `cleanContent` drops keys whose value equals the default or is blank; `saveSettings(merged)`;
  then `setContentOverrides(saved.content || {})` and reseed local state. Success alert
  "Saved. Content is live on the website."

- [ ] **Step 2: Add styles to `admin.css`**

```css
/* ── Content tab: rich-text editor & list rows ── */
.admin-rte { border: 1px solid var(--adm-border); border-radius: 8px; overflow: hidden; }
.admin-rte__bar { display: flex; gap: 4px; padding: 6px; background: #f7f9fc; border-bottom: 1px solid var(--adm-border); }
.admin-rte__area { min-height: 90px; border: 0; border-radius: 0; }
.admin-listrow { display: flex; gap: 8px; align-items: flex-start; margin-bottom: 10px; }
.admin-listrow__body { flex: 1; }
.admin-listrow__ctrls { display: flex; flex-direction: column; gap: 4px; }
```

- [ ] **Step 3: Wire the "Content" tab into `AdminDashboard.jsx`**

Import `ContentPanel`; add a tab button (after "SEO") and `{tab === 'content' && <ContentPanel />}`.

- [ ] **Step 4: Verify lint + build**

Run: `cd client && npx eslint src/components/admin/ContentPanel.jsx src/pages/admin/AdminDashboard.jsx && npm run build`
Expected: lint exit 0 on changed files; build succeeds.

- [ ] **Step 5: Review checkpoint (no commit).** Note: "P2 Task 7 — Content tab."

---

### Task 8: Migrate Hero + FAQ to the content system

**Files:**
- Modify: `client/src/components/sections/home/HeroSection.jsx`
- Modify: `client/src/components/sections/home/FAQ.jsx`

- [ ] **Step 1: Migrate `HeroSection.jsx`**

Replace hardcoded strings with `getContent`:
- Title: `getContent('home.hero.title')`.
- Subtitle: `<RichText html={getContent('home.hero.subtitle')} as="p" className="hero-subtitle" />`.
- Primary button label: `getContent('home.hero.ctaPrimary')`.
- Trust list: `getContent('home.hero.trust').map((t) => <li key={t}>{t}</li>)`.
Import `getContent` and `RichText`. Leave `siteConfig.motto`/phone as-is.

- [ ] **Step 2: Migrate `FAQ.jsx`**

- `const faqs = getContent('faq.items');`
- Heading: `getContent('faq.heading')`; sub-heading: `getContent('faq.subheading')`.
- Answer: `<RichText html={faq.answer} as="p" />`.
Import `getContent` and `RichText`.

- [ ] **Step 3: Verify lint + build**

Run: `cd client && npx eslint src/components/sections/home/HeroSection.jsx src/components/sections/home/FAQ.jsx && npm run build`
Expected: lint exit 0; build succeeds.

- [ ] **Step 4: Review checkpoint (no commit).** Note: "P2 Task 8 — Hero+FAQ migrated."

---

### Task 9: Full verification pass

- [ ] **Step 1: Tests + quality**

Run: `cd client && npm test && npm run lint` (expect: content tests pass; pre-existing lint
errors only in untouched files) `&& npm run build` (succeeds).

- [ ] **Step 2: Manual (dev server + admin)**

- Content tab lists **Homepage — Hero** and **Homepage — FAQ**.
- Edit hero headline + subtitle (make part **bold**, add a link), Save → reload home →
  changes render, bold/link show, and are safe.
- FAQ: add a new Q&A, delete one, reorder → Save → home reflects the new list.
- Clear a field → reverts to default.
- **XSS check:** in the subtitle editor, paste `<img src=x onerror=alert(1)>` → confirm it is
  stripped (no alert, no image) after save/render.
- Other tabs and the public site unaffected.

- [ ] **Step 3: Hand off for owner review (no commit).** Summarize changed files.

---

## Self-Review

**Spec coverage:** engine (resolver/store/schema) → Tasks 1–3; sanitizer+RichText → Task 4;
boot wiring → Task 5; editor (all field types incl. add/delete/reorder + rich text) → Tasks
6–7; migration (Hero+FAQ) → Task 8; safety net → Tasks 1/3 (tested); DOMPurify allow-list →
Task 4; whole-value content resolution → Tasks 3/5. ✅

**Placeholder scan:** FAQ defaults are the real 5 Q&As; no TBD/TODO. `cleanContent` behavior
is specified (drop default-equal/blank keys). ✅

**Type consistency:** `resolveContent(override, fallback)` used in Tasks 1/3; `getContent(key)`
in Tasks 3/8; `sanitizeHtml(html)` in Tasks 4/6; `<RichText html=...>` in Tasks 4/8;
`CONTENT_GROUPS`/`CONTENT_DEFAULTS` shape consistent Tasks 2/3/7. ✅

**Paths verified:** dashboard at `src/pages/admin/AdminDashboard.jsx`; sections at
`src/components/sections/home/{HeroSection,FAQ}.jsx` — all confirmed present in the repo.
