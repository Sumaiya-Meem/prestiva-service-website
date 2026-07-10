import React, { useEffect, useMemo, useState } from 'react';
import siteConfig from '../../config/siteConfig';
import { fetchSettings, saveSettings } from '../../services/adminApi';
import { SEO_PAGES } from '../../config/seoPages';
import { resolveSeo } from '../../utils/resolveSeo';

const TITLE_MAX = 60;
const DESC_MAX = 160;
const SITE_URL = 'https://www.prestiva.com.au';

/**
 * Keep only meaningful values so the stored overrides stay tidy and a cleared
 * field genuinely removes the override (blank → falls back to the built-in
 * default at render time via resolveSeo).
 */
const cleanSeo = (obj) => {
  const out = {};
  for (const [path, v] of Object.entries(obj || {})) {
    const e = {};
    if (typeof v.title === 'string' && v.title.trim()) e.title = v.title;
    if (typeof v.description === 'string' && v.description.trim()) e.description = v.description;
    if (v.noindex) e.noindex = true;
    if (Object.keys(e).length) out[path] = e;
  }
  return out;
};

const SeoPanel = () => {
  const [existing, setExisting] = useState({}); // full settings-overrides blob
  const [seo, setSeo] = useState({});           // path -> { title, description, noindex }
  const [selected, setSelected] = useState(SEO_PAGES[0].path);
  const [msg, setMsg] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings()
      .then((d) => {
        setExisting(d.settings || {});
        setSeo(d.settings?.seo ? structuredClone(d.settings.seo) : {});
      })
      .catch((e) => setMsg({ type: 'error', text: e.message }))
      .finally(() => setLoading(false));
  }, []);

  const page = useMemo(() => SEO_PAGES.find((p) => p.path === selected), [selected]);
  const entry = seo[selected] || {};

  const setField = (field, value) =>
    setSeo((s) => ({ ...s, [selected]: { ...(s[selected] || {}), [field]: value } }));

  const effective = resolveSeo(entry, {
    title: page.defaultTitle,
    description: page.defaultDescription,
  });

  const onSave = async () => {
    setSaving(true);
    setMsg(null);
    try {
      // seo state is authoritative — replace the seo slice, preserve everything else,
      // and send the full blob (the API replaces the whole overrides document).
      const merged = structuredClone(existing);
      merged.seo = cleanSeo(seo);
      const data = await saveSettings(merged);
      const saved = data.settings || merged;
      setExisting(saved);
      setSeo(structuredClone(saved.seo || {}));
      // Reflect on the public site within this session (replace so clears take effect).
      siteConfig.seo = structuredClone(saved.seo || {});
      setMsg({ type: 'success', text: 'Saved. SEO changes are live on the website.' });
    } catch (e) {
      setMsg({ type: 'error', text: e.message });
    } finally {
      setSaving(false);
    }
  };

  const titleLen = (entry.title ?? '').length;
  const descLen = (entry.description ?? '').length;
  const ph = page.dynamic
    ? 'Auto-generated from service settings — type here to override'
    : undefined;

  return (
    <div className="admin-card">
      <div className="admin-card__title">SEO</div>
      <div className="admin-card__sub">
        Control how your pages appear in Google search.
      </div>
      <div className="admin-help">
        <strong>What this tab is for:</strong> setting the <strong>title</strong> and
        <strong> description</strong> Google shows for each page, and whether a page appears
        in search at all.
        <ol>
          <li>Pick a <strong>Page</strong> from the dropdown.</li>
          <li>Edit the <strong>SEO title</strong> and <strong>meta description</strong> — keep them under the character counts, and use the <strong>Google preview</strong> to see how they’ll look.</li>
          <li>Optionally switch on <strong>Hide this page from Google</strong> for pages you don’t want found.</li>
          <li>Click <strong>Save changes</strong> — updates go live immediately.</li>
        </ol>
        Tip: leave a field blank to keep the page’s current wording.
      </div>

      {loading && <div className="admin-empty">Loading…</div>}

      {!loading && (
        <>
          <div className="admin-field">
            <label className="admin-label" htmlFor="seo-page">Page</label>
            <select
              id="seo-page"
              className="admin-select"
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
            >
              {SEO_PAGES.map((p) => (
                <option key={p.path} value={p.path}>{p.name} ({p.path})</option>
              ))}
            </select>
          </div>

          <div className="admin-field">
            <label className="admin-label" htmlFor="seo-title">
              SEO title
              <span className={`admin-counter ${titleLen > TITLE_MAX ? 'admin-counter--warn' : ''}`}>
                {titleLen}/{TITLE_MAX}
              </span>
            </label>
            <input
              id="seo-title"
              className="admin-input"
              type="text"
              value={entry.title ?? ''}
              placeholder={ph ?? page.defaultTitle}
              onChange={(e) => setField('title', e.target.value)}
            />
            <small className="admin-hint">
              The clickable headline in Google. Aim for {TITLE_MAX} characters or fewer.
            </small>
          </div>

          <div className="admin-field">
            <label className="admin-label" htmlFor="seo-desc">
              Meta description
              <span className={`admin-counter ${descLen > DESC_MAX ? 'admin-counter--warn' : ''}`}>
                {descLen}/{DESC_MAX}
              </span>
            </label>
            <textarea
              id="seo-desc"
              className="admin-input"
              rows={3}
              style={{ resize: 'vertical' }}
              value={entry.description ?? ''}
              placeholder={ph ?? page.defaultDescription}
              onChange={(e) => setField('description', e.target.value)}
            />
            <small className="admin-hint">
              The grey summary under the title in Google. Aim for {DESC_MAX} characters or fewer.
            </small>
          </div>

          <div className="admin-field">
            <label className="admin-label admin-check">
              <input
                type="checkbox"
                checked={Boolean(entry.noindex)}
                onChange={(e) => setField('noindex', e.target.checked)}
              />
              Hide this page from Google
            </label>
            <small className="admin-hint">
              Removes this page from Google search results. Only use for pages you don’t want found.
            </small>
          </div>

          <div className="admin-subtitle">Google preview</div>
          <div className="seo-preview">
            <div className="seo-preview__url">{SITE_URL}{selected === '/' ? '' : selected}</div>
            <div className="seo-preview__title">{effective.title || '(no title set)'}</div>
            <div className="seo-preview__desc">{effective.description || '(no description set)'}</div>
            {effective.noindex && <div className="seo-preview__noindex">🚫 Hidden from Google search</div>}
          </div>

          {msg && <div className={`admin-alert admin-alert--${msg.type}`}>{msg.text}</div>}

          <div className="admin-savebar">
            <button className="admin-btn admin-btn--primary" onClick={onSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default SeoPanel;
