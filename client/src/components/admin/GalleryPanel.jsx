import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  fetchGallery,
  addGallerySection,
  deleteGallerySection,
  uploadGalleryMedia,
  deleteGalleryMedia,
  importDefaultGallery,
  clearGalleryCache,
  mediaUrl,
} from '../../services/adminApi';

const isImageFile = (f) => f && /^image\//.test(f.type);
const isVideoFile = (f) => f && /^video\//.test(f.type);

/** One media thumbnail (image or video) with a delete button. */
const Thumb = ({ slug, item, onDelete }) => (
  <figure className={`admin-media-thumb admin-media-thumb--${item.type}`}>
    {item.type === 'video' ? (
      item.thumbUrl || item.posterUrl ? (
        <img src={mediaUrl(item.thumbUrl || item.posterUrl)} alt="" loading="lazy" />
      ) : (
        <video src={mediaUrl(item.url)} preload="metadata" muted playsInline />
      )
    ) : (
      <img src={mediaUrl(item.thumbUrl || item.url)} alt="" loading="lazy" />
    )}

    {item.type === 'video' && <span className="admin-media-thumb__play" aria-hidden="true">▶</span>}
    <span className="admin-media-thumb__type">{item.type === 'video' ? 'Video' : 'Photo'}</span>

    <button
      className="admin-media-thumb__del"
      onClick={() => onDelete(slug, item)}
      aria-label={`Delete ${item.type}`}
      title="Delete"
    >
      ×
    </button>
  </figure>
);

const GalleryPanel = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null); // { type, text }
  const [newName, setNewName] = useState('');
  const [busy, setBusy] = useState(false);
  const [upload, setUpload] = useState(null); // { slug, progress, name }
  const [dragSlug, setDragSlug] = useState('');
  const [importing, setImporting] = useState(false);
  const fileInputs = useRef({}); // slug -> <input> ref

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchGallery();
      setSections(data.sections || []);
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const flash = (type, text) => setMsg({ type, text });

  const onImport = async () => {
    if (!window.confirm('Import the built-in photos & videos onto the server? This is safe to run anytime and fixes images that don’t load.')) return;
    setImporting(true);
    setMsg(null);
    try {
      const r = await importDefaultGallery();
      await load();
      flash('success', `Import complete — ${r.added} added, ${r.restored} restored, ${r.skipped} already present${r.failed ? `, ${r.failed} failed` : ''}.`);
    } catch (err) {
      flash('error', err.message);
    } finally {
      setImporting(false);
    }
  };

  const totals = useMemo(() => {
    let images = 0; let videos = 0;
    for (const s of sections) for (const m of s.media || []) (m.type === 'video' ? videos++ : images++);
    return { images, videos, sections: sections.length };
  }, [sections]);

  const onAddSection = async (e) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setBusy(true); setMsg(null);
    try {
      await addGallerySection(name);
      setNewName('');
      await load();
      flash('success', `Section “${name}” added.`);
    } catch (err) {
      flash('error', err.message);
    } finally {
      setBusy(false);
    }
  };

  const onDeleteSection = async (section) => {
    const count = (section.media || []).length;
    const warn = count
      ? `Delete “${section.tag}” and its ${count} item${count > 1 ? 's' : ''}? This cannot be undone.`
      : `Delete the empty section “${section.tag}”?`;
    if (!window.confirm(warn)) return;
    setBusy(true); setMsg(null);
    try {
      await deleteGallerySection(section.slug);
      await load();
      flash('success', `Section “${section.tag}” deleted.`);
    } catch (err) {
      flash('error', err.message);
    } finally {
      setBusy(false);
    }
  };

  // Upload one or more files (from picker or drag-drop) sequentially.
  const uploadFiles = async (slug, fileList) => {
    const files = Array.from(fileList || []).filter((f) => isImageFile(f) || isVideoFile(f));
    if (!files.length) return;
    setMsg(null);
    try {
      for (const file of files) {
        setUpload({ slug, progress: 0, name: file.name });
        await uploadGalleryMedia(slug, file, (p) =>
          setUpload({ slug, progress: p, name: file.name })
        );
      }
      clearGalleryCache(); // public site refetches next time it loads
      await load();
      flash('success', `${files.length} item${files.length > 1 ? 's' : ''} added.`);
    } catch (err) {
      flash('error', err.message);
    } finally {
      setUpload(null);
    }
  };

  const onPickFile = (slug) => fileInputs.current[slug]?.click();

  const onInputChange = (slug, e) => {
    // Snapshot to an array BEFORE clearing the input — e.target.files is a live
    // list that resetting value='' would empty, dropping the selection.
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    uploadFiles(slug, files);
  };

  const onDeleteMedia = async (slug, item) => {
    if (!window.confirm(`Delete this ${item.type}?`)) return;
    setMsg(null);
    try {
      await deleteGalleryMedia(slug, item.id);
      setSections((prev) =>
        prev.map((s) =>
          s.slug === slug ? { ...s, media: s.media.filter((m) => m.id !== item.id) } : s
        )
      );
    } catch (err) {
      flash('error', err.message);
    }
  };

  const onDrop = (slug, e) => {
    e.preventDefault();
    setDragSlug('');
    uploadFiles(slug, e.dataTransfer.files);
  };

  return (
    <div className="admin-card">
      <div className="admin-card__title">Gallery</div>
      <div className="admin-card__sub">
        Manage the photos &amp; videos shown on the public website. Drag files onto a
        section or use “Add media”. Images are auto-compressed to WebP; videos get a
        poster frame. Changes are live on the site immediately.
      </div>

      {/* Totals */}
      <div className="admin-stats">
        <div className="admin-stat"><div className="admin-stat__num">{totals.sections}</div><div className="admin-stat__label">Sections</div></div>
        <div className="admin-stat"><div className="admin-stat__num">{totals.images}</div><div className="admin-stat__label">Photos</div></div>
        <div className="admin-stat"><div className="admin-stat__num">{totals.videos}</div><div className="admin-stat__label">Videos</div></div>
      </div>

      {/* Repair / import built-in media */}
      <div className="admin-gallery-import">
        <div>
          <strong>Images not showing on the live site?</strong>
          <div className="admin-hint" style={{ marginTop: 4 }}>
            Imports the built-in photos &amp; videos onto this server. Safe to run anytime.
          </div>
        </div>
        <button className="admin-btn" onClick={onImport} disabled={importing || busy}>
          {importing ? 'Importing… (may take a minute)' : 'Import built-in gallery'}
        </button>
      </div>

      {/* Add section */}
      <form className="admin-gallery-addbar" onSubmit={onAddSection}>
        <input
          className="admin-input"
          placeholder="New section name (e.g. Window Cleaning)"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          disabled={busy}
        />
        <button className="admin-btn admin-btn--primary" type="submit" disabled={busy || !newName.trim()}>
          Add section
        </button>
      </form>

      {msg && <div className={`admin-alert admin-alert--${msg.type}`}>{msg.text}</div>}

      {loading ? (
        <div className="admin-empty">Loading gallery…</div>
      ) : sections.length === 0 ? (
        <div className="admin-empty">No sections yet. Add one above to get started.</div>
      ) : (
        sections.map((section) => {
          const media = section.media || [];
          const uploadingHere = upload && upload.slug === section.slug;
          return (
            <div
              className={`admin-gallery-section${dragSlug === section.slug ? ' is-dragover' : ''}`}
              key={section.slug}
              onDragOver={(e) => { e.preventDefault(); setDragSlug(section.slug); }}
              onDragLeave={() => setDragSlug('')}
              onDrop={(e) => onDrop(section.slug, e)}
            >
              <div className="admin-gallery-section__head">
                <div>
                  <span className="admin-gallery-section__name">{section.tag}</span>
                  <span className="admin-gallery-section__count">
                    {media.length} item{media.length === 1 ? '' : 's'}
                  </span>
                </div>
                <div className="admin-gallery-section__actions">
                  <button
                    className="admin-btn admin-btn--sm"
                    onClick={() => onPickFile(section.slug)}
                    disabled={!!upload}
                  >
                    {uploadingHere ? 'Uploading…' : '+ Add media'}
                  </button>
                  <button
                    className="admin-btn admin-btn--sm admin-btn--danger"
                    onClick={() => onDeleteSection(section)}
                    disabled={busy || !!upload}
                  >
                    Delete section
                  </button>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    hidden
                    ref={(el) => { fileInputs.current[section.slug] = el; }}
                    onChange={(e) => onInputChange(section.slug, e)}
                  />
                </div>
              </div>

              {/* Upload progress for this section */}
              {uploadingHere && (
                <div className="admin-upload-progress">
                  <div className="admin-upload-progress__bar" style={{ width: `${Math.round(upload.progress * 100)}%` }} />
                  <span className="admin-upload-progress__label">
                    {upload.name} — {Math.round(upload.progress * 100)}%
                  </span>
                </div>
              )}

              {media.length === 0 ? (
                <div className="admin-gallery-empty">
                  Drop photos or videos here, or use “Add media”.
                </div>
              ) : (
                <div className="admin-gallery-grid">
                  {media.map((item) => (
                    <Thumb key={item.id} slug={section.slug} item={item} onDelete={onDeleteMedia} />
                  ))}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default GalleryPanel;
