import React, { useEffect, useRef, useState } from 'react';
import { PAGE_BACKGROUNDS } from '../../config/pageBackgrounds';
import {
  fetchSettings,
  uploadPageBackground,
  deletePageBackground,
  mediaUrl,
} from '../../services/adminApi';

/** One page's background card: preview + upload/replace + remove. */
const PageCard = ({ page, customUrl, onUpload, onRemove, uploading }) => {
  const inputRef = useRef(null);
  const preview = customUrl ? mediaUrl(customUrl) : page.default; // custom → default → none
  const isCustom = Boolean(customUrl);

  return (
    <div className="admin-bg-card">
      <div className="admin-bg-card__preview">
        {preview ? (
          <img src={preview} alt={`${page.label} background`} loading="lazy" />
        ) : (
          <div className="admin-bg-card__navy">No image (navy hero)</div>
        )}
        <span className={`admin-bg-card__tag${isCustom ? ' admin-bg-card__tag--custom' : ''}`}>
          {isCustom ? 'Custom' : page.default ? 'Default' : 'Navy'}
        </span>
        {uploading != null && (
          <div className="admin-bg-card__uploading">Uploading… {Math.round(uploading * 100)}%</div>
        )}
      </div>

      <div className="admin-bg-card__body">
        <div className="admin-bg-card__name">{page.label}</div>
        <div className="admin-bg-card__actions">
          <button
            className="admin-btn admin-btn--sm admin-btn--primary"
            onClick={() => inputRef.current?.click()}
            disabled={uploading != null}
          >
            {isCustom ? 'Replace' : 'Upload'}
          </button>
          {isCustom && (
            <button
              className="admin-btn admin-btn--sm admin-btn--danger"
              onClick={() => onRemove(page.key)}
              disabled={uploading != null}
            >
              Remove
            </button>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const f = e.target.files && e.target.files[0];
              e.target.value = '';
              if (f) onUpload(page.key, f);
            }}
          />
        </div>
      </div>
    </div>
  );
};

const BackgroundsPanel = () => {
  const [backgrounds, setBackgrounds] = useState({}); // page key -> custom url
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  const [progress, setProgress] = useState({}); // page key -> 0..1 while uploading

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchSettings();
      setBackgrounds((data.settings && data.settings.pageBackgrounds) || {});
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onUpload = async (key, file) => {
    setMsg(null);
    setProgress((p) => ({ ...p, [key]: 0 }));
    try {
      const res = await uploadPageBackground(key, file, (pct) =>
        setProgress((p) => ({ ...p, [key]: pct }))
      );
      setBackgrounds((b) => ({ ...b, [key]: res.url }));
      setMsg({ type: 'success', text: 'Background updated — it’s live on the site.' });
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setProgress((p) => { const n = { ...p }; delete n[key]; return n; });
    }
  };

  const onRemove = async (key) => {
    if (!window.confirm('Remove this custom background and revert to the default?')) return;
    setMsg(null);
    try {
      await deletePageBackground(key);
      setBackgrounds((b) => { const n = { ...b }; delete n[key]; return n; });
      setMsg({ type: 'success', text: 'Reverted to the default background.' });
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  return (
    <div className="admin-card">
      <div className="admin-card__title">Page Backgrounds</div>
      <div className="admin-card__sub">
        Change the hero background image at the top of each page. Uploads are
        auto-compressed and go live on the site immediately. Remove a custom image
        to revert to the built-in default.
      </div>

      {msg && <div className={`admin-alert admin-alert--${msg.type}`}>{msg.text}</div>}

      {loading ? (
        <div className="admin-empty">Loading…</div>
      ) : (
        <div className="admin-bg-grid">
          {PAGE_BACKGROUNDS.map((page) => (
            <PageCard
              key={page.key}
              page={page}
              customUrl={backgrounds[page.key]}
              uploading={progress[page.key] ?? null}
              onUpload={onUpload}
              onRemove={onRemove}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BackgroundsPanel;
