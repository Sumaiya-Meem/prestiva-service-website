import React, { useEffect, useMemo, useState } from 'react';
import { fetchSettings, saveSettings } from '../../services/adminApi';
import { CONTENT_GROUPS, CONTENT_DEFAULTS } from '../../config/contentSchema';
import { setContentOverrides } from '../../config/content';
import RichTextInput from './RichTextInput';

// Deep equality via stable JSON (our content values are plain data).
const deepEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// Keep only meaningful overrides: drop blanks and anything equal to the default,
// so storage stays minimal and a cleared/reverted field falls back to default.
const cleanContent = (content) => {
  const out = {};
  for (const [key, val] of Object.entries(content || {})) {
    if (val === undefined || val === null) continue;
    if (typeof val === 'string' && !val.trim()) continue;
    if (deepEqual(val, CONTENT_DEFAULTS[key])) continue;
    out[key] = val;
  }
  return out;
};

const blankItem = (itemFields) => Object.fromEntries(itemFields.map((f) => [f.key, '']));

const ContentPanel = () => {
  const [existing, setExisting] = useState({});
  const [content, setContent] = useState({}); // key -> value (override draft)
  const [groupId, setGroupId] = useState(CONTENT_GROUPS[0].id);
  const [msg, setMsg] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings()
      .then((d) => {
        setExisting(d.settings || {});
        setContent(d.settings?.content ? structuredClone(d.settings.content) : {});
      })
      .catch((e) => setMsg({ type: 'error', text: e.message }))
      .finally(() => setLoading(false));
  }, []);

  const group = useMemo(() => CONTENT_GROUPS.find((g) => g.id === groupId), [groupId]);

  // Editable value for a key: current draft override if present, else the default.
  const valueOf = (key) => (content[key] !== undefined ? content[key] : CONTENT_DEFAULTS[key]);
  const setValue = (key, val) => setContent((c) => ({ ...c, [key]: val }));

  // ── list helpers ──
  const listAdd = (key, item) => setValue(key, [...(valueOf(key) || []), item]);
  const listDelete = (key, i) => setValue(key, valueOf(key).filter((_, idx) => idx !== i));
  const listMove = (key, i, dir) => {
    const arr = [...valueOf(key)];
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    setValue(key, arr);
  };
  const listSetItem = (key, i, item) => {
    const arr = [...valueOf(key)];
    arr[i] = item;
    setValue(key, arr);
  };

  const onSave = async () => {
    setSaving(true); setMsg(null);
    try {
      const merged = structuredClone(existing);
      merged.content = cleanContent(content);
      const data = await saveSettings(merged);
      const saved = data.settings || merged;
      setExisting(saved);
      setContent(structuredClone(saved.content || {}));
      setContentOverrides(saved.content || {}); // reflect live in this session
      setMsg({ type: 'success', text: 'Saved. Content is live on the website.' });
    } catch (e) {
      setMsg({ type: 'error', text: e.message });
    } finally {
      setSaving(false);
    }
  };

  // ── scalar control by type ──
  const renderScalar = (type, val, onChange, fieldKey) => {
    if (type === 'richtext') {
      return <RichTextInput key={fieldKey} value={val} onChange={onChange} />;
    }
    if (type === 'textarea') {
      return (
        <textarea className="admin-input" rows={3} style={{ resize: 'vertical' }}
          value={val ?? ''} onChange={(e) => onChange(e.target.value)} />
      );
    }
    return (
      <input className="admin-input" type="text" value={val ?? ''}
        onChange={(e) => onChange(e.target.value)} />
    );
  };

  const rowControls = (key, i) => (
    <div className="admin-listrow__ctrls">
      <button type="button" className="admin-btn admin-btn--sm" title="Move up" onClick={() => listMove(key, i, -1)}>↑</button>
      <button type="button" className="admin-btn admin-btn--sm" title="Move down" onClick={() => listMove(key, i, 1)}>↓</button>
      <button type="button" className="admin-btn admin-btn--sm admin-btn--danger" title="Delete" onClick={() => listDelete(key, i)}>✕</button>
    </div>
  );

  const renderField = (f) => {
    if (f.type === 'list') {
      const arr = valueOf(f.key) || [];
      return (
        <div className="admin-field" key={f.key}>
          <label className="admin-label">{f.label}</label>
          {arr.map((item, i) => (
            <div className="admin-listrow" key={i}>
              <div className="admin-listrow__body">
                {renderScalar(f.itemType || 'text', item, (v) => listSetItem(f.key, i, v), `${f.key}.${i}`)}
              </div>
              {rowControls(f.key, i)}
            </div>
          ))}
          <button type="button" className="admin-btn admin-btn--sm" onClick={() => listAdd(f.key, '')}>+ Add</button>
        </div>
      );
    }

    if (f.type === 'listObject') {
      const arr = valueOf(f.key) || [];
      return (
        <div className="admin-field" key={f.key}>
          <label className="admin-label">{f.label}</label>
          {arr.map((obj, i) => (
            <div className="admin-listrow" key={i}>
              <div className="admin-listrow__body">
                {f.itemFields.map((sub) => (
                  <div className="admin-field" key={sub.key}>
                    <label className="admin-label admin-label--sm">{sub.label}</label>
                    {renderScalar(sub.type, obj?.[sub.key], (v) => listSetItem(f.key, i, { ...obj, [sub.key]: v }), `${f.key}.${i}.${sub.key}`)}
                  </div>
                ))}
              </div>
              {rowControls(f.key, i)}
            </div>
          ))}
          <button type="button" className="admin-btn admin-btn--sm" onClick={() => listAdd(f.key, blankItem(f.itemFields))}>+ Add</button>
        </div>
      );
    }

    // scalar field
    return (
      <div className="admin-field" key={f.key}>
        <label className="admin-label">{f.label}</label>
        {renderScalar(f.type, valueOf(f.key), (v) => setValue(f.key, v), f.key)}
      </div>
    );
  };

  return (
    <div className="admin-card">
      <div className="admin-card__title">Content</div>
      <div className="admin-card__sub">
        Edit the words on your website. Pick a section, change the text, and Save — changes are
        live immediately. Clear a field to restore the original wording.
      </div>

      {loading && <div className="admin-empty">Loading…</div>}

      {!loading && (
        <>
          <div className="admin-field">
            <label className="admin-label" htmlFor="content-group">Section</label>
            <select id="content-group" className="admin-select" value={groupId}
              onChange={(e) => setGroupId(e.target.value)}>
              {CONTENT_GROUPS.map((g) => <option key={g.id} value={g.id}>{g.title}</option>)}
            </select>
          </div>

          {group.fields.map(renderField)}

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

export default ContentPanel;
