import React, { useEffect, useState } from 'react';
import { fetchPages, createPage, updatePage, deletePage } from '../../services/adminApi';
import { slugify } from '../../utils/slug';
import RichTextInput from './RichTextInput';

const BLOCK_LABELS = {
  hero: 'Hero banner', heading: 'Heading', richtext: 'Rich text', cta: 'Call to action',
  image: 'Image', twoColumn: 'Text + image', getQuote: 'Get-a-quote button',
};
const BLOCK_FIELDS = {
  hero: [['heading', 'text'], ['subtext', 'richtext'], ['image', 'url'], ['buttonText', 'text'], ['buttonLink', 'text']],
  heading: [['text', 'text']],
  richtext: [['html', 'richtext']],
  cta: [['heading', 'text'], ['buttonText', 'text'], ['buttonLink', 'text']],
  image: [['url', 'url'], ['alt', 'text']],
  twoColumn: [['html', 'richtext'], ['image', 'url'], ['imageSide', 'imageSide']],
  getQuote: [['buttonText', 'text'], ['service', 'text']],
};
const FIELD_LABELS = {
  heading: 'Heading', subtext: 'Subtext', image: 'Image URL',
  buttonText: 'Button text', buttonLink: 'Button link (e.g. /contact)',
  text: 'Text', html: 'Content', url: 'Image URL', alt: 'Alt text (accessibility)',
  imageSide: 'Image position', service: 'Pre-selected service (optional)',
};

const blankPage = () => ({
  title: '', slug: '', blocks: [],
  seo: { title: '', description: '', noindex: false },
  showInNav: false, navLabel: '', status: 'draft',
});

const PagesPanel = () => {
  const [view, setView] = useState('list');
  const [pages, setPages] = useState([]);
  const [page, setPage] = useState(blankPage());
  const [slugTouched, setSlugTouched] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const load = () => {
    setLoading(true);
    fetchPages()
      .then((d) => setPages(d.pages || []))
      .catch((e) => setMsg({ type: 'error', text: e.message }))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const startNew = () => { setPage(blankPage()); setSlugTouched(false); setMsg(null); setView('edit'); };
  const startEdit = (p) => { setPage(structuredClone(p)); setSlugTouched(true); setMsg(null); setView('edit'); };

  const onTitle = (v) => setPage((p) => ({ ...p, title: v, slug: slugTouched ? p.slug : slugify(v) }));
  const onSlug = (v) => { setSlugTouched(true); setPage((p) => ({ ...p, slug: v })); };
  const setField = (k, v) => setPage((p) => ({ ...p, [k]: v }));
  const setSeo = (k, v) => setPage((p) => ({ ...p, seo: { ...p.seo, [k]: v } }));

  // ── blocks ──
  const addBlock = (type) => setPage((p) => ({ ...p, blocks: [...p.blocks, { type }] }));
  const setBlockField = (i, key, v) =>
    setPage((p) => ({ ...p, blocks: p.blocks.map((b, idx) => (idx === i ? { ...b, [key]: v } : b)) }));
  const moveBlock = (i, dir) => setPage((p) => {
    const blocks = [...p.blocks];
    const j = i + dir;
    if (j < 0 || j >= blocks.length) return p;
    [blocks[i], blocks[j]] = [blocks[j], blocks[i]];
    return { ...p, blocks };
  });
  const deleteBlock = (i) => setPage((p) => ({ ...p, blocks: p.blocks.filter((_, idx) => idx !== i) }));

  const onSave = async () => {
    setSaving(true); setMsg(null);
    try {
      if (page._id) await updatePage(page._id, page);
      else await createPage(page);
      load();
      setView('list');
    } catch (e) {
      setMsg({ type: 'error', text: e.message });
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (p) => {
    if (!window.confirm(`Delete “${p.title}”? This can’t be undone.`)) return;
    try { await deletePage(p._id); load(); }
    catch (e) { setMsg({ type: 'error', text: e.message }); }
  };

  const renderBlockField = (block, i, [key, type]) => {
    const val = block[key] ?? '';
    let control;
    if (type === 'richtext') {
      control = <RichTextInput key={`${i}-${key}`} value={val} onChange={(v) => setBlockField(i, key, v)} />;
    } else if (type === 'imageSide') {
      control = (
        <select className="admin-select" value={val || 'right'} onChange={(e) => setBlockField(i, key, e.target.value)}>
          <option value="right">Image on the right</option>
          <option value="left">Image on the left</option>
        </select>
      );
    } else {
      control = <input className="admin-input" type="text" value={val} onChange={(e) => setBlockField(i, key, e.target.value)} />;
    }
    return (
      <div className="admin-field" key={key}>
        <label className="admin-label admin-label--sm">{FIELD_LABELS[key] || key}</label>
        {control}
      </div>
    );
  };

  // ── LIST VIEW ──
  if (view === 'list') {
    return (
      <div className="admin-card">
        <div className="admin-card__title">Pages</div>
        <div className="admin-card__sub">Create and manage your own pages and landing pages.</div>
        <div className="admin-help">
          <strong>What this tab is for:</strong> building extra pages (e.g. campaign landing
          pages) without a developer.
          <ol>
            <li>Click <strong>+ New page</strong>, give it a title and web address.</li>
            <li>Add <strong>blocks</strong> (hero, heading, text, call-to-action) and edit them.</li>
            <li>Set <strong>Published</strong> and <strong>Save</strong> — it goes live at <code>/your-address</code>. Leave it as <strong>Draft</strong> to keep it hidden.</li>
          </ol>
          Your main pages (Home, Contact, etc.) aren’t listed here and can’t be affected.
        </div>

        {msg && <div className={`admin-alert admin-alert--${msg.type}`}>{msg.text}</div>}

        <div className="admin-toolbar">
          <button className="admin-btn admin-btn--primary admin-btn--sm" onClick={startNew}>+ New page</button>
          <button className="admin-btn admin-btn--sm" onClick={load} disabled={loading}>{loading ? 'Loading…' : '↻ Refresh'}</button>
        </div>

        {!loading && pages.length === 0 && <div className="admin-empty">No custom pages yet.</div>}

        {pages.length > 0 && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Title</th><th>Address</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {pages.map((p) => (
                  <tr key={p._id}>
                    <td><strong>{p.title}</strong></td>
                    <td>/{p.slug}</td>
                    <td>{p.status === 'published' ? 'Published' : 'Draft'}</td>
                    <td>
                      <button className="admin-btn admin-btn--sm admin-btn--ghost" onClick={() => startEdit(p)}>Edit</button>
                      <button className="admin-btn admin-btn--sm admin-btn--danger" onClick={() => onDelete(p)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // ── EDITOR VIEW ──
  return (
    <div className="admin-card">
      <div className="admin-card__title">{page._id ? 'Edit page' : 'New page'}</div>

      <div className="admin-grid">
        <div className="admin-field">
          <label className="admin-label" htmlFor="pg-title">Title</label>
          <input id="pg-title" className="admin-input" type="text" value={page.title} onChange={(e) => onTitle(e.target.value)} placeholder="Spring Cleaning Offer" />
        </div>
        <div className="admin-field">
          <label className="admin-label" htmlFor="pg-slug">Web address</label>
          <input id="pg-slug" className="admin-input" type="text" value={page.slug} onChange={(e) => onSlug(e.target.value)} onBlur={(e) => onSlug(slugify(e.target.value))} placeholder="spring-cleaning-offer" />
          <small className="admin-hint">Lives at /{page.slug || '…'} — letters, numbers and dashes only.</small>
        </div>
      </div>

      <div className="admin-grid">
        <div className="admin-field">
          <label className="admin-label" htmlFor="pg-status">Status</label>
          <select id="pg-status" className="admin-select" value={page.status} onChange={(e) => setField('status', e.target.value)}>
            <option value="draft">Draft (hidden)</option>
            <option value="published">Published (live)</option>
          </select>
        </div>
        <div className="admin-field">
          <label className="admin-label admin-check">
            <input type="checkbox" checked={page.showInNav} onChange={(e) => setField('showInNav', e.target.checked)} />
            Show in navigation menu
          </label>
          {page.showInNav && (
            <input className="admin-input" type="text" value={page.navLabel} onChange={(e) => setField('navLabel', e.target.value)} placeholder="Menu label (defaults to the title)" style={{ marginTop: 8 }} />
          )}
        </div>
      </div>

      {/* SEO */}
      <div className="admin-subtitle">Search (SEO)</div>
      <div className="admin-field">
        <label className="admin-label admin-label--sm">SEO title (defaults to the page title)</label>
        <input className="admin-input" type="text" value={page.seo.title} onChange={(e) => setSeo('title', e.target.value)} />
      </div>
      <div className="admin-field">
        <label className="admin-label admin-label--sm">Meta description</label>
        <textarea className="admin-input" rows={2} style={{ resize: 'vertical' }} value={page.seo.description} onChange={(e) => setSeo('description', e.target.value)} />
      </div>
      <div className="admin-field">
        <label className="admin-label admin-check">
          <input type="checkbox" checked={page.seo.noindex} onChange={(e) => setSeo('noindex', e.target.checked)} />
          Hide this page from Google
        </label>
      </div>

      {/* Blocks */}
      <div className="admin-subtitle">Blocks</div>
      {page.blocks.map((block, i) => (
        <div className="admin-listrow" key={i}>
          <div className="admin-listrow__body">
            <div className="admin-block__head">{BLOCK_LABELS[block.type] || block.type}</div>
            {(BLOCK_FIELDS[block.type] || []).map((f) => renderBlockField(block, i, f))}
          </div>
          <div className="admin-listrow__ctrls">
            <button type="button" className="admin-btn admin-btn--sm" title="Move up" onClick={() => moveBlock(i, -1)}>↑</button>
            <button type="button" className="admin-btn admin-btn--sm" title="Move down" onClick={() => moveBlock(i, 1)}>↓</button>
            <button type="button" className="admin-btn admin-btn--sm admin-btn--danger" title="Delete" onClick={() => deleteBlock(i)}>✕</button>
          </div>
        </div>
      ))}

      <div className="admin-block-add">
        {Object.keys(BLOCK_LABELS).map((type) => (
          <button key={type} type="button" className="admin-btn admin-btn--sm" onClick={() => addBlock(type)}>+ {BLOCK_LABELS[type]}</button>
        ))}
      </div>

      {msg && <div className={`admin-alert admin-alert--${msg.type}`}>{msg.text}</div>}

      <div className="admin-savebar">
        <button className="admin-btn admin-btn--primary" onClick={onSave} disabled={saving || !page.title.trim()}>
          {saving ? 'Saving…' : 'Save page'}
        </button>
        <button className="admin-btn admin-btn--ghost" onClick={() => setView('list')} disabled={saving}>Cancel</button>
      </div>
    </div>
  );
};

export default PagesPanel;
