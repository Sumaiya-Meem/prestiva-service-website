import React, { useEffect, useRef, useState } from 'react';
import {
  fetchGallery,
  addGallerySection,
  deleteGallerySection,
  uploadGalleryImage,
  deleteGalleryImage,
  mediaUrl,
} from '../../services/adminApi';

const GalleryPanel = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null); // { type, text }
  const [newName, setNewName] = useState('');
  const [busy, setBusy] = useState(false); // section-level action in flight
  const [uploading, setUploading] = useState(''); // slug currently uploading
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

  useEffect(() => {
    load();
  }, []);

  const flash = (type, text) => setMsg({ type, text });

  const onAddSection = async (e) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setBusy(true);
    setMsg(null);
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
    const count = section.images.length;
    const warn = count
      ? `Delete “${section.tag}” and its ${count} image${count > 1 ? 's' : ''}? This cannot be undone.`
      : `Delete the empty section “${section.tag}”?`;
    if (!window.confirm(warn)) return;
    setBusy(true);
    setMsg(null);
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

  const onPickFile = (slug) => fileInputs.current[slug]?.click();

  const onUpload = async (slug, e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = ''; // allow re-selecting the same file later
    if (!file) return;
    setUploading(slug);
    setMsg(null);
    try {
      await uploadGalleryImage(slug, file);
      await load();
      flash('success', 'Image added.');
    } catch (err) {
      flash('error', err.message);
    } finally {
      setUploading('');
    }
  };

  const onDeleteImage = async (slug, id) => {
    if (!window.confirm('Delete this image?')) return;
    setMsg(null);
    try {
      await deleteGalleryImage(slug, id);
      await load();
    } catch (err) {
      flash('error', err.message);
    }
  };

  return (
    <div className="admin-card">
      <div className="admin-card__title">Gallery</div>
      <div className="admin-card__sub">
        Add or remove gallery sections, and upload or delete photos within each. Uploaded
        images are auto-compressed to WebP. Changes are stored on the server.
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
        sections.map((section) => (
          <div className="admin-gallery-section" key={section.slug}>
            <div className="admin-gallery-section__head">
              <div>
                <span className="admin-gallery-section__name">{section.tag}</span>
                <span className="admin-gallery-section__count">{section.images.length} photo{section.images.length === 1 ? '' : 's'}</span>
              </div>
              <div className="admin-gallery-section__actions">
                <button
                  className="admin-btn admin-btn--sm"
                  onClick={() => onPickFile(section.slug)}
                  disabled={uploading === section.slug}
                >
                  {uploading === section.slug ? 'Uploading…' : '+ Add image'}
                </button>
                <button
                  className="admin-btn admin-btn--sm admin-btn--danger"
                  onClick={() => onDeleteSection(section)}
                  disabled={busy}
                >
                  Delete section
                </button>
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  ref={(el) => { fileInputs.current[section.slug] = el; }}
                  onChange={(e) => onUpload(section.slug, e)}
                />
              </div>
            </div>

            {section.images.length === 0 ? (
              <div className="admin-gallery-empty">No images yet — use “Add image”.</div>
            ) : (
              <div className="admin-gallery-grid">
                {section.images.map((img) => (
                  <figure className="admin-gallery-thumb" key={img.id}>
                    <img src={mediaUrl(img.url)} alt="" loading="lazy" />
                    <button
                      className="admin-gallery-thumb__del"
                      onClick={() => onDeleteImage(section.slug, img.id)}
                      aria-label="Delete image"
                      title="Delete image"
                    >
                      ×
                    </button>
                  </figure>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default GalleryPanel;
